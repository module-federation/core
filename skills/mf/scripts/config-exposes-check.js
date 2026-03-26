#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const eqIdx = arg.indexOf('=');
      if (eqIdx >= 0) {
        args[arg.slice(2, eqIdx)] = arg.slice(eqIdx + 1);
      } else {
        args[arg.slice(2)] = argv[i + 1] || '';
        i++;
      }
    }
  }
  return args;
}

function checkPlugin(ctx, results) {
  const bundler = (ctx.bundler && ctx.bundler.name) || '';
  const configFile = (ctx.bundler && ctx.bundler.configFile) || '';
  const deps = ctx.dependencies || {};

  const hasModernJsV3 = !!deps['@module-federation/modern-js-v3'];
  const hasModernJs = !!deps['@module-federation/modern-js'];
  const hasNextMf = !!deps['@module-federation/nextjs-mf'];
  const hasEnhanced = !!deps['@module-federation/enhanced'];
  const hasRspackPlugin = !!deps['@module-federation/rspack'];
  const hasRsbuildPlugin = !!deps['@module-federation/rsbuild-plugin'];

  const isModernJs = configFile.includes('modern');
  const isNextJs = !!deps['next'];

  if (isNextJs) {
    if (!hasNextMf) {
      results.push({
        code: 'CONFIG-PLUGIN',
        severity: 'warning',
        message:
          'Next.js project detected but @module-federation/nextjs-mf is not installed.',
        context: { bundler, recommended: '@module-federation/nextjs-mf' },
      });
    }
    return;
  }

  if (isModernJs) {
    const modernJsAppToolsVersion = deps['@modern-js/app-tools'] || '';
    const major = parseInt(modernJsAppToolsVersion.replace(/[^0-9]/, ''), 10);
    const recommended =
      !isNaN(major) && major >= 3
        ? '@module-federation/modern-js-v3'
        : '@module-federation/modern-js';
    if (!hasModernJsV3 && !hasModernJs) {
      results.push({
        code: 'CONFIG-PLUGIN',
        severity: 'warning',
        message: `Modern.js project detected but no MF plugin found. Recommended: ${recommended}.`,
        context: { bundler, recommended },
      });
    }
    return;
  }

  if (bundler === 'rsbuild') {
    if (!hasRsbuildPlugin && !hasEnhanced && !hasRspackPlugin) {
      results.push({
        code: 'CONFIG-PLUGIN',
        severity: 'warning',
        message:
          'Rsbuild project detected but no MF plugin found. Recommended: @module-federation/rsbuild-plugin.',
        context: { bundler, recommended: '@module-federation/rsbuild-plugin' },
      });
    }
    return;
  }

  if (bundler === 'rspack') {
    if (!hasEnhanced && !hasRspackPlugin) {
      results.push({
        code: 'CONFIG-PLUGIN',
        severity: 'warning',
        message:
          'Rspack project detected but no MF plugin found. Recommended: @module-federation/enhanced/rspack.',
        context: { bundler, recommended: '@module-federation/enhanced/rspack' },
      });
    }
    return;
  }

  if (bundler === 'webpack') {
    if (!hasEnhanced) {
      results.push({
        code: 'CONFIG-PLUGIN',
        severity: 'warning',
        message:
          'Webpack project detected but @module-federation/enhanced is not installed.',
        context: { bundler, recommended: '@module-federation/enhanced' },
      });
    }
    return;
  }
}

function checkAsyncEntry(ctx, results) {
  const deps = ctx.dependencies || {};
  const configFile = (ctx.bundler && ctx.bundler.configFile) || '';

  if (
    deps['@module-federation/modern-js-v3'] ||
    deps['@module-federation/modern-js']
  ) {
    return;
  }

  const mfConfig = ctx.mfConfig || {};
  const experiments = mfConfig.experiments || {};

  if (!experiments.asyncStartup) {
    const bundler = (ctx.bundler && ctx.bundler.name) || '';
    let note = 'Set `experiments.asyncStartup = true` in your bundler config.';
    if (bundler === 'rspack') {
      note += ' Note: Rspack requires version > 1.7.4 for this option.';
    }
    results.push({
      code: 'CONFIG-ASYNC-ENTRY',
      severity: 'warning',
      message: `experiments.asyncStartup is not set. ${note} See: https://module-federation.io/blog/hoisted-runtime.md`,
      context: { configFile },
    });
  }
}

function checkExposes(ctx, results) {
  const projectRoot = ctx.project && ctx.project.root;
  const exposes = (ctx.mfConfig && ctx.mfConfig.exposes) || {};

  Object.entries(exposes).forEach(([key, value]) => {
    if (!key.startsWith('./')) {
      results.push({
        code: 'CONFIG-EXPOSES-KEY',
        severity: 'warning',
        message: `exposes key "${key}" should start with "./"`,
        context: { key },
      });
    }
    const rel = typeof value === 'string' ? value : value && value.import;
    if (!rel || typeof rel !== 'string') return;
    if (projectRoot) {
      const full = path.join(projectRoot, rel);
      if (!fs.existsSync(full)) {
        results.push({
          code: 'CONFIG-EXPOSES-PATH',
          severity: 'warning',
          message: `The path referenced by exposes["${key}"] does not exist: ${rel} (check exact file extension)`,
          context: { key, path: rel },
        });
      }
    }
  });
}

function main(ctx) {
  const results = [];
  checkPlugin(ctx, results);
  checkAsyncEntry(ctx, results);
  checkExposes(ctx, results);
  process.stdout.write(
    `${JSON.stringify({ context: ctx, results }, null, 2)}\n`,
  );
}

const args = parseArgs(process.argv);
main(JSON.parse(args.context));
