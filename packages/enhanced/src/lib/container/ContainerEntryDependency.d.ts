export = ContainerEntryDependency;
/** @typedef {import("./ContainerEntryModule").ExposeOptions} ExposeOptions */
declare class ContainerEntryDependency extends Dependency {
  /**
   * @param {string} name entry name
   * @param {[string, ExposeOptions][]} exposes list of exposed modules
   * @param {string} shareScope name of the share scope
   * @param {string[]} runtimePlugins Runtime plugin file paths or package name.
   */
  constructor(
    name: string,
    exposes: [string, ExposeOptions][],
    shareScope: string,
    runtimePlugins: string[],
  );
  name: string;
  exposes: [string, import('./ContainerEntryModule').ExposeOptions][];
  shareScope: string;
  runtimePlugins: string[];
}
declare namespace ContainerEntryDependency {
  export { ExposeOptions };
}
type ExposeOptions = import('./ContainerEntryModule').ExposeOptions;
