import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    name: 'enhanced-build',
    cwd: import.meta.dirname,
    entry: {
      index: 'src/index.ts',
      webpack: 'src/webpack.ts',
      rspack: 'src/rspack.ts',
      runtime: 'src/runtime.ts',
      prefetch: 'src/prefetch.ts',
      'lib/container/ModuleFederationPlugin':
        'src/lib/container/ModuleFederationPlugin.ts',
      'lib/container/ContainerReferencePlugin':
        'src/lib/container/ContainerReferencePlugin.ts',
      'lib/container/ContainerPlugin': 'src/lib/container/ContainerPlugin.ts',
      'lib/container/AsyncBoundaryPlugin':
        'src/lib/container/AsyncBoundaryPlugin.ts',
      'lib/container/hoistContainerReferencesPlugin':
        'src/lib/container/HoistContainerReferencesPlugin.ts',
      'lib/container/runtime/FederationModulesPlugin':
        'src/lib/container/runtime/FederationModulesPlugin.ts',
      'lib/container/runtime/FederationRuntimePlugin':
        'src/lib/container/runtime/FederationRuntimePlugin.ts',
      'lib/sharing/SharePlugin': 'src/lib/sharing/SharePlugin.ts',
      'lib/sharing/ConsumeSharedPlugin':
        'src/lib/sharing/ConsumeSharedPlugin.ts',
      'lib/sharing/ProvideSharedPlugin':
        'src/lib/sharing/ProvideSharedPlugin.ts',
      'lib/sharing/tree-shaking/TreeShakingSharedPlugin':
        'src/lib/sharing/tree-shaking/TreeShakingSharedPlugin.ts',
    },
    tsconfig: 'tsconfig.lib.json',
    outDir: 'dist/src',
    format: ['cjs'],
    external: [/^[^./]/, /package\.json$/],
    sourcemap: true,
    clean: true,
    cjsDefault: false,
    dts: {
      resolver: 'tsc',
    },
    inlineOnly: false,
    skipNodeModulesBundle: true,
    unbundle: true,
    outExtensions: () => ({
      js: '.js',
      dts: '.d.ts',
    }),
  },
]);
