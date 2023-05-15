const {
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi,
} = require('openai');
const { removeStopwords } = require('stopword');
const {
  model: defaultModel,
  MAX_TOKENS,
  chatHistory,
  filterStopwords,
  response,
} = require('../constants');

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

/**
 * Sends a completion request to the OpenAI API.
 *
 * @param {string} prompt - The prompt to send to the API.
 * @param {number} temperature - The temperature to use for the completion.
 * @param {number} max_tokens - The maximum number of tokens to generate.
 * @returns {Promise<string>} The generated text from the API.
 */
async function completion({
  prompt,
  fallback,
  max_tokens,
  temperature = 0,
  model = defaultModel,
}) {
  const messages = [
    {
      role: ChatCompletionRequestMessageRoleEnum.System,
      content: filterStopwords
        ? removeStopwords((prompt ?? '').split(' ')).join(' ')
        : prompt ?? '',
    },
    ...Array.from(chatHistory),
  ];

  let result;
  try {
    result = await openai.createChatCompletion({
      model,
      messages,
      temperature,
      max_tokens: max_tokens ?? 800,
      stop: [response.end],
    });
  } catch (error) {
    console.error('Error in createChatCompletion:', error);
    if (error.response) {
      console.error('HTTP response body:', error.response.data);
    }
    throw error;
  }

  if (!result.data.choices[0].message) {
    throw new Error('No text returned from completions endpoint');
  }

  const messageContent = result.data.choices[0].message.content;

  chatHistory.add({
    role: ChatCompletionRequestMessageRoleEnum.Assistant,
    content: messageContent,
  });

  return messageContent;
}

/**
 * Sends a completion request to the OpenAI API and returns a stream of text.
 *
 * @param {string} prompt - The prompt to send to the API.
 * @param {number} temperature - The temperature to use for the completion.
 * @param {number} max_tokens - The maximum number of tokens to generate.
 * @returns {AsyncGenerator<string>} An async generator that yields text chunks from the API.
 */
async function* completionStream({
  prompt,
  temperature,
  max_tokens,
  model = defaultModel,
}) {
  const messages = [
    {
      role: ChatCompletionRequestMessageRoleEnum.System,
      content: filterStopwords
        ? removeStopwords((prompt ?? '').split(' ')).join(' ')
        : prompt ?? '',
    },
    ...Array.from(chatHistory),
  ];

  let result;
  try {
    result = await openai.createChatCompletion(
      {
        model,
        messages,
        temperature,
        max_tokens: max_tokens ?? 800,
        stream: true,
        stop: [response.end],
      },
      {
        responseType: 'stream',
      }
    );
  } catch (error) {
    console.error('Error in createChatCompletion:', error);
    if (error.response) {
      console.error('HTTP response body:', error.response.data);
    }
    throw error;
  }

  const stream = result.data;
  let buffer = '';
  const textDecoder = new TextDecoder();
  for await (const chunk of stream) {
    buffer += textDecoder.decode(chunk, { stream: true });

    const lines = buffer.split('\n');

    if (buffer.endsWith('\n')) {
      buffer = '';
    } else {
      buffer = lines.pop() || '';
    }

    for (const line of lines) {
      const message = line.trim().split('data: ')[1];

      if (message === '[DONE]') {
        break;
      }

      if (message) {
        try {
          const data = JSON.parse(message);

          if (data.choices[0].delta?.content) {
            yield data.choices[0].delta?.content;
          }
        } catch (error) {
          console.error('Error parsing JSON message:', error);
        }
      }
    }
  }

  if (buffer) {
    chatHistory.add({
      role: ChatCompletionRequestMessageRoleEnum.Assistant,
      content: buffer,
    });
  }
}

/**
 * Sends an embedding request to the OpenAI API.
 *
 * @param {string[]} input - The input strings to get embeddings for.
 * @returns {Promise<number[][]>} The embeddings for the input strings.
 */
async function embedding({ input, model = 'text-embedding-ada-002' }) {
  const result = await openai.createEmbedding({
    model: 'text-embedding-ada-002', //cant be GPT4
    input,
  });

  if (!result.data.data[0].embedding) {
    throw new Error('No embedding returned from the completions endpoint');
  }

  return result.data.data.map((d) => d.embedding);
}

module.exports = {
  embedding,
  completionStream,
  completion,
  openai,
};
