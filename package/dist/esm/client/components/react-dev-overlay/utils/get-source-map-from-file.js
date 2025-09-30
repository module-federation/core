import fs from 'fs/promises';
import path from 'path';
import url from 'url';
import dataUriToBuffer from 'next/dist/compiled/data-uri-to-buffer';
import { getSourceMapUrl } from './get-source-map-url';
export async function getSourceMapFromFile(filename) {
    filename = filename.startsWith('file://') ? url.fileURLToPath(filename) : filename;
    let fileContents;
    try {
        fileContents = await fs.readFile(filename, 'utf-8');
    } catch (error) {
        throw Object.defineProperty(new Error("Failed to read file contents of " + filename + ".", {
            cause: error
        }), "__NEXT_ERROR_CODE", {
            value: "E466",
            enumerable: false,
            configurable: true
        });
    }
    const sourceUrl = getSourceMapUrl(fileContents);
    if (!sourceUrl) {
        return undefined;
    }
    if (sourceUrl.startsWith('data:')) {
        let buffer;
        try {
            buffer = dataUriToBuffer(sourceUrl);
        } catch (error) {
            throw Object.defineProperty(new Error("Failed to parse source map URL for " + filename + ".", {
                cause: error
            }), "__NEXT_ERROR_CODE", {
                value: "E199",
                enumerable: false,
                configurable: true
            });
        }
        if (buffer.type !== 'application/json') {
            throw Object.defineProperty(new Error("Unknown source map type for " + filename + ": " + buffer.typeFull + "."), "__NEXT_ERROR_CODE", {
                value: "E113",
                enumerable: false,
                configurable: true
            });
        }
        try {
            return JSON.parse(buffer.toString());
        } catch (error) {
            throw Object.defineProperty(new Error("Failed to parse source map for " + filename + ".", {
                cause: error
            }), "__NEXT_ERROR_CODE", {
                value: "E318",
                enumerable: false,
                configurable: true
            });
        }
    }
    const sourceMapFilename = path.resolve(path.dirname(filename), decodeURIComponent(sourceUrl));
    try {
        const sourceMapContents = await fs.readFile(sourceMapFilename, 'utf-8');
        return JSON.parse(sourceMapContents.toString());
    } catch (error) {
        throw Object.defineProperty(new Error("Failed to parse source map " + sourceMapFilename + ".", {
            cause: error
        }), "__NEXT_ERROR_CODE", {
            value: "E220",
            enumerable: false,
            configurable: true
        });
    }
}

//# sourceMappingURL=get-source-map-from-file.js.map