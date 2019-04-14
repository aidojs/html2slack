
/**
 * Changes attribute names of node, replacing '-' with '_'
 * @param {HTMLElement} node
 */
function dashAttributes(node) {
  return Object.keys(node.attributes)
    .reduce((acc, key) => ({
      ...acc,
      [key.replace(/-/g, "_")]: node.attributes[key],
    }), {})
}

module.exports = dashAttributes
