import { normalizeRuntimeInitOptionsWithOutShared } from './utils';
import type { moduleFederationPlugin } from '@module-federation/sdk';

describe('normalizeRuntimeInitOptionsWithOutShared', () => {
  it('should normalize explicit commonjs string without remoteType', () => {
    const options: moduleFederationPlugin.ModuleFederationPluginOptions = {
      name: 'test',
      remotes: {
        app1: 'commonjs ./container.js',
      },
    };

    const result = normalizeRuntimeInitOptionsWithOutShared(options);

    expect(result).toEqual({
      name: 'test',
      remotes: [
        {
          alias: 'app1',
          name: '',
          entry: './container.js',
          shareScope: 'default',
          externalType: 'commonjs',
        },
      ],
      shareStrategy: 'version-first',
    });
  });

  it('should normalize with remoteType commonjs', () => {
    const options: moduleFederationPlugin.ModuleFederationPluginOptions = {
      name: 'test',
      remotes: {
        app1: './container.js',
      },
      remoteType: 'commonjs',
    };

    const result = normalizeRuntimeInitOptionsWithOutShared(options);

    expect(result).toEqual({
      name: 'test',
      remotes: [
        {
          alias: 'app1',
          name: '',
          entry: './container.js',
          shareScope: 'default',
          externalType: 'commonjs',
        },
      ],
      shareStrategy: 'version-first',
    });
  });

  it('should normalize script external type with global name', () => {
    const options: moduleFederationPlugin.ModuleFederationPluginOptions = {
      name: 'test',
      remotes: {
        app1: 'app1@http://localhost:3001/remoteEntry.js',
      },
      remoteType: 'script',
    };

    const result = normalizeRuntimeInitOptionsWithOutShared(options);

    expect(result).toEqual({
      name: 'test',
      remotes: [
        {
          alias: 'app1',
          name: 'app1',
          entry: 'http://localhost:3001/remoteEntry.js',
          shareScope: 'default',
          externalType: 'script',
        },
      ],
      shareStrategy: 'version-first',
    });
  });

  it('should normalize http url without global name', () => {
    const options: moduleFederationPlugin.ModuleFederationPluginOptions = {
      name: 'test',
      remotes: {
        app1: 'http://localhost:3001/remoteEntry.js',
      },
      remoteType: 'script',
    };

    const result = normalizeRuntimeInitOptionsWithOutShared(options);

    expect(result).toEqual({
      name: 'test',
      remotes: [
        {
          alias: 'app1',
          name: '',
          entry: 'http://localhost:3001/remoteEntry.js',
          shareScope: 'default',
          externalType: 'script',
        },
      ],
      shareStrategy: 'version-first',
    });
  });

  it('should use library type as default remoteType if not specified', () => {
    const options: moduleFederationPlugin.ModuleFederationPluginOptions = {
      name: 'test',
      remotes: {
        app1: 'app1@http://localhost:3001/remoteEntry.js',
      },
      library: {
        type: 'commonjs',
      },
    };

    const result = normalizeRuntimeInitOptionsWithOutShared(options);

    expect(result).toEqual({
      name: 'test',
      remotes: [
        {
          alias: 'app1',
          name: 'app1',
          entry: 'http://localhost:3001/remoteEntry.js',
          shareScope: 'default',
          externalType: 'commonjs',
        },
      ],
      shareStrategy: 'version-first',
    });
  });

  it('should use script as default remoteType if neither remoteType nor library type specified', () => {
    const options: moduleFederationPlugin.ModuleFederationPluginOptions = {
      name: 'test',
      remotes: {
        app1: 'app1@http://localhost:3001/remoteEntry.js',
      },
    };

    const result = normalizeRuntimeInitOptionsWithOutShared(options);

    expect(result).toEqual({
      name: 'test',
      remotes: [
        {
          alias: 'app1',
          name: 'app1',
          entry: 'http://localhost:3001/remoteEntry.js',
          shareScope: 'default',
          externalType: 'script',
        },
      ],
      shareStrategy: 'version-first',
    });
  });

  it('should handle array of remotes', () => {
    const options: moduleFederationPlugin.ModuleFederationPluginOptions = {
      name: 'test',
      remotes: {
        app1: ['app1@http://localhost:3001/remoteEntry.js'],
      },
      remoteType: 'script',
    };

    const result = normalizeRuntimeInitOptionsWithOutShared(options);

    expect(result).toEqual({
      name: 'test',
      remotes: [
        {
          alias: 'app1',
          name: 'app1',
          entry: 'http://localhost:3001/remoteEntry.js',
          shareScope: 'default',
          externalType: 'script',
        },
      ],
      shareStrategy: 'version-first',
    });
  });

  it('should handle custom shareScope', () => {
    const options: moduleFederationPlugin.ModuleFederationPluginOptions = {
      name: 'test',
      remotes: {
        app1: {
          external: 'app1@http://localhost:3001/remoteEntry.js',
          shareScope: 'custom',
        },
      },
      remoteType: 'script',
    };

    const result = normalizeRuntimeInitOptionsWithOutShared(options);

    expect(result).toEqual({
      name: 'test',
      remotes: [
        {
          alias: 'app1',
          name: 'app1',
          entry: 'http://localhost:3001/remoteEntry.js',
          shareScope: 'custom',
          externalType: 'script',
        },
      ],
      shareStrategy: 'version-first',
    });
  });

  it('should handle array in external field', () => {
    const options: moduleFederationPlugin.ModuleFederationPluginOptions = {
      name: 'test',
      remotes: {
        app1: {
          external: ['app1@http://localhost:3001/remoteEntry.js'],
          shareScope: 'custom',
        },
      },
      remoteType: 'script',
    };

    const result = normalizeRuntimeInitOptionsWithOutShared(options);

    expect(result).toEqual({
      name: 'test',
      remotes: [
        {
          alias: 'app1',
          name: 'app1',
          entry: 'http://localhost:3001/remoteEntry.js',
          shareScope: 'custom',
          externalType: 'script',
        },
      ],
      shareStrategy: 'version-first',
    });
  });

  it('should skip entries with spaces', () => {
    const options: moduleFederationPlugin.ModuleFederationPluginOptions = {
      name: 'test',
      remotes: {
        app1: 'invalid entry with spaces',
      },
      remoteType: 'script',
    };

    const result = normalizeRuntimeInitOptionsWithOutShared(options);

    expect(result).toEqual({
      name: 'test',
      remotes: [],
      shareStrategy: 'version-first',
    });
  });

  it('should handle custom shareStrategy', () => {
    const options: moduleFederationPlugin.ModuleFederationPluginOptions = {
      name: 'test',
      remotes: {
        app1: 'app1@http://localhost:3001/remoteEntry.js',
      },
      remoteType: 'script',
      shareStrategy: 'loaded-first',
    };

    const result = normalizeRuntimeInitOptionsWithOutShared(options);

    expect(result).toEqual({
      name: 'test',
      remotes: [
        {
          alias: 'app1',
          name: 'app1',
          entry: 'http://localhost:3001/remoteEntry.js',
          shareScope: 'default',
          externalType: 'script',
        },
      ],
      shareStrategy: 'loaded-first',
    });
  });

  it('should use remoteType when entry has no type prefix', () => {
    const options: moduleFederationPlugin.ModuleFederationPluginOptions = {
      name: 'test',
      remotes: {
        app1: './container.js',
      },
      remoteType: 'commonjs-module',
    };

    const result = normalizeRuntimeInitOptionsWithOutShared(options);

    expect(result).toEqual({
      name: 'test',
      remotes: [
        {
          alias: 'app1',
          name: '',
          entry: './container.js',
          shareScope: 'default',
          externalType: 'commonjs-module',
        },
      ],
      shareStrategy: 'version-first',
    });
  });

  it('should use entry type prefix over remoteType when both present', () => {
    const options: moduleFederationPlugin.ModuleFederationPluginOptions = {
      name: 'test',
      remotes: {
        app1: 'commonjs ./container.js',
      },
      remoteType: 'script',
    };

    const result = normalizeRuntimeInitOptionsWithOutShared(options);

    expect(result).toEqual({
      name: 'test',
      remotes: [
        {
          alias: 'app1',
          name: '',
          entry: './container.js',
          shareScope: 'default',
          externalType: 'commonjs',
        },
      ],
      shareStrategy: 'version-first',
    });
  });

  it('should handle matching remoteType and entry type prefix', () => {
    const options: moduleFederationPlugin.ModuleFederationPluginOptions = {
      name: 'test',
      remotes: {
        app1: 'commonjs ./container.js',
      },
      remoteType: 'commonjs',
    };

    const result = normalizeRuntimeInitOptionsWithOutShared(options);

    expect(result).toEqual({
      name: 'test',
      remotes: [
        {
          alias: 'app1',
          name: '',
          entry: './container.js',
          shareScope: 'default',
          externalType: 'commonjs',
        },
      ],
      shareStrategy: 'version-first',
    });
  });

  it('should handle object format with remoteType', () => {
    const options: moduleFederationPlugin.ModuleFederationPluginOptions = {
      name: 'test',
      remotes: {
        app1: {
          external: './container.js',
        },
      },
      remoteType: 'commonjs',
    };

    const result = normalizeRuntimeInitOptionsWithOutShared(options);

    expect(result).toEqual({
      name: 'test',
      remotes: [
        {
          alias: 'app1',
          name: '',
          entry: './container.js',
          shareScope: 'default',
          externalType: 'commonjs',
        },
      ],
      shareStrategy: 'version-first',
    });
  });

  it('should handle object format with type prefix overriding remoteType', () => {
    const options: moduleFederationPlugin.ModuleFederationPluginOptions = {
      name: 'test',
      remotes: {
        app1: {
          external: 'commonjs ./container.js',
        },
      },
      remoteType: 'script',
    };

    const result = normalizeRuntimeInitOptionsWithOutShared(options);

    expect(result).toEqual({
      name: 'test',
      remotes: [
        {
          alias: 'app1',
          name: '',
          entry: './container.js',
          shareScope: 'default',
          externalType: 'commonjs',
        },
      ],
      shareStrategy: 'version-first',
    });
  });

  it('should handle array format with remoteType', () => {
    const options: moduleFederationPlugin.ModuleFederationPluginOptions = {
      name: 'test',
      remotes: {
        app1: ['./container.js'],
      },
      remoteType: 'commonjs',
    };

    const result = normalizeRuntimeInitOptionsWithOutShared(options);

    expect(result).toEqual({
      name: 'test',
      remotes: [
        {
          alias: 'app1',
          name: '',
          entry: './container.js',
          shareScope: 'default',
          externalType: 'commonjs',
        },
      ],
      shareStrategy: 'version-first',
    });
  });

  it('should handle array format with type prefix overriding remoteType', () => {
    const options: moduleFederationPlugin.ModuleFederationPluginOptions = {
      name: 'test',
      remotes: {
        app1: ['commonjs ./container.js'],
      },
      remoteType: 'script',
    };

    const result = normalizeRuntimeInitOptionsWithOutShared(options);

    expect(result).toEqual({
      name: 'test',
      remotes: [
        {
          alias: 'app1',
          name: '',
          entry: './container.js',
          shareScope: 'default',
          externalType: 'commonjs',
        },
      ],
      shareStrategy: 'version-first',
    });
  });

  it('should handle remoteType with matching prefix in string format', () => {
    const options: moduleFederationPlugin.ModuleFederationPluginOptions = {
      name: 'test',
      remotes: {
        app1: 'commonjs ./container.js',
      },
      remoteType: 'commonjs',
    };

    const result = normalizeRuntimeInitOptionsWithOutShared(options);

    expect(result).toEqual({
      name: 'test',
      remotes: [
        {
          alias: 'app1',
          name: '',
          entry: './container.js',
          shareScope: 'default',
          externalType: 'commonjs',
        },
      ],
      shareStrategy: 'version-first',
    });
  });

  it('should handle remoteType with different prefix in string format', () => {
    const options: moduleFederationPlugin.ModuleFederationPluginOptions = {
      name: 'test',
      remotes: {
        app1: 'commonjs ./container.js',
      },
      remoteType: 'script',
    };

    const result = normalizeRuntimeInitOptionsWithOutShared(options);

    expect(result).toEqual({
      name: 'test',
      remotes: [
        {
          alias: 'app1',
          name: '',
          entry: './container.js',
          shareScope: 'default',
          externalType: 'commonjs',
        },
      ],
      shareStrategy: 'version-first',
    });
  });

  it('should handle remoteType with matching prefix in object format', () => {
    const options: moduleFederationPlugin.ModuleFederationPluginOptions = {
      name: 'test',
      remotes: {
        app1: {
          external: 'commonjs ./container.js',
        },
      },
      remoteType: 'commonjs',
    };

    const result = normalizeRuntimeInitOptionsWithOutShared(options);

    expect(result).toEqual({
      name: 'test',
      remotes: [
        {
          alias: 'app1',
          name: '',
          entry: './container.js',
          shareScope: 'default',
          externalType: 'commonjs',
        },
      ],
      shareStrategy: 'version-first',
    });
  });

  it('should handle remoteType with different prefix in object format', () => {
    const options: moduleFederationPlugin.ModuleFederationPluginOptions = {
      name: 'test',
      remotes: {
        app1: {
          external: 'commonjs ./container.js',
        },
      },
      remoteType: 'script',
    };

    const result = normalizeRuntimeInitOptionsWithOutShared(options);

    expect(result).toEqual({
      name: 'test',
      remotes: [
        {
          alias: 'app1',
          name: '',
          entry: './container.js',
          shareScope: 'default',
          externalType: 'commonjs',
        },
      ],
      shareStrategy: 'version-first',
    });
  });

  it('should handle remoteType with matching prefix in array format', () => {
    const options: moduleFederationPlugin.ModuleFederationPluginOptions = {
      name: 'test',
      remotes: {
        app1: ['commonjs ./container.js'],
      },
      remoteType: 'commonjs',
    };

    const result = normalizeRuntimeInitOptionsWithOutShared(options);

    expect(result).toEqual({
      name: 'test',
      remotes: [
        {
          alias: 'app1',
          name: '',
          entry: './container.js',
          shareScope: 'default',
          externalType: 'commonjs',
        },
      ],
      shareStrategy: 'version-first',
    });
  });

  it('should handle remoteType with different prefix in array format', () => {
    const options: moduleFederationPlugin.ModuleFederationPluginOptions = {
      name: 'test',
      remotes: {
        app1: ['commonjs ./container.js'],
      },
      remoteType: 'script',
    };

    const result = normalizeRuntimeInitOptionsWithOutShared(options);

    expect(result).toEqual({
      name: 'test',
      remotes: [
        {
          alias: 'app1',
          name: '',
          entry: './container.js',
          shareScope: 'default',
          externalType: 'commonjs',
        },
      ],
      shareStrategy: 'version-first',
    });
  });

  it('should handle remoteType with different prefix and shareScope', () => {
    const options: moduleFederationPlugin.ModuleFederationPluginOptions = {
      name: 'test',
      remotes: {
        app1: {
          external: 'commonjs ./container.js',
          shareScope: 'custom',
        },
      },
      remoteType: 'script',
    };

    const result = normalizeRuntimeInitOptionsWithOutShared(options);

    expect(result).toEqual({
      name: 'test',
      remotes: [
        {
          alias: 'app1',
          name: '',
          entry: './container.js',
          shareScope: 'custom',
          externalType: 'commonjs',
        },
      ],
      shareStrategy: 'version-first',
    });
  });
});
