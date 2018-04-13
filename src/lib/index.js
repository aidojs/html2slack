const parse = require("./parse")
const mrkdwn = require("./mrkdwn")
const attributes = require("./attributes")
const fields = require("./fields")
const buttons = require("./buttons")

module.exports = html => {
  const root = parse(html.toString("utf-8"))

  const body = root.querySelector("body")

  const attachments = body.querySelectorAll("section").map(section => ({
    color: "good",
    ...attributes(section),
    ...fields(section),
    ...buttons(section),
    text: mrkdwn(section),
    mrkdwn_in: ["text", "pretext", "fields"]
  }))
  
  return { attachments }
}
