// RegExp for version string
const VERSION_PATTERN_REGEXP: RegExp = /^([\d^=v<>~]|[*xX]$)/;

/**
 * @param {string} str maybe required version
 * @returns {boolean} true, if it looks like a version
 */
export function isRequiredVersion(str: string): boolean {
  return VERSION_PATTERN_REGEXP.test(str);
}

export function isRegExp(target: any) {
  return Object.prototype.toString.call(target) === '[object RegExp]';
}
