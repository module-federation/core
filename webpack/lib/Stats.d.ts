export = Stats;
/** @typedef {import("../declarations/WebpackOptions").StatsOptions} StatsOptions */
/** @typedef {import("./Compilation")} Compilation */
/** @typedef {import("./stats/DefaultStatsFactoryPlugin").StatsCompilation} StatsCompilation */
declare class Stats {
  /**
   * @param {Compilation} compilation webpack compilation
   */
  constructor(compilation: Compilation);
  compilation: import('./Compilation');
  get hash(): string;
  get startTime(): number;
  get endTime(): number;
  /**
   * @returns {boolean} true if the compilation had a warning
   */
  hasWarnings(): boolean;
  /**
   * @returns {boolean} true if the compilation encountered an error
   */
  hasErrors(): boolean;
  /**
   * @param {(string | boolean | StatsOptions)=} options stats options
   * @returns {StatsCompilation} json output
   */
  toJson(
    options?: (string | boolean | StatsOptions) | undefined,
  ): StatsCompilation;
  /**
   * @param {(string | boolean | StatsOptions)=} options stats options
   * @returns {string} string output
   */
  toString(options?: (string | boolean | StatsOptions) | undefined): string;
}
declare namespace Stats {
  export { StatsOptions, Compilation, StatsCompilation };
}
type StatsOptions = import('../declarations/WebpackOptions').StatsOptions;
type Compilation = import('./Compilation');
type StatsCompilation =
  import('./stats/DefaultStatsFactoryPlugin').StatsCompilation;
