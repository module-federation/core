import { expect, describe, it } from 'vitest';

import { calculateSnapshot, calculateMicroAppSnapshot } from '../src/utils';
import {
  singleAppSnapshot,
  microAppSnapshot,
  expectMicroAppSnapshot,
  expectSingleAppSnapshot,
} from './mock';

describe('test calculate snapshot sdk', () => {
  it('singleApp', () => {
    const res = calculateSnapshot(singleAppSnapshot, {
      webpack_provider: 'http://localhost:6666/mf-manifest.json',
    });

    expect(res).toMatchObject(expectSingleAppSnapshot);
  });

  it('microApp', () => {
    const res = calculateMicroAppSnapshot(microAppSnapshot, {
      webpack_provider: 'http://localhost:6666/mf-manifest.json',
    });

    expect(res).toMatchObject(expectMicroAppSnapshot);
  });
});
