export = DependencyTemplates;
/** @typedef {import("./Compilation").DependencyConstructor} DependencyConstructor */
/** @typedef {import("./DependencyTemplate")} DependencyTemplate */
/** @typedef {typeof import("./util/Hash")} Hash */
declare class DependencyTemplates {
  /**
   * @param {string | Hash} hashFunction the hash function to use
   */
  constructor(hashFunction?: string | Hash);
  /** @type {Map<DependencyConstructor, DependencyTemplate>} */
  _map: Map<DependencyConstructor, DependencyTemplate>;
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
  export { DependencyConstructor, DependencyTemplate, Hash };
}
type DependencyConstructor = import('./Compilation').DependencyConstructor;
type DependencyTemplate = import('./DependencyTemplate');
type Hash = typeof import('./util/Hash');
