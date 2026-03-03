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

  if (ctx.mfConfig && ctx.mfConfig.exposes) {
    const hasExportApp = Object.keys(ctx.mfConfig.exposes).some((k) =>
      /export-app/i.test(k),
    );
    if (!hasExportApp) {
      results.push({
        code: 'BRIDGE-USAGE',
        severity: 'info',
        message:
          'No obvious export-app export found in exposes. Please verify that the producer exports the app entry following the Bridge spec.',
        context: { exposesKeys: Object.keys(ctx.mfConfig.exposes) },
      });
    }
  }

  results.push({
    code: 'BRIDGE-USAGE',
    severity: 'info',
    message:
      'On the consumer side, prefer using official APIs such as createRemoteAppComponent instead of directly concatenating remote URLs.',
    context: {},
  });

  process.stdout.write(
    `${JSON.stringify({ context: ctx, results }, null, 2)}\n`,
  );
}

const args = parseArgs(process.argv);
main(JSON.parse(args.context));
