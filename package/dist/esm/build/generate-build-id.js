export async function generateBuildId(generate, fallback) {
    let buildId = await generate();
    // If there's no buildId defined we'll fall back
    if (buildId === null) {
        // We also create a new buildId if it contains the word `ad` to avoid false
        // positives with ad blockers
        while(!buildId || /ad/i.test(buildId)){
            buildId = fallback();
        }
    }
    if (typeof buildId !== 'string') {
        throw Object.defineProperty(new Error('generateBuildId did not return a string. https://nextjs.org/docs/messages/generatebuildid-not-a-string'), "__NEXT_ERROR_CODE", {
            value: "E455",
            enumerable: false,
            configurable: true
        });
    }
    return buildId.trim();
}

//# sourceMappingURL=generate-build-id.js.map