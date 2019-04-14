const modal = require("../src/lib/modal")
const parse = require("../src/lib/parse")

function modalHTML(html) {
  const { childNodes } = parse(html)
  const form = childNodes[0]
  return modal(form)
}

describe("HTML Form to Slack dialog converter", () => {
  it("should convert the action, header and submit button", () => {
    const output = modalHTML(`
    <form action="foo">
      <header>Title of your sextape</header>
      <input type="submit" value="bar"/> 
    </form>
  `)

    expect(output.title).toBe("Title of your sextape")
    expect(output.callback_id).toBe("foo")
    expect(output.state).toBe("foo")
    expect(output.submit_label).toBe("bar")
  })

  it("should convert text inputs", () => {
    const { elements } = modalHTML(`
      <form action="foo">
        <header>A fine form for fun</header>
        <label>
          Example label
          <input type="text" name="foo" value="bar" placeholder="baz" hint="quz"/>
        </label>
        <label>
          Email input
          <input type="email" name="foo" required="required"/>
        </label>
        <label>
          Number input
          <input type="number" name="foo"/>
        </label>
        <label>
          Telephone input
          <input type="tel" name="foo"/>
        </label>
        <label>
          URL input
          <input type="url" name="foo"/>
        </label>
        <input type="submit" value="bar"/> 
      </form>
    `)
    const [textInput, emailInput, numberInput, telephoneInput, URLInput] = elements

    expect(textInput).toMatchObject({
      type: "text",
      optional: true,
      name: "foo",
      value: "bar",
      placeholder: "baz",
      hint: "quz",
    })
    expect(textInput.label).toContain("Example label")
    expect(textInput).toMatchObject({
      type: "text",
      optional: true,
      name: "foo",
      value: "bar",
      placeholder: "baz",
      hint: "quz",
    })
    expect(emailInput.optional).toBe(false)
    expect(emailInput.subtype).toBe("email")
    expect(numberInput.subtype).toBe("number")
    expect(telephoneInput.subtype).toBe("tel")
    expect(URLInput.subtype).toBe("url")
  })

  it("should convert Select input and its options", () => {
    const { elements } = modalHTML(`
      <form action="foo">
        <header>Title of your sextape</header>
        <label>
          Select input
          <select name="foo">
            <option value="1" selected="selected">Some label</option>
            <option value="2">Another label</option>
          </select>
        </label>
        <input type="submit" value="bar"/> 
      </form>
    `)
    const [select] = elements
    const { options } = select
    expect(select.type).toBe("select")
    expect(select.label).toContain("Select input")
    expect(select.value).toBe("1")
    expect(options.length).toBe(2)
    expect(options[0].label).toBe("Some label")
    expect(options[0].value).toBe("1")
    expect(options[1].label).toBe("Another label")
    expect(options[1].value).toBe("2")
  })

  it("should convert Select input and its option groups", () => {
    const { elements } = modalHTML(`
      <form action="foo">
        <header>Title of your sextape</header>
        <label>
          Select input
          <select name="foo">
            <optgroup label="First group">
              <option value="1">Some label</option>
              <option value="2">Another label</option>
            </optgroup>
            <optgroup label="Second group">
              <option value="3">A final label</option>
            </optgroup>
          </select>
        </label>
        <input type="submit" value="bar"/> 
      </form>
    `)
    const [select] = elements
    const { option_groups } = select
    const [group1, group2] = option_groups
    expect(option_groups.length).toBe(2)
    expect(group1.label).toBe("First group")
    expect(group1.options.length).toBe(2)
    expect(group1.options[0].label).toBe("Some label")
    expect(group1.options[0].value).toBe("1")
    expect(group1.options[1].label).toBe("Another label")
    expect(group1.options[1].value).toBe("2")
    expect(group2.label).toBe("Second group")
    expect(group2.options.length).toBe(1)
    expect(group2.options[0].label).toBe("A final label")
    expect(group2.options[0].value).toBe("3")
  })

  it("should convert TextArea inputs", () => {
    const { elements } = modalHTML(`
      <form action="foo">
        <header>Title of your sextape</header>
        <label>
          Text area
          <textarea min-length="5" max-length="10"></textarea>
        </label>
        <label>
          Email version
          <textarea type="email"></textarea>
        </label>
        <input type="submit" value="bar"/> 
      </form>
    `)
    const [normal, email] = elements
    expect(normal).toMatchObject({
      type: "textarea",
      min_length: "5",
      max_length: "10",
    })
    expect(normal.label).toContain("Text area")
    expect(email).toMatchObject({
      type: "textarea",
      subtype: "email",
    })
    expect(email.label).toContain("Email version")
  })

  it("should ignore the rest", () => {
    const output = modalHTML(`
      <form action="foo">
        <header>Title of your sextape</header>
        <label>
          A useless label
          <p>A useless paragraph</p>
        </label>
        <input type="submit"/> 
      </form>
    `)
    expect(output.elements.length).toBe(0)
  })
})
