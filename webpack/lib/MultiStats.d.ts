export = MultiStats;
/** @typedef {undefined | string | boolean | StatsOptions} ChildrenStatsOptions */
/** @typedef {Omit<StatsOptions, "children"> & { children?: ChildrenStatsOptions | ChildrenStatsOptions[] }} MultiStatsOptions */
/** @typedef {{ version: boolean, hash: boolean, errorsCount: boolean, warningsCount: boolean, errors: boolean, warnings: boolean, children: NormalizedStatsOptions[] }} ChildOptions */
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
  /**
   * @param {undefined | string | boolean | MultiStatsOptions} options stats options
   * @param {CreateStatsOptionsContext} context context
   * @returns {ChildOptions} context context
   */
  _createChildOptions(
    options: undefined | string | boolean | MultiStatsOptions,
    context: CreateStatsOptionsContext,
  ): ChildOptions;
  /**
   * @param {(string | boolean | MultiStatsOptions)=} options stats options
   * @returns {StatsCompilation} json output
   */
  toJson(
    options?: (string | boolean | MultiStatsOptions) | undefined,
  ): StatsCompilation;
  /**
   * @param {(string | boolean | MultiStatsOptions)=} options stats options
   * @returns {string} string output
   */
  toString(
    options?: (string | boolean | MultiStatsOptions) | undefined,
  ): string;
}
declare namespace MultiStats {
  export {
    StatsOptions,
    CreateStatsOptionsContext,
    NormalizedStatsOptions,
    Stats,
    KnownStatsCompilation,
    StatsCompilation,
    StatsError,
    ChildrenStatsOptions,
    MultiStatsOptions,
    ChildOptions,
  };
}
type StatsOptions = import('../declarations/WebpackOptions').StatsOptions;
type CreateStatsOptionsContext =
  import('./Compilation').CreateStatsOptionsContext;
type NormalizedStatsOptions = import('./Compilation').NormalizedStatsOptions;
type Stats = import('./Stats');
type KnownStatsCompilation =
  import('./stats/DefaultStatsFactoryPlugin').KnownStatsCompilation;
type StatsCompilation =
  import('./stats/DefaultStatsFactoryPlugin').StatsCompilation;
type StatsError = import('./stats/DefaultStatsFactoryPlugin').StatsError;
type ChildrenStatsOptions = undefined | string | boolean | StatsOptions;
type MultiStatsOptions = Omit<StatsOptions, 'children'> & {
  children?: ChildrenStatsOptions | ChildrenStatsOptions[];
};
type ChildOptions = {
  version: boolean;
  hash: boolean;
  errorsCount: boolean;
  warningsCount: boolean;
  errors: boolean;
  warnings: boolean;
  children: NormalizedStatsOptions[];
};
