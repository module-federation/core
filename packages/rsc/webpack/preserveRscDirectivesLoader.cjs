'use strict';

function extractDirective(source) {
  if (typeof source !== 'string') return null;

  // Fast path
  if (!source.includes('use client') && !source.includes('use server')) {
    return null;
  }

  // Strip BOM
  const s = source.replace(/^\uFEFF/, '');
  let i = 0;

  function skipWhitespace() {
    while (i < s.length) {
      const ch = s.charCodeAt(i);
      // space, tab, cr, lf
      if (ch === 32 || ch === 9 || ch === 10 || ch === 13) {
        i++;
        continue;
      }
      break;
    }
  }

  function skipLineComment() {
    // assumes s[i..i+1] === //
    i += 2;
    while (i < s.length && s.charCodeAt(i) !== 10) i++;
  }

  function skipBlockComment() {
    // assumes s[i..i+1] === /*
    i += 2;
    while (i < s.length) {
      if (s.charCodeAt(i) === 42 && s.charCodeAt(i + 1) === 47) {
        i += 2;
        return;
      }
      i++;
    }
    // unterminated comment → treat as no directive
    i = s.length;
  }

  function skipLeadingTrivia() {
    while (i < s.length) {
      skipWhitespace();
      if (s.charCodeAt(i) === 47 && s.charCodeAt(i + 1) === 47) {
        skipLineComment();
        continue;
      }
      if (s.charCodeAt(i) === 47 && s.charCodeAt(i + 1) === 42) {
        skipBlockComment();
        continue;
      }
      break;
    }
  }

  skipLeadingTrivia();
  if (i >= s.length) return null;

  const quote = s[i];
  if (quote !== "'" && quote !== '"') return null;
  i++;

  // Only accept "use client" / "use server" at the start of the file, like React expects.
  const start = i;
  while (i < s.length) {
    const ch = s[i];
    if (ch === quote) break;
    // Reject escapes to keep parsing linear + safe.
    if (ch === '\\') return null;
    i++;
  }
  if (i >= s.length) return null;
  const content = s.slice(start, i);
  if (content !== 'use client' && content !== 'use server') return null;
  i++; // closing quote

  // Optional semicolon + whitespace
  if (s[i] === ';') i++;

  return content;
}

module.exports = function preserveRscDirectivesLoader(source, inputMap) {
  const directive =
    typeof source === 'string' ? extractDirective(source) : null;
  if (directive && this._module && this._module.buildInfo) {
    this._module.buildInfo.rscDirective = directive;
  }
  return this.callback(null, source, inputMap);
};
