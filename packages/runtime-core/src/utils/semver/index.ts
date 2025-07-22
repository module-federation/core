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

export function satisfy(version: string, range: string): boolean {
  if (!version) {
    return false;
  }

  // Extract version details once
  const extractedVersion = extractComparator(version);
  if (!extractedVersion) {
    // If the version string is invalid, it can't satisfy any range
    return false;
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
  const versionAtom: CompareAtom = {
    operator: versionOperator,
    version: combineVersion(
      versionMajor,
      versionMinor,
      versionPatch,
      versionPreRelease,
    ), // exclude build atom
    major: versionMajor,
    minor: versionMinor,
    patch: versionPatch,
    preRelease: versionPreRelease?.split('.'),
  };

  // Split the range by || to handle OR conditions
  const orRanges = range.split('||');

  for (const orRange of orRanges) {
    const trimmedOrRange = orRange.trim();
    if (!trimmedOrRange) {
      // An empty range string signifies wildcard *, satisfy any valid version
      // (We already checked if the version itself is valid)
      return true;
    }

    // Handle simple wildcards explicitly before complex parsing
    if (trimmedOrRange === '*' || trimmedOrRange === 'x') {
      return true;
    }

    try {
      // Apply existing parsing logic to the current OR sub-range
      const parsedSubRange = parseRange(trimmedOrRange); // Handles hyphens, trims etc.

      // Check if the result of initial parsing is empty, which can happen
      // for some wildcard cases handled by parseRange/parseComparatorString.
      // E.g. `parseStar` used in `parseComparatorString` returns ''.
      if (!parsedSubRange.trim()) {
        // If parsing results in empty string, treat as wildcard match
        return true;
      }

      const parsedComparatorString = parsedSubRange
        .split(' ')
        .map((rangeVersion) => parseComparatorString(rangeVersion)) // Expands ^, ~
        .join(' ');

      // Check again if the comparator string became empty after specific parsing like ^ or ~
      if (!parsedComparatorString.trim()) {
        return true;
      }

      // Split the sub-range by space for implicit AND conditions
      const comparators = parsedComparatorString
        .split(/\s+/)
        .map((comparator) => parseGTE0(comparator))
        // Filter out empty strings that might result from multiple spaces
        .filter(Boolean);

      // If a sub-range becomes empty after parsing (e.g., invalid characters),
      // it cannot be satisfied. This check might be redundant now but kept for safety.
      if (comparators.length === 0) {
        continue;
      }

      let subRangeSatisfied = true;
      for (const comparator of comparators) {
        const extractedComparator = extractComparator(comparator);

        // If any part of the AND sub-range is invalid, the sub-range is not satisfied
        if (!extractedComparator) {
          subRangeSatisfied = false;
          break;
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
        const rangeAtom: CompareAtom = {
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

        // Check if the version satisfies this specific comparator in the AND chain
        if (!compare(rangeAtom, versionAtom)) {
          subRangeSatisfied = false; // This part of the AND condition failed
          break; // No need to check further comparators in this sub-range
        }
      }

      // If all AND conditions within this OR sub-range were met, the overall range is satisfied
      if (subRangeSatisfied) {
        return true;
      }
    } catch (e) {
      // Log error and treat this sub-range as unsatisfied
      console.error(
        `[semver] Error processing range part "${trimmedOrRange}":`,
        e,
      );
      continue;
    }
  }

  // If none of the OR sub-ranges were satisfied
  return false;
}

export function isLegallyVersion(version: string): boolean {
  const semverRegex =
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?(\+[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$/;
  return semverRegex.test(version);
}
