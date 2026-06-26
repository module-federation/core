import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rslib/core';
import mfConfig from './module-federation.config';
import pkg from './package.json';

function isTypescriptDynamicRequireWarning(warning: unknown) {
  const message =
    typeof warning === 'object' && warning && 'message' in warning
      ? String(warning.message)
      : String(warning);
  const moduleResource =
    typeof warning === 'object' && warning && 'module' in warning
      ? String(
          (
            warning as {
              module?: { resource?: string; identifier?: () => string };
            }
          ).module?.resource ||
            (
              warning as { module?: { identifier?: () => string } }
            ).module?.identifier?.() ||
            '',
        )
      : '';

  return (
    message.includes('Critical dependency') &&
    (message.includes('typescript/lib/typescript.js') ||
      moduleResource.includes('typescript/lib/typescript.js'))
  );
}

const shared = {
  dts: {
    bundle: true,
  },
  source: {
    entry: {
      index: './src/component.ts',
    },
  },
};

export default defineConfig({
  lib: [
    {
      ...shared,
      format: 'esm',
      output: {
        distPath: {
          root: './dist/esm',
        },
        externals: ['react', 'react-dom', 'react-dom/client'],
      },
    },
    {
      ...shared,
      format: 'cjs',
      output: {
        distPath: {
          root: './dist/cjs',
        },
        externals: ['react', 'react-dom', 'react-dom/client'],
      },
    },
    {
      ...shared,
      format: 'mf',
      output: {
        assetPrefix:
          process.env.NODE_ENV === 'production'
            ? `https://unpkg.com/${pkg.name}@latest/dist/mf/`
            : undefined,
        distPath: {
          root: './dist/mf',
        },
      },
    },
  ],
  server: {
    port: 3006,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
    },
  },
  tools: {
    rspack: (config) => {
      config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        isTypescriptDynamicRequireWarning,
      ];
    },
  },
  plugins: [
    pluginReact(),
    pluginModuleFederation(mfConfig, { target: 'dual' }),
  ],
});
