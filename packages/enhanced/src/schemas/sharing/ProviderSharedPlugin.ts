//@ts-nocheck
export default {
  definitions: {
    Provides: {
      description:
        'Modules that should be provided as shared modules to the share scope. When provided, property name is used to match modules, otherwise this is automatically inferred from share key.',
      anyOf: [
        {
          type: 'array',
          items: {
            description:
              'Modules that should be provided as shared modules to the share scope.',
            anyOf: [
              {
                $ref: '#/definitions/ProvidesItem',
              },
              {
                $ref: '#/definitions/ProvidesObject',
              },
            ],
          },
        },
        {
          $ref: '#/definitions/ProvidesObject',
        },
      ],
    },
    ProvidesConfig: {
      description:
        'Advanced configuration for modules that should be provided as shared modules to the share scope.',
      type: 'object',
      additionalProperties: false,
      properties: {
        eager: {
          description:
            'Include the provided module directly instead behind an async request. This allows to use this shared module in initial load too. All possible shared modules need to be eager too.',
          type: 'boolean',
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
            'Key in the share scope under which the shared modules should be stored.',
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
    ProvidesItem: {
      description:
        'Request to a module that should be provided as shared module to the share scope (will be resolved when relative).',
      type: 'string',
      minLength: 1,
    },
    ProvidesObject: {
      description:
        'Modules that should be provided as shared modules to the share scope. Property names are used as share keys.',
      type: 'object',
      additionalProperties: {
        description:
          'Modules that should be provided as shared modules to the share scope.',
        anyOf: [
          {
            $ref: '#/definitions/ProvidesConfig',
          },
          {
            $ref: '#/definitions/ProvidesItem',
          },
        ],
      },
    },
  },
  title: 'ProvideSharedPluginOptions',
  type: 'object',
  additionalProperties: false,
  properties: {
    provides: {
      $ref: '#/definitions/Provides',
    },
    shareScope: {
      description:
        "Share scope name used for all provided modules (defaults to 'default').",
      type: 'string',
      minLength: 1,
    },
  },
  required: ['provides'],
};
