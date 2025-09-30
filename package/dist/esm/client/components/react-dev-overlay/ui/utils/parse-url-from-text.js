export function parseUrlFromText(text, matcherFunc) {
    const linkRegex = /https?:\/\/[^\s/$.?#].[^\s)'"]*/gi;
    const links = Array.from(text.matchAll(linkRegex), (match)=>match[0]);
    if (matcherFunc) {
        return links.filter((link)=>matcherFunc(link));
    }
    return links;
}

//# sourceMappingURL=parse-url-from-text.js.map