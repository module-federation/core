export const E2E_SUITE_DEFINITIONS = {
  manifest: {
    appNames: [
      '3008-webpack-host',
      '3009-webpack-provider',
      '3010-rspack-provider',
      '3011-rspack-manifest-provider',
      '3012-rspack-js-entry-provider',
    ],
    inputs: [
      '.github/workflows/e2e-manifest.yml',
      'tools/scripts/run-manifest-e2e.mjs',
    ],
  },
  metro: {
    appNames: ['example-host'],
    inputs: [
      '.github/workflows/e2e-metro.yml',
      'tools/scripts/run-metro-e2e.mjs',
    ],
  },
  modern: {
    appNames: [
      '@module-federation/modern-js',
      '@module-federation/modern-js-v3',
    ],
    inputs: ['.github/workflows/e2e-modern.yml'],
  },
  modernSsr: {
    appNames: [
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
    inputs: [
      '.github/workflows/e2e-modern-ssr.yml',
      'tools/scripts/run-modern-e2e.mjs',
    ],
  },
  next: {
    appNames: [
      '@module-federation/3000-home',
      '@module-federation/3001-shop',
      '@module-federation/3002-checkout',
    ],
    inputs: [
      '.github/workflows/e2e-next-dev.yml',
      '.github/workflows/e2e-next-prod.yml',
      'tools/scripts/run-next-e2e.mjs',
    ],
  },
  node: {
    appNames: [
      'node-host',
      'node-local-remote',
      'node-remote',
      'node-dynamic-remote-new-version',
      'node-dynamic-remote',
      'node-host-e2e',
    ],
    inputs: [
      '.github/workflows/e2e-node.yml',
      'tools/scripts/run-node-e2e.mjs',
    ],
  },
  router: {
    appNames: [
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
    inputs: [
      '.github/workflows/e2e-router.yml',
      'tools/scripts/run-router-e2e.mjs',
    ],
  },
  runtime: {
    appNames: ['runtime-host', 'runtime-remote1', 'runtime-remote2'],
    inputs: [
      '.github/workflows/e2e-runtime.yml',
      'tools/scripts/run-runtime-e2e.mjs',
    ],
  },
  sharedTreeShaking: {
    appNames: [
      'shared-tree-shaking-no-server-host',
      'shared-tree-shaking-no-server-provider',
      'shared-tree-shaking-with-server-host',
      'shared-tree-shaking-with-server-provider',
    ],
    inputs: ['.github/workflows/e2e-shared-tree-shaking.yml'],
    parentWorkflow: false,
  },
  treeshake: {
    appNames: [
      '@module-federation/treeshake-server',
      '@module-federation/treeshake-frontend',
    ],
    inputs: ['.github/workflows/e2e-treeshake.yml'],
  },
};

export const E2E_SUITES = Object.fromEntries(
  Object.entries(E2E_SUITE_DEFINITIONS).map(([suiteName, definition]) => [
    suiteName,
    definition.appNames,
  ]),
);

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
