const HTMLParser = require("fast-html-parser")

const parse = html => HTMLParser.parse(
  html, {
    lowerCaseTagName: true,
    style: true,
    pre: true,
  }
)

module.exports = parse
