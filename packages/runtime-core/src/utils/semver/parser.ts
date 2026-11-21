// fork from https://github.com/originjs/vite-plugin-federation/blob/v1.1.12/packages/lib/src/utils/semver/index.ts
// Copyright (c)
// vite-plugin-federation is licensed under Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//      http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
// See the Mulan PSL v2 for more details.

import { isXVersion, parseRegex } from './utils';
import {
  caret,
  caretTrim,
  comparatorTrim,
  gte0,
  hyphenRange,
  star,
  tilde,
  tildeTrim,
  xRange,
} from './constants';

// These patterns have no global/sticky flags, so matching does not carry state
// between calls. Their sources are fixed and independent of user ranges.
const hyphenRangeRegex = parseRegex(hyphenRange);
const comparatorTrimRegex = parseRegex(comparatorTrim);
const tildeTrimRegex = parseRegex(tildeTrim);
const caretTrimRegex = parseRegex(caretTrim);
const caretExpression = parseRegex(caret);
const tildeExpression = parseRegex(tilde);
const xRangeExpression = parseRegex(xRange);
const starRegex = parseRegex(star);
const gte0Regex = parseRegex(gte0);

export function parseHyphen(range: string): string {
  return range.replace(
    hyphenRangeRegex,
    (
      _range,
      from,
      fromMajor,
      fromMinor,
      fromPatch,
      _fromPreRelease,
      _fromBuild,
      to,
      toMajor,
      toMinor,
      toPatch,
      toPreRelease,
    ) => {
      if (isXVersion(fromMajor)) {
        from = '';
      } else if (isXVersion(fromMinor)) {
        from = `>=${fromMajor}.0.0`;
      } else if (isXVersion(fromPatch)) {
        from = `>=${fromMajor}.${fromMinor}.0`;
      } else {
        from = `>=${from}`;
      }

      if (isXVersion(toMajor)) {
        to = '';
      } else if (isXVersion(toMinor)) {
        to = `<${Number(toMajor) + 1}.0.0-0`;
      } else if (isXVersion(toPatch)) {
        to = `<${toMajor}.${Number(toMinor) + 1}.0-0`;
      } else if (toPreRelease) {
        to = `<=${toMajor}.${toMinor}.${toPatch}-${toPreRelease}`;
      } else {
        to = `<=${to}`;
      }

      return `${from} ${to}`.trim();
    },
  );
}

export function parseComparatorTrim(range: string): string {
  return range.replace(comparatorTrimRegex, '$1$2$3');
}

export function parseTildeTrim(range: string): string {
  return range.replace(tildeTrimRegex, '$1~');
}

export function parseCaretTrim(range: string): string {
  return range.replace(caretTrimRegex, '$1^');
}

export function parseCarets(range: string): string {
  return range
    .trim()
    .split(/\s+/)
    .map((rangeVersion) =>
      rangeVersion.replace(
        caretExpression,
        (_, major, minor, patch, preRelease) => {
          if (isXVersion(major)) {
            return '';
          } else if (isXVersion(minor)) {
            return `>=${major}.0.0 <${Number(major) + 1}.0.0-0`;
          } else if (isXVersion(patch)) {
            if (major === '0') {
              return `>=${major}.${minor}.0 <${major}.${Number(minor) + 1}.0-0`;
            } else {
              return `>=${major}.${minor}.0 <${Number(major) + 1}.0.0-0`;
            }
          } else if (preRelease) {
            if (major === '0') {
              if (minor === '0') {
                return `>=${major}.${minor}.${patch}-${preRelease} <${major}.${minor}.${
                  Number(patch) + 1
                }-0`;
              } else {
                return `>=${major}.${minor}.${patch}-${preRelease} <${major}.${
                  Number(minor) + 1
                }.0-0`;
              }
            } else {
              return `>=${major}.${minor}.${patch}-${preRelease} <${
                Number(major) + 1
              }.0.0-0`;
            }
          } else {
            if (major === '0') {
              if (minor === '0') {
                return `>=${major}.${minor}.${patch} <${major}.${minor}.${
                  Number(patch) + 1
                }-0`;
              } else {
                return `>=${major}.${minor}.${patch} <${major}.${
                  Number(minor) + 1
                }.0-0`;
              }
            }

            return `>=${major}.${minor}.${patch} <${Number(major) + 1}.0.0-0`;
          }
        },
      ),
    )
    .join(' ');
}

export function parseTildes(range: string): string {
  return range
    .trim()
    .split(/\s+/)
    .map((rangeVersion) =>
      rangeVersion.replace(
        tildeExpression,
        (_, major, minor, patch, preRelease) => {
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

          return `>=${major}.${minor}.${patch} <${major}.${
            Number(minor) + 1
          }.0-0`;
        },
      ),
    )
    .join(' ');
}

export function parseXRanges(range: string): string {
  return range
    .split(/\s+/)
    .map((rangeVersion) =>
      rangeVersion
        .trim()
        .replace(
          xRangeExpression,
          (ret, gtlt, major, minor, patch, preRelease) => {
            const isXMajor = isXVersion(major);
            const isXMinor = isXMajor || isXVersion(minor);
            const isXPatch = isXMinor || isXVersion(patch);

            if (gtlt === '=' && isXPatch) {
              gtlt = '';
            }

            preRelease = '';

            if (isXMajor) {
              if (gtlt === '>' || gtlt === '<') {
                // nothing is allowed
                return '<0.0.0-0';
              } else {
                // nothing is forbidden
                return '*';
              }
            } else if (gtlt && isXPatch) {
              // replace X with 0
              if (isXMinor) {
                minor = 0;
              }

              patch = 0;

              if (gtlt === '>') {
                // >1 => >=2.0.0
                // >1.2 => >=1.3.0
                gtlt = '>=';

                if (isXMinor) {
                  major = Number(major) + 1;
                  minor = 0;
                  patch = 0;
                } else {
                  minor = Number(minor) + 1;
                  patch = 0;
                }
              } else if (gtlt === '<=') {
                // <=0.7.x is actually <0.8.0, since any 0.7.x should pass
                // Similarly, <=7.x is actually <8.0.0, etc.
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
          },
        ),
    )
    .join(' ');
}

export function parseStar(range: string): string {
  return range.trim().replace(starRegex, '');
}

export function parseGTE0(comparatorString: string): string {
  return comparatorString.trim().replace(gte0Regex, '');
}
