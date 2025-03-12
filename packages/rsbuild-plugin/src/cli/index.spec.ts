import { describe, expect, it } from 'vitest';
import { isMFFormat } from '../../src/cli';
import type { Rspack } from '@rsbuild/core';

describe('isMFFormat', () => {
  it('should return true when library config is not present', () => {
    const config: Partial<Rspack.Configuration> = {
      output: {},
    };
    expect(isMFFormat(config as Rspack.Configuration)).toBe(true);
  });

  it('should return true when library is not an object', () => {
    const config: Partial<Rspack.Configuration> = {
      output: {
        library: 'myLib',
      },
    };
    expect(isMFFormat(config as Rspack.Configuration)).toBe(true);
  });

  it('should return true when library is an array', () => {
    const config: Partial<Rspack.Configuration> = {
      output: {
        library: ['myLib'],
      },
    };
    expect(isMFFormat(config as Rspack.Configuration)).toBe(true);
  });

  it('should return false when library.type is commonjs', () => {
    const config: Partial<Rspack.Configuration> = {
      output: {
        library: {
          type: 'commonjs',
        },
      },
    };
    expect(isMFFormat(config as Rspack.Configuration)).toBe(false);
  });

  it('should return false when library.type is umd', () => {
    const config: Partial<Rspack.Configuration> = {
      output: {
        library: {
          type: 'umd',
        },
      },
    };
    expect(isMFFormat(config as Rspack.Configuration)).toBe(false);
  });

  it('should return false when library.type is modern-module', () => {
    const config: Partial<Rspack.Configuration> = {
      output: {
        library: {
          type: 'modern-module',
        },
      },
    };
    expect(isMFFormat(config as Rspack.Configuration)).toBe(false);
  });

  it('should return false when library.type contains commonjs', () => {
    const config: Partial<Rspack.Configuration> = {
      output: {
        library: {
          type: 'commonjs-static',
        },
      },
    };
    expect(isMFFormat(config as Rspack.Configuration)).toBe(false);
  });

  it('should return true when library.type is other value', () => {
    const config: Partial<Rspack.Configuration> = {
      output: {
        library: {
          type: 'var',
        },
      },
    };
    expect(isMFFormat(config as Rspack.Configuration)).toBe(true);
  });
});
