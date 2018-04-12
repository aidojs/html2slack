const HTMLParser = require("fast-html-parser")
const { minify } = require("html-minifier")

const parse = html => HTMLParser.parse(
  minify(html, {
    collapseWhitespace: true
  }), {
    lowerCaseTagName: true,
    style: true,
    pre: true
  }
)

module.exports = parse
