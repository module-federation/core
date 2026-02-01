// fork from https://github.com/originjs/vite-plugin-federation/blob/v1.1.12/packages/lib/src/utils/semver/index.ts
// those constants are based on https://www.rubydoc.info/gems/semantic_range/3.0.0/SemanticRange#BUILDIDENTIFIER-constant
// Copyright (c)
// vite-plugin-federation is licensed under Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//      http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
// See the Mulan PSL v2 for more details.

export function isXVersion(version: string): boolean {
  return !version || version.toLowerCase() === 'x' || version === '*';
}

// --- regex constants (formerly constants.ts) ---

const buildIdentifier = '[0-9A-Za-z-]+';
const build = `(?:\\+(${buildIdentifier}(?:\\.${buildIdentifier})*))`;
const numericIdentifier = '0|[1-9]\\d*';
const numericIdentifierLoose = '[0-9]+';
const nonNumericIdentifier = '\\d*[a-zA-Z-][a-zA-Z0-9-]*';
const preReleaseIdentifierLoose = `(?:${numericIdentifierLoose}|${nonNumericIdentifier})`;
const preReleaseLoose = `(?:-?(${preReleaseIdentifierLoose}(?:\\.${preReleaseIdentifierLoose})*))`;
const preReleaseIdentifier = `(?:${numericIdentifier}|${nonNumericIdentifier})`;
const preRelease = `(?:-(${preReleaseIdentifier}(?:\\.${preReleaseIdentifier})*))`;
const xRangeIdentifier = `${numericIdentifier}|x|X|\\*`;
const xRangePlain = `[v=\\s]*(${xRangeIdentifier})(?:\\.(${xRangeIdentifier})(?:\\.(${xRangeIdentifier})(?:${preRelease})?${build}?)?)?`;
const hyphenRange = new RegExp(
  `^\\s*(${xRangePlain})\\s+-\\s+(${xRangePlain})\\s*$`,
);
const mainVersionLoose = `(${numericIdentifierLoose})\\.(${numericIdentifierLoose})\\.(${numericIdentifierLoose})`;
const loosePlain = `[v=\\s]*${mainVersionLoose}${preReleaseLoose}?${build}?`;
const gtlt = '((?:<|>)?=?)';
const comparatorTrim = new RegExp(
  `(\\s*)${gtlt}\\s*(${loosePlain}|${xRangePlain})`,
);
const loneTilde = '(?:~>?)';
const tildeTrim = new RegExp(`(\\s*)${loneTilde}\\s+`);
const loneCaret = '(?:\\^)';
const caretTrim = new RegExp(`(\\s*)${loneCaret}\\s+`);
const star = new RegExp('(<|>)?=?\\s*\\*');
const caret = new RegExp(`^${loneCaret}${xRangePlain}$`);
const mainVersion = `(${numericIdentifier})\\.(${numericIdentifier})\\.(${numericIdentifier})`;
const fullPlain = `v?${mainVersion}${preRelease}?${build}?`;
const tilde = new RegExp(`^${loneTilde}${xRangePlain}$`);
const xRange = new RegExp(`^${gtlt}\\s*${xRangePlain}$`);
export const comparator = new RegExp(`^${gtlt}\\s*(${fullPlain})$|^$`);
const gte0 = new RegExp('^\\s*>=\\s*0.0.0\\s*$');

export {
  hyphenRange,
  comparatorTrim,
  tildeTrim,
  caretTrim,
  star,
  caret,
  tilde,
  xRange,
  gte0,
};

// --- parser functions ---

function applyRangeRule(
  range: string,
  regex: RegExp,
  replacer: (...args: string[]) => string,
): string {
  return range
    .trim()
    .split(/\s+/)
    .map((rv) => rv.trim().replace(regex, replacer))
    .join(' ');
}

export function parseHyphen(range: string): string {
  return range.replace(
    hyphenRange,
    (_range, from, fM, fMi, fP, _fPR, _fB, to, tM, tMi, tP, tPR) => {
      from = isXVersion(fM)
        ? ''
        : isXVersion(fMi)
          ? `>=${fM}.0.0`
          : isXVersion(fP)
            ? `>=${fM}.${fMi}.0`
            : `>=${from}`;

      to = isXVersion(tM)
        ? ''
        : isXVersion(tMi)
          ? `<${Number(tM) + 1}.0.0-0`
          : isXVersion(tP)
            ? `<${tM}.${Number(tMi) + 1}.0-0`
            : tPR
              ? `<=${tM}.${tMi}.${tP}-${tPR}`
              : `<=${to}`;

      return `${from} ${to}`.trim();
    },
  );
}

export function parseComparatorTrim(range: string): string {
  return range.replace(comparatorTrim, '$1$2$3');
}

export function parseTildeTrim(range: string): string {
  return range.replace(tildeTrim, '$1~');
}

export function parseCaretTrim(range: string): string {
  return range.replace(caretTrim, '$1^');
}

export function parseCarets(range: string): string {
  return applyRangeRule(range, caret, (_, major, minor, patch, preRelease) => {
    if (isXVersion(major)) return '';
    if (isXVersion(minor)) return `>=${major}.0.0 <${Number(major) + 1}.0.0-0`;
    if (isXVersion(patch)) {
      return major === '0'
        ? `>=${major}.${minor}.0 <${major}.${Number(minor) + 1}.0-0`
        : `>=${major}.${minor}.0 <${Number(major) + 1}.0.0-0`;
    }
    const pre = preRelease ? `-${preRelease}` : '';
    const gte = `>=${major}.${minor}.${patch}${pre}`;
    const lt =
      major !== '0'
        ? `<${Number(major) + 1}.0.0-0`
        : minor !== '0'
          ? `<${major}.${Number(minor) + 1}.0-0`
          : `<${major}.${minor}.${Number(patch) + 1}-0`;
    return `${gte} ${lt}`;
  });
}

export function parseTildes(range: string): string {
  return applyRangeRule(range, tilde, (_, major, minor, patch, preRelease) => {
    if (isXVersion(major)) {
      return '';
    } else if (isXVersion(minor)) {
      return `>=${major}.0.0 <${Number(major) + 1}.0.0-0`;
    } else if (isXVersion(patch)) {
      return `>=${major}.${minor}.0 <${major}.${Number(minor) + 1}.0-0`;
    } else if (preRelease) {
      return `>=${major}.${minor}.${patch}-${preRelease} <${major}.${
        Number(minor) + 1
      }.0-0`;
    }

    return `>=${major}.${minor}.${patch} <${major}.${Number(minor) + 1}.0-0`;
  });
}

export function parseXRanges(range: string): string {
  return range
    .split(/\s+/)
    .map((rangeVersion) =>
      rangeVersion
        .trim()
        .replace(xRange, (ret, gtlt, major, minor, patch, preRelease) => {
          const isXMajor = isXVersion(major);
          const isXMinor = isXMajor || isXVersion(minor);
          const isXPatch = isXMinor || isXVersion(patch);

          if (gtlt === '=' && isXPatch) {
            gtlt = '';
          }

          preRelease = '';

          if (isXMajor) {
            return gtlt === '>' || gtlt === '<' ? '<0.0.0-0' : '*';
          } else if (gtlt && isXPatch) {
            if (isXMinor) {
              minor = 0;
            }
            patch = 0;

            if (gtlt === '>') {
              gtlt = '>=';
              if (isXMinor) {
                major = Number(major) + 1;
                minor = 0;
              } else {
                minor = Number(minor) + 1;
              }
              patch = 0;
            } else if (gtlt === '<=') {
              gtlt = '<';
              if (isXMinor) {
                major = Number(major) + 1;
              } else {
                minor = Number(minor) + 1;
              }
            }

            if (gtlt === '<') {
              preRelease = '-0';
            }

            return `${gtlt + major}.${minor}.${patch}${preRelease}`;
          } else if (isXMinor) {
            return `>=${major}.0.0${preRelease} <${Number(major) + 1}.0.0-0`;
          } else if (isXPatch) {
            return `>=${major}.${minor}.0${preRelease} <${major}.${
              Number(minor) + 1
            }.0-0`;
          }

          return ret;
        }),
    )
    .join(' ');
}

export function parseStar(range: string): string {
  return range.trim().replace(star, '');
}

export function parseGTE0(comparatorString: string): string {
  return comparatorString.trim().replace(gte0, '');
}
