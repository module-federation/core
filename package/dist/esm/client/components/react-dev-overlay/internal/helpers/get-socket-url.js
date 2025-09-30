function getSocketProtocol(assetPrefix) {
    let protocol = window.location.protocol;
    try {
        // assetPrefix is a url
        protocol = new URL(assetPrefix).protocol;
    } catch (e) {}
    return protocol === "http:" ? "ws" : "wss";
}
export function getSocketUrl(assetPrefix) {
    const { hostname, port } = window.location;
    const protocol = getSocketProtocol(assetPrefix);
    const normalizedAssetPrefix = assetPrefix.replace(/^\/+/, "");
    let url = protocol + "://" + hostname + ":" + port + (normalizedAssetPrefix ? "/" + normalizedAssetPrefix : "");
    if (normalizedAssetPrefix.startsWith("http")) {
        url = protocol + "://" + normalizedAssetPrefix.split("://", 2)[1];
    }
    return url;
}

//# sourceMappingURL=get-socket-url.js.map