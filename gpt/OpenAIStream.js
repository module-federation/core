const { completionStream } = require('./services/openai');

async function OpenAIStream(payload, onChunk) {
  const { model, messages, temperature, max_tokens } = payload;

  for await (const chunk of completionStream({
    model,
    messages,
    temperature,
    max_tokens,
    fallback: null,
  })) {
    onChunk(chunk);
  }
}

module.exports = OpenAIStream;
