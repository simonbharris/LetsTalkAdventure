module.exports.function = function makefilter (filter, name, platforms, genres, themes, releasedSince, sortFilter) {
  if (filter && filter != "")
    var newFilter = filter;
  else
    var newFilter = {}
  if (name && name != "")
    newFilter.name = name;
  if(platforms && platforms != "")
    newFilter.platforms = platforms;
  if(genres && genres != "")
    newFilter.genres = genres;
  if(themes && themes != "")
    newFilter.themes = themes;
  if(releasedSince && releasedSince != "")
    newFilter.releasedSince = releasedSince;
  if(sortFilter && sortFilter != "")
    newFilter.sortFilter = sortFilter;
  return newFilter;
}
