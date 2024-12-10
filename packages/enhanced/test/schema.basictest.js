/* eslint-env jest */
const validate =
  require('../src/schemas/sharing/ProviderSharedPlugin.check').default;
const validateConsume =
  require('../src/schemas/sharing/ConsumeSharedPlugin.check').default;
const validateContainerReference =
  require('../src/schemas/container/ContainerReferencePlugin.check').default;

describe('ProviderSharedPlugin Schema Validation', () => {
  test('should validate minimal valid config', () => {
    const config = {
      provides: ['react'],
    };
    expect(validate(config)).toBe(true);
  });

  test('should validate complex provides config', () => {
    const config = {
      provides: {
        react: {
          singleton: true,
          strictVersion: true,
          version: '18.0.0',
          shareScope: 'default',
          eager: true,
        },
      },
      shareScope: 'custom',
    };
    expect(validate(config)).toBe(true);
  });

  test('should validate array of mixed provides', () => {
    const config = {
      provides: [
        'react',
        {
          'react-dom': {
            singleton: true,
            version: '18.0.0',
          },
        },
      ],
    };
    expect(validate(config)).toBe(true);
  });

  test('should validate requiredVersion with different formats', () => {
    const config = {
      provides: {
        react: {
          requiredVersion: '^18.0.0',
          singleton: true,
        },
        vue: {
          requiredVersion: '~3.0.0',
          singleton: true,
        },
        svelte: {
          requiredVersion: false,
          singleton: true,
        },
      },
    };
    expect(validate(config)).toBe(true);
  });

  test('should validate version with string and false values', () => {
    const config = {
      provides: {
        react: {
          version: '18.0.0',
          singleton: true,
        },
        vue: {
          version: false,
          singleton: true,
        },
      },
    };
    expect(validate(config)).toBe(true);
  });

  test('should validate complex nested configurations', () => {
    const config = {
      provides: [
        'react',
        {
          'react-dom': {
            singleton: true,
            version: '18.0.0',
            shareScope: 'default',
          },
        },
        {
          'shared-lib': {
            eager: true,
            shareKey: 'shared-lib-key',
            requiredVersion: '^1.0.0',
            singleton: true,
            strictVersion: true,
            version: '1.2.3',
            layer: 'vendor',
            request: './path/to/shared-lib',
          },
        },
      ],
      shareScope: 'custom',
    };
    expect(validate(config)).toBe(true);
  });

  test('should validate shareKey with minimum length', () => {
    const config = {
      provides: {
        react: {
          shareKey: 'custom-react',
          version: '18.0.0',
        },
      },
    };
    expect(validate(config)).toBe(true);
  });

  test('should reject empty shareKey', () => {
    const config = {
      provides: {
        react: {
          shareKey: '',
          version: '18.0.0',
        },
      },
    };
    expect(validate(config)).toBe(false);
  });

  test('should reject invalid config without provides', () => {
    const config = {
      shareScope: 'default',
    };
    expect(validate(config)).toBe(false);
  });

  test('should reject invalid provides type', () => {
    const config = {
      provides: 123,
    };
    expect(validate(config)).toBe(false);
  });

  test('should reject invalid additional properties', () => {
    const config = {
      provides: ['react'],
      invalidProp: 'value',
    };
    expect(validate(config)).toBe(false);
  });

  test('should reject invalid provides config', () => {
    const config = {
      provides: {
        react: {
          singleton: 'not-a-boolean',
          version: 123,
        },
      },
    };
    expect(validate(config)).toBe(false);
  });

  test('should validate provides with request property', () => {
    const config = {
      provides: {
        'my-alias': {
          request: 'actual-module',
          singleton: true,
        },
      },
    };
    expect(validate(config)).toBe(true);
  });

  test('should validate provides with layer property', () => {
    const config = {
      provides: {
        react: {
          layer: 'vendor',
          version: '18.0.0',
        },
      },
    };
    expect(validate(config)).toBe(true);
  });
});

describe('ConsumeSharedPlugin Schema Validation', () => {
  test('should validate minimal valid config', () => {
    const config = {
      consumes: ['react'],
    };
    expect(validateConsume(config)).toBe(true);
  });

  test('should validate complex consumes config', () => {
    const config = {
      consumes: {
        react: {
          singleton: true,
          strictVersion: true,
          requiredVersion: '18.0.0',
          shareScope: 'default',
          eager: true,
        },
      },
      shareScope: 'custom',
    };
    expect(validateConsume(config)).toBe(true);
  });

  test('should validate array of mixed consumes', () => {
    const config = {
      consumes: [
        'react',
        {
          'react-dom': {
            singleton: true,
            requiredVersion: '18.0.0',
          },
        },
      ],
    };
    expect(validateConsume(config)).toBe(true);
  });

  test('should validate import with false and string values', () => {
    const config = {
      consumes: {
        react: {
          import: false,
          singleton: true,
        },
        vue: {
          import: './path/to/fallback',
          singleton: true,
        },
      },
    };
    expect(validateConsume(config)).toBe(true);
  });

  test('should validate complex nested configurations', () => {
    const config = {
      consumes: [
        'react',
        {
          'react-dom': {
            singleton: true,
            requiredVersion: '18.0.0',
            shareScope: 'default',
          },
        },
        {
          'shared-lib': {
            eager: true,
            shareKey: 'shared-lib-key',
            packageName: 'shared-lib',
            requiredVersion: '^1.0.0',
            singleton: true,
            strictVersion: true,
            import: './local-fallback',
            layer: 'vendor',
            issuerLayer: 'app',
            request: './path/to/shared-lib',
          },
        },
      ],
      shareScope: 'custom',
    };
    expect(validateConsume(config)).toBe(true);
  });

  test('should validate shareKey with minimum length', () => {
    const config = {
      consumes: {
        react: {
          shareKey: 'custom-react',
          requiredVersion: '18.0.0',
        },
      },
    };
    expect(validateConsume(config)).toBe(true);
  });

  test('should reject empty shareKey', () => {
    const config = {
      consumes: {
        react: {
          shareKey: '',
          requiredVersion: '18.0.0',
        },
      },
    };
    expect(validateConsume(config)).toBe(false);
  });

  test('should reject invalid config without consumes', () => {
    const config = {
      shareScope: 'default',
    };
    expect(validateConsume(config)).toBe(false);
  });

  test('should reject invalid consumes type', () => {
    const config = {
      consumes: 123,
    };
    expect(validateConsume(config)).toBe(false);
  });

  test('should reject invalid additional properties', () => {
    const config = {
      consumes: ['react'],
      invalidProp: 'value',
    };
    expect(validateConsume(config)).toBe(false);
  });

  test('should reject invalid consumes config', () => {
    const config = {
      consumes: {
        react: {
          singleton: 'not-a-boolean',
          requiredVersion: 123,
        },
      },
    };
    expect(validateConsume(config)).toBe(false);
  });

  test('should validate requiredVersion formats', () => {
    const config = {
      consumes: {
        react: {
          requiredVersion: '^18.0.0',
          singleton: true,
        },
        vue: {
          requiredVersion: '~3.0.0',
          singleton: true,
        },
        svelte: {
          requiredVersion: false,
          singleton: true,
        },
      },
    };
    expect(validateConsume(config)).toBe(true);
  });

  test('should validate trailing slash in shareKey for prefix matching', () => {
    const config = {
      consumes: {
        '@scope/': {
          shareKey: '@scope/',
          singleton: true,
        },
      },
    };
    expect(validateConsume(config)).toBe(true);
  });

  test('should validate different path types', () => {
    const config = {
      consumes: {
        // Relative path
        './local-module': {
          singleton: true,
        },
        // Absolute path
        '/absolute/path/module': {
          singleton: true,
        },
        // Module request
        '@scope/package': {
          singleton: true,
        },
      },
    };
    expect(validateConsume(config)).toBe(true);
  });

  test('should validate all possible ConsumesConfig combinations', () => {
    const config = {
      consumes: {
        module1: {
          eager: true,
          import: './fallback1',
          packageName: 'package1',
          requiredVersion: '^1.0.0',
          shareKey: 'key1',
          shareScope: 'scope1',
          singleton: true,
          strictVersion: true,
          issuerLayer: 'app',
          layer: 'vendor',
          request: './custom-request',
        },
        module2: {
          eager: false,
          import: false,
          requiredVersion: false,
          singleton: false,
          strictVersion: false,
        },
      },
    };
    expect(validateConsume(config)).toBe(true);
  });

  test('should validate mixed array with all possible types', () => {
    const config = {
      consumes: [
        // Simple string
        'simple-module',
        // Object with string value
        { 'module-string': 'value' },
        // Object with config
        {
          'module-config': {
            eager: true,
            import: './fallback',
            singleton: true,
          },
        },
        // Object with multiple entries
        {
          module1: { singleton: true },
          module2: 'direct-value',
          module3: {
            requiredVersion: '^1.0.0',
          },
        },
      ],
    };
    expect(validateConsume(config)).toBe(true);
  });

  test('should validate version formats', () => {
    const config = {
      consumes: {
        module1: {
          requiredVersion: '1.0.0',
        },
        module2: {
          requiredVersion: '^1.0.0',
        },
        module3: {
          requiredVersion: '~1.0.0',
        },
        module4: {
          requiredVersion: '1.2.3-beta.1',
        },
        module5: {
          requiredVersion: false,
        },
      },
    };
    expect(validateConsume(config)).toBe(true);
  });

  test('should validate empty strings and minimum length requirements', () => {
    const config = {
      consumes: {
        'valid-module': {
          packageName: 'pkg', // valid: length >= 1
          shareKey: 'key', // valid: length >= 1
          shareScope: 'scope', // valid: length >= 1
          layer: 'layer1', // valid: length >= 1
          issuerLayer: 'layer2', // valid: length >= 1
          request: './path', // valid: length >= 1
        },
      },
    };
    expect(validateConsume(config)).toBe(true);

    const invalidConfig = {
      consumes: {
        'invalid-module': {
          packageName: '', // invalid: empty string
          shareKey: '', // invalid: empty string
          shareScope: '', // invalid: empty string
          layer: '', // invalid: empty string
          issuerLayer: '', // invalid: empty string
          request: '', // invalid: empty string
        },
      },
    };
    expect(validateConsume(invalidConfig)).toBe(false);
  });

  test('should validate nested ConsumesObject structures', () => {
    const config = {
      consumes: {
        module1: {
          singleton: true,
          request: './nested1',
        },
        module2: 'direct-value',
        module3: {
          eager: true,
          import: './fallback',
        },
      },
      shareScope: 'custom',
    };
    expect(validateConsume(config)).toBe(true);
  });

  test('should reject missing consumes', () => {
    const config = {
      shareScope: 'default',
    };
    expect(validateConsume(config)).toBe(false);
  });

  test('should reject invalid consumes type', () => {
    const config = {
      consumes: 123,
    };
    expect(validateConsume(config)).toBe(false);
  });

  test('should reject invalid property in ConsumesConfig', () => {
    const config = {
      consumes: {
        module: {
          singleton: true,
          invalidProp: 'value',
        },
      },
    };
    expect(validateConsume(config)).toBe(false);
  });

  test('should reject invalid boolean type', () => {
    const config = {
      consumes: {
        module: {
          singleton: 'not-a-boolean',
        },
      },
    };
    expect(validateConsume(config)).toBe(false);
  });

  test('should reject invalid version format', () => {
    const config = {
      consumes: {
        module: {
          requiredVersion: 123,
        },
      },
    };
    expect(validateConsume(config)).toBe(false);
  });

  test('should reject nested object structure', () => {
    const config = {
      consumes: {
        group1: {
          nested1: {
            singleton: true,
          },
        },
      },
    };
    expect(validateConsume(config)).toBe(false);
  });

  test('should validate packageName property', () => {
    const config = {
      consumes: {
        'some-package': {
          packageName: 'actual-package-name',
          requiredVersion: '^1.0.0',
        },
      },
    };
    expect(validateConsume(config)).toBe(true);
  });

  test('should validate issuerLayer property', () => {
    const config = {
      consumes: {
        react: {
          issuerLayer: 'application',
          singleton: true,
        },
      },
    };
    expect(validateConsume(config)).toBe(true);
  });

  test('should validate shareKey with trailing slash', () => {
    const config = {
      consumes: {
        'components/': {
          shareKey: 'shared-components/',
          singleton: true,
        },
      },
    };
    expect(validateConsume(config)).toBe(true);
  });

  test('should reject empty shareScope', () => {
    const config = {
      consumes: ['react'],
      shareScope: '',
    };
    expect(validateConsume(config)).toBe(false);
  });

  test('should validate all requiredVersion formats', () => {
    const config = {
      consumes: {
        pkg1: {
          requiredVersion: '^1.0.0',
        },
        pkg2: {
          requiredVersion: '~2.0.0',
        },
        pkg3: {
          requiredVersion: '3.0.0',
        },
        pkg4: {
          requiredVersion: false,
        },
      },
    };
    expect(validateConsume(config)).toBe(true);
  });

  test('should validate strictVersion with different combinations', () => {
    const config = {
      consumes: {
        pkg1: {
          strictVersion: true,
          requiredVersion: '^1.0.0',
          import: './fallback',
        },
        pkg2: {
          strictVersion: false,
          singleton: true,
        },
        pkg3: {
          strictVersion: true,
          singleton: true,
          requiredVersion: '^3.0.0',
        },
      },
    };
    expect(validateConsume(config)).toBe(true);
  });

  test('should reject invalid property combinations', () => {
    const config = {
      consumes: {
        react: {
          eager: 'not-a-boolean',
          requiredVersion: 123,
          shareScope: '',
        },
      },
    };
    expect(validateConsume(config)).toBe(false);
  });
});

describe('ContainerReferencePlugin Schema Validation', () => {
  test('should validate minimal valid config', () => {
    const config = {
      remoteType: 'var',
      remotes: ['app1', 'app2'],
    };
    expect(validateContainerReference(config)).toBe(true);
  });

  test('should validate remotes as object', () => {
    const config = {
      remoteType: 'var',
      remotes: {
        app1: 'app1@http://localhost:3001/remoteEntry.js',
        app2: 'app2@http://localhost:3002/remoteEntry.js',
      },
    };
    expect(validateContainerReference(config)).toBe(true);
  });

  test('should validate remotes with advanced configuration', () => {
    const config = {
      remoteType: 'var',
      remotes: {
        app1: {
          external: 'app1@http://localhost:3001/remoteEntry.js',
          shareScope: 'custom',
        },
      },
      shareScope: 'default',
    };
    expect(validateContainerReference(config)).toBe(true);
  });

  test('should validate remotes with array of externals', () => {
    const config = {
      remoteType: 'var',
      remotes: {
        app1: {
          external: [
            'app1@http://localhost:3001/remoteEntry.js',
            'app1@http://localhost:3002/remoteEntry.js',
          ],
          shareScope: 'custom',
        },
      },
    };
    expect(validateContainerReference(config)).toBe(true);
  });

  test('should validate all remoteType values', () => {
    const remoteTypes = [
      'var',
      'module',
      'assign',
      'this',
      'window',
      'self',
      'global',
      'commonjs',
      'commonjs2',
      'commonjs-module',
      'commonjs-static',
      'amd',
      'amd-require',
      'umd',
      'umd2',
      'jsonp',
      'system',
      'promise',
      'import',
      'script',
      'node-commonjs',
    ];

    remoteTypes.forEach((type) => {
      const config = {
        remoteType: type,
        remotes: ['app1'],
      };
      expect(validateContainerReference(config)).toBe(true);
    });
  });

  test('should reject invalid remoteType', () => {
    const config = {
      remoteType: 'invalid-type',
      remotes: ['app1'],
    };
    expect(validateContainerReference(config)).toBe(false);
  });

  test('should reject missing required fields', () => {
    const config = {
      remotes: ['app1'],
    };
    expect(validateContainerReference(config)).toBe(false);

    const config2 = {
      remoteType: 'var',
    };
    expect(validateContainerReference(config2)).toBe(false);
  });

  test('should reject invalid remotes format', () => {
    const config = {
      remoteType: 'var',
      remotes: 123,
    };
    expect(validateContainerReference(config)).toBe(false);
  });

  test('should reject empty remote strings', () => {
    const config = {
      remoteType: 'var',
      remotes: [''],
    };
    expect(validateContainerReference(config)).toBe(false);
  });

  test('should reject invalid additional properties', () => {
    const config = {
      remoteType: 'var',
      remotes: ['app1'],
      invalidProp: 'value',
    };
    expect(validateContainerReference(config)).toBe(false);
  });

  test('should validate shareScope with minimum length', () => {
    const config = {
      remoteType: 'var',
      remotes: ['app1'],
      shareScope: 'custom',
    };
    expect(validateContainerReference(config)).toBe(true);
  });

  test('should reject empty shareScope', () => {
    const config = {
      remoteType: 'var',
      remotes: ['app1'],
      shareScope: '',
    };
    expect(validateContainerReference(config)).toBe(false);
  });

  test('should validate mixed array of RemotesItem and RemotesObject', () => {
    const config = {
      remoteType: 'var',
      remotes: [
        'app1@http://localhost:3001/remoteEntry.js',
        {
          app2: {
            external: 'app2@http://localhost:3002/remoteEntry.js',
            shareScope: 'custom',
          },
        },
      ],
    };
    expect(validateContainerReference(config)).toBe(true);
  });

  test('should validate RemotesObject with multiple formats', () => {
    const config = {
      remoteType: 'var',
      remotes: {
        app1: 'app1@http://localhost:3001/remoteEntry.js',
        app2: [
          'app2@http://localhost:3002/remoteEntry.js',
          'app2@http://localhost:3003/remoteEntry.js',
        ],
        app3: {
          external: 'app3@http://localhost:3004/remoteEntry.js',
          shareScope: 'custom',
        },
      },
    };
    expect(validateContainerReference(config)).toBe(true);
  });

  test('should reject invalid RemotesConfig', () => {
    const config = {
      remoteType: 'var',
      remotes: {
        app1: {
          external: '', // invalid: empty string
          shareScope: 'custom',
        },
      },
    };
    expect(validateContainerReference(config)).toBe(false);

    const config2 = {
      remoteType: 'var',
      remotes: {
        app1: {
          // missing required 'external' property
          shareScope: 'custom',
        },
      },
    };
    expect(validateContainerReference(config2)).toBe(false);

    const config3 = {
      remoteType: 'var',
      remotes: {
        app1: {
          external: 'valid-external',
          shareScope: '', // invalid: empty string
          invalidProp: 'value', // invalid: additional property
        },
      },
    };
    expect(validateContainerReference(config3)).toBe(false);
  });
});

describe('ContainerPlugin Schema Validation', () => {
  const validate =
    require('../src/schemas/container/ContainerPlugin.check').default;

  test('should validate minimal valid config', () => {
    const config = {
      name: 'my-container',
      exposes: {
        './Component': './src/Component',
      },
    };
    expect(validate(config)).toBe(true);
  });

  test('should validate config with array exposes', () => {
    const config = {
      name: 'my-container',
      exposes: [
        './Component',
        {
          './Button': './src/Button',
        },
      ],
    };
    expect(validate(config)).toBe(true);
  });

  test('should validate config with library options', () => {
    const config = {
      name: 'my-container',
      exposes: {
        './Component': './src/Component',
      },
      library: {
        type: 'var',
        name: 'MyContainer',
      },
    };
    expect(validate(config)).toBe(true);
  });

  test('should validate config with all optional properties', () => {
    const config = {
      name: 'my-container',
      exposes: {
        './Component': {
          import: './src/Component',
          name: 'MyComponent',
        },
      },
      filename: 'container.js',
      library: {
        type: 'umd',
        name: {
          root: 'MyContainer',
          amd: 'my-container',
          commonjs: 'my-container',
        },
        auxiliaryComment: {
          root: 'Root Comment',
          commonjs: 'CommonJS Comment',
        },
        umdNamedDefine: true,
      },
      runtime: 'my-runtime',
      runtimePlugins: ['./runtime-plugin.js'],
      shareScope: 'default',
      experiments: {
        federationRuntime: 'hoisted',
      },
    };
    expect(validate(config)).toBe(true);
  });

  test('should reject invalid config without required properties', () => {
    const config = {
      library: {
        type: 'var',
      },
    };
    expect(validate(config)).toBe(false);
  });

  test('should reject invalid library type', () => {
    const config = {
      name: 'my-container',
      exposes: {
        './Component': './src/Component',
      },
      library: {
        type: 123,
        name: 'MyContainer',
      },
    };
    expect(validate(config)).toBe(false);
  });

  test('should reject invalid filename with absolute path', () => {
    const config = {
      name: 'my-container',
      exposes: {
        './Component': './src/Component',
      },
      filename: '/absolute/path/container.js',
    };
    expect(validate(config)).toBe(false);
  });

  test('should reject invalid experiments config', () => {
    const config = {
      name: 'my-container',
      exposes: {
        './Component': './src/Component',
      },
      experiments: {
        federationRuntime: 'invalid',
      },
    };
    expect(validate(config)).toBe(false);
  });

  test('should validate complex exposes configuration', () => {
    const config = {
      name: 'my-container',
      exposes: {
        './ComponentA': {
          import: ['./src/ComponentA', './src/styles.css'],
          name: 'ComponentA',
        },
        './ComponentB': {
          import: './src/ComponentB',
        },
        './ComponentC': './src/ComponentC',
      },
    };
    expect(validate(config)).toBe(true);
  });

  test('should reject invalid exposes format', () => {
    const config = {
      name: 'my-container',
      exposes: 'invalid',
    };
    expect(validate(config)).toBe(false);
  });

  test('should validate runtime plugins with string paths', () => {
    const config = {
      name: 'my-container',
      exposes: {
        './Component': './src/Component',
      },
      runtimePlugins: ['./plugin1.js', './plugin2.js'],
    };
    expect(validate(config)).toBe(true);
  });

  test('should validate empty runtime plugins array', () => {
    const config = {
      name: 'my-container',
      exposes: {
        './Component': './src/Component',
      },
      runtimePlugins: [],
    };
    expect(validate(config)).toBe(true);
  });

  test('should reject invalid runtime plugin configurations', () => {
    // Empty string path
    const configEmptyString = {
      name: 'my-container',
      exposes: {
        './Component': './src/Component',
      },
      runtimePlugins: [''],
    };
    expect(validate(configEmptyString)).toBe(false);

    // Invalid type (number)
    const configInvalidType = {
      name: 'my-container',
      exposes: {
        './Component': './src/Component',
      },
      runtimePlugins: [123],
    };
    expect(validate(configInvalidType)).toBe(false);

    // Invalid type (object)
    const configInvalidObject = {
      name: 'my-container',
      exposes: {
        './Component': './src/Component',
      },
      runtimePlugins: [
        {
          import: './plugin.js',
          async: true,
        },
      ],
    };
    expect(validate(configInvalidObject)).toBe(false);

    // Not an array
    const configNotArray = {
      name: 'my-container',
      exposes: {
        './Component': './src/Component',
      },
      runtimePlugins: './plugin.js',
    };
    expect(validate(configNotArray)).toBe(false);
  });

  test('should validate all library types', () => {
    const libraryTypes = [
      'var',
      'module',
      'assign',
      'assign-properties',
      'this',
      'window',
      'self',
      'global',
      'commonjs',
      'commonjs2',
      'commonjs-module',
      'commonjs-static',
      'amd',
      'amd-require',
      'umd',
      'umd2',
      'jsonp',
      'system',
    ];

    libraryTypes.forEach((type) => {
      const config = {
        name: 'my-container',
        exposes: {
          './Component': './src/Component',
        },
        library: {
          type,
          name: 'MyContainer',
        },
      };
      expect(validate(config)).toBe(true);
    });
  });

  test('should validate library name in different formats', () => {
    const config = {
      name: 'my-container',
      exposes: {
        './Component': './src/Component',
      },
      library: {
        type: 'umd',
        name: ['MyNamespace', 'MyContainer'], // array format
        auxiliaryComment: {
          amd: 'AMD Comment',
          commonjs: 'CommonJS Comment',
          commonjs2: 'CommonJS2 Comment',
          root: 'Root Comment',
        },
        umdNamedDefine: true,
        amdContainer: 'MyAmdContainer',
      },
    };
    expect(validate(config)).toBe(true);
  });

  test('should validate library export in different formats', () => {
    const config = {
      name: 'my-container',
      exposes: {
        './Component': './src/Component',
      },
      library: {
        type: 'umd',
        name: 'MyContainer',
        export: ['default', 'named'], // array format
      },
    };
    expect(validate(config)).toBe(true);

    const configWithStringExport = {
      name: 'my-container',
      exposes: {
        './Component': './src/Component',
      },
      library: {
        type: 'umd',
        name: 'MyContainer',
        export: 'default', // string format
      },
    };
    expect(validate(configWithStringExport)).toBe(true);
  });

  test('should validate entry runtime options', () => {
    const config = {
      name: 'my-container',
      exposes: {
        './Component': './src/Component',
      },
      runtime: 'my-runtime',
    };
    expect(validate(config)).toBe(true);

    const configWithFalseRuntime = {
      name: 'my-container',
      exposes: {
        './Component': './src/Component',
      },
      runtime: false,
    };
    expect(validate(configWithFalseRuntime)).toBe(true);
  });

  test('should validate all experiment options', () => {
    const config = {
      name: 'my-container',
      exposes: {
        './Component': './src/Component',
      },
      experiments: {
        federationRuntime: true,
      },
    };
    expect(validate(config)).toBe(true);

    const configWithHoisted = {
      name: 'my-container',
      exposes: {
        './Component': './src/Component',
      },
      experiments: {
        federationRuntime: 'hoisted',
      },
    };
    expect(validate(configWithHoisted)).toBe(true);
  });

  test('should reject invalid runtime plugin format', () => {
    const config = {
      name: 'my-container',
      exposes: {
        './Component': './src/Component',
      },
      runtimePlugins: [
        {
          import: './plugin.js',
          // missing required 'async' property
        },
      ],
    };
    expect(validate(config)).toBe(false);
  });

  test('should reject invalid library name format', () => {
    const config = {
      name: 'my-container',
      exposes: {
        './Component': './src/Component',
      },
      library: {
        type: 'umd',
        name: [], // empty array is invalid
      },
    };
    expect(validate(config)).toBe(false);
  });

  test('should reject empty strings in library configuration', () => {
    const config = {
      name: 'my-container',
      exposes: {
        './Component': './src/Component',
      },
      library: {
        type: 'umd',
        name: 'MyContainer',
        amdContainer: '', // empty string is invalid
      },
    };
    expect(validate(config)).toBe(false);
  });

  test('should reject invalid additional properties', () => {
    const config = {
      name: 'my-container',
      exposes: {
        './Component': './src/Component',
      },
      library: {
        type: 'umd',
        name: 'MyContainer',
        invalidProp: 'value', // invalid additional property
      },
    };
    expect(validate(config)).toBe(false);
  });

  test('should validate complex library UMD configuration', () => {
    const config = {
      name: 'my-container',
      exposes: {
        './Component': './src/Component',
      },
      library: {
        type: 'umd',
        name: {
          root: ['MyNamespace', 'MyContainer'],
          amd: 'my-container',
          commonjs: 'my-container',
        },
        auxiliaryComment: {
          root: 'Root Comment',
          commonjs: 'CommonJS Comment',
          commonjs2: 'CommonJS2 Comment',
          amd: 'AMD Comment',
        },
        umdNamedDefine: true,
      },
    };
    expect(validate(config)).toBe(true);
  });

  test('should validate shareScope with different values', () => {
    const config = {
      name: 'my-container',
      exposes: {
        './Component': './src/Component',
      },
      shareScope: 'custom',
    };
    expect(validate(config)).toBe(true);

    const invalidConfig = {
      name: 'my-container',
      exposes: {
        './Component': './src/Component',
      },
      shareScope: '', // should fail with empty string
    };
    expect(validate(invalidConfig)).toBe(false);
  });

  test('should validate deeply nested exposes configurations', () => {
    const config = {
      name: 'my-container',
      exposes: {
        './ComponentA': {
          import: [
            './src/components/SubComponentA',
            './src/components/SubComponentB',
          ],
          name: 'ComponentGroup',
        },
        './ComponentB': {
          import: './src/components/ComponentB',
          name: 'SingleComponent',
        },
      },
    };
    expect(validate(config)).toBe(true);
  });

  test('should validate complex configuration with all features combined', () => {
    const config = {
      name: 'my-container',
      exposes: {
        './ComponentA': {
          import: './src/ComponentA',
          name: 'ComponentA',
        },
      },
      filename: 'remote-entry.js',
      library: {
        type: 'umd',
        name: {
          root: 'MyContainer',
          amd: 'my-container',
        },
      },
      runtime: 'custom-runtime',
      runtimePlugins: ['./plugin1.js', './plugin2.js'],
      shareScope: 'custom',
      experiments: {
        federationRuntime: 'hoisted',
      },
    };
    expect(validate(config)).toBe(true);
  });

  test('should validate runtime edge cases', () => {
    // Empty runtime string
    const configEmptyRuntime = {
      name: 'my-container',
      exposes: {
        './Component': './src/Component',
      },
      runtime: '',
    };
    expect(validate(configEmptyRuntime)).toBe(false);

    // Invalid runtime type
    const configInvalidRuntime = {
      name: 'my-container',
      exposes: {
        './Component': './src/Component',
      },
      runtime: {},
    };
    expect(validate(configInvalidRuntime)).toBe(false);
  });
});
