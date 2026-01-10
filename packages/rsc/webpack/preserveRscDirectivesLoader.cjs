'use strict';

const LEADING_DIRECTIVE_PATTERN =
  /^\s*(?:\/\/[^\n]*\n|\/\*[\s\S]*?\*\/\s*)*(['"]use (client|server)['"];?)/;

function extractDirective(source) {
  const sanitized = source.replace(/^\uFEFF/, '');
  const match = sanitized.match(LEADING_DIRECTIVE_PATTERN);
  if (!match) return null;
  return match[1].replace(/;?$/, '');
}

module.exports = function preserveRscDirectivesLoader(source, inputMap) {
  const directive =
    typeof source === 'string' ? extractDirective(source) : null;
  if (directive && this._module && this._module.buildInfo) {
    this._module.buildInfo.rscDirective = directive;
  }
  return this.callback(null, source, inputMap);
};
