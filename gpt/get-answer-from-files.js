const { completionStream } = require('./services/openai');
const { showProgress, MAX_FILES_LENGTH, MAX_TOKENS } = require('./constants');
async function getAnswer(chunkMaps, question) {
  let filesString = '';
  for (let fileName in chunkMaps) {
    let fileChunks = chunkMaps[fileName];
    let fileString = fileChunks
      .map((fileChunk) => `###\n\"${fileName}\":\n${fileChunk.text}`)
      .join('\n');
    filesString += fileString + '\n';
  }

  filesString = filesString.slice(0, MAX_FILES_LENGTH);

  const prompt = `Request: ${question}\n\nFiles:\n${filesString}\n\nResponse: #File:[filename] [updated content] #File:[filename] [updated content] #File:[filename] [updated content]`;

  let answer = '';
  try {
    const stream = completionStream({
      prompt,
      temperature: 0.5,
      max_tokens: MAX_TOKENS,
    });
    for await (const data of stream) {
      answer += data;
      if (showProgress) {
        const lines = answer.split('\n');
        const lastLines = lines.slice(-5); // Adjust this number to the number of lines you want to tail
        process.stdout.clearLine();
        console.clear();
        process.stdout.cursorTo(0);
        process.stdout.write(lastLines.join('\n'));
      }
    }

    if (!answer.endsWith('__END_OF_RESPONSE__')) {
      //console.log in red and big
      console.log(
        '\x1b[31m%s\x1b[0m',
        'ERROR: __END_OF_RESPONSE__ not found in answer'
      );
    }
  } catch (error) {
    console.log('getAnswer error', error);
  }
  return answer;
}

module.exports = getAnswer;
