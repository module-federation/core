// TypeScript trick to simulate opaque types, like in Flow.
export function createCacheKey(originalHref, nextUrl) {
    const originalUrl = new URL(originalHref);
    const cacheKey = {
        href: originalHref,
        search: originalUrl.search,
        nextUrl: nextUrl
    };
    return cacheKey;
}

//# sourceMappingURL=cache-key.js.map