/**
 * Converts HTML buttons in slack actions
 * @param {HTMLElement} node 
 */
function buttons(node) {
  const list = node.querySelectorAll("button")

  if (!list) {
    return {}
  }

  console.log(list.map(button => console.log(button.classNames)))

  // Returns one of the three recognized button styles or empty object
  const getStyle = classes => {
    if (classes.includes("primary")) { return { style: "primary" } }
    if (classes.includes("danger")) { return { style: "danger" } }
    if (classes.includes("normal")) { return { style: "normal" } }
    return {}
  }

  const actions = list.map(({ rawText, attributes, classNames }) => ({
    text: rawText,
    name: attributes.name,
    value: attributes.name,
    type: "button",
    ...getStyle(classNames)
  }))

  return { actions }
}

module.exports = buttons
