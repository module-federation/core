const fs = require('fs');
const path = require('path');
const createEmbeddings = require('./services/createEmbeddings');
const extractTextFromFile = require('./services/extractTextFromFile');

async function processFile(filepath) {
  const text = await extractTextFromFile({
    filepath,
    filetype: path.extname(filepath) || '.txt',
  });

  const embedding = await createEmbeddings({ text });
  // const { meanEmbedding, chunks }
  return { ...embedding, filepath };
}

module.exports = processFile;
