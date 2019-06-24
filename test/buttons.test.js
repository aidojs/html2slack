const buttons = require("../src/lib/buttons")
const parse = require("../src/lib/parse")

describe("HTML buttons to Slack actions converter", () => {
  it("should return an empty object if the node doesn't contain any button", () => {
    const input = parse("<p>Some text but no button</p>")
    expect(buttons(input)).toEqual({})
  })

  it("should convert buttons in the HTML to Slack actions", () => {
    const html = `
    <button>Bar Baz</button>
    <button name="quz">Fnord Foo</button>
    <button name="glop" value="glap">Five Schmekels</button>
    `
    const input = parse(html)
    const { actions } = buttons(input)
    expect(actions.length).toBe(3)
    expect(actions[0]).toEqual({
      text: "Bar Baz",
      type: "button",
    })
    expect(actions[1]).toEqual({
      text: "Fnord Foo",
      name: "quz",
      value: "quz",
      type: "button",
    })
    expect(actions[2]).toEqual({
      text: "Five Schmekels",
      name: "glop",
      value: "glap",
      type: "button",
    })
  })

  it("should convert buttons with href attribute to Slack link buttons", () => {
    const url = "https://comet.co"
    const html = `<button href="${url}">Foo</button>`
    const input = parse(html)
    const { actions } = buttons(input)
    expect(actions.length).toBe(1)
    expect(actions[0]).toEqual({
      text: "Foo",
      url,
      type: "button",
    })
  })

  it("should use allowed classes as Slack button styles and ignore others", () => {
    const html = `
    <button class="foo">Unrecognized style</button>
    <button class="primary">Recognized style</button>
    <button class="danger">Recognized style</button>
    <button class="normal">Recognized style</button>
    `
    const input = parse(html)
    const { actions } = buttons(input)
    expect(actions[0].style).toBeUndefined()
    expect(actions[1].style).toBe("primary")
    expect(actions[2].style).toBe("danger")
    expect(actions[3].style).toBe("normal")
  })
})
