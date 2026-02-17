declare namespace _exports {
    export { Hash, HashFunction };
}
declare function _exports(algorithm: HashFunction): Hash;
export = _exports;
type Hash = import("./Hash");
type HashFunction = import("../../declarations/WebpackOptions").HashFunction;
