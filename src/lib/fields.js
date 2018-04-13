const mrkdwn = require("./mrkdwn")
/**
 * Converts <dl> lists into an array of slack fields with a title & a value
 * Will only convert the first <dl> it finds
 * <dl>
 *   <dt>Title</dt>
 *   <dd>Value</dt>
 * </dl>
 * @param {HTMLElement} node 
 */
function fields(node) {
  const list = node.querySelector("dl")

  if (!list) {
    return {}
  }

  const titles = list.querySelectorAll("dt").map(title => title.rawText)
  const values = list.querySelectorAll("dd").map(value => mrkdwn(value))
  const short = list.querySelectorAll("dd").map(value => value.classNames.includes("short"))

  const fields = titles.map((title, index) => ({
    title,
    value: values[index],
    short: short[index]
  }))

  return { fields }
}

module.exports = fields
