import { test, expect } from '@rstest/core';
import type { MF_DATA_FETCH_MAP } from '../src/types';

type Assert<T extends true> = T;

// Ensures data-fetch global augmentations are declared for consumers.
type _GlobalsDeclared = Assert<
  [
    typeof globalThis.__MF_DATA_FETCH_MAP__,
    typeof globalThis._mfSSRDowngrade,
    typeof globalThis._mfDataFetch,
  ] extends [
    MF_DATA_FETCH_MAP | undefined,
    string[] | true | undefined,
    Array<[id?: string, data?: unknown, downgrade?: boolean]> | undefined,
  ]
    ? true
    : false
>;

test('declares data-fetch globals for TypeScript consumers', () => {
  void (0 as unknown as _GlobalsDeclared);
  expect(true).toBe(true);
});
