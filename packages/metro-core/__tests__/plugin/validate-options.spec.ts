import { afterEach, describe, expect, it, vi } from 'vitest';
import { validateOptions } from '../../src/plugin/validate-options';

function getValidConfig() {
  return {
    name: 'MetroHost',
    filename: 'mf-manifest.bundle',
    remotes: {},
    shared: {
      react: {
        singleton: true,
        eager: true,
        version: '19.1.0',
        requiredVersion: '19.1.0',
      },
      'react-native': {
        singleton: true,
        eager: true,
        version: '0.80.0',
        requiredVersion: '0.80.0',
      },
    },
  };
}

describe('validateOptions', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('warns when unsupported options are configured', () => {
    const warnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    validateOptions({
      ...getValidConfig(),
      manifest: true,
    } as any);

    expect(warnSpy).toHaveBeenCalled();
    expect(warnSpy.mock.calls.join('\n')).toContain('manifest');
    expect(warnSpy.mock.calls.join('\n')).toContain('will have no effect');
  });

  it('warns that runtime plugin params are not supported', () => {
    const warnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    validateOptions({
      ...getValidConfig(),
      runtimePlugins: [['/tmp/runtime-plugin.js', { answer: 42 }]],
    } as any);

    expect(warnSpy).toHaveBeenCalled();
    expect(warnSpy.mock.calls.join('\n')).toContain('runtimePlugins[0][1]');
    expect(warnSpy.mock.calls.join('\n')).toContain('will have no effect');
  });

  it('does not warn for runtime plugin tuple without params', () => {
    const warnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    validateOptions({
      ...getValidConfig(),
      runtimePlugins: [['/tmp/runtime-plugin.js']],
    } as any);

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('warns when deprecated plugins is used', () => {
    const warnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    validateOptions({
      ...getValidConfig(),
      plugins: ['/tmp/runtime-plugin.js'],
    } as any);

    expect(warnSpy).toHaveBeenCalled();
    expect(warnSpy.mock.calls.join('\n')).toContain('deprecated');
    expect(warnSpy.mock.calls.join('\n')).toContain('runtimePlugins');
  });

  it('throws for unsupported advanced remotes format', () => {
    expect(() =>
      validateOptions({
        ...getValidConfig(),
        remotes: {
          mini: {
            external: 'mini@http://localhost:8081/mf-manifest.json',
          },
        },
      } as any),
    ).toThrow('remotes');
  });

  it('throws for unsupported shared shorthand format', () => {
    expect(() =>
      validateOptions({
        ...getValidConfig(),
        shared: {
          react: 'react',
          'react-native': {
            singleton: true,
            eager: true,
            version: '0.80.0',
            requiredVersion: '0.80.0',
          },
        },
      } as any),
    ).toThrow('shared');
  });
});
