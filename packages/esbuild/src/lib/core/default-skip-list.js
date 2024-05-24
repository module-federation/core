export const DEFAULT_SKIP_LIST = [
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
  (pkg) => pkg.startsWith('@angular/') && !!pkg.match(/\/testing(\/|$)/),
  (pkg) => pkg.startsWith('@types/'),
  (pkg) => pkg.startsWith('@module-federation/'),
];

export const PREPARED_DEFAULT_SKIP_LIST = prepareSkipList(DEFAULT_SKIP_LIST);

export function prepareSkipList(skipList) {
  return {
    strings: new Set(skipList.filter((e) => typeof e === 'string')),
    functions: skipList.filter((e) => typeof e === 'function'),
    regexps: skipList.filter((e) => typeof e === 'object'),
  };
}

export function isInSkipList(entry, skipList) {
  if (skipList.strings.has(entry)) {
    return true;
  }
  if (skipList.functions.find((f) => f(entry))) {
    return true;
  }
  if (skipList.regexps.find((r) => r.test(entry))) {
    return true;
  }
  return false;
}
