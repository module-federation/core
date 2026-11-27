export = isDependencyKind;
/** @import Dependency, { DependencyKinds } from "./Dependency" */
/**
 * Returns whether a dependency is of the given kind; use it wherever a plugin's dependency can reach.
 * A dependency extending another webpack copy's `Dependency` has no `is()` and is of no kind.
 * @template {keyof DependencyKinds} K
 * @param {Dependency} dependency a dependency
 * @param {K} kind a dependency kind
 * @returns {dependency is DependencyKinds[K]} true when the dependency is of that kind
 */
declare function isDependencyKind<K extends keyof Dependency.DependencyKinds>(dependency: Dependency, kind: K): dependency is Dependency.DependencyKinds[K];
import type Dependency from "./Dependency";
