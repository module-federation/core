export type SkipFn = (name: string) => boolean;
export type SkipListEntry = string | RegExp | SkipFn;
export type SkipList = SkipListEntry[];
export type PreparedSkipList = {
  strings: Set<string>;
  functions: SkipFn[];
  regexps: RegExp[];
};

export const DEFAULT_SKIP_LIST: SkipListEntry[] = [
  '@module-federation/native-federation-runtime',
  '@module-federation/native-federation',
  '@module-federation/native-federation-core',
  '@module-federation/native-federation-esbuild',
  '@angular-architects/native-federation',
  '@angular-architects/native-federation-runtime',
  'es-module-shims',
  'zone.js',
  'tslib/',
  '@angular/localize',
  '@angular/localize/init',
  '@angular/localize/tools',
  '@angular/platform-server',
  '@angular/platform-server/init',
  '@angular/ssr',
  'express',
  /\/schematics(\/|$)/,
  /^@nx\/angular/,
  (pkg: string) =>
    pkg.startsWith('@angular/') && !!pkg.match(/\/testing(\/|$)/),
  (pkg: string) => pkg.startsWith('@types/'),
  (pkg: string) => pkg.startsWith('@module-federation/'),
];

export const PREPARED_DEFAULT_SKIP_LIST: PreparedSkipList =
  prepareSkipList(DEFAULT_SKIP_LIST);

export function prepareSkipList(skipList: SkipListEntry[]): PreparedSkipList {
  return {
    strings: new Set(
      skipList.filter((e): e is string => typeof e === 'string'),
    ),
    functions: skipList.filter((e): e is SkipFn => typeof e === 'function'),
    regexps: skipList.filter((e): e is RegExp => e instanceof RegExp),
  };
}

export function isInSkipList(
  entry: string,
  skipList: PreparedSkipList,
): boolean {
  if (skipList.strings.has(entry)) {
    return true;
  }
  if (skipList.functions.some((f) => f(entry))) {
    return true;
  }
  if (skipList.regexps.some((r) => r.test(entry))) {
    return true;
  }
  return false;
}
