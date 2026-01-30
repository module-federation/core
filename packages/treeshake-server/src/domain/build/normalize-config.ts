import type { CheckTreeShaking, Config } from './schema';

export type NormalizedConfig = {
  [sharedName: string]: (Config | CheckTreeShaking) & { usedExports: string[] };
};

export type BuildType = 're-shake' | 'full';

export const parseNormalizedKey = (key: string) => {
  const res = key.split('@');
  return { name: res.slice(0, -1).join('@'), version: res[res.length - 1] };
};
export const normalizedKey = (name: string, v: string) => {
  return `${name}@${v}`;
};
// ensure stable
export function normalizeConfig(
  config: Config | CheckTreeShaking,
): NormalizedConfig {
  const { shared, plugins, target, libraryType, hostName, uploadOptions } =
    config;

  const commonNormalizedConfig = {
    plugins: plugins?.sort(([a], [b]) => a.localeCompare(b)) ?? [],
    target: Array.isArray(target) ? [...target].sort() : [target],
    uploadOptions,
    libraryType,
    hostName,
  };
  const normalizedConfig: NormalizedConfig = {};

  shared.forEach(([sharedName, version, usedExports], index) => {
    const key = normalizedKey(sharedName, version);
    normalizedConfig[key] = {
      ...commonNormalizedConfig,
      shared: shared
        .slice(0, index)
        .concat(shared.slice(index + 1))
        .sort(([s, v, u], [b, v2, u2]) =>
          `${s}${v}${u.sort().join('')}`.localeCompare(
            `${b}${v2}${u2.sort().join('')}`,
          ),
        ),
      usedExports,
    };
  });

  return normalizedConfig;
}

export function extractBuildConfig(
  config: NormalizedConfig[string],
  type: BuildType,
) {
  const { shared, plugins, target, libraryType, usedExports } = config;
  return { shared, plugins, target, libraryType, usedExports, type };
}
