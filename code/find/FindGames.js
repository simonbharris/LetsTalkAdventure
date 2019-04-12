var http = require('http')
var config = require('config')
var textLib = require('textLib')
var console = require('console')
const platforms = require("./lib/platforms.js")
const themes = require("./lib/themes.js")
const genres = require("./lib/genres.js")

function pairIds(ids, group) {
  var result = [];
  
  if (ids)
    group.forEach(function (g) {
      ids.forEach(function (id) {
        if (g[0] == id)
          result.push(g[1].name)
      });
    });
  return result;
}

function convertToGames(apiObj)
{
  var result = [];
    apiObj.forEach(function(o) {
    result.push({
      name: o.name,
      platforms: pairIds(o.platforms, platforms),
      themes: pairIds(o.themes, themes),
      genres: pairIds(o.genres, genres)
    })
  });
  return result;
}

// - May need to switch to Enum or change from fuzzymatch;
// Looking for "PlayStation" will return "PlayStation", "Playstation 2", "PlayStation portable"... etc.
function getPlatformID(userInput) {
  var result = [];
  platforms.forEach(function (platform) {
    if (textLib.fuzzyMatch(platform[1].name, userInput.toString()))
      result.push(platform[0]);
  });
  return result;
}

function getThemeID(userInput) {
  var result = [];
  console.log("User Input: " + userInput.toString() + " vs " + themes[0][1].name);
  themes.forEach(function (theme) {
    if (theme[1].name == userInput.toString())
      result.push(theme[0]);
    console.log(theme);
  });
  return result;
}

module.exports.function = function findGames (name, platforms, themes) {
  var options = {}
  options.headers = {
    "user-key": config.get('api.key')
  }
  console.debug("Inside FindGames");
  // If name is supplied
  if (name) {
    var apiObj = JSON.parse(
                    http.postUrl(config.get('api.url') + "games/",
                    "fields name, themes, platforms, genres;" + "search \"" + name + "\";",
                    options))
    return convertToGames(apiObj);
  }
  
  if (themes) {
    var platformIds = getThemeID(themes)
    var apiObj = JSON.parse(
                    http.postUrl(config.get('api.url') + "games/",
                    "fields name, themes, platforms, genres;" + "where platforms = (" + platformIds + ");",
                    options))
    return convertToGames(apiObj);
  }
  
  if (platforms) {
    var platformIds = getPlatformID(platforms)
    var apiObj = JSON.parse(
                    http.postUrl(config.get('api.url') + "games/",
                    "fields name, themes, platforms, genres;" + "where platforms = (" + platformIds + ");",
                    options))
    return convertToGames(apiObj);
  }
  
  var apiObj = JSON.parse(http.postUrl(config.get('api.url') + "games/", "fields name, themes, platforms, genres;", options))
  var result = convertToGames(apiObj);  
  return result
}
