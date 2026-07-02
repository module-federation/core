export const E2E_SUITES = {
  manifest: [
    '3008-webpack-host',
    '3009-webpack-provider',
    '3010-rspack-provider',
    '3011-rspack-manifest-provider',
    '3012-rspack-js-entry-provider',
  ],
  metro: ['example-host'],
  modern: ['@module-federation/modern-js', '@module-federation/modern-js-v3'],
  modernSsr: [
    '@module-federation/modern-js',
    '@module-federation/modern-js-v3',
    'modernjs-ssr-host',
    'modernjs-ssr-remote',
    'modernjs-ssr-remote-new-version',
    'modernjs-ssr-nested-remote',
    'modernjs-ssr-dynamic-remote',
    'modernjs-ssr-dynamic-remote-new-version',
    'modernjs-ssr-dynamic-nested-remote',
    'modernjs-ssr-data-fetch-host',
    'modernjs-ssr-data-fetch-provider',
    'modernjs-ssr-data-fetch-provider-csr',
  ],
  next: [
    '@module-federation/3000-home',
    '@module-federation/3001-shop',
    '@module-federation/3002-checkout',
  ],
  node: [
    'node-host',
    'node-local-remote',
    'node-remote',
    'node-dynamic-remote-new-version',
    'node-dynamic-remote',
    'node-host-e2e',
  ],
  router: [
    'host',
    'host-v5',
    'host-vue3',
    'remote1',
    'remote2',
    'remote3',
    'remote4',
    'remote5',
    'remote6',
  ],
  runtime: ['runtime-host', 'runtime-remote1', 'runtime-remote2'],
  sharedTreeShaking: [
    'shared-tree-shaking-no-server-host',
    'shared-tree-shaking-no-server-provider',
    'shared-tree-shaking-with-server-host',
    'shared-tree-shaking-with-server-provider',
  ],
  treeshake: [
    '@module-federation/treeshake-server',
    '@module-federation/treeshake-frontend',
  ],
};

export function resolveE2ESuiteAppNames(suiteName) {
  if (!suiteName) {
    return null;
  }
  return E2E_SUITES[suiteName] ?? null;
}

export function normalizeAppNames(appNames) {
  if (Array.isArray(appNames)) {
    return appNames.map((name) => name.trim()).filter(Boolean);
  }
  return (appNames ?? '')
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);
}

export function serializeAppNames(appNames) {
  return normalizeAppNames(appNames).join(',');
}
