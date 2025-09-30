/**
 * The result of parsing a URL relative to a base URL.
 */
export type RelativeURL = {
    /**
     * The relative URL. Either a URL including the origin or a relative URL.
     */
    url: string;
    /**
     * Whether the URL is relative to the base URL.
     */
    isRelative: boolean;
};
export declare function parseRelativeURL(url: string | URL, base: string | URL): RelativeURL;
/**
 * Given a URL as a string and a base URL it will make the URL relative
 * if the parsed protocol and host is the same as the one in the base
 * URL. Otherwise it returns the same URL string.
 */
export declare function getRelativeURL(url: string | URL, base: string | URL): string;
