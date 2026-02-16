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
      autoExtension: true,
      syntax: 'es2021',
      bundle: false,
      outBase: 'src',
      dts: {
        autoExtension: true,
        bundle: false,
        distPath: './dist',
      },
    },
    // CJS format
    {
      format: 'cjs',
      autoExtension: true,
      syntax: 'es2021',
      bundle: false,
      outBase: 'src',
      dts: {
        autoExtension: true,
        distPath: './dist',
      }, // Only generate types once for ESM
    },
  ],
  // Shared configurations
  source: {
    entry: {
      index: [
        './src/**/*.{ts,tsx,js,jsx}',
        '!./src/**/*.spec.*',
        '!./src/**/*.test.*',
      ],
    },
    define: {
      __VERSION__: JSON.stringify(pkg.version),
      FEDERATION_DEBUG: JSON.stringify(FEDERATION_DEBUG),
    },
    tsconfigPath: './tsconfig.lib.json',
  },
  output: {
    target: 'node',
    minify: false,
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
