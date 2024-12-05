export default {
  definitions: {
    Consumes: {
      description:
        'Modules that should be consumed from share scope. When provided, property names are used to match requested modules in this compilation.',
      anyOf: [
        {
          type: 'array',
          items: {
            description: 'Modules that should be consumed from share scope.',
            anyOf: [
              {
                $ref: '#/definitions/ConsumesItem',
              },
              {
                $ref: '#/definitions/ConsumesObject',
              },
            ],
          },
        },
        {
          $ref: '#/definitions/ConsumesObject',
        },
      ],
    },
    ConsumesConfig: {
      description:
        'Advanced configuration for modules that should be consumed from share scope.',
      type: 'object',
      additionalProperties: false,
      properties: {
        eager: {
          description:
            'Include the fallback module directly instead behind an async request. This allows to use fallback module in initial load too. All possible shared modules need to be eager too.',
          type: 'boolean',
        },
        import: {
          description:
            'Fallback module if no shared module is found in share scope. Defaults to the property name.',
          anyOf: [
            {
              description: 'No fallback module.',
              enum: [false],
            },
            {
              $ref: '#/definitions/ConsumesItem',
            },
          ],
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
        issuerLayer: {
          description: 'Layer in which the issuer should be.',
          type: 'string',
          minLength: 1,
        },
        layer: {
          description: 'Layer for the shared module.',
          type: 'string',
          minLength: 1,
        },
        request: {
          description:
            'The actual request to use for importing the module. If not specified, the property name/key will be used.',
          type: 'string',
          minLength: 1,
        },
      },
    },
    ConsumesItem: {
      description: 'A module that should be consumed from share scope.',
      type: 'string',
      minLength: 1,
    },
    ConsumesObject: {
      description:
        'Modules that should be consumed from share scope. Property names are used to match requested modules in this compilation. Relative requests are resolved, module requests are matched unresolved, absolute paths will match resolved requests. A trailing slash will match all requests with this prefix. In this case shareKey must also have a trailing slash.',
      type: 'object',
      additionalProperties: {
        description: 'Modules that should be consumed from share scope.',
        anyOf: [
          {
            $ref: '#/definitions/ConsumesConfig',
          },
          {
            $ref: '#/definitions/ConsumesItem',
          },
        ],
      },
    },
  },
  title: 'ConsumeSharedPluginOptions',
  description: 'Options for consuming shared modules.',
  type: 'object',
  additionalProperties: false,
  properties: {
    consumes: {
      $ref: '#/definitions/Consumes',
    },
    shareScope: {
      description:
        "Share scope name used for all consumed modules (defaults to 'default').",
      type: 'string',
      minLength: 1,
    },
  },
  required: ['consumes'],
};
