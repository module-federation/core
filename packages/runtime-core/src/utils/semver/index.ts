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
      const parsedSubRange = parseRange(trimmed);
      if (!parsedSubRange.trim()) return true;

      const parsedComparatorString = parsedSubRange
        .split(' ')
        .map((rv) => parseComparatorString(rv))
        .join(' ');

      if (!parsedComparatorString.trim()) return true;

      const comparators = parsedComparatorString
        .split(/\s+/)
        .map((c) => parseGTE0(c))
        .filter(Boolean);

      if (comparators.length === 0) continue;

      let satisfied = true;
      for (const comparator of comparators) {
        const extracted = extractComparator(comparator);
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
