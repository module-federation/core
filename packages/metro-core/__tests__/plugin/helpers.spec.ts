import { describe, expect, it } from '@rstest/core';
import { replaceExtension, toPosixPath } from '../../src/plugin/helpers';

describe('toPosixPath', () => {
  it('converts backslashes to forward slashes', () => {
    expect(toPosixPath('C:\\Users\\someone\\project\\src\\index.js')).toBe(
      'C:/Users/someone/project/src/index.js',
    );
  });

  it('leaves posix paths unchanged', () => {
    expect(toPosixPath('/usr/local/bin')).toBe('/usr/local/bin');
  });
});

describe('replaceExtension', () => {
  it('preserves existing path separators', () => {
    expect(replaceExtension('src/info.tsx', '.bundle')).toBe('src/info.bundle');
    expect(replaceExtension('src\\info.tsx', '.bundle')).toBe(
      'src\\info.bundle',
    );
  });
});
