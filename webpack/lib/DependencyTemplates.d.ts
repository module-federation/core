export = DependencyTemplates;
/** @typedef {import("./Dependency")} Dependency */
/** @typedef {import("./DependencyTemplate")} DependencyTemplate */
/** @typedef {typeof import("./util/Hash")} Hash */
/** @typedef {new (...args: any[]) => Dependency} DependencyConstructor */
declare class DependencyTemplates {
  /**
   * @param {string | Hash} hashFunction the hash function to use
   */
  constructor(hashFunction?: string | Hash);
  /** @type {Map<Function, DependencyTemplate>} */
  _map: Map<Function, DependencyTemplate>;
  /** @type {string} */
  _hash: string;
  _hashFunction: string | typeof import('./util/Hash');
  /**
   * @param {DependencyConstructor} dependency Constructor of Dependency
   * @returns {DependencyTemplate | undefined} template for this dependency
   */
  get(dependency: DependencyConstructor): DependencyTemplate | undefined;
  /**
   * @param {DependencyConstructor} dependency Constructor of Dependency
   * @param {DependencyTemplate} dependencyTemplate template for this dependency
   * @returns {void}
   */
  set(
    dependency: DependencyConstructor,
    dependencyTemplate: DependencyTemplate,
  ): void;
  /**
   * @param {string} part additional hash contributor
   * @returns {void}
   */
  updateHash(part: string): void;
  getHash(): string;
  clone(): DependencyTemplates;
}
declare namespace DependencyTemplates {
  export { Dependency, DependencyTemplate, Hash, DependencyConstructor };
}
type DependencyTemplate = import('./DependencyTemplate');
type DependencyConstructor = new (...args: any[]) => Dependency;
type Hash = typeof import('./util/Hash');
type Dependency = import('./Dependency');
