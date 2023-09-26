export = WebpackOptionsDefaulter;
/** @typedef {import("./config/normalization").WebpackOptions} WebpackOptions */
/** @typedef {import("./config/normalization").WebpackOptionsNormalized} WebpackOptionsNormalized */
declare class WebpackOptionsDefaulter {
  /**
   * @param {WebpackOptions} options webpack options
   * @returns {WebpackOptionsNormalized} normalized webpack options
   */
  process(options: WebpackOptions): WebpackOptionsNormalized;
}
declare namespace WebpackOptionsDefaulter {
  export { WebpackOptions, WebpackOptionsNormalized };
}
type WebpackOptions = import('./config/normalization').WebpackOptions;
type WebpackOptionsNormalized =
  import('./config/normalization').WebpackOptionsNormalized;
