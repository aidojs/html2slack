
// We use inline-elements which is fetched directly from the html spec
// but patch it with strike which is deprecated in HTML5
const pad = require("pad")
const romanize = require("romanize")
const ntol = require("number-to-letter")

const inlineElements = [
  ...require("inline-elements"),
  "strike",
]

/**
 * Bold : *bold*
 */
const strong = text => `*${text}*`

/**
 * Italic : _italic_
 */
const em = text => `_${text}_`

/**
 * Strikethrough : ~strikethrough~
 */
const strike = text => `~${text}~`

/**
 * Quote (inline) :
 * > Some quote
 */
const q = text => `>${text}`

/**
 * Quote (multi-line, uses textarea so white-space is preserved in minifiers) :
 * >>> Some multi line content
 * That will be treated as one quote
 * As long as it is sent in one go
 */
const textarea = text => `>>>${text}`

/**
 * Blockquote work a little differently : they will wrap each line in a single quote
 * so that you can exit the quote :
 * > This will be in the quote
 * > As will this
 * But not this
 */
const blockquote = text => text.trim()
  .split("\n")
  .map(line => `>${line}`)
  .join("\n")

/**
 * Code (inline) : `some code`
 */
const code = text => `\`${text}\``

/**
 * Code (multi-line) :
 * ```Some code
 * on several
 * lines```
 */
const pre = text => `\`\`\`${text}\`\`\``

/**
 * Link :
 * - <https://destination|Label> (web)
 * - <@recipient|Name> (user)
 * - <#location|Name> (channel)
 */
const a = (text, el) => `<${el.attributes.href}|${text}>`

/**
 * Unordered list :
 * • Item 1
 * • Item 2
 */
const ul = (text, el) => el.querySelectorAll("li").map(li => `• ${li.text}`).join("\n")

/**
 * Ordered list :
 * 1. Item 1
 * 2. Item 2
 */
const ol = (text, el) => {
  // Depending on the type attribute, we may prefix each li with
  // - 1: a number
  // - A: an uppercase letter
  // - a: a lowercase letter
  // - I: an uppercase roman numeral
  // - i: a lowercase roman numeral
  const type = el.attributes.type || "1"
  const prefixer = {
    "1": idx => (idx + 1).toString(),
    "A": idx => ntol(idx),
    "a": idx => ntol(idx).toLowerCase(),
    "I": idx => romanize(idx + 1),
    "i": idx => romanize(idx + 1).toLowerCase(),
  }[type]
    

  // If we're in roman type we want to pad the prefixes so that the dots align :
  //   I. Item one
  //  II. Item two
  // III. Item three
  const lis = el.querySelectorAll("li")
  if (type === "I" || type === "i") {
    // To do that we fetch the length of the longest prefix in the collection
    const maxWidth = Math.max(...lis.map((li, idx) => prefixer(idx).length))
  
    // Return the lis, prefixed and padded
    return lis.map((li, idx) => `\`${pad(maxWidth, prefixer(idx))}.\` ${li.text}`).join("\n")
  } else {
    // Else just prefix the lis
    return lis.map((li, idx) => `${prefixer(idx)}. ${li.text}`).join("\n")
  }
}

/**
 * Table : in the style of Markdown tables
 * 
 * [ Some content | is short             | but                        ]
 * [--------------|----------------------|----------------------------]
 * [     But      | some is              | absurdly and stupidly long ]
 * [--------------|----------------------|----------------------------]
 * [    It's also | cool to align on the |                      right ]
 */
const table = (text, el) => {
  const lines = el.querySelectorAll("tr")

  let columnWidths = []

  lines.forEach(line => {
    const cells = line.querySelectorAll("td")
    cells.forEach((cell, idx) => {
      const { text } = cell
      if (!columnWidths[idx]) {
        columnWidths.push(text.length)
      }
      else {
        columnWidths[idx] = Math.max(columnWidths[idx], text.length)
      }
    })
  })

  const align = {
    left: (text, width) => pad(text, width),
    right: (text, width) => pad(width, text),
    center: (text, width) => {
      const half = (width - text.length) / 2

      const prefix = " ".repeat(Math.floor(half))
      const suffix = " ".repeat(Math.ceil(half))

      return `${prefix}${text}${suffix}`
    },
  }

  // Table theme
  const rowPrefix = "| "
  const rowSuffix = " |"
  const columnSeparator = " | "
  const linePrefix = "|-"
  const lineSuffix = "-|"
  const linePad = "-"
  const lineSeparator = "-|-"
  // Unicode theme
  // const rowPrefix = "║ "
  // const rowSuffix = " ║"
  // const columnSeparator = " ┃ "
  // const linePrefix = "╟─"
  // const lineSuffix = "─╢"
  // const linePad = "─"
  // const lineSeparator = "─╂─"

  const formatCell = (cell, idx) => align[cell.attributes.align](cell.childNodes[0].text, columnWidths[idx])
  const formatLine = line => {
    // Default cell alignments to left
    const cells = line.querySelectorAll("td").map(
      cell => ({
        ...cell,
        attributes: {
          align: "left",
          ...cell.attributes,
        },
      })
    )

    return `${rowPrefix}${cells.map(formatCell).join(columnSeparator)}${rowSuffix}\n`
  }
  const emptyLine = `${linePrefix}${columnWidths.map(width => linePad.repeat(width)).join(lineSeparator)}${lineSuffix}\n`
  
  const table = lines
    .map(formatLine)
    .join(emptyLine)

  return `\`\`\`${table}\`\`\``
}

// These are the rules to replace common html tags with their mrkdwn equivalent
// as per https://get.slack.help/hc/en-us/articles/202288908-Format-your-messages
const rules = {
  strong,
  b: strong,
  h1: strong,
  h2: strong,
  h3: strong,
  h4: strong,
  h5: strong,
  h6: strong,
  em,
  i: em,
  strike,
  q,
  textarea,
  blockquote,
  code,
  pre,
  a,
  ul,
  ol,
  table,
}

// These tags are ignored because they are handled as special Slack attachments
const ignoredTags = [
  "dl",
  "button",
]
/**
 * Walk through the sub-nodes of an HTML element and translates them as one mrkdwn string
 * with control characters escaped
 * @param  {HTMLElement|String|TextNode} node
 * @return {String}
 */
const mrkdwn = (node) => {
  const { constructor } = node

  // Return the escaped text for String & TextNode
  if (constructor.name === "String") {
    return node
  }
  if (constructor.name === "TextNode") {
    return node.text
  }
  
  // Recursively convert html elements
  if (constructor.name === "HTMLElement" && !ignoredTags.includes(node.tagName)) {
    const { tagName, childNodes } = node
    // Recursively convert all children nodes of unsupported tags
    if (!rules[tagName] && childNodes.length) {

      // If the children are all text nodes or inline elements we simply concatenate them
      // Otherwise we join them with new lines
      const inlineChildren = childNodes.filter(
        child => child.constructor.name === "TextNode" || inlineElements.includes(child.tagName)
      )
      const separator = inlineChildren.length === childNodes.length
        ? ""
        : "\n"

      return childNodes.map(node => mrkdwn(node)).join(separator)
    }

    const { text } = node
  
    // Apply the rules for each supported tag.
    // For unsupported tags, just return the parsed text
    return rules[tagName]
      ? rules[tagName](text, node)
      : text
  }

  // If the node is of unsupported or ignored type just return an empty string
  return ""
}

module.exports = mrkdwn

