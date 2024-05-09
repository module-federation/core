'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.isInSkipList =
  exports.prepareSkipList =
  exports.PREPARED_DEFAULT_SKIP_LIST =
  exports.DEFAULT_SKIP_LIST =
    void 0;
exports.DEFAULT_SKIP_LIST = [
  '@softarc/native-federation-runtime',
  '@softarc/native-federation',
  '@softarc/native-federation-core',
  '@softarc/native-federation-esbuild',
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
];
exports.PREPARED_DEFAULT_SKIP_LIST = prepareSkipList(exports.DEFAULT_SKIP_LIST);
function prepareSkipList(skipList) {
  return {
    strings: new Set(skipList.filter((e) => typeof e === 'string')),
    functions: skipList.filter((e) => typeof e === 'function'),
    regexps: skipList.filter((e) => typeof e === 'object'),
  };
}
exports.prepareSkipList = prepareSkipList;
function isInSkipList(entry, skipList) {
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
exports.isInSkipList = isInSkipList;
//# sourceMappingURL=default-skip-list.js.map
