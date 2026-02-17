declare function _exports(algorithm: string | typeof Hash | undefined): Hash;
export = _exports;
export type HashFactory = () => Hash;
import Hash = require('./Hash');
