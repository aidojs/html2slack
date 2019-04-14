const mrkdwn = require("../src/lib/mrkdwn")
const parse = require("../src/lib/parse")

/**
 * Executes an array of tests and checks expected output
 * @param {Object[]} testCases
 * @param {String} testCases[].input
 * @param {String} testCases[].expectedOutput
 */
function multiTest(testCases) {
  testCases.forEach((testCase) => {
    const parsed = parse(testCase.input)
    const converted = mrkdwn(parsed)
    expect(converted).toBe(testCase.expectedOutput)
  })
}

describe("Converting basic HTML", () => {
  it("Should return an empty string when provided with data other than String or HTMLElement", () => {
    expect(mrkdwn({})).toEqual("")
    expect(mrkdwn([])).toEqual("")
    expect(mrkdwn(1)).toEqual("")
  })

  it("Should return an empty string when provided with an empty node", () => {
    const html = parse("")
    expect(mrkdwn(html)).toEqual("")
  })

  it("Should return an untouched string when provided with plain text", () => {
    const plainText = "Lorem ipsum sit dolor amet"
    expect(mrkdwn(plainText)).toEqual(plainText)
  })

  it("Should return an untouched string when provided with a non modifying HTML attribute", () => {
    const testCases = [{
      input: "<p>Lorem ipsum sit dolor amet</p>",
      expectedOutput: "Lorem ipsum sit dolor amet",
    }]

    multiTest(testCases)
  })

  it("Should ignore HTML tags which are handled by separate functions", () => {
    const testCases = [{
      input: "<dl>Lorem ipsum sit dolor amet</dl>",
      expectedOutput: "",
    }, {
      input: '<button name="testButton">A small button</button>',
      expectedOutput: "",
    }]

    multiTest(testCases)
  })

  it("Should correctly convert inline formatting", () => {
    const testCases = [{
      input: "<b>Bold</b>",
      expectedOutput: "*Bold*",
    }, {
      input: "<strong>Bold</strong>",
      expectedOutput: "*Bold*",
    }, {
      input: "<i>Italic</i>",
      expectedOutput: "_Italic_",
    }, {
      input: "<em>Italic</em>",
      expectedOutput: "_Italic_",
    }, {
      input: "<strike>Strike</strike>",
      expectedOutput: "~Strike~",
    }, {
      input: "<code>Code</code>",
      expectedOutput: "`Code`",
    }, {
      input: "<q>Some inline quote</q>",
      expectedOutput: ">Some inline quote",
    }, {
      input: "<a href='https://destination'>Label</a>",
      expectedOutput: "<https://destination|Label>",
    }]

    multiTest(testCases)
  })

  it("Should correctly convert multiline formatting", () => {
    const testCases = [{
      input:
`<textarea>Line 1
Line 2
Line 3</textarea>`,
      expectedOutput:
`>>>Line 1
Line 2
Line 3`,
    }, {
      input:
`<blockquote>Line 1
Line 2
Line 3</blockquote>`,
      expectedOutput:
`>Line 1
>Line 2
>Line 3`,
    }, {
      input:
`<pre>const a = 1
const b = a + 1
console.log(b)</pre>`,
      expectedOutput:
`\`\`\`const a = 1
const b = a + 1
console.log(b)\`\`\``,
    }]

    multiTest(testCases)
  })
})

describe("Converting lists", () => {
  it("Should convert empty lists to empty strings", () => {
    const testCases = [{
      input: "<ul></ul>",
      expectedOutput: "",
    }, {
      input: "<ol></ol>",
      expectedOutput: "",
    }]

    multiTest(testCases)
  })

  it("Should convert unordered lists", () => {
    const testCases = [{
      input:
`<ul>
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>`,
      expectedOutput:
`• Item 1
• Item 2
• Item 3`,
    }]

    multiTest(testCases)
  })

  it("Should default ordered lists to number type (1)", () => {
    const testCases = [{
      input:
`<ol>
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ol>`,
      expectedOutput:
`1. Item 1
2. Item 2
3. Item 3`,
    }]

    multiTest(testCases)
  })

  it("Should handle all types of ordered lists and pad the prefixes", () => {
    const testCases = [{
      input:
`<ol type="1">
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ol>`,
      expectedOutput:
`1. Item 1
2. Item 2
3. Item 3`,
    }, {
      input:
`<ol type="A">
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ol>`,
      expectedOutput:
`A. Item 1
B. Item 2
C. Item 3`,
    }, {
      input:
`<ol type="a">
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ol>`,
      expectedOutput:
`a. Item 1
b. Item 2
c. Item 3`,
    }, {
      input:
`<ol type="I">
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ol>`,
      expectedOutput:
`\`  I.\` Item 1
\` II.\` Item 2
\`III.\` Item 3`,
    }, {
      input:
`<ol type="i">
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ol>`,
      expectedOutput:
`\`  i.\` Item 1
\` ii.\` Item 2
\`iii.\` Item 3`,
    }]

    multiTest(testCases)
  })

  it("should correctly convert tables", () => {
    const testCases = [{
      input: `
      <table>
        <tr>
          <td>Some content</td>
          <td>is short</td>
          <td>but</td>
        </tr>
        <tr>
          <td align="center">But</td>
          <td>some is</td>
          <td>absurdly and stupidly long</td>
        </tr>
        <tr>
          <td align="right">It's also</td>
          <td align="right">cool to align on the</td>
          <td align="right">right</td>
        </tr>
      </table>`,
      expectedOutput: 
`\`\`\`| Some content | is short             | but                        |
|--------------|----------------------|----------------------------|
|     But      | some is              | absurdly and stupidly long |
|--------------|----------------------|----------------------------|
|    It's also | cool to align on the |                      right |
\`\`\``,
    }]

    multiTest(testCases)
  })
})
