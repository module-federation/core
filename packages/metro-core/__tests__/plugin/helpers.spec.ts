import { describe, expect, it } from 'vitest';
import { toPosixPath } from '../../src/plugin/helpers';

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
