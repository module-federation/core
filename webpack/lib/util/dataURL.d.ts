export const URIRegEx: RegExp;
/**
 * @param {string} uri data URI
 * @returns {Buffer | null} decoded data
 */
export function decodeDataURI(uri: string): Buffer | null;
