const genreLib = require("../find/lib/genresLib.js")

module.exports.function = function getGenreNames () {
  var result = []
  genreLib.forEach(function (g) {
    result.push(g[1].name)
  })
  return result
}
