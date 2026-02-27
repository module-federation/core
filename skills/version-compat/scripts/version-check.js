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
  const deps = ctx.dependencies || {};

  const interesting = [
    '@vmok/runtime',
    '@vmok/cli',
    '@module-federation/core',
    '@module-federation/runtime',
    '@edenx/app-tools',
    '@rsbuild/core',
    'webpack',
    '@rspack/core',
  ];

  const collected = {};
  interesting.forEach((name) => {
    if (deps[name]) collected[name] = deps[name];
  });

  const results = [
    {
      code: 'VERSION-COMPAT',
      severity: 'info',
      message:
        'Key dependency versions related to Vmok/MF have been collected. Please compare manually against the internal version compatibility matrix.',
      context: { dependencies: collected },
    },
  ];

  process.stdout.write(
    `${JSON.stringify({ context: ctx, results }, null, 2)}\n`,
  );
}

const args = parseArgs(process.argv);
main(JSON.parse(args.context));
