const themeLib = require("../find/lib/themesLib.js")

module.exports.function = function getThemeNames () {
  var result = []
  themeLib.forEach(function (g) {
    result.push(g[1].name)
  })
  return result
}
