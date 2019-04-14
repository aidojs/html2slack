
const request = require("request-promise-native")

/**
 * Helpers to post examples on existing incoming webhooks
 * The webhook first needs to be setup on Slack (https://my.slack.com/services/new/incoming-webhook/)
 */
const defaultWebhook = process.env["SLACK_WEBHOOK"]

const options = {
  method: "POST",
  json: true,
}

function postText(message, webhook = defaultWebhook) {
  return request({
    ...options,
    uri: webhook,
    body: { text: message },
  })
    .catch(e => { console.error(e) })
}

function postMessage(message, webhook = defaultWebhook) {
  return request({
    ...options,
    uri: webhook,
    body: message,
  })
    .catch(e => { console.error(e) })
}

module.exports = {
  postText,
  postMessage,
}
