const platformsLib = require("../find/lib/platformsLib.js")

module.exports.function = function getPlatformNames () {
  var result = []
  platformsLib.forEach(function (g) {
    result.push(g[1].name)
  })
  return result
}
