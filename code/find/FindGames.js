var http = require('http')
var config = require('config')
var textLib = require('textLib')
var console = require('console')
const platformsLib = require("./lib/platformsLib.js")
const themesLib = require("./lib/themesLib.js")
const genresLib = require("./lib/genresLib.js")
const gameFields = "fields name, platforms.name, genres.name, themes.name, cover.image_id, summary, total_rating, total_rating_count, url;"


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
      console.log(o);
    result.push(o)
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
                    gameFields + "where "+ fieldName +" = (" + IDs + ");",
                    options))
    return convertToGames(apiObj);
  
}

module.exports.function = function findGames (name, platforms, themes, genres) {
  var options = {}
  var body = gameFields;
  options.headers = {
    "user-key": config.get('api.key')
  }
  var url = config.get('api.url') + "games/";
  
  // If name is supplied
  if (name && name != "") {
    body += "search \"" + name + "\";";
  }
  
  if (themes != "" || platforms != "" || genres != "") {
    console.log("Adding a where clause");
    console.log("T: " + themes + ", G: " + genres + ", P: " + platforms)
    body += " where ";
    if (themes != "") {
      console.log("Adding Themes");
      body += "themes = ( " + getEnumID(themes, themesLib)+ ")";
      if ( genres != "" || platforms != "" )
        body += " & ";
    } 

    if (genres != "") {
      console.log("Adding Genres");
      body += "genres = ( " + getEnumID(genres, genresLib)+ ")";
      if (platforms != "" )
        body += " & ";
    }


    if (platforms != "") {
      console.log("Adding Platforms");
      body += "platforms = ( " + getEnumID(platforms, platformsLib)+ ")";
    }
    body += ";"
  }
  
  var apiObj = JSON.parse(http.postUrl(config.get('api.url') + "games/", body, options))
  var result = convertToGames(apiObj);  
  return result
}
