module.exports.function = function makefilter (name, platforms, genres, themes, releasedSince, sortFilter) {
  var filter = {}
  filter.name = name;
  filter.platforms = platforms;
  filter.genres = genres;
  filter.themes = themes;
  filter.releasedSince = releasedSince;
  filter.sortFilter = sortFilter;
  return filter;
}
