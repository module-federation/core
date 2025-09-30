/**
 * Formats the manifest depending on the environment variable
 * `NODE_ENV`. If it's set to `development`, it will return a pretty printed
 * JSON string, otherwise it will return a minified JSON string.
 */ export function formatManifest(manifest) {
    return JSON.stringify(manifest, null, 2);
}

//# sourceMappingURL=format-manifest.js.map