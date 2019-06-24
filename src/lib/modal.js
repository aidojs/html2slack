const dashAttributes = require("./attributes")

/**
 * Converts a form into a Slack dialog
 * @param {HTMLElement} form 
 */
function modal(form) {
  const action = form.attributes["action"]
  const [submitButton] = form.querySelectorAll("input").filter(({ attributes }) => attributes.type === "submit")
  const header = form.querySelector("header")
  const labels = form.querySelectorAll("label")

  const submitLabel = submitButton.attributes.value ? submitButton.attributes.value.substring(0, 23) : ""
  const title = header.text.substring(0, 23)

  const elements = labels.map(label => {
    const textInput = label.querySelector("input")
    const select = label.querySelector("select")
    const textarea = label.querySelector("textarea")
    const labelTextNode = label.childNodes.find(child => child.constructor.name === "TextNode")

    if (textInput) {
      const { attributes } = textInput
      return {
        type: "text",
        label: labelTextNode.text.substring(0, 24),
        ...attributes.type !== "text" && { subtype: attributes.type },
        optional: !attributes.required,
        ...dashAttributes(textInput),
      }
    }

    if (select) {
      const { attributes } = select
      const optgroups = select.querySelectorAll("optgroup")
      const options = select.querySelectorAll("option")
      const selected = options.find(option => option.attributes.selected)

      const base = {
        type: "select",
        label: labelTextNode.text.substring(0, 24),
        optional: !attributes.required,
        ...dashAttributes(select),
      }
      if (selected) { base.value = selected.attributes.value}

      if (optgroups.length > 0) {
        return {
          ...base,
          option_groups: optgroups.map(optgroup => ({
            label: optgroup.attributes.label,
            options: optgroup.querySelectorAll("option").map(option => ({ value: option.attributes.value, label: option.text })),
          })),
        }
      } else {
        return {
          ...base,
          options: options.map(option => ({ value: option.attributes.value, label: option.rawText })),
        }
      }
    }

    if (textarea) {
      const { attributes } = textarea
      return {
        label: labelTextNode.text.substring(0, 24),
        ...attributes.type && { subtype: attributes.type },
        optional: !attributes.required,
        ...dashAttributes(textarea),
        type: "textarea",
      }
    }
    return null
  })

  return {
    title,
    callback_id: action,
    state: action,
    submit_label: submitLabel,
    elements: elements.filter(Boolean),
  }
}

module.exports = modal
