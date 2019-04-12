var http = require('http')
var config = require('config')
var textLib = require('textLib')
var console = require('console')
const platformsLib = require("./lib/platformsLib.js")
const themesLib = require("./lib/themesLib.js")
const genresLib = require("./lib/genresLib.js")

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
      platforms: pairIds(o.platforms, platformsLib),
      themes: pairIds(o.themes, themesLib),
      genres: pairIds(o.genres, genresLib),
    })
      console.log("Pushing game with: " +o.platforms  + " " +  o.themes, + " " +   o.genres);
  });
  return result;
}

function getEnumID(userInput, group)
{
  var result = [];
  group.forEach(function (g) {
    if (g[1].name == userInput.toString()) {
      console.log("Adding" + g[0]);
      result.push(g[0]);
    }
    console.log(g.toString() + " vs " + userInput );
  });
  return result;
}

function simpleFieldSearch(fieldName, IDs, options)
{
    var apiObj = JSON.parse(
                    http.postUrl(config.get('api.url') + "games/",
                    "fields name, themes, platforms, genres;" + "where "+ fieldName +" = (" + IDs + ");",
                    options))
    return convertToGames(apiObj);
  
}

module.exports.function = function findGames (name, platforms, themes, genres) {
  var options = {}
  options.headers = {
    "user-key": config.get('api.key')
  }
  console.log("In findGames");
  // If name is supplied
  if (name) {
    console.log("Name-only Route");
    var apiObj = JSON.parse(
                    http.postUrl(config.get('api.url') + "games/",
                    "fields name, themes, platforms, genres;" + "search \"" + name + "\";",
                    options))
    return convertToGames(apiObj);
  }
  
     
  if (themes) {
    console.log("Theme-only Route");
    var themeIds = getEnumID(themes, themesLib)
    var games = simpleFieldSearch("themes", themeIds, options);
    return games;
  } 
  
  if (genres) {
    console.log("Genre-only route");
    var genreIds = getEnumID(genres, genresLib);
    var games = simpleFieldSearch("genres", genreIds, options);
    return games;
  }

  
  if (platforms) {
    console.log("Platform-only Route");
    var platformIds = getEnumID(platforms, platformsLib)
    var games = simpleFieldSearch("platforms", platformIds, options);
    return games;
  }

  
  var apiObj = JSON.parse(http.postUrl(config.get('api.url') + "games/", "fields name, themes, platforms, genres;", options))
  var result = convertToGames(apiObj);  
  return result
}
