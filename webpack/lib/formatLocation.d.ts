export = formatLocation;
/**
 * @param {DependencyLocation} loc location
 * @returns {string} formatted location
 */
declare function formatLocation(loc: DependencyLocation): string;
declare namespace formatLocation {
  export { DependencyLocation, SourcePosition };
}
type DependencyLocation = import('./Dependency').DependencyLocation;
type SourcePosition = import('./Dependency').SourcePosition;
