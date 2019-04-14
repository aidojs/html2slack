const attributes = require("../src/lib/attributes")
const parse = require("../src/lib/parse")

describe("Attributes formatter", () => {
  it("should extract attributes from an HTML node", () => {
    const { childNodes } = parse('<p class="foo" style="bar" name="baz" id="quz"></p>')
    expect(attributes(childNodes[0])).toEqual({
      class: "foo",
      style: "bar",
      name: "baz",
      id: "quz",
    })
  })

  it("should convert html-style dashed attributes to slack_style ones", () => {
    const { childNodes } = parse('<p dashed-attribute="foo" other-attribute="bar"></p>')
    expect(attributes(childNodes[0])).toEqual({
      dashed_attribute: "foo",
      other_attribute: "bar",
    })
  })
})
