var http = require('http')
var config = require('config')
const platforms = require("./lib/platforms.js")
const themes = require("./lib/themes.js")
const genres = require("./lib/genres.js")

function pairIds(ids, group) {
  var result = [];
  
  if (ids)
    group.forEach(function (g) {
      ids.forEach(function (id) {
        if (g.id == id)
          result.push(g.name)
      });
    });
  return result;
}

module.exports.function = function getGameDetails () {
  var options = {}
  options.headers = {
    "user-key": config.get('api.key')
  }
  
  var apiobj = JSON.parse(http.postUrl(config.get('api.url') + "games/", "fields name, themes, platforms, genres;", options))
  var result = [];  
  apiobj.forEach(function(o) {
    result.push({
      name: o.name,
      platforms: pairIds(o.platforms, platforms),
      themes: pairIds(o.themes, themes),
      genres: pairIds(o.genres, genres)
    })
  });
  return result
}
