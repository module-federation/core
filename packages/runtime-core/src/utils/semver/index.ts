// fork from https://github.com/originjs/vite-plugin-federation/blob/v1.1.12/packages/lib/src/utils/semver/index.ts
// Copyright (c)
// vite-plugin-federation is licensed under Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//      http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
// See the Mulan PSL v2 for more details.

import {
  comparator,
  parseHyphen,
  parseComparatorTrim,
  parseTildeTrim,
  parseCaretTrim,
  parseCarets,
  parseTildes,
  parseXRanges,
  parseStar,
  parseGTE0,
  isXVersion,
} from './parser';

// --- utils (formerly utils.ts) ---

export function pipe(
  ...fns: Array<(input: string) => string>
): (input: string) => string {
  return (x: string): string => fns.reduce((v, f) => f(v), x);
}

export function extractComparator(
  comparatorString: string,
): RegExpMatchArray | null {
  return comparatorString.match(comparator);
}

export function combineVersion(
  major: string,
  minor: string,
  patch: string,
  preRelease: string,
): string {
  const mainVersion = `${major}.${minor}.${patch}`;
  if (preRelease) {
    return `${mainVersion}-${preRelease}`;
  }
  return mainVersion;
}

// --- compare (formerly compare.ts) ---

export interface CompareAtom {
  operator: string;
  version: string;
  major: string;
  minor: string;
  patch: string;
  preRelease?: string[];
}

function compareAtom(
  rangeAtom: string | number,
  versionAtom: string | number,
): number {
  rangeAtom = Number(rangeAtom) || rangeAtom;
  versionAtom = Number(versionAtom) || versionAtom;

  if (rangeAtom > versionAtom) {
    return 1;
  }

  if (rangeAtom === versionAtom) {
    return 0;
  }

  return -1;
}

function comparePreRelease(
  rangeAtom: CompareAtom,
  versionAtom: CompareAtom,
): number {
  const { preRelease: rangePreRelease } = rangeAtom;
  const { preRelease: versionPreRelease } = versionAtom;

  if (rangePreRelease === undefined && Boolean(versionPreRelease)) {
    return 1;
  }

  if (Boolean(rangePreRelease) && versionPreRelease === undefined) {
    return -1;
  }

  if (rangePreRelease === undefined && versionPreRelease === undefined) {
    return 0;
  }

  for (let i = 0, n = rangePreRelease!.length; i <= n; i++) {
    const rangeElement = rangePreRelease![i];
    const versionElement = versionPreRelease![i];

    if (rangeElement === versionElement) {
      continue;
    }

    if (rangeElement === undefined && versionElement === undefined) {
      return 0;
    }

    if (!rangeElement) {
      return 1;
    }

    if (!versionElement) {
      return -1;
    }

    return compareAtom(rangeElement, versionElement);
  }

  return 0;
}

function compareVersion(
  rangeAtom: CompareAtom,
  versionAtom: CompareAtom,
): number {
  return (
    compareAtom(rangeAtom.major, versionAtom.major) ||
    compareAtom(rangeAtom.minor, versionAtom.minor) ||
    compareAtom(rangeAtom.patch, versionAtom.patch) ||
    comparePreRelease(rangeAtom, versionAtom)
  );
}

export function compare(
  rangeAtom: CompareAtom,
  versionAtom: CompareAtom,
): boolean {
  switch (rangeAtom.operator) {
    case '':
    case '=':
      return rangeAtom.version === versionAtom.version;
    case '>':
      return compareVersion(rangeAtom, versionAtom) < 0;
    case '>=':
      return (
        rangeAtom.version === versionAtom.version ||
        compareVersion(rangeAtom, versionAtom) < 0
      );
    case '<':
      return compareVersion(rangeAtom, versionAtom) > 0;
    case '<=':
      return (
        rangeAtom.version === versionAtom.version ||
        compareVersion(rangeAtom, versionAtom) > 0
      );
    case undefined: {
      return true;
    }
    default:
      return false;
  }
}

// --- range parsing & satisfy (public API) ---

function parseRange(range: string): string {
  return pipe(
    parseHyphen,
    parseComparatorTrim,
    parseTildeTrim,
    parseCaretTrim,
  )(range.trim())
    .split(/\s+/)
    .join(' ')
    .split(' ')
    .map((rv) => pipe(parseCarets, parseTildes, parseXRanges, parseStar)(rv))
    .join(' ');
}

function buildAtom(extracted: RegExpMatchArray): CompareAtom {
  const [, operator, , major, minor, patch, preRelease] = extracted;
  return {
    operator,
    version: combineVersion(major, minor, patch, preRelease),
    major,
    minor,
    patch,
    preRelease: preRelease?.split('.'),
  };
}

export function satisfy(version: string, range: string): boolean {
  if (!version) return false;

  const extractedVersion = extractComparator(version);
  if (!extractedVersion) return false;

  const versionAtom = buildAtom(extractedVersion);

  for (const orRange of range.split('||')) {
    const trimmed = orRange.trim();
    if (!trimmed || trimmed === '*' || trimmed === 'x') return true;

    try {
      const parsedRange = parseRange(trimmed);
      if (!parsedRange.trim()) return true;

      const comparators = parsedRange
        .split(/\s+/)
        .map((c) => parseGTE0(c))
        .filter(Boolean);

      if (comparators.length === 0) continue;

      let satisfied = true;
      for (const comp of comparators) {
        const extracted = extractComparator(comp);
        if (!extracted || !compare(buildAtom(extracted), versionAtom)) {
          satisfied = false;
          break;
        }
      }

      if (satisfied) return true;
    } catch (e) {
      console.error(`[semver] Error processing range part "${trimmed}":`, e);
      continue;
    }
  }

  return false;
}

export { isXVersion };

export function isLegallyVersion(version: string): boolean {
  const semverRegex =
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?(\+[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$/;
  return semverRegex.test(version);
}
