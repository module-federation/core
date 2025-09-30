export class PrefixPathnameNormalizer {
    constructor(prefix){
        this.prefix = prefix;
        if (prefix.endsWith('/')) {
            throw Object.defineProperty(new Error(`PrefixPathnameNormalizer: prefix "${prefix}" should not end with a slash`), "__NEXT_ERROR_CODE", {
                value: "E219",
                enumerable: false,
                configurable: true
            });
        }
    }
    match(pathname) {
        // If the pathname doesn't start with the prefix, we don't match.
        if (pathname !== this.prefix && !pathname.startsWith(this.prefix + '/')) {
            return false;
        }
        return true;
    }
    normalize(pathname, matched) {
        // If we're not matched and we don't match, we don't need to normalize.
        if (!matched && !this.match(pathname)) return pathname;
        if (pathname.length === this.prefix.length) {
            return '/';
        }
        return pathname.substring(this.prefix.length);
    }
}

//# sourceMappingURL=prefix.js.map