export = MultiStats;
declare class MultiStats {
  /**
   * @param {Stats[]} stats the child stats
   */
  constructor(stats: Stats[]);
  stats: import('./Stats')[];
  get hash(): string;
  /**
   * @returns {boolean} true if a child compilation encountered an error
   */
  hasErrors(): boolean;
  /**
   * @returns {boolean} true if a child compilation had a warning
   */
  hasWarnings(): boolean;
  _createChildOptions(
    options: any,
    context: any,
  ): {
    version: boolean;
    hash: boolean;
    errorsCount: boolean;
    warningsCount: boolean;
    errors: boolean;
    warnings: boolean;
    children: import('./Compilation').NormalizedStatsOptions[];
  };
  /**
   * @param {any} options stats options
   * @returns {StatsCompilation} json output
   */
  toJson(options: any): StatsCompilation;
  toString(options: any): string;
}
declare namespace MultiStats {
  export { StatsOptions, Stats, KnownStatsCompilation, StatsCompilation };
}
type StatsCompilation =
  import('./stats/DefaultStatsFactoryPlugin').StatsCompilation;
type Stats = import('./Stats');
type StatsOptions = import('../declarations/WebpackOptions').StatsOptions;
type KnownStatsCompilation =
  import('./stats/DefaultStatsFactoryPlugin').KnownStatsCompilation;
