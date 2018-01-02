
const { readFile } = require('promise-fs')
const parse = require("./lib/parse")
const mrkdwn = require("./lib/mrkdwn")
const {
  postMessage
} = require("./lib/webhook")

;(async () => {
  const example = process.argv[2]
  const html = await readFile(`./examples/${example}.html`)
  
  const root = parse(html.toString("utf-8"))

  const body = root.querySelector("body")
  const style = root.querySelector("style")

  // Each <section> is its own attachment
  // HTML attributes are reported verbatim in the attachment object, so you can use
  // all customizations from here : https://api.slack.com/docs/message-attachments#attachment_parameters
  // (just replace `_` with `-` in the param names)
  const sectionAttributes = section => Object.keys(section.attributes)
    .reduce((acc, key) => ({
      ...acc,
      [key.replace(/-/g, "_")]: section.attributes[key]
    }), {})

  const attachments = body.querySelectorAll("section").map(section => ({
    color: "good",
    ...sectionAttributes(section),
    text: mrkdwn(section),
    mrkdwn_in: ["text", "pretext", "fields"]
  }))

  // console.log(JSON.stringify(attachments, null, 2))

  postMessage({
    attachments
  })
})().catch(e => { console.error(e) })
