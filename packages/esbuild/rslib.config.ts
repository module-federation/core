import { defineConfig } from '@rslib/core';
import { readFileSync } from 'fs';
import { join } from 'path';
import { pluginPublint } from 'rsbuild-plugin-publint';

// Read package.json to get version
const pkg = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf-8'),
);

const FEDERATION_DEBUG = process.env.FEDERATION_DEBUG || '';

export default defineConfig({
  plugins: [pluginPublint()],
  lib: [
    // ESM format
    {
      format: 'esm',
      syntax: 'es2021',
      bundle: true,
      dts: {
        distPath: './dist',
      },
    },
    // CJS format
    {
      format: 'cjs',
      syntax: 'es2021',
      bundle: true,
      dts: false, // Only generate types once for ESM
    },
  ],
  // Shared configurations
  source: {
    entry: {
      index: './src/index.ts',
      plugin: './src/adapters/lib/plugin.ts',
      build: './src/build.ts',
    },
    define: {
      __VERSION__: JSON.stringify(pkg.version),
      FEDERATION_DEBUG: JSON.stringify(FEDERATION_DEBUG),
    },
    tsconfigPath: './tsconfig.lib.json',
  },
  output: {
    target: 'node',
    distPath: {
      root: './dist',
    },
    externals: [
      // Keep all Module Federation packages external
      /@module-federation/,
      // Optional dependency that may not be available
      'pnpapi',
    ],
    copy: [
      {
        from: './src/resolve',
        to: './resolve',
      },
    ],
  },
  tools: {
    rspack: (config: any) => {
      // Handle special debug mode for ESM format
      if (FEDERATION_DEBUG && config.output?.library?.type === 'module') {
        config.output.library.type = 'var';
        config.output.iife = true;
        config.externals = undefined;
      }
      return config;
    },
  },
});
