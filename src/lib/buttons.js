/**
 * Converts HTML buttons in slack actions
 * @param {HTMLElement} node 
 */
function buttons(node) {
  const list = node.querySelectorAll("button")

  if (!list.length) {
    return {}
  }

  // Returns one of the three recognized button styles or an empty object
  const getStyle = classes => {
    if (classes.includes("primary")) { return { style: "primary" } }
    if (classes.includes("danger")) { return { style: "danger" } }
    if (classes.includes("normal")) { return { style: "normal" } }
    return {}
  }

  const actions = list.map(({ rawText, attributes, classNames }) => ({
    text: rawText,
    name: attributes.name,
    value: attributes.value || attributes.name,
    type: "button",
    ...getStyle(classNames),
  }))

  return { actions }
}

module.exports = buttons
