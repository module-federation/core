const { completionStream } = require('./services/openai');
const { get_encoding, encoding_for_model } = require('@dqbd/tiktoken');
const { MAX_TOKENS, model } = require('./constants'); // make sure to import completionStream
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function sendPromptToGPT({ role = 'assistant', prompt, userFeedback }) {
  console.log('Sending Prompt to GPT...');
  if (!prompt && !userFeedback) {
    console.error('No prompt to send');
    return;
  }

  let enc = encoding_for_model(model);
  let encoded = enc.encode(prompt);
  enc.free();

  console.log('Sending prompt to OpenAI API...');
  console.log('usage', 'predicted tokens:', encoded && encoded.length);

  const gptStream = await completionStream({
    prompt,
    temperature: 0.5,
    max_tokens: MAX_TOKENS,
  });

  let content = '';
  for await (const data of gptStream) {
    content += data;
  }

  return content;
}

module.exports.sendPromptToGPT = sendPromptToGPT;
module.exports.readline = rl;
