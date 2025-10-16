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
          anyOf: [
            {
              type: 'string',
              minLength: 1,
            },
            {
              type: 'array',
              items: {
                type: 'string',
                minLength: 1,
              },
            },
          ],
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
        exclude: {
          description:
            "Options for excluding specific versions or request paths of the shared module. When specified, matching modules will not be shared. Cannot be used with 'include'.",
          $ref: '#/definitions/IncludeExcludeOptions',
        },
        include: {
          description:
            "Options for including only specific versions or request paths of the shared module. When specified, only matching modules will be shared. Cannot be used with 'exclude'.",
          $ref: '#/definitions/IncludeExcludeOptions',
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
          anyOf: [
            {
              type: 'string',
              minLength: 1,
            },
            {
              type: 'array',
              items: {
                type: 'string',
                minLength: 1,
              },
            },
          ],
        },
        shareStrategy: {
          description:
            "[Deprecated]: load shared strategy(defaults to 'version-first').",
          enum: ['version-first', 'loaded-first'],
          type: 'string',
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
        allowNodeModulesSuffixMatch: {
          description:
            'Enable reconstructed lookup for node_modules paths for this share item',
          type: 'boolean',
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
    IncludeExcludeOptions: {
      type: 'object',
      properties: {
        request: {
          type: ['string', 'object'],
          description:
            'A string (which can be a regex pattern) or a RegExp object to match the request path.',
        },
        version: {
          type: 'string',
          description:
            "Semantic versioning range to match against the module's version.",
        },
        fallbackVersion: {
          type: 'string',
          description:
            "Semantic versioning range to match against the fallback module's version for exclusion/inclusion context where applicable.",
        },
      },
      additionalProperties: false,
      anyOf: [
        {
          required: ['request'],
        },
        {
          required: ['version'],
        },
        {
          required: ['fallbackVersion'],
        },
      ],
    },
    Exclude: {
      description: 'Advanced filtering options.',
      type: 'object',
      additionalProperties: false,
      properties: {
        request: {
          description: 'Regular expression pattern to filter module requests',
          instanceof: 'RegExp',
        },
        version: {
          description:
            'Specific version string or range to filter by (exclude matches).',
          type: 'string',
        },
        fallbackVersion: {
          description:
            'Optional specific version string to check against the filter.version range instead of reading package.json.',
          type: 'string',
        },
      },
    },
  },
  title: 'ModuleFederationPluginOptions',
  type: 'object',
  additionalProperties: false,
  properties: {
    async: {
      description:
        'Enable/disable asynchronous loading of runtime modules or provide async boundary options.',
      anyOf: [
        {
          type: 'boolean',
        },
        {
          type: 'object',
          properties: {
            eager: {
              description:
                'Eagerly load a module, matched via RegExp or predicate function',
              anyOf: [
                {
                  instanceof: 'RegExp',
                },
                {
                  instanceof: 'Function',
                },
              ],
            },
            excludeChunk: {
              description: 'Predicate to exclude chunk from async boundary',
              instanceof: 'Function',
            },
          },
          additionalProperties: false,
        },
      ],
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
      anyOf: [
        {
          type: 'string',
          minLength: 1,
        },
        {
          type: 'array',
          items: {
            type: 'string',
            minLength: 1,
          },
        },
      ],
    },
    shareStrategy: {
      description: 'Strategy for resolving shared modules',
      enum: ['version-first', 'loaded-first'],
      type: 'string',
    },
    shared: {
      $ref: '#/definitions/Shared',
    },
    dts: {
      description: 'TypeScript declaration file generation options',
      anyOf: [
        {
          type: 'boolean',
        },
        {
          type: 'object',
          properties: {
            generateTypes: {
              anyOf: [
                {
                  type: 'boolean',
                },
                {
                  type: 'object',
                  properties: {
                    tsConfigPath: {
                      type: 'string',
                    },
                    typesFolder: {
                      type: 'string',
                    },
                    compiledTypesFolder: {
                      type: 'string',
                    },
                    deleteTypesFolder: {
                      type: 'boolean',
                    },
                    additionalFilesToCompile: {
                      type: 'array',
                      items: {
                        type: 'string',
                      },
                    },
                    compileInChildProcess: {
                      type: 'boolean',
                    },
                    compilerInstance: {
                      type: 'string',
                    },
                    generateAPITypes: {
                      type: 'boolean',
                    },
                    extractThirdParty: {
                      anyOf: [
                        {
                          type: 'boolean',
                        },
                        {
                          type: 'object',
                          properties: {
                            exclude: {
                              type: 'array',
                              items: {
                                anyOf: [
                                  {
                                    type: 'string',
                                  },
                                  {
                                    instanceof: 'RegExp',
                                  },
                                ],
                              },
                            },
                          },
                          additionalProperties: false,
                        },
                      ],
                    },
                    extractRemoteTypes: {
                      type: 'boolean',
                    },
                    abortOnError: {
                      type: 'boolean',
                    },
                  },
                },
              ],
            },
            consumeTypes: {
              anyOf: [
                {
                  type: 'boolean',
                },
                {
                  type: 'object',
                  properties: {
                    typesFolder: {
                      type: 'string',
                    },
                    abortOnError: {
                      type: 'boolean',
                    },
                    remoteTypesFolder: {
                      type: 'string',
                    },
                    deleteTypesFolder: {
                      type: 'boolean',
                    },
                    maxRetries: {
                      type: 'number',
                    },
                    consumeAPITypes: {
                      type: 'boolean',
                    },
                    runtimePkgs: {
                      type: 'array',
                      items: {
                        type: 'string',
                      },
                    },
                    remoteTypeUrls: {
                      description: 'Remote type URLs provider or map',
                      anyOf: [
                        {
                          instanceof: 'Function',
                        },
                        {
                          type: 'object',
                          additionalProperties: {
                            type: 'object',
                            properties: {
                              alias: {
                                type: 'string',
                              },
                              api: {
                                type: 'string',
                              },
                              zip: {
                                type: 'string',
                              },
                            },
                            required: ['api', 'zip'],
                            additionalProperties: false,
                          },
                        },
                      ],
                    },
                    timeout: {
                      type: 'number',
                    },
                    family: {
                      enum: [4, 6],
                    },
                    typesOnBuild: {
                      type: 'boolean',
                    },
                  },
                },
              ],
            },
            tsConfigPath: {
              type: 'string',
            },
            extraOptions: {
              type: 'object',
            },
            implementation: {
              type: 'string',
            },
            cwd: {
              type: 'string',
            },
            displayErrorInTerminal: {
              type: 'boolean',
            },
          },
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
        optimization: {
          description: 'Options related to build optimizations.',
          type: 'object',
          properties: {
            disableSnapshot: {
              description: 'Enable optimization to skip snapshot plugin',
              type: 'boolean',
            },
            target: {
              description: 'Target environment for the build',
              enum: ['web', 'node'],
            },
          },
          additionalProperties: false,
        },
      },
    },
    bridge: {
      description: 'Bridge configuration options',
      type: 'object',
      properties: {
        enableBridgeRouter: {
          description:
            'Enables bridge router functionality for React applications. When enabled, automatically handles routing context and basename injection for micro-frontend applications using react-router-dom.',
          type: 'boolean',
          default: false,
        },
        disableAlias: {
          description:
            '[Deprecated] Use `enableBridgeRouter: false` instead. Disables the default alias setting in the bridge. When true, users must manually handle basename through root component props.',
          type: 'boolean',
          default: false,
        },
      },
      additionalProperties: false,
    },
    virtualRuntimeEntry: {
      description:
        'Uses a virtual module instead of a file for federation runtime entry',
      type: 'boolean',
    },
    dev: {
      description: 'Development mode configuration options',
      anyOf: [
        {
          type: 'boolean',
        },
        {
          type: 'object',
          properties: {
            disableLiveReload: {
              description: 'Disable live reload for development mode',
              type: 'boolean',
            },
            disableHotTypesReload: {
              description: 'Disable hot types reload for development mode',
              type: 'boolean',
            },
            disableDynamicRemoteTypeHints: {
              description:
                'Disable dynamic remote type hints for development mode',
              type: 'boolean',
            },
          },
          additionalProperties: false,
        },
      ],
    },
    manifest: {
      description:
        'Manifest generation configuration options. IMPORTANT: When using this option, you must set a string value for `output.publicPath` in your webpack configuration.',
      anyOf: [
        {
          type: 'boolean',
        },
        {
          type: 'object',
          properties: {
            filePath: {
              description: 'Path where the manifest file will be generated',
              type: 'string',
            },
            disableAssetsAnalyze: {
              description: 'Disable assets analyze for manifest generation',
              type: 'boolean',
            },
            fileName: {
              description: 'Name of the manifest file',
              type: 'string',
            },
            additionalData: {
              description:
                'Function that provides additional data to the manifest',
              instanceof: 'Function',
            },
          },
          additionalProperties: false,
        },
      ],
    },
    runtimePlugins: {
      description:
        'Runtime plugin file paths or package names to be included in federation runtime',
      type: 'array',
      items: {
        anyOf: [
          {
            type: 'string',
          },
          {
            type: 'array',
            items: [
              {
                type: 'string',
              },
              {
                type: 'object',
              },
            ],
            minItems: 2,
            maxItems: 2,
          },
        ],
      },
    },
    getPublicPath: {
      description: 'Custom public path function for remote entry',
      type: 'string',
    },
    dataPrefetch: {
      description: 'Whether enable data prefetch',
      type: 'boolean',
    },
    implementation: {
      description: 'Bundler runtime path',
      type: 'string',
    },
  },
} as const;
