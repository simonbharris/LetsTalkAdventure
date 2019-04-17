var http = require('http')
var config = require('config')
var secret = require('secret')
var textLib = require('textLib')
var console = require('console')
var dates = require('dates');
const platformsLib = require("./lib/platformsLib.js")
const themesLib = require("./lib/themesLib.js")
const genresLib = require("./lib/genresLib.js")
const releaseStates = require("./lib/ReleaseState.js")

// If we ever take this further, it would be better to just store the ID of platforms, genres, themes, etc. And pair these to names internally. They have a "10k/50k per month limit on their API, the fields search below is a cost of "6", once for the query, and once for each field expansion, IE: genre.name
const gameFields = "fields "
  + " name,"
  + " platforms.name,"
  + " genres.name,"
  + " themes.name,"
  + " cover.image_id,"
  + " summary,"
  + " total_rating,"
  + " total_rating_count,"
  + " similar_games, "
  + " first_release_date, "
  + " external_games.category, "
  + " external_games.url, "
  + " url;"

module.exports.function = function findGames (filter, pageNo) {
  var body = gameFields;
  var url = config.get('api.url') + "games/";

  // If name is supplied
  // For some reason, name can be undefined or empty; so if its either we need to set things to false.
  // Maybe there's a more visual-friendly way of doing this?
  if (filter) {
  if (filter.name && filter.name != "") {
    body += "search \"" + filter.name + "\"; ";
  }
  body += "offset " + pageNo * config.get('maxReturnCount') + "; "
  // Applies most of the "where" clauses and some conditions depending on which sort filters are set.
  body += applyFilters(filter);

  if(!filter.name || filter.name == "")
    body += sortBy(filter.sortFilter)
  body += default_limit();
  }
  
  console.log(body);
  var json = http.postUrl(config.get('api.url') + "games/", body, {"headers" :{"user-key": secret.get('api.key')}})
  var result = convertToGames(JSON.parse(json));
  console.log(json);
  return result
}

/*
** **********************
** --- Helper Functions
** **********************
*/

function convertToGames(apiObj)
{
  var result = [];
    apiObj.forEach(function(o) {
      if (o.first_release_date)
         o.release_date = new dates.ZonedDateTime("UTC+00:00", o.first_release_date*1000).format("MMM dd YYYY")
      o.first_release_date=undefined; // removing untracked field
      console.log(o);
    result.push(o)
  });
  return result;
}

function getEnumID(userInput, group)
{
  var result = [];
  group.forEach(function (g) {
    userInput.forEach( function (u) {
          if (g[1].name == u.toString()) {
      result.push(g[0]);
    }})
  });
  return result;
}

function sortBy (sortFilter) {
  var sort = "sort ";
  console.log("Sort filter: " + sortFilter);
  switch (sortFilter.toString()) {
    case ("popularity"):
      sort += "popularity desc;";
      break;
    case ("total_rating"):
      sort += "total_rating desc;";
      break;
    case ("release_dates"):
      sort += "first_release_date desc;";
      break ;
    default:
      sort += "popularity desc;";
      break;
  }
  return sort;
}

function applyFilters(filter) {
  var body = " where ";
  // Sort of string building a where clause for filtering.

  if (filter.themes != "" || filter.platforms != "" || filter.genres != "") {
    console.log("T: " + filter.themes + ", G: " + filter.genres + ", P: " + filter.platforms)
    if (filter.themes != "") {
      console.log("Adding Themes");
      body += "themes = (" + getEnumID(filter.themes, themesLib).join(",") + ") ";
      body += " & ";
    } 

    if (filter.genres != "") {
      console.log("Adding Genres");
      body += "genres = (" + getEnumID(filter.genres, genresLib).join(",") + ") ";
      body += " & ";
    }

    if (filter.platforms != "") {
      console.log("Adding Platforms");
      body += "platforms = (" + getEnumID(filter.platforms, platformsLib).join(",") + ") ";
      body += " & ";
    }
  }
  
  // body += "status = " + getEnumIstaD(releaseState, releaseStates) + " & ";
  if (filter.sortFilter == "total_rating")
    body += "total_rating_count > 10 & ";
  
  body += setDateRange(filter.releasedSince, filter.sortFilter);
  body += "themes != (42); " // Hardcoded a ban on erotic themes (At least for demo purposes); otherwise these pop up in high popularity filters <.<;
  return body;
}

function getSecondsFromEpoch(date){
  return (date.getMillisFromEpoch() - date.getMillisecond()) / 1000;
}

// Handles the establishment of a time interval to search for games in.
// IE: Games released between the present, and one year ago.
function setDateRange(releasedSince, sortFilter) {
  var body = "";
  var present = new dates.ZonedDateTime("UTC+00:00");
  var timeFrom = (present.minusYears(10).getMillisFromEpoch()-present.getMillisecond())/1000;
  var timeTo = undefined;
  if (releasedSince && releasedSince.dateInterval)
  {
    timeFrom = getSecondsFromEpoch(dates.ZonedDateTime.fromDate(releasedSince.dateInterval.start));
    timeTo = getSecondsFromEpoch(dates.ZonedDateTime.fromDate(releasedSince.dateInterval.end));
  }
  else if (releasedSince && releasedSince.date)
  {
    timeFrom = getSecondsFromEpoch(dates.ZonedDateTime.fromDate(releasedSince.date));
  }
  else if (released = true)
    timeTo = getSecondsFromEpoch(present);
  else{
    timeTo = (present.plusYears(1).getMillisFromEpoch()-present.getMillisecond())/1000;
    timeFrom = getSecondsFromEpoch(present);
  }
  
  if (sortFilter == "release_dates" || releasedSince)
    body += "first_release_date > " + timeFrom + " & ";
  if (timeTo)
    body += "first_release_date < " + timeTo + " & ";
  return body;
}

function default_limit() {
  return "limit " + config.get('maxReturnCount') + ";"
}

