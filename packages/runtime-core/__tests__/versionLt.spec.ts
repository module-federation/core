import { describe, expect, test } from 'vitest';
import { satisfy } from '../src/utils/semver';
import { findVersion, versionLt } from '../src/utils/share';

function transformInvalidVersion(version: string): string {
  const isNumberVersion = !Number.isNaN(Number(version));
  if (isNumberVersion) {
    const splitArr = version.split('.');
    let validVersion = version;
    for (let i = 0; i < 3 - splitArr.length; i++) {
      validVersion += '.0';
    }
    return validVersion;
  }
  return version;
}

function legacyVersionLt(a: string, b: string): boolean {
  return satisfy(transformInvalidVersion(a), `<=${transformInvalidVersion(b)}`);
}

describe('versionLt', () => {
  test('equal versions are inclusive (<=)', () => {
    expect(versionLt('1.2.3', '1.2.3')).toBe(true);
    expect(versionLt('18.2.0', '18.2.0')).toBe(true);
  });

  test('strict less and greater', () => {
    expect(versionLt('1.2.2', '1.2.3')).toBe(true);
    expect(versionLt('1.2.4', '1.2.3')).toBe(false);
    expect(versionLt('17.0.0', '18.3.1')).toBe(true);
    expect(versionLt('18.3.1', '17.0.0')).toBe(false);
  });

  test('prerelease ordering', () => {
    expect(versionLt('1.2.3-beta', '1.2.3')).toBe(true);
    expect(versionLt('1.2.3', '1.2.3-beta')).toBe(false);
    expect(versionLt('4.0.0-alpha.56', '4.0.0-alpha.57')).toBe(true);
    expect(versionLt('4.0.0-alpha.58', '4.0.0-alpha.57')).toBe(false);
  });

  test('transformInvalidVersion numeric strings', () => {
    expect(versionLt('16', '16.0.0')).toBe(true);
    expect(versionLt('16.1', '16.1.0')).toBe(true);
    expect(versionLt('16', '17.0.0')).toBe(true);
    expect(versionLt('17', '16.0.0')).toBe(false);
  });

  test('invalid inputs return false', () => {
    expect(versionLt('', '1.2.3')).toBe(false);
    expect(versionLt('1.2.3', '')).toBe(false);
    expect(versionLt('not-a-version', '1.2.3')).toBe(false);
    expect(versionLt('1.2.3', 'not-a-version')).toBe(false);
  });

  test('parity with legacy satisfy(a, "<=" + b) behavior', () => {
    const pairs: Array<[string, string]> = [
      ['1.2.3', '1.2.3'],
      ['1.2.2', '1.2.3'],
      ['1.2.4', '1.2.3'],
      ['16', '16.0.0'],
      ['16.1', '16.1.0'],
      ['1.2.3-beta', '1.2.3'],
      ['4.0.0-alpha.56', '4.0.0-alpha.57'],
      ['4.0.0-alpha.58', '4.0.0-alpha.57'],
      ['18.2.0', '18.3.1'],
      ['', '1.0.0'],
      ['1.0.0', ''],
    ];

    for (const [a, b] of pairs) {
      expect(versionLt(a, b)).toBe(legacyVersionLt(a, b));
    }
  });
});

describe('findVersion', () => {
  test('picks the highest semver version', () => {
    const shareVersionMap = {
      '17.0.0': {},
      '18.2.0': {},
      '18.3.1': {},
    };

    expect(findVersion(shareVersionMap)).toBe('18.3.1');
  });

  test('replaces default version 0 with a real version', () => {
    const shareVersionMap = {
      '0': {},
      '18.2.0': {},
    };

    expect(findVersion(shareVersionMap)).toBe('18.2.0');
  });

  test('keeps the later key when versions compare equal', () => {
    const shareVersionMap = {
      '1.2.3+build': {},
      '1.2.3': {},
    };

    expect(findVersion(shareVersionMap)).toBe('1.2.3');
  });

  test('prefers wildcard versions over concrete versions', () => {
    const shareVersionMap = {
      '1.0.0': {},
      '*': {},
    };

    expect(findVersion(shareVersionMap)).toBe('*');
  });
});

describe('versionLt wildcard parity', () => {
  test('wildcard upper bound matches legacy satisfy behavior', () => {
    expect(versionLt('1.0.0', '*')).toBe(legacyVersionLt('1.0.0', '*'));
    expect(versionLt('1.0.0', 'x')).toBe(legacyVersionLt('1.0.0', 'x'));
    expect(versionLt('1.0.0', '1.x')).toBe(legacyVersionLt('1.0.0', '1.x'));
  });
});

describe('parseRangeComparators cache', () => {
  test('repeated satisfy calls with the same range stay consistent', () => {
    const range = '^18.2.0';
    const versions = ['17.0.0', '18.1.0', '18.2.0', '18.3.1', '19.0.0'];

    for (const version of versions) {
      expect(satisfy(version, range)).toBe(satisfy(version, range));
    }
  });
});
