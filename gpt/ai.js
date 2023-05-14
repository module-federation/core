const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { execSync } = require('child_process');
const fetch = require('node-fetch');
const { pipeline, Transform } = require('stream');
const { TextDecoder } = require('util');
const { get_encoding, encoding_for_model } = require('@dqbd/tiktoken');
const { streamGPT, chatHistory } = require('./generate');
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const chatgptApiEndpoint = 'https://api.openai.com/v1/chat/completions';
const chatgptApiKey = process.env.OPENAI_API_KEY;
const MAX_CHAR_COUNT = 10000;
const historyLength = 5; // Change this value to set the desired chat history length
async function sendPromptToGPT({ role = 'assistant', prompt, userFeedback }) {
  console.log('Sending Prompt to GPT...');
  const argv = yargs(hideBin(process.argv)).argv;
  if (!prompt && !userFeedback) {
    console.error('No prompt to send');
    return;
  }

  let enc = encoding_for_model('gpt-3.5-turbo');
  let encoded = enc.encode(prompt);
  enc.free();

  if (!chatgptApiKey) {
    throw new Error('Please set the OPENAI_API_KEY environment variable.');
  }

  // Prepare the message input with the user's chat history
  // const messageInput = [{ role: 'system', content: '' }];
  // const recentHistory = chatHistory[username].slice(-historyLength);
  // recentHistory.forEach((msg) => {
  //   messageInput.push(msg);
  // });

  console.log('Sending prompt to OpenAI API...');
  const gptStream = await streamGPT(prompt, userFeedback, true);

  let content = gptStream;

  console.log(
    'usage',
    // data.usage,
    'predicted tokens:',
    encoded && encoded.length
  );

  return content;
}

module.exports = {
  sendPromptToGPT,
  MAX_CHAR_COUNT,
  readline: rl,
  chatHistory,
};
