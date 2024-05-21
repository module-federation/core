import { comparator } from './constants';

// This function creates a regular expression from a given string.
export function parseRegex(source: string): RegExp {
  return new RegExp(source);
}

// This function checks if the provided version string represents a wildcard version.
export function isXVersion(version: string): boolean {
  return !version || version.toLowerCase() === 'x' || version === '*';
}

// This function constructs a version string from given components.
export function combineVersion(
  major: string,
  minor: string,
  patch: string,
  preRelease = '',
): string {
  const mainVersion = `${major}.${minor}.${patch}`;
  return preRelease ? `${mainVersion}-${preRelease}` : mainVersion;
}

// This function extracts a RegExpMatchArray from a comparator string using the predefined comparator regex.
export function extractComparator(
  comparatorString: string,
): RegExpMatchArray | null {
  return comparatorString.match(parseRegex(comparator));
}

// Overloaded pipe function to support typing for up to 7 function compositions.
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function pipe<TArgs extends any[], R1, R2, R3, R4, R5, R6, R7>(
  f1: (...args: TArgs) => R1,
  f2: (a: R1) => R2,
  f3: (a: R2) => R3,
  f4: (a: R3) => R4,
  f5: (a: R4) => R5,
  f6: (a: R5) => R6,
  f7: (a: R6) => R7,
): (...args: TArgs) => R7;
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function pipe<TArgs extends any[], R1, R2, R3, R4, R5, R6>(
  f1: (...args: TArgs) => R1,
  f2: (a: R1) => R2,
  f3: (a: R2) => R3,
  f4: (a: R3) => R4,
  f5: (a: R4) => R5,
  f6: (a: R5) => R6,
): (...args: TArgs) => R6;
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function pipe<TArgs extends any[], R1, R2, R3, R4, R5>(
  f1: (...args: TArgs) => R1,
  f2: (a: R1) => R2,
  f3: (a: R2) => R3,
  f4: (a: R3) => R4,
  f5: (a: R4) => R5,
): (...args: TArgs) => R5;
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function pipe<TArgs extends any[], R1, R2, R3, R4>(
  f1: (...args: TArgs) => R1,
  f2: (a: R1) => R2,
  f3: (a: R2) => R3,
  f4: (a: R3) => R4,
): (...args: TArgs) => R4;
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function pipe<TArgs extends any[], R1, R2, R3>(
  f1: (...args: TArgs) => R1,
  f2: (a: R1) => R2,
  f3: (a: R2) => R3,
): (...args: TArgs) => R3;
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function pipe<TArgs extends any[], R1, R2>(
  f1: (...args: TArgs) => R1,
  f2: (a: R1) => R2,
): (...args: TArgs) => R2;
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function pipe<TArgs extends any[], R1>(
  f1: (...args: TArgs) => R1,
): (...args: TArgs) => R1;
// Continue with additional overloads...
// This function pipes the output of one function to the input of another, supporting chaining of multiple functions.
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function pipe(...fns: ((params: any) => any)[]) {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  return (initialValue: unknown): any =>
    fns.reduce((value, func) => func(value), initialValue);
}
