import type { SemVerRange } from 'webpack/lib/util/semver';
import type {
  ConsumeSharedPluginInstance,
  ConsumeConfig,
  ResolveFunction,
  DescriptionFileResolver,
  ConsumeEntry,
} from '../test-types';

export const toSemVerRange = (range: string): SemVerRange =>
  range as unknown as SemVerRange;

// Preserve the required core fields while allowing callers to override
// any subset of the remaining configuration for convenience during tests.
type BaseConfig = Pick<ConsumeConfig, 'shareKey' | 'shareScope'> &
  Partial<Omit<ConsumeConfig, 'shareKey' | 'shareScope'>>;

const defaultConfig: BaseConfig = {
  shareScope: 'default',
  shareKey: 'test-module',
  import: './test-module',
  requiredVersion: toSemVerRange('^1.0.0'),
  strictVersion: true,
  singleton: false,
  eager: false,
  issuerLayer: undefined,
  layer: undefined,
  request: 'test-module',
  include: undefined,
  exclude: undefined,
  allowNodeModulesSuffixMatch: undefined,
  packageName: undefined,
};

export const createConsumeConfig = (
  overrides: Partial<ConsumeConfig> = {},
): ConsumeConfig =>
  ({
    ...defaultConfig,
    ...overrides,
  }) as ConsumeConfig;

export const getConsumes = (
  instance: ConsumeSharedPluginInstance,
): ConsumeEntry[] =>
  (instance as unknown as { _consumes: ConsumeEntry[] })._consumes;

export type {
  ConsumeSharedPluginInstance,
  ConsumeConfig,
  ResolveFunction,
  DescriptionFileResolver,
  ConsumeEntry,
};
