var config = require('config')
var secret = require('secret')
var console = require('console')
var http = require('http');

const gameFields = "fields "
  + " name,"
  + " platforms.name,"
  + " genres.name,"
  + " themes.name,"
  + " cover.image_id,"
  + " summary, total_rating,"
  + " total_rating_count,"
  + " similar_games, "
  + " url;"

function convertToGames(apiObj)
{
  var result = [];
    apiObj.forEach(function(o) {
      console.log(o);
    result.push(o)
  });
  return result;
}

module.exports.function = function findGameLike (game) {
  var body = gameFields;
  var url = config.get('api.url') + "games/";
  console.log("Blarg");
  body += "where id = (" + game.similar_games.join(",") + "); limit " + config.get('maxReturnCount') + ";";

  console.log(body);
  var json = http.postUrl(config.get('api.url') + "games/", body, {"headers" :{"user-key": secret.get('api.key')}});
  var result = convertToGames(JSON.parse(json));
  console.log(json);
  return result
}
