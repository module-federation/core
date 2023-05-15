const fs = require('fs');
const path = require('path');
const processFile = require('./process-file');
const { getAnswer } = require('./get-answer-from-files');
const { parseGptResponse } = require('./services/utils');
const { chatHistory, response } = require('./constants');

let prompt = `
Given the files provided, please perform the following tasks as needed:
1. Improve the runtime complexity of the code. Analyze the current time complexity and identify any bottlenecks or inefficient operations. Implement optimizations to improve the efficiency of the code.
2. Add thorough JSDoc comments to all functions, variables, and classes in the code. The comments should provide detailed descriptions of the purpose and functionality of each element, the types and descriptions of all parameters and return values, and any side effects or exceptions. The comments should be formatted correctly for use with autocomplete features in code editors.
3. Refactor the code as needed for easier maintainability. This may include simplifying complex code, breaking down large functions into smaller ones, removing redundant or unnecessary code, improving the organization and structure of the code, and renaming variables and functions for clarity.
4. Ensure that the user feedback is taken into consideration, if it exists.
5. Ensure that the updated code is returned in the response, with no additional text or formatting. The code should be ready to use as-is.
6. Do not include any presentational text in responses. No markdown, code blocks, or other formatting should be included in the response.

Please provide the updated code as the answer to this objective.

The response should follow this template:

__BLOCK_START__
[filename 1]
__CODE_START__
[code changes for file 1]
__BLOCK_END__
__BLOCK_START__
[filename 2]
__CODE_START__
[code changes for file 2]
__BLOCK_END__
${response.end}

For each file, start with '__BLOCK_START__', followed by the filename, then '__CODE_START__', then the updated content of the file, and end with '__BLOCK_END__'. Separate the sections for different files with a newline. The very last line should be ${response.end} mark
`;

async function promptFile(filePaths, question) {
  if (!filePaths || !Array.isArray(filePaths) || filePaths.length === 0) {
    throw new Error('Missing or invalid argument: filePaths');
  }

  if (!question) {
    throw new Error('Missing argument: question');
  }

  chatHistory.add({
    role: 'user',
    content: `Primary Objective/User Feedback: ${question}`,
  });

  let chunkMaps = {};
  for (let filePath of filePaths) {
    console.log('Processing file:', filePath);
    filePath = path.resolve(process.cwd(), filePath);
    try {
      const result = await processFile(filePath);
      if (!chunkMaps[filePath]) chunkMaps[filePath] = [];
      chunkMaps[filePath] = chunkMaps[filePath].concat(result.chunks);
      //getLastItemInArray
      // const lastItem = result.chunks[result.chunks.length - 1];
      // console.log(lastItem.text);
    } catch (err) {
      console.error('Error processing file:', filePath);
      throw err;
    }
  }

  console.log('Asking questions...');

  const answer = await getAnswer(chunkMaps, prompt);
  console.log('Parsing response...');
  const parsedResposne = parseGptResponse(answer);
  console.log('Response parsed successfully.');

  return parsedResposne;
}

module.exports = promptFile;
