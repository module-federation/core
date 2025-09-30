import { streamToString } from '../stream-utils/node-web-streams-helper';
export async function renderToString({ renderToReadableStream, element }) {
    const renderStream = await renderToReadableStream(element);
    await renderStream.allReady;
    return streamToString(renderStream);
}

//# sourceMappingURL=render-to-string.js.map