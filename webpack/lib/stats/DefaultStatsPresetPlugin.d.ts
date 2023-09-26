export = DefaultStatsPresetPlugin;
declare class DefaultStatsPresetPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace DefaultStatsPresetPlugin {
  export { StatsOptions, Compilation, CreateStatsOptionsContext, Compiler };
}
type Compiler = import('../Compiler');
type StatsOptions = import('../../declarations/WebpackOptions').StatsOptions;
type Compilation = import('../Compilation');
type CreateStatsOptionsContext =
  import('../Compilation').CreateStatsOptionsContext;
