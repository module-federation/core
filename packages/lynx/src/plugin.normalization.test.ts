import { describe, expect, it } from '@rstest/core';
import { normalizeLynxExposes, normalizeLynxShared } from './plugin';
import { LAYERS } from './plugin.testUtils';

describe('Lynx federation option normalization', () => {
  it('defaults exposes and shared modules to the background layer', () => {
    expect(
      normalizeLynxExposes(
        {
          './Button': './src/Button',
          './Card': {
            import: './src/Card',
            layer: 'custom-layer',
          },
        },
        LAYERS.BACKGROUND,
      ),
    ).toEqual({
      './Button': { import: './src/Button', layer: LAYERS.BACKGROUND },
      './Card': { import: './src/Card', layer: 'custom-layer' },
    });

    expect(
      normalizeLynxShared(
        {
          react: '^19.0.0',
          '@lynx-js/react': {
            singleton: true,
            layer: 'custom-layer',
          },
        },
        LAYERS.BACKGROUND,
      ),
    ).toEqual({
      react: {
        import: 'react',
        requiredVersion: '^19.0.0',
        layer: LAYERS.BACKGROUND,
        issuerLayer: LAYERS.BACKGROUND,
      },
      '@lynx-js/react': {
        singleton: true,
        layer: 'custom-layer',
        issuerLayer: LAYERS.BACKGROUND,
      },
    });
  });

  it('preserves duplicate shared array entries and explicit layers', () => {
    expect(
      normalizeLynxShared(
        [
          { react: '^19.0.0' },
          {
            react: {
              singleton: true,
              layer: 'provided-layer',
              issuerLayer: 'consumer-layer',
            },
          },
        ],
        LAYERS.BACKGROUND,
      ),
    ).toEqual([
      {
        react: {
          import: 'react',
          requiredVersion: '^19.0.0',
          layer: LAYERS.BACKGROUND,
          issuerLayer: LAYERS.BACKGROUND,
        },
      },
      {
        react: {
          singleton: true,
          layer: 'provided-layer',
          issuerLayer: 'consumer-layer',
        },
      },
    ]);
  });
});
