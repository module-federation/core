const { completionStream } = require('./services/openai');

async function generateUnitTest(code, description) {
  const prompt = `Given the following Python function:

${code}

And the following description of the function's behavior:

${description}

Write a unit test for this function using the unittest module in Python.`;

  const stream = completionStream({ model: 'text-davinci-002', prompt });

  let unitTest = '';
  for await (const data of stream) {
    unitTest += data;
  }

  return unitTest;
}

module.exports = generateUnitTest;
