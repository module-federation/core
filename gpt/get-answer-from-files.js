const { ChatCompletionRequestMessageRoleEnum } = require('openai');
const { completionStream } = require('./services/openai');
const {
  showProgress,
  chatHistory,
  MAX_FILES_LENGTH,
  MAX_TOKENS,
  response,
  model,
} = require('./constants');

async function getAnswer(chunkMaps, question) {
  let filesString = '';
  for (let fileName in chunkMaps) {
    let fileChunks = chunkMaps[fileName];
    let fileString = fileChunks
      .map((fileChunk) => `###\n\"${fileName}\":\n${fileChunk.text}`)
      .join('\n');
    filesString += fileString + '\n';
  }

  const basePrompt = `Request: ${question}\n\nFiles:\n`;
  const responsePrompt = `\n\nResponse: #File:[filename] [updated content] #File:[filename] [updated content] #File:[filename] [updated content]`;

  let answer = '';
  let fileChunks = filesString.split('\n');
  let currentChunk = '';

  for (let i = 0; i < fileChunks.length; i++) {
    let newChunk = currentChunk + fileChunks[i] + '\n';
    if (newChunk.length > MAX_FILES_LENGTH) {
      console.log('hitting openapi again');
      // Send the current chunk and start a new one
      let prompt = basePrompt + currentChunk + responsePrompt;
      if (prompt) {
        chatHistory.add({
          role: ChatCompletionRequestMessageRoleEnum.System,
          content: prompt,
        });
        console.log(prompt);
      }
      answer += await getAnswerFromStream(prompt, chunkMaps); // pass question here
      currentChunk = fileChunks[i] + '\n';
    } else {
      // Otherwise, add the current line to the chunk
      currentChunk = newChunk;
    }
  }

  if (currentChunk.length > 0) {
    let prompt = basePrompt + currentChunk + responsePrompt;
    chatHistory.add({
      role: ChatCompletionRequestMessageRoleEnum.System,
      content: prompt,
    });
    answer += await getAnswerFromStream(prompt, chunkMaps, question); // pass question here
  }

  console.log(currentChunk);

  return answer;
}

async function getAnswerFromStream(prompt, chunkMaps, question) {
  let answer = '';
  const stream = completionStream({
    prompt,
    temperature: 0.5,
    max_tokens: MAX_TOKENS,
    model,
  });

  // Create a write stream
  const writeStream = fs.createWriteStream('output.txt', { encoding: 'utf8' });

  for await (const data of stream) {
    answer += data;
    writeStream.write(data); // Write data to file

    if (showProgress) {
      const lines = answer.split('\n');
      const lastLines = lines.slice(-5); // Adjust this number to the number of lines you want to tail
      process.stdout.clearLine();
      console.clear();
      process.stdout.cursorTo(0);
      process.stdout.write(lastLines.join('\n'));
    }
  }

  writeStream.end(); // Close the write stream

  if (!answer.endsWith(response.end)) {
    console.log(
      '\x1b[31m%s\x1b[0m',
      `ERROR: ${response.end} not found in answer`
    );
    console.log(answer);
    chatHistory.add({
      role: 'user',
      content: 'Can you continue where you left off?',
    });
    return getAnswer(chunkMaps, question);
  }

  return answer;
}

module.exports = getAnswer;
