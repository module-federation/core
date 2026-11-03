import { Transform } from 'node:stream';
import { StringDecoder } from 'node:string_decoder';
import { htmlFrames } from './frames.server';

/** Input is the Host's raw React stream, before the document template is applied. */
export function hostPieces(
  marker: string,
  maxFrameBytes = 3 * 1024 * 1024,
): Transform {
  if (!marker) throw Error('Host did not provide its SSR shell marker');
  const decoder = new StringDecoder('utf8');
  let shell = false;
  let buffer = '';
  let bufferBytes = 0;
  let searchFrom = 0;
  const fragments = htmlFrames({ maxFrameBytes });
  const output = new Transform({
    readableObjectMode: true,
    transform(chunk, _encoding, callback) {
      try {
        const text = decoder.write(chunk);
        if (!shell) {
          buffer += text;
          bufferBytes += Buffer.byteLength(text);
          const index = buffer.indexOf(marker, searchFrom);
          if (index < 0) {
            searchFrom = Math.max(0, buffer.length - marker.length + 1);
            if (bufferBytes > maxFrameBytes)
              throw Error('Host shell exceeds limit');
            callback();
            return;
          }
          const end = index + marker.length;
          const initial = buffer.slice(0, end);
          if (Buffer.byteLength(initial) > maxFrameBytes)
            throw Error('Host shell exceeds limit');
          output.push(initial);
          const rest = buffer.slice(end);
          buffer = '';
          bufferBytes = 0;
          shell = true;
          fragments.write(rest, callback);
        } else fragments.write(text, callback);
      } catch (error) {
        callback(error as Error);
      }
    },
    flush(callback) {
      if (!shell) {
        callback(Error('Missing Bridge shell marker'));
        return;
      }
      fragments.once('end', () => callback());
      fragments.once('error', callback);
      fragments.end(decoder.end());
    },
    destroy(error, callback) {
      fragments.destroy();
      callback(error);
    },
  });
  fragments.on('data', (fragment: string) => output.push(fragment));
  fragments.on('error', (error) => output.destroy(error));
  return output;
}
