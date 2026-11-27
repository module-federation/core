import { describe, expect, it } from '@rstest/core';

import { getLynxWebEncodeMode } from './webEncode';

describe('getLynxWebEncodeMode', () => {
  it('encodes background, main-thread, CSS, and data sections', async () => {
    const { buffer } = await getLynxWebEncodeMode()({
      compilerOptions: { targetSdkVersion: '3.5' },
      sourceContent: { appType: 'DynamicComponent' },
      customSections: {
        background: { content: 'module.exports = "background"' },
        main: {
          encoding: 'JsBytecode',
          content: 'module.exports = "main"',
        },
        styles: {
          encoding: 'CSS',
          content: { ruleList: [] },
        },
        metadata: { content: { version: 1 } },
      },
    });

    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.byteLength).toBeGreaterThan(100);
  });

  it('rejects invalid JavaScript sections', async () => {
    await expect(
      getLynxWebEncodeMode()({
        customSections: {
          main: { encoding: 'JsBytecode', content: { invalid: true } },
        },
      }),
    ).rejects.toThrow('must be a string');
  });
});
