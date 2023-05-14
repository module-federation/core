const { createParser } = require('eventsource-parser');
const { TextEncoder, TextDecoder } = require('util');
const fetch = require('node-fetch');

async function OpenAIStream(payload, onChunk) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ''}`,
    },
    method: 'POST',
    body: JSON.stringify(payload),
  });

  // callback
  function onParse(event) {
    if (event.type === 'event') {
      const data = event.data;
      if (data === '[DONE]') {
        console.log(event);
        return;
      }
      try {
        const json = JSON.parse(data);
        const text = json.choices[0].delta.content;
        onChunk(text); // call the provided callback with the chunk
      } catch (e) {
        console.error(e); // handle the error as you prefer
      }
    }
  }

  // stream response (SSE) from OpenAI may be fragmented into multiple chunks
  // this ensures we properly read chunks and invoke an event for each SSE event stream
  const parser = createParser(onParse);

  // https://web.dev/streams/#asynchronous-iteration
  for await (const chunk of res.body) {
    parser.feed(decoder.decode(chunk));
  }
}

module.exports = OpenAIStream;
