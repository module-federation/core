import { describe, it, expect } from '@rstest/core';
import { formatShareConfigs } from '../src/utils/share';
import type { Options } from '../src/type';

const prevOptions = {
  name: 'host',
  remotes: [],
  shared: {},
  plugins: [],
} as unknown as Options;

describe('formatShareConfigs', () => {
  it('keeps requiredVersion based on version when version is set', () => {
    const { newShareInfos } = formatShareConfigs(prevOptions, {
      name: 'host',
      shared: {
        react: {
          version: '16.0.0',
          get: () => Promise.resolve(() => ({})),
        },
      },
    });
    expect(newShareInfos['react'][0].shareConfig.requiredVersion).toBe(
      '^16.0.0',
    );
  });

  it('falls back to * when version is missing', () => {
    const { newShareInfos } = formatShareConfigs(prevOptions, {
      name: 'host',
      shared: {
        react: {
          get: () => Promise.resolve(() => ({})),
        },
      },
    });
    // used to produce the string "^undefined"
    expect(newShareInfos['react'][0].shareConfig.requiredVersion).toBe('*');
  });

  it('does not touch an explicit requiredVersion', () => {
    const { newShareInfos } = formatShareConfigs(prevOptions, {
      name: 'host',
      shared: {
        react: {
          shareConfig: { requiredVersion: '^17.0.0' },
          get: () => Promise.resolve(() => ({})),
        },
      },
    });
    expect(newShareInfos['react'][0].shareConfig.requiredVersion).toBe(
      '^17.0.0',
    );
  });
});
