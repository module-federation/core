#!/usr/bin/env node

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

function main(ctx) {
  const results = [];
  const bundlerName = (ctx.bundler && ctx.bundler.name) || 'unknown';
  const hasTypescript = Boolean(
    ctx.dependencies && ctx.dependencies.typescript,
  );

  results.push({
    code: 'PERF',
    severity: 'info',
    message:
      'Enable dev.disableAssetsAnalyze during local development to reduce bundle analysis overhead and speed up HMR and builds.',
    context: { bundler: bundlerName },
  });

  if (bundlerName === 'rspack' || bundlerName === 'rsbuild') {
    results.push({
      code: 'PERF',
      severity: 'info',
      message:
        'Rspack/Rsbuild project detected. Setting splitChunks.chunks to "async" is recommended to reduce initial bundle size.',
      context: { bundler: bundlerName },
    });
  }

  if (hasTypescript) {
    results.push({
      code: 'PERF',
      severity: 'info',
      message:
        'TypeScript dependency detected. If type generation (DTS) overhead is too high, consider disabling DTS or using ts-go to optimize the type-checking pipeline.',
      context: { typescript: ctx.dependencies.typescript },
    });
  }

  process.stdout.write(
    `${JSON.stringify({ context: ctx, results }, null, 2)}\n`,
  );
}

const args = parseArgs(process.argv);
main(JSON.parse(args.context));
