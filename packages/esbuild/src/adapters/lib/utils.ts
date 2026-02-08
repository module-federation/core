export function orderedUniq<T>(array: T[]): T[] {
  // prettier-ignore
  const ret: T[] = [], visited = new Set<T>();
  for (const val of array)
    if (!visited.has(val)) visited.add(val), ret.push(val);
  return ret;
}

export function cachedReduce<S, T>(
  array: T[],
  reducer: (s: S, a: T) => S,
  s: S,
): (len: number) => S {
  // prettier-ignore
  const cache = [s];
  let cacheLen = 1,
    last = s;
  return (len: number): S => {
    while (cacheLen <= len)
      cacheLen = cache.push((last = reducer(last, array[cacheLen - 1])));
    return cache[len];
  };
}

// from @rollup/pluginutils
const reservedWords =
  'break case class catch const continue debugger default delete do else export extends finally for function if import in instanceof let new return super switch this throw try typeof var void while with yield enum await implements package protected static interface private public';
const builtin =
  'arguments Infinity NaN undefined null true false eval uneval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Symbol Error EvalError InternalError RangeError ReferenceError SyntaxError TypeError URIError Number Math Date String RegExp Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array Map Set WeakMap WeakSet SIMD ArrayBuffer DataView JSON Promise Generator GeneratorFunction Reflect Proxy Intl';
const forbiddenIdentifiers = new Set(`${reservedWords} ${builtin}`.split(' '));
forbiddenIdentifiers.add('');
export const makeLegalIdentifier = function makeLegalIdentifier(
  str: string,
): string {
  let identifier = str
    .replace(/-(\w)/g, (_, letter) => letter.toUpperCase())
    .replace(/[^$_a-zA-Z0-9]/g, '_');
  if (/\d/.test(identifier[0]) || forbiddenIdentifiers.has(identifier)) {
    identifier = `_${identifier}`;
  }
  return identifier || '_';
};
