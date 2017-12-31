
// We use inline-elements which is fetched directly from the html spec
// but patch it with strike which is deprecated in HTML5
const pad = require('pad')
const inlineElements = [
  ...require("inline-elements"),
  "strike"
]

/**
 * Bold : *bold*
 */
const strong = text => `*${text}*`
const b = strong

/**
 * Italic : _italic_
 */
const em = text => `_${text}_`
const i = em

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
  const romanize = require('romanize')
  const ntol = require('number-to-letter')

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
    "i": idx => romanize(idx + 1).toLowerCase()
  }[type]
    
  // We want to pad the prefixes so that the dots align :
  //   I. Item one
  //  II. Item two
  // III. Item three
  const lis = el.querySelectorAll("li")
  const len = lis.length
  // To do that we fetch the length of the longest prefix in the collection
  const maxWidth = Math.max(...lis.map((li, idx) => prefixer(idx).length))

  // Return the lis, prefixed and padded
  return lis.map((li, idx) => `\`${pad(maxWidth, prefixer(idx))}.\` ${li.text}`).join("\n")
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
    }
  }

  // Table theme
  // const rowPrefix = "[ "
  // const rowSuffix = " ]"
  // const columnSeparator = " | "
  // const linePrefix = "[-"
  // const lineSuffix = "-]"
  // const linePad = "-"
  // const lineSeparator = "-|-"
  const rowPrefix = "║ "
  const rowSuffix = " ║"
  const columnSeparator = " ┃ "
  const linePrefix = "╟─"
  const lineSuffix = "─╢"
  const linePad = "─"
  const lineSeparator = "─╂─"

  const formatCell = (cell, idx) => align[cell.attributes.align](cell.childNodes[0].text, columnWidths[idx])
  const formatLine = line => {
    // Default cell alignments to left
    const cells = line.querySelectorAll("td").map(
      cell => ({
        ...cell,
        attributes: {
          align: "left",
          ...cell.attributes
        }
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
  b,
  strong,
  i,
  em,
  strike,
  q,
  textarea,
  code,
  pre,
  a,
  ul,
  ol,
  table
}

const escapeText = text => text
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/&/g, "&amp;")

/**
 * Walk through the sub-nodes of an HTML element and translates them as one mrkdwn string
 * with control characters escaped
 * @param  {HTMLElement|String|TextNode} node
 * @return {String}
 */
const mrkdwn = node => {
  const { constructor } = node
  if (constructor.name === "String") {
    return escapeText(node)
  }
  
  if (constructor.name === "HTMLElement") {
    const { tagName, childNodes } = node
    // Recursively convert all children nodes of unsupported tags
    if (!rules[tagName] && childNodes.length) {

      // If the children are all text nodes or inline elements we simply concatenate them
      // Otherwise we join them with new lines
      const inlineChildren = childNodes.filter(
        child => child.constructor.name === 'TextNode' || inlineElements.indexOf(child.tagName) !== -1
      )
      const separator = inlineChildren.length === childNodes.length
        ? ""
        : "\n"

      return childNodes.map(node => mrkdwn(node)).join(separator)
    }

    // Escape <, > and &
    // as per https://api.slack.com/docs/message-formatting#3_characters_you_must_encode_as_html_entities
    const text = escapeText(node.text)
  
    // Apply the rules for each supported tag.
    // For unsupported tags, just return the parsed text
    return rules[tagName]
      ? `${rules[tagName](text, node)}`
      : text
  }

  if (constructor.name === "TextNode") {
    return escapeText(node.text)
  }

  // Return an empty string for unsupported data types
  return ""
}

module.exports = mrkdwn

