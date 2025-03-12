// @ts-nocheck
/* eslint-disable */
/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 */

export default {
  definitions: {
    AmdContainer: {
      description:
        'Add a container for define/require functions in the AMD module.',
      type: 'string',
      minLength: 1,
    },
    AuxiliaryComment: {
      description: 'Add a comment in the UMD wrapper.',
      anyOf: [
        {
          description: 'Append the same comment above each import style.',
          type: 'string',
        },
        {
          $ref: '#/definitions/LibraryCustomUmdCommentObject',
        },
      ],
    },
    EntryRuntime: {
      description:
        'The name of the runtime chunk. If set a runtime chunk with this name is created or an existing entrypoint is used as runtime.',
      anyOf: [
        {
          enum: [false],
        },
        {
          type: 'string',
          minLength: 1,
        },
      ],
    },
    Exposes: {
      description:
        'Modules that should be exposed by this container. When provided, property name is used as public name, otherwise public name is automatically inferred from request.',
      anyOf: [
        {
          type: 'array',
          items: {
            description: 'Modules that should be exposed by this container.',
            anyOf: [
              {
                $ref: '#/definitions/ExposesItem',
              },
              {
                $ref: '#/definitions/ExposesObject',
              },
            ],
          },
        },
        {
          $ref: '#/definitions/ExposesObject',
        },
      ],
    },
    ExposesConfig: {
      description:
        'Advanced configuration for modules that should be exposed by this container.',
      type: 'object',
      additionalProperties: false,
      properties: {
        import: {
          description:
            'Request to a module that should be exposed by this container.',
          anyOf: [
            {
              $ref: '#/definitions/ExposesItem',
            },
            {
              $ref: '#/definitions/ExposesItems',
            },
          ],
        },
        name: {
          description: 'Custom chunk name for the exposed module.',
          type: 'string',
        },
      },
      required: ['import'],
    },
    ExposesItem: {
      description: 'Module that should be exposed by this container.',
      type: 'string',
      minLength: 1,
    },
    ExposesItems: {
      description: 'Modules that should be exposed by this container.',
      type: 'array',
      items: {
        $ref: '#/definitions/ExposesItem',
      },
    },
    ExposesObject: {
      description:
        'Modules that should be exposed by this container. Property names are used as public paths.',
      type: 'object',
      additionalProperties: {
        description: 'Modules that should be exposed by this container.',
        anyOf: [
          {
            $ref: '#/definitions/ExposesConfig',
          },
          {
            $ref: '#/definitions/ExposesItem',
          },
          {
            $ref: '#/definitions/ExposesItems',
          },
        ],
      },
    },
    ExternalsType: {
      description:
        "Specifies the default type of externals ('amd*', 'umd*', 'system' and 'jsonp' depend on output.libraryTarget set to the same value).",
      enum: [
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
        'module-import',
        'script',
        'node-commonjs',
      ],
    },
    LibraryCustomUmdCommentObject: {
      description:
        'Set explicit comments for `commonjs`, `commonjs2`, `amd`, and `root`.',
      type: 'object',
      additionalProperties: false,
      properties: {
        amd: {
          description: 'Set comment for `amd` section in UMD.',
          type: 'string',
        },
        commonjs: {
          description: 'Set comment for `commonjs` (exports) section in UMD.',
          type: 'string',
        },
        commonjs2: {
          description:
            'Set comment for `commonjs2` (module.exports) section in UMD.',
          type: 'string',
        },
        root: {
          description:
            'Set comment for `root` (global variable) section in UMD.',
          type: 'string',
        },
      },
    },
    LibraryCustomUmdObject: {
      description:
        'Description object for all UMD variants of the library name.',
      type: 'object',
      additionalProperties: false,
      properties: {
        amd: {
          description: 'Name of the exposed AMD library in the UMD.',
          type: 'string',
          minLength: 1,
        },
        commonjs: {
          description: 'Name of the exposed commonjs export in the UMD.',
          type: 'string',
          minLength: 1,
        },
        root: {
          description:
            'Name of the property exposed globally by a UMD library.',
          anyOf: [
            {
              type: 'array',
              items: {
                description:
                  'Part of the name of the property exposed globally by a UMD library.',
                type: 'string',
                minLength: 1,
              },
            },
            {
              type: 'string',
              minLength: 1,
            },
          ],
        },
      },
    },
    LibraryExport: {
      description: 'Specify which export should be exposed as library.',
      anyOf: [
        {
          type: 'array',
          items: {
            description:
              'Part of the export that should be exposed as library.',
            type: 'string',
            minLength: 1,
          },
        },
        {
          type: 'string',
          minLength: 1,
        },
      ],
    },
    LibraryName: {
      description:
        'The name of the library (some types allow unnamed libraries too).',
      anyOf: [
        {
          type: 'array',
          items: {
            description: 'A part of the library name.',
            type: 'string',
            minLength: 1,
          },
          minItems: 1,
        },
        {
          type: 'string',
          minLength: 1,
        },
        {
          $ref: '#/definitions/LibraryCustomUmdObject',
        },
      ],
    },
    LibraryOptions: {
      description: 'Options for library.',
      type: 'object',
      additionalProperties: false,
      properties: {
        amdContainer: {
          $ref: '#/definitions/AmdContainer',
        },
        auxiliaryComment: {
          $ref: '#/definitions/AuxiliaryComment',
        },
        export: {
          $ref: '#/definitions/LibraryExport',
        },
        name: {
          $ref: '#/definitions/LibraryName',
        },
        type: {
          $ref: '#/definitions/LibraryType',
        },
        umdNamedDefine: {
          $ref: '#/definitions/UmdNamedDefine',
        },
      },
      required: ['type'],
    },
    LibraryType: {
      description:
        "Type of library (types included by default are 'var', 'module', 'assign', 'assign-properties', 'this', 'window', 'self', 'global', 'commonjs', 'commonjs2', 'commonjs-module', 'commonjs-static', 'amd', 'amd-require', 'umd', 'umd2', 'jsonp', 'system', but others might be added by plugins).",
      anyOf: [
        {
          enum: [
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
          ],
        },
        {
          type: 'string',
        },
      ],
    },
    Remotes: {
      description:
        'Container locations and request scopes from which modules should be resolved and loaded at runtime. When provided, property name is used as request scope, otherwise request scope is automatically inferred from container location.',
      anyOf: [
        {
          type: 'array',
          items: {
            description:
              'Container locations and request scopes from which modules should be resolved and loaded at runtime.',
            anyOf: [
              {
                $ref: '#/definitions/RemotesItem',
              },
              {
                $ref: '#/definitions/RemotesObject',
              },
            ],
          },
        },
        {
          $ref: '#/definitions/RemotesObject',
        },
      ],
    },
    RemotesConfig: {
      description:
        'Advanced configuration for container locations from which modules should be resolved and loaded at runtime.',
      type: 'object',
      additionalProperties: false,
      properties: {
        external: {
          description:
            'Container locations from which modules should be resolved and loaded at runtime.',
          anyOf: [
            {
              $ref: '#/definitions/RemotesItem',
            },
            {
              $ref: '#/definitions/RemotesItems',
            },
          ],
        },
        shareScope: {
          description: 'The name of the share scope shared with this remote.',
          type: 'string',
          minLength: 1,
        },
      },
      required: ['external'],
    },
    RemotesItem: {
      description:
        'Container location from which modules should be resolved and loaded at runtime.',
      type: 'string',
      minLength: 1,
    },
    RemotesItems: {
      description:
        'Container locations from which modules should be resolved and loaded at runtime.',
      type: 'array',
      items: {
        $ref: '#/definitions/RemotesItem',
      },
    },
    RemotesObject: {
      description:
        'Container locations from which modules should be resolved and loaded at runtime. Property names are used as request scopes.',
      type: 'object',
      additionalProperties: {
        description:
          'Container locations from which modules should be resolved and loaded at runtime.',
        anyOf: [
          {
            $ref: '#/definitions/RemotesConfig',
          },
          {
            $ref: '#/definitions/RemotesItem',
          },
          {
            $ref: '#/definitions/RemotesItems',
          },
        ],
      },
    },
    Shared: {
      description:
        'Modules that should be shared in the share scope. When provided, property names are used to match requested modules in this compilation.',
      anyOf: [
        {
          type: 'array',
          items: {
            description: 'Modules that should be shared in the share scope.',
            anyOf: [
              {
                $ref: '#/definitions/SharedItem',
              },
              {
                $ref: '#/definitions/SharedObject',
              },
            ],
          },
        },
        {
          $ref: '#/definitions/SharedObject',
        },
      ],
    },
    SharedConfig: {
      description:
        'Advanced configuration for modules that should be shared in the share scope.',
      type: 'object',
      additionalProperties: false,
      properties: {
        eager: {
          description:
            'Include the provided and fallback module directly instead behind an async request. This allows to use this shared module in initial load too. All possible shared modules need to be eager too.',
          type: 'boolean',
        },
        import: {
          description:
            "Provided module that should be provided to share scope. Also acts as fallback module if no shared module is found in share scope or version isn't valid. Defaults to the property name.",
          anyOf: [
            {
              description: 'No provided or fallback module.',
              enum: [false],
            },
            {
              $ref: '#/definitions/SharedItem',
            },
          ],
        },
        request: {
          description: 'Import request to match on',
          type: 'string',
          minLength: 1,
        },
        layer: {
          description: 'Layer in which the shared module should be placed.',
          type: 'string',
          minLength: 1,
        },
        issuerLayer: {
          description: 'Layer of the issuer.',
          type: 'string',
          minLength: 1,
        },
        packageName: {
          description:
            "Package name to determine required version from description file. This is only needed when package name can't be automatically determined from request.",
          type: 'string',
          minLength: 1,
        },
        requiredVersion: {
          description: 'Version requirement from module in share scope.',
          anyOf: [
            {
              description: 'No version requirement check.',
              enum: [false],
            },
            {
              description:
                "Version as string. Can be prefixed with '^' or '~' for minimum matches. Each part of the version should be separated by a dot '.'.",
              type: 'string',
            },
          ],
        },
        shareKey: {
          description:
            'Module is looked up under this key from the share scope.',
          type: 'string',
          minLength: 1,
        },
        shareScope: {
          description: 'Share scope name.',
          type: 'string',
          minLength: 1,
        },
        singleton: {
          description:
            'Allow only a single version of the shared module in share scope (disabled by default).',
          type: 'boolean',
        },
        strictVersion: {
          description:
            'Do not accept shared module if version is not valid (defaults to yes, if local fallback module is available and shared module is not a singleton, otherwise no, has no effect if there is no required version specified).',
          type: 'boolean',
        },
        version: {
          description:
            'Version of the provided module. Will replace lower matching versions, but not higher.',
          anyOf: [
            {
              description: "Don't provide a version.",
              enum: [false],
            },
            {
              description:
                "Version as string. Each part of the version should be separated by a dot '.'.",
              type: 'string',
            },
          ],
        },
      },
    },
    SharedItem: {
      description: 'A module that should be shared in the share scope.',
      type: 'string',
      minLength: 1,
    },
    SharedObject: {
      description:
        'Modules that should be shared in the share scope. Property names are used to match requested modules in this compilation. Relative requests are resolved, module requests are matched unresolved, absolute paths will match resolved requests. A trailing slash will match all requests with this prefix. In this case shareKey must also have a trailing slash.',
      type: 'object',
      additionalProperties: {
        description: 'Modules that should be shared in the share scope.',
        anyOf: [
          {
            $ref: '#/definitions/SharedConfig',
          },
          {
            $ref: '#/definitions/SharedItem',
          },
        ],
      },
    },
    UmdNamedDefine: {
      description:
        'If `output.libraryTarget` is set to umd and `output.library` is set, setting this to true will name the AMD module.',
      type: 'boolean',
    },
  },
  title: 'ModuleFederationPluginOptions',
  type: 'object',
  additionalProperties: false,
  properties: {
    async: {
      description:
        'Enable/disable asynchronous loading of runtime modules. When enabled, entry points will be wrapped in asynchronous chunks.',
      type: 'boolean',
    },
    exposes: {
      $ref: '#/definitions/Exposes',
    },
    filename: {
      description:
        'The filename for this container relative path inside the `output.path` directory.',
      type: 'string',
      absolutePath: false,
      minLength: 1,
    },
    library: {
      $ref: '#/definitions/LibraryOptions',
    },
    name: {
      description: 'The name for this container.',
      type: 'string',
      minLength: 1,
    },
    remoteType: {
      description: 'The external type of the remote containers.',
      oneOf: [
        {
          $ref: '#/definitions/ExternalsType',
        },
      ],
    },
    remotes: {
      $ref: '#/definitions/Remotes',
    },
    runtime: {
      $ref: '#/definitions/EntryRuntime',
    },
    shareScope: {
      description:
        "The name of the share scope which is shared with the host (defaults to 'default').",
      type: 'string',
      minLength: 1,
    },
    shareStrategy: {
      description: 'Strategy for resolving shared modules',
      enum: ['version-first', 'loaded-first'],
      type: 'string',
    },
    shared: {
      $ref: '#/definitions/Shared',
    },
    experiments: {
      description: 'Experimental features configuration',
      type: 'object',
      additionalProperties: false,
      properties: {
        federationRuntime: {
          description: 'Enable asynchronous startup',
          oneOf: [
            {
              enum: [false],
            },
            {
              enum: ['hoisted'],
            },
          ],
        },
        externalRuntime: {
          description:
            'After setting true, the external MF runtime will be used and the runtime provided by the consumer will be used. (Please make sure your consumer has provideExternalRuntime: true set, otherwise it will not run properly!)',
          type: 'boolean',
          default: false,
        },
        provideExternalRuntime: {
          description: 'Enable providing external runtime',
          type: 'boolean',
          default: false,
        },
      },
    },
    runtimePlugins: {
      description: 'Runtime plugin file paths or package names',
      type: 'array',
      items: {
        type: 'string',
      },
    },
    getPublicPath: {
      description: 'Custom public path function',
      type: 'string',
    },
    implementation: {
      description: 'Bundler runtime path',
      type: 'string',
    },
    manifest: {
      description: 'Manifest configuration',
      oneOf: [
        {
          type: 'boolean',
        },
        {
          type: 'object',
          title: 'PluginManifestOptions',
        },
      ],
    },
    dev: {
      description: 'Development mode configuration',
      oneOf: [
        {
          type: 'boolean',
        },
      ],
    },
    experiments: {
      type: 'object',
      properties: {
        asyncStartup: {
          description: 'Enable async startup for the container',
          type: 'boolean',
        },
        externalRuntime: {
          type: 'boolean',
        },
        provideExternalRuntime: {
          type: 'boolean',
        },
      },
    },
    bridge: {
      description: 'Bridge configuration options',
      type: 'object',
      properties: {
        disableAlias: {
          description:
            'Disables the default alias setting in the bridge. When true, users must manually handle basename through root component props.',
          type: 'boolean',
          default: false,
        },
      },
      additionalProperties: false,
    },
  },
} as const;
