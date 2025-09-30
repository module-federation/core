import { arrayBufferToString, stringToUint8Array } from '../app-render/encryption-utils';
/**
 * Parses serialized cache entries into a UseCacheCacheStore
 * @param entries - The serialized entries to parse
 * @returns A new UseCacheCacheStore containing the parsed entries
 */ export function parseUseCacheCacheStore(entries) {
    const store = new Map();
    for (const [key, { value, tags, stale, timestamp, expire, revalidate }] of entries){
        store.set(key, Promise.resolve({
            // Create a ReadableStream from the Uint8Array
            value: new ReadableStream({
                start (controller) {
                    // Enqueue the Uint8Array to the stream
                    controller.enqueue(stringToUint8Array(atob(value)));
                    // Close the stream
                    controller.close();
                }
            }),
            tags,
            stale,
            timestamp,
            expire,
            revalidate
        }));
    }
    return store;
}
/**
 * Serializes UseCacheCacheStore entries into an array of key-value pairs
 * @param entries - The store entries to stringify
 * @returns A promise that resolves to an array of key-value pairs with serialized values
 */ export async function serializeUseCacheCacheStore(entries) {
    return Promise.all(Array.from(entries).map(([key, value])=>{
        return value.then(async (entry)=>{
            const [left, right] = entry.value.tee();
            entry.value = right;
            let binaryString = '';
            // We want to encode the value as a string, but we aren't sure if the
            // value is a a stream of UTF-8 bytes or not, so let's just encode it
            // as a string using base64.
            for await (const chunk of left){
                binaryString += arrayBufferToString(chunk);
            }
            return [
                key,
                {
                    // Encode the value as a base64 string.
                    value: btoa(binaryString),
                    tags: entry.tags,
                    stale: entry.stale,
                    timestamp: entry.timestamp,
                    expire: entry.expire,
                    revalidate: entry.revalidate
                }
            ];
        }).catch(()=>{
            // Any failed cache writes should be ignored as to not discard the
            // entire cache.
            return null;
        });
    }));
}

//# sourceMappingURL=cache-store.js.map