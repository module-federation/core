const numericId = '0|[1-9]\\d*';
const numericIdLoose = '[0-9]+';

const nonNumericId = '\\d*[a-zA-Z-][a-zA-Z0-9-]*';

const preReleaseId = `(?:${numericId}|${nonNumericId})`;
const preReleaseIdLoose = `(?:${numericIdLoose}|${nonNumericId})`;

const buildId = '[0-9A-Za-z-]+';
const buildMetadata = `(?:\\+(${buildId}(?:\\.${buildId})*))`;

const preReleaseMetadata = `(?:-(${preReleaseId}(?:\\.${preReleaseId})*))`;
const preReleaseMetadataLoose = `(?:-?(${preReleaseIdLoose}(?:\\.${preReleaseIdLoose})*))`;

const versionCore = `(${numericId})\\.(${numericId})\\.(${numericId})`;
const versionCoreLoose = `(${numericIdLoose})\\.(${numericIdLoose})\\.(${numericIdLoose})`;

const xRangeId = `${numericId}|x|X|\\*`;
const xRangePattern = `[v=\\s]*(${xRangeId})(?:\\.(${xRangeId})(?:\\.(${xRangeId})(?:${preReleaseMetadata})?${buildMetadata}?)?)?`;

const fullPattern = `v?${versionCore}${preReleaseMetadata}?${buildMetadata}?`;
const loosePattern = `[v=\\s]*${versionCoreLoose}${preReleaseMetadataLoose}?${buildMetadata}?`;

const comparatorOperator = '((?:<|>)?=?)';

export const hyphenRange = `^\\s*(${xRangePattern})\\s+-\\s+(${xRangePattern})\\s*$`;
export const comparator = `^${comparatorOperator}\\s*(${fullPattern})$|^$`;
export const xRange = `^${comparatorOperator}\\s*${xRangePattern}$`;
export const comparatorTrim = `(\\s*)${comparatorOperator}\\s*(${loosePattern}|${xRangePattern})`;

const tildeOperator = '(?:~>?)';
const caretOperator = '(?:\\^)';

export const tilde = `^${tildeOperator}${xRangePattern}$`;
export const caret = `^${caretOperator}${xRangePattern}$`;
export const tildeTrim = `(\\s*)${tildeOperator}\\s+`;
export const caretTrim = `(\\s*)${caretOperator}\\s+`;
export const star = '(<|>)?=?\\s*\\*';

export const gte0 = '^\\s*>=\\s*0.0.0\\s*$'; // Indicates a greater than or equal comparison to version 0.0.0
