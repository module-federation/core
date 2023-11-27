export const FederationModuleManifest = 'federation-manifest.json';
export const MANIFEST_EXT = '.json';

export const BROWSER_LOG_KEY = 'FEDERATION_DEBUG';
export const BROWSER_LOG_VALUE = '1';

export const NameTransformSymbol = {
  AT: '@',
  HYPHEN: '-',
  SLASH: '/',
};
export const NameTransformMap = {
  [NameTransformSymbol.AT]: 'scope_',
  [NameTransformSymbol.HYPHEN]: '_',
  [NameTransformSymbol.SLASH]: '__',
};

export const EncodedNameTransformMap = {
  [NameTransformMap[NameTransformSymbol.AT]]: NameTransformSymbol.AT,
  [NameTransformMap[NameTransformSymbol.HYPHEN]]: NameTransformSymbol.HYPHEN,
  [NameTransformMap[NameTransformSymbol.SLASH]]: NameTransformSymbol.SLASH,
};

export const SEPARATOR = ':';

export const FederationPrefetchCommon: Record<string, string> = {
  identifier: 'FederationPrefetch',
  globalKey: '__PREFETCH__',
  library: 'federation-prefetch',
  exportsKey: '__PREFETCH_EXPORTS__',
};
