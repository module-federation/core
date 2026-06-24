import { describe, expect, it } from 'vitest';
import { formatShareConfigs } from '../src/utils/share';
import type { Options, ShareArgs, UserOptions } from '../src/type';

const createPrevOptions = (): Options => ({
  name: 'host',
  remotes: [],
  shared: {},
  plugins: [],
  inBrowser: false,
});

describe('formatShareConfigs', () => {
  it('normalizes numeric shared boolean options from bundler runtime configs', () => {
    const numericShareArgs = {
      version: '18.3.1',
      shareConfig: {
        singleton: 1,
        eager: 0,
        strictVersion: 1,
        requiredVersion: '^18.0.0',
      },
    } as unknown as ShareArgs;

    const userOptions = {
      name: 'host',
      remotes: [],
      shared: {
        react: numericShareArgs,
      },
    } satisfies UserOptions;

    const { newShareInfos } = formatShareConfigs(
      createPrevOptions(),
      userOptions,
    );

    expect(newShareInfos.react[0].shareConfig).toMatchObject({
      singleton: true,
      eager: false,
      strictVersion: true,
      requiredVersion: '^18.0.0',
    });
  });
});
