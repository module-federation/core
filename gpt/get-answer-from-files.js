const { ChatCompletionRequestMessageRoleEnum } = require('openai');
const { completionStream } = require('./services/openai');
const fs = require('fs');
const {
  showProgress,
  chatHistory,
  MAX_FILES_LENGTH,
  MAX_TOKENS,
  response,
  model,
} = require('./constants');
const { normalizedFileName, parseGptResponse } = require('./services/utils');

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
      let prompt = basePrompt + currentChunk + responsePrompt;
      if (prompt) {
        chatHistory.add({
          role: ChatCompletionRequestMessageRoleEnum.System,
          content: prompt,
        });
        console.log(prompt);
      }
      answer += await getAnswerFromStream(prompt, chunkMaps);
      currentChunk = fileChunks[i] + '\n';
    } else {
      currentChunk = newChunk;
    }
  }

  if (fileChunks.length > 0) {
    let prompt = basePrompt + currentChunk + responsePrompt;
    chatHistory.add({
      role: ChatCompletionRequestMessageRoleEnum.System,
      content: prompt,
    });
    answer += await getAnswerFromStream(prompt, chunkMaps);
  }

  return answer;
}

async function getAnswerFromStream(prompt, chunks) {
  let answer = '';
  const stream = completionStream({
    prompt,
    temperature: 0.5,
    max_tokens: MAX_TOKENS,
    model,
  });

  let writeStreams = {};

  for (let path in chunks) {
    writeStreams[path + '.gpt.js'] = {
      stream: fs.createWriteStream(path + '.gpt.js', { encoding: 'utf8' }),
      lastWrittenPos: 0,
    };
  }

  for await (const data of stream) {
    answer += data;

    const response = parseGptResponse(data);

    for (let fileName in response) {
      const tempname = fileName + '.gpt.js';
      if (!writeStreams[tempname]) {
        writeStreams[tempname] = {
          stream: fs.createWriteStream(tempname, { encoding: 'utf8' }),
          lastWrittenPos: 0,
        };
      }
      const newContent = response[fileName].slice(
        writeStreams[tempname].lastWrittenPos
      );
      console.log('writing to file', tempname, newContent);
      writeStreams[tempname].stream.write(newContent);
      writeStreams[tempname].lastWrittenPos = response[fileName].length;
    }

    if (showProgress) {
      // const lines = answer.split('\n');
      // process.stdout.clearLine();
      // process.stdout.cursorTo(0);
      // process.stdout.write(lines.join('\n'));
    }
  }

  for (let fileName in writeStreams) {
    const tempname = fileName;
    writeStreams[tempname].stream.end();
    delete writeStreams[tempname];
  }

  return answer;
}

module.exports.getAnswer = getAnswer;
