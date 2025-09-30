/**
 * We only encode path delimiters for path segments from
 * getStaticPaths so we need to attempt decoding the URL
 * to match against and only escape the path delimiters
 * this allows non-ascii values to be handled e.g.
 * Japanese characters.
 * */
declare function decodePathParams(pathname: string): string;
export { decodePathParams };
