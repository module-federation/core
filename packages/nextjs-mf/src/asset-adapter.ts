import fs from 'node:fs';
import path from 'node:path';

type RuleSetUseItem =
  | string
  | {
      loader?: string;
      options?: unknown;
      [key: string]: unknown;
    };

type RuleLike = {
  loader?: string;
  use?: RuleSetUseItem | RuleSetUseItem[];
  type?: string;
  oneOf?: RuleLike[];
  rules?: RuleLike[];
  [key: string]: unknown;
};

type CompilerLike = {
  options: {
    plugins?: Array<{
      constructor?: { name?: string };
      name?: string;
      appDirEnabled?: boolean;
    }>;
    module?: {
      rules?: RuleLike[];
    };
  };
};

const AUTOMATIC_ASSET_ADAPTER_MARKER = 'asset-adapter-loader';
const ASSET_MODULE_TYPES = new Set(['asset', 'asset/resource']);
const ASSET_LOADERS = ['next-image-loader', 'url-loader'];

const resolveAssetAdapterLoaderPath = (): string => {
  const candidates = [
    path.resolve(__dirname, 'asset-adapter-loader.ts'),
    path.resolve(__dirname, 'asset-adapter-loader.js'),
    path.resolve(__dirname, 'asset-adapter-loader.cjs'),
  ];

  return (
    candidates.find((candidate) => fs.existsSync(candidate)) ||
    candidates[candidates.length - 1]
  );
};

const normalizeUse = (
  use: RuleLike['use'],
): Array<Exclude<RuleSetUseItem, undefined>> => {
  if (!use) {
    return [];
  }

  return Array.isArray(use) ? [...use] : [use];
};

const isLoaderMatch = (
  value: string | undefined,
  loaderName: string,
): boolean =>
  Boolean(
    value &&
    (value === loaderName ||
      value.includes(`/${loaderName}/`) ||
      value.includes(`${loaderName}.`)),
  );

const hasLoader = (rule: RuleLike, loaderName: string): boolean => {
  if (isLoaderMatch(rule.loader, loaderName)) {
    return true;
  }

  return normalizeUse(rule.use).some((entry) =>
    typeof entry === 'string'
      ? isLoaderMatch(entry, loaderName)
      : isLoaderMatch(entry.loader, loaderName),
  );
};

const hasAutomaticAssetAdapter = (rule: RuleLike): boolean =>
  hasLoader(rule, AUTOMATIC_ASSET_ADAPTER_MARKER);

const shouldAdaptRule = (rule: RuleLike): boolean =>
  ASSET_LOADERS.some((loaderName) => hasLoader(rule, loaderName)) ||
  ASSET_MODULE_TYPES.has(rule.type || '');

const prependLoader = (rule: RuleLike, loaderPath: string) => {
  const injectedLoader = {
    loader: loaderPath,
  };

  if (rule.loader) {
    rule.use = [
      injectedLoader,
      {
        loader: rule.loader,
        options: rule['options'],
      },
    ];
    delete rule.loader;
    delete rule['options'];
    return;
  }

  const normalizedUse = normalizeUse(rule.use);
  rule.use = [injectedLoader, ...normalizedUse];
};

const visitRule = (rule: RuleLike, loaderPath: string) => {
  if (Array.isArray(rule.oneOf)) {
    rule.oneOf.forEach((nestedRule) => visitRule(nestedRule, loaderPath));
  }

  if (Array.isArray(rule.rules)) {
    rule.rules.forEach((nestedRule) => visitRule(nestedRule, loaderPath));
  }

  if (!shouldAdaptRule(rule) || hasAutomaticAssetAdapter(rule)) {
    return;
  }

  prependLoader(rule, loaderPath);
};

export const isAppDirectoryCompiler = (compiler: CompilerLike): boolean => {
  const pluginNames = (compiler.options.plugins || []).map((plugin) => {
    return plugin?.constructor?.name || plugin?.name || '';
  });

  if (
    pluginNames.includes('FlightClientEntryPlugin') ||
    pluginNames.includes('ClientReferenceManifestPlugin')
  ) {
    return true;
  }

  const manifestPlugin = (compiler.options.plugins || []).find(
    (plugin) => plugin?.constructor?.name === 'BuildManifestPlugin',
  );

  return Boolean(manifestPlugin?.appDirEnabled);
};

export const applyAutomaticAssetAdaptation = (compiler: CompilerLike): void => {
  const rules = compiler.options.module?.rules;

  if (!rules?.length) {
    return;
  }

  const loaderPath = resolveAssetAdapterLoaderPath();
  rules.forEach((rule) => visitRule(rule, loaderPath));
};
