export = ContainerEntryDependency;
/** @typedef {import("webpack/lib/container/ContainerEntryModule").ExposeOptions} ExposeOptions */
declare class ContainerEntryDependency extends Dependency {
  /**
   * @param {string} name entry name
   * @param {[string, ExposeOptions][]} exposes list of exposed modules
   * @param {string} shareScope name of the share scope
   */
  constructor(
    name: string,
    exposes: [string, ExposeOptions][],
    shareScope: string,
  );
  name: string;
  exposes: [
    string,
    import('webpack/lib/container/ContainerEntryModule').ExposeOptions,
  ][];
  shareScope: string;
}
declare namespace ContainerEntryDependency {
  export { ExposeOptions };
}
import Dependency = require('webpack/lib/Dependency');
type ExposeOptions =
  import('webpack/lib/container/ContainerEntryModule').ExposeOptions;
