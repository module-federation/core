import type { AllowedRequest, MemberRole } from './types';

export const LEGACY_PACKAGE_NAMES: Readonly<Record<MemberRole, string>> = {
  'runtime-tools': '@module-federation/runtime-tools',
  runtime: '@module-federation/runtime',
  'runtime-core': '@module-federation/runtime-core',
  'bundler-runtime': '@module-federation/webpack-bundler-runtime',
  sdk: '@module-federation/sdk',
};

export const LEGACY_DEPENDENCIES: Readonly<
  Record<MemberRole, readonly MemberRole[]>
> = {
  'runtime-tools': ['runtime', 'bundler-runtime'],
  runtime: ['runtime-core', 'sdk'],
  'runtime-core': ['sdk'],
  'bundler-runtime': ['runtime', 'sdk'],
  sdk: [],
};

export const LEGACY_ALLOWED_REQUESTS: Readonly<Record<string, AllowedRequest>> =
  {
    '@module-federation/runtime$': {
      role: 'runtime',
      exportName: './bundler',
    },
    '@module-federation/runtime-tools$': {
      role: 'runtime-tools',
      exportName: './bundler',
    },
  };
