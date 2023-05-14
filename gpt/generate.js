const { Configuration, OpenAIApi } = require('openai');
const OpenAIStream = require('./OpenAIStream');
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const chatHistory = new Set();

const openai = new OpenAIApi(configuration);

const pre_prompt = `
You support me in identifying gratitude in my life.
You share examples of gratitude, and you also share reasons why recognizing gratitude
can improve one's wellbeing. You help me find gratitude. Your language is simple, clear,
and you are enthusiastic, compassionate, and caring.
An example of this is "I'm curious, what do you feel grateful for today?"
or "I'd love to know what you feel thankful for."
or "Is there anything that comes to mind today that filled you with gratitude?"
Your presence fills me with calm. You're jovial.
Limit the questions in each message and don't be too repetitive.
Gently introduce the idea of gratitude in our conversation.

Start with a quick greeting, and succinctly give me an example thing i can be thankful for.
Share this example gratitude in the first person.
Here is an example of how to start the conversation:
"Hi! I'm glad we can talk today. One thing I've been grateful for lately is the sound of the wind in the trees. It's beautiful."
`;
function getMessagesPrompt(chat, userFeedback) {
  const system = { role: 'system', content: pre_prompt };
  chatHistory.add(system);
  chat.map((message) => {
    const role = message.name == 'Me' ? 'user' : 'assistant';
    const m = { role: role, content: message.message };
    chatHistory.add(m);
  });
  return messages;
}

async function readChunks(payload, onChunk) {
  const chunks = [];
  OpenAIStream(payload, (chunk) => {
    if (onChunk) onChunk(chunk);
    chunks.push(chunk);
  }).then(() => {
    chatHistory.add({ role: 'assistant', content: chunks.join('') });
  });

  return chunks;
}

async function readChunksBlocking(payload, onChunk) {
  const chunks = [];
  await OpenAIStream(payload, (chunk) => {
    if (onChunk) onChunk(chunk);
    chunks.push(chunk);
  }).then(() => {
    chatHistory.add({ role: 'assistant', content: chunks.join('') });
  });

  return chunks.join('');
}

const handler = async (prompt, userFeedback, blocking = false, onChunk) => {
  if (prompt) {
    const system = { role: 'system', content: prompt };
    chatHistory.add(system);
  }
  if (userFeedback) {
    const user = { role: 'user', content: userFeedback };
    chatHistory.add(user);
  }

  // if (message.trim().length === 0) {
  //   return new Response('Need enter a valid input', { status: 400 });
  // }

  const payload = {
    model: 'gpt-3.5-turbo',
    messages: Array.from(chatHistory),
    temperature: 0.9,
    presence_penalty: 0.6,
    // max_tokens: 100,
    stream: true,
  };

  console.log('history', chatHistory);

  const aiResponse = blocking
    ? await readChunksBlocking(payload, onChunk)
    : await readChunks(payload, onChunk);
  return aiResponse;
};
module.exports.streamGPT = handler;
module.exports.chatHistory = chatHistory;
