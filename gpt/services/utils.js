const fs = require('fs');
const { embedding } = require('./openai');
const { COSINE_SIM_THRESHOLD } = require('../constants');
// This function takes a search query and a list of files, and returns the chunks of text that are most semantically similar to the query
async function searchFileChunks({ searchQuery, files, maxResults }) {
  // Get the search query embedding
  const searchQueryEmbeddingResponse = await embedding({
    input: searchQuery,
  });
  // Get the first element in the embedding array
  const searchQueryEmbedding =
    searchQueryEmbeddingResponse.length > 0
      ? searchQueryEmbeddingResponse[0]
      : [];
  // Rank the chunks by their cosine similarity to the search query (using dot product since the embeddings are normalized) and return this
  const rankedChunks = files
    // Map each file to an array of chunks with the file name and score
    .flatMap((file) =>
      file.chunks
        ? file.chunks.map((chunk) => {
            // Calculate the dot product between the chunk embedding and the search query embedding
            const dotProduct = chunk.embedding.reduce(
              (sum, val, i) => sum + val * searchQueryEmbedding[i],
              0
            );
            // Assign the dot product as the score for the chunk
            return { ...chunk, filename: file.name, score: dotProduct };
          })
        : []
    )
    // Sort the chunks by their scores in descending order
    .sort((a, b) => b.score - a.score)
    // Filter the chunks by their score above the threshold
    .filter((chunk) => chunk.score > COSINE_SIM_THRESHOLD)
    // Take the first maxResults chunks
    .slice(0, maxResults);
  return rankedChunks;
}
// A function that takes a file name and a string and returns true if the file name is contained in the string
// after removing punctuation and whitespace from both
const isFileNameInString = (fileName, str) => {
  // Check if the input string is null or undefined
  if (!str) {
    return false;
  }
  // Convert both to lowercase and remove punctuation and whitespace
  const normalizedFileName = fileName
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=-_~()\s]/g, '');
  const normalizedStr = str
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=-_~()\s]/g, '');
  // Return true if the normalized file name is included in the normalized string
  return normalizedStr.includes(normalizedFileName);
};

function parseGptResponse(response) {
  console.log('Parsing GPT response...');
  const blocks = response.split('__BLOCK_START__').slice(1); // Ignore everything before the first block
  const parsed = {};
  blocks.forEach((block) => {
    const [filePath, code] = block.split('__CODE_START__');

    const cleanedFilePath = filePath.trim();
    console.log('Parsing block:', cleanedFilePath);

    const cleanedCode = code.split('__BLOCK_END__')[0].trim(); // Ignore everything after the block end
    parsed[cleanedFilePath] = cleanedCode;
  });

  console.log(Object.keys(parsed).length, 'files parsed');

  return parsed;
}

module.exports = {
  parseGptResponse,
  isFileNameInString,
  searchFileChunks,
};
