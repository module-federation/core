const searchFileChunks = require('./services/searchFileChunks');

async function searchChunks(searchQuery, files, maxResults) {
  const searchResults = await searchFileChunks({
    searchQuery,
    files,
    maxResults,
  });

  return searchResults;
}

module.exports = searchChunks;
