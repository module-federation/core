import type { ConfigT, YargArguments } from 'metro-config';
import type { Config } from '../types';
import loadMetroConfig from './load-metro-config';

type MetroConfigCommandOptions = Pick<
  YargArguments,
  'config' | 'maxWorkers' | 'resetCache'
>;

type PreloadedMetroConfig = {
  readonly optionsKey: ReturnType<typeof JSON.stringify>;
  readonly config: Promise<ConfigT>;
};

const preloadedMetroConfigs = new WeakMap<Config, PreloadedMetroConfig>();

function getMetroConfigOptionsKey(options: MetroConfigCommandOptions) {
  return JSON.stringify([
    options.config,
    options.maxWorkers,
    options.resetCache,
  ]);
}

export function preloadMetroConfigForCommand(
  cfg: Config,
  options: YargArguments = {},
): Promise<ConfigT> {
  const config = loadMetroConfig(cfg, options);
  const preload = {
    optionsKey: getMetroConfigOptionsKey(options),
    config,
  };
  preloadedMetroConfigs.set(cfg, preload);
  void config.then(undefined, () => {
    if (preloadedMetroConfigs.get(cfg) === preload) {
      preloadedMetroConfigs.delete(cfg);
    }
  });
  return config;
}

export function resolveMetroConfigForCommand(
  cfg: Config,
  options: MetroConfigCommandOptions,
): Promise<ConfigT> {
  const preload = preloadedMetroConfigs.get(cfg);
  preloadedMetroConfigs.delete(cfg);

  if (preload?.optionsKey === getMetroConfigOptionsKey(options)) {
    return preload.config;
  }

  return loadMetroConfig(cfg, {
    maxWorkers: options.maxWorkers,
    resetCache: options.resetCache,
    config: options.config,
  });
}
