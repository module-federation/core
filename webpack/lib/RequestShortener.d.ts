export = RequestShortener;
declare class RequestShortener {
  /**
   * @param {string} dir the directory
   * @param {object=} associatedObjectForCache an object to which the cache will be attached
   */
  constructor(dir: string, associatedObjectForCache?: object | undefined);
  contextify: (arg0: string) => string;
  /**
   * @param {string | undefined | null} request the request to shorten
   * @returns {string | undefined | null} the shortened request
   */
  shorten(request: string | undefined | null): string | undefined | null;
}
