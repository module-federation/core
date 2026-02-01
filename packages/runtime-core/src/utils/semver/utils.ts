// fork from https://github.com/originjs/vite-plugin-federation/blob/v1.1.12/packages/lib/src/utils/semver/index.ts
// Copyright (c)
// vite-plugin-federation is licensed under Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//      http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
// See the Mulan PSL v2 for more details.

import { comparator } from './constants';

export function isXVersion(version: string): boolean {
  return !version || version.toLowerCase() === 'x' || version === '*';
}

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
