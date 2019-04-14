const fields = require("../src/lib/fields")
const parse = require("../src/lib/parse")

describe("HTML description lists to Slack fields converter", () => {
  it("should return an empty object if the node doesn't contain any description list", () => {
    const input = parse("<p>Some text but no button</p>")
    expect(fields(input)).toEqual({})
  })

  it("should return an empty object if the node contains an empty description list", () => {
    const input = parse("<dl></dl>")
    expect(fields(input)).toEqual({})
  })

  it("should convert the description list in the HTML to Slack fields", () => {
    const input = parse(`
      <dl>
        <dt>Title 1</dt>
        <dd>Some list element</dd>
        <dt>Different title</dt>
        <dd>Another list element</dd>
      </dl>`)
    expect(fields(input)).toEqual({
      fields: [{
        short: false,
        title: "Title 1",
        value: "Some list element",
      }, {
        short: false,
        title: "Different title",
        value: "Another list element",
      }],
    })
  })

  it("should handle HTML in the titles and values", () => {
    const input = parse(`
      <dl>
        <dt>Title <b>1</b></dt>
        <dd>Some <i>list</i> element</dd>
      </dl>`)
    expect(fields(input)).toEqual({
      fields: [{
        short: false,
        title: "Title *1*",
        value: "Some _list_ element",
      }],
    })
  })

  it("should handle short fields", () => {
    const input = parse(`
      <dl>
        <dt>Title 1</dt>
        <dd class="short">Some list element</dd>
      </dl>`)
    expect(fields(input)).toEqual({
      fields: [{
        short: true,
        title: "Title 1",
        value: "Some list element",
      }],
    })
  })

  it("should only convert the first list in the HTML", () => {
    const input = parse(`
      <dl>
        <dt>Title 1</dt>
        <dd class="short">Some list element</dd>
      </dl>
      <dl>
        <dt>Title 2</dt>
        <dd class="short">Another element in another list</dd>
      </dl>`)
    expect(fields(input).fields.length).toBe(1)
  })
})
