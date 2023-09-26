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
  get startTime(): any;
  get endTime(): any;
  /**
   * @returns {boolean} true if the compilation had a warning
   */
  hasWarnings(): boolean;
  /**
   * @returns {boolean} true if the compilation encountered an error
   */
  hasErrors(): boolean;
  /**
   * @param {(string|StatsOptions)=} options stats options
   * @returns {StatsCompilation} json output
   */
  toJson(options?: (string | StatsOptions) | undefined): StatsCompilation;
  toString(options: any): string;
}
declare namespace Stats {
  export { StatsOptions, Compilation, StatsCompilation };
}
type StatsOptions = import('../declarations/WebpackOptions').StatsOptions;
type StatsCompilation =
  import('./stats/DefaultStatsFactoryPlugin').StatsCompilation;
type Compilation = import('./Compilation');
