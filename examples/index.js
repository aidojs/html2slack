
const { promisify } = require("util")
const fs = require("fs")
const readFile = promisify(fs.readFile)
const html2slack = require("../src/lib")

const {
  postMessage,
} = require("../src/utils/webhook")

/**
 * Usage : SLACK_WEBHOOK=xxx node examples <example name without html extension>
 * - each html file in the examples folder is a valid example
 * - the SLACK_WEBHOOK needs to be configured on your slack team (https://my.slack.com/services/new/incoming-webhook/)
 */
;(async () => {
  const example = process.argv[2]
  const html = await readFile(`./examples/${example}.html`)

  const slack = html2slack(html)

  console.log("# Posting to Slack webhook")
  console.log("# ========================")
  console.log("# Original HTML")
  console.log(html.toString("utf-8"))
  console.log("# ====")
  console.log("# Slack conversion")
  console.log(JSON.stringify(slack, null, 2))
  
  if (process.env["SLACK_WEBHOOK"]) {
    postMessage(slack)
  }
})().catch(e => { console.error(e) })
