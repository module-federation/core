// fork from https://github.com/originjs/vite-plugin-federation/blob/v1.1.12/packages/lib/src/utils/semver/index.ts
// Copyright (c)
// vite-plugin-federation is licensed under Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//      http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
// See the Mulan PSL v2 for more details.

import { combineVersion, extractComparator, pipe } from './utils';
import {
  parseHyphen,
  parseComparatorTrim,
  parseTildeTrim,
  parseCaretTrim,
  parseCarets,
  parseTildes,
  parseXRanges,
  parseStar,
  parseGTE0,
} from './parser';
import { compare } from './compare';
import type { CompareAtom } from './compare';

function parseComparatorString(range: string): string {
  return pipe(
    // handle caret
    // ^ --> * (any, kinda silly)
    // ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0-0
    // ^2.0, ^2.0.x --> >=2.0.0 <3.0.0-0
    // ^1.2, ^1.2.x --> >=1.2.0 <2.0.0-0
    // ^1.2.3 --> >=1.2.3 <2.0.0-0
    // ^1.2.0 --> >=1.2.0 <2.0.0-0
    parseCarets,
    // handle tilde
    // ~, ~> --> * (any, kinda silly)
    // ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0-0
    // ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0-0
    // ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0-0
    // ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0-0
    // ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0-0
    parseTildes,
    parseXRanges,
    parseStar,
  )(range);
}

function parseRange(range: string) {
  return pipe(
    // handle hyphenRange
    // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
    parseHyphen,
    // handle trim comparator
    // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
    parseComparatorTrim,
    // handle trim tilde
    // `~ 1.2.3` => `~1.2.3`
    parseTildeTrim,
    // handle trim caret
    // `^ 1.2.3` => `^1.2.3`
    parseCaretTrim,
  )(range.trim())
    .split(/\s+/)
    .join(' ');
}

export function toCompareAtom(version: string): CompareAtom | null {
  const extractedVersion = extractComparator(version);
  if (!extractedVersion) {
    return null;
  }
  const [
    ,
    versionOperator,
    ,
    versionMajor,
    versionMinor,
    versionPatch,
    versionPreRelease,
  ] = extractedVersion;
  return {
    operator: versionOperator,
    version: combineVersion(
      versionMajor,
      versionMinor,
      versionPatch,
      versionPreRelease,
    ),
    major: versionMajor,
    minor: versionMinor,
    patch: versionPatch,
    preRelease: versionPreRelease?.split('.'),
  };
}

type OrRangeResult =
  | { type: 'wildcard' }
  | { type: 'comparators'; comparators: CompareAtom[] };

const parsedRangeCache = new Map<string, OrRangeResult[]>();

function comparatorStringToAtom(comparator: string): CompareAtom | null {
  const extractedComparator = extractComparator(comparator);
  if (!extractedComparator) {
    return null;
  }
  const [
    ,
    rangeOperator,
    ,
    rangeMajor,
    rangeMinor,
    rangePatch,
    rangePreRelease,
  ] = extractedComparator;
  return {
    operator: rangeOperator,
    version: combineVersion(
      rangeMajor,
      rangeMinor,
      rangePatch,
      rangePreRelease,
    ),
    major: rangeMajor,
    minor: rangeMinor,
    patch: rangePatch,
    preRelease: rangePreRelease?.split('.'),
  };
}

function parseOrRange(trimmedOrRange: string): OrRangeResult | null {
  if (!trimmedOrRange) {
    return { type: 'wildcard' };
  }

  if (trimmedOrRange === '*' || trimmedOrRange === 'x') {
    return { type: 'wildcard' };
  }

  try {
    const parsedSubRange = parseRange(trimmedOrRange);

    if (!parsedSubRange.trim()) {
      return { type: 'wildcard' };
    }

    const parsedComparatorString = parsedSubRange
      .split(' ')
      .map((rangeVersion) => parseComparatorString(rangeVersion))
      .join(' ');

    if (!parsedComparatorString.trim()) {
      return { type: 'wildcard' };
    }

    const comparatorStrings = parsedComparatorString
      .split(/\s+/)
      .map((comparator) => parseGTE0(comparator))
      .filter(Boolean);

    if (comparatorStrings.length === 0) {
      return null;
    }

    const comparators: CompareAtom[] = [];
    for (const comparator of comparatorStrings) {
      const rangeAtom = comparatorStringToAtom(comparator);
      if (!rangeAtom) {
        return null;
      }
      comparators.push(rangeAtom);
    }

    return { type: 'comparators', comparators };
  } catch (e) {
    console.error(
      `[semver] Error processing range part "${trimmedOrRange}":`,
      e,
    );
    return null;
  }
}

export function parseRangeComparators(range: string): OrRangeResult[] {
  const cached = parsedRangeCache.get(range);
  if (cached) {
    return cached;
  }

  const orRanges = range.split('||');
  const result: OrRangeResult[] = [];

  for (const orRange of orRanges) {
    const parsed = parseOrRange(orRange.trim());
    if (parsed) {
      result.push(parsed);
    }
  }

  parsedRangeCache.set(range, result);
  return result;
}

export function satisfy(version: string, range: string): boolean {
  if (!version) {
    return false;
  }

  const versionAtom = toCompareAtom(version);
  if (!versionAtom) {
    return false;
  }

  const orRanges = parseRangeComparators(range);

  for (const orRange of orRanges) {
    if (orRange.type === 'wildcard') {
      return true;
    }

    let subRangeSatisfied = true;
    for (const rangeAtom of orRange.comparators) {
      if (!compare(rangeAtom, versionAtom)) {
        subRangeSatisfied = false;
        break;
      }
    }

    if (subRangeSatisfied) {
      return true;
    }
  }

  return false;
}

export function isLegallyVersion(version: string): boolean {
  const semverRegex =
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?(\+[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$/;
  return semverRegex.test(version);
}
