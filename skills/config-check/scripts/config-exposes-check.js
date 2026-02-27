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

function main(ctx) {
  const projectRoot = ctx.project && ctx.project.root;
  const exposes = (ctx.mfConfig && ctx.mfConfig.exposes) || {};
  const results = [];

  Object.entries(exposes).forEach(([key, value]) => {
    if (!key.startsWith('./')) {
      results.push({
        code: 'CONFIG-EXPOSES',
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
          code: 'CONFIG-EXPOSES',
          severity: 'warning',
          message: `The path referenced by exposes["${key}"] does not exist: ${rel}`,
          context: { key, path: rel },
        });
      }
    }
  });

  process.stdout.write(
    `${JSON.stringify({ context: ctx, results }, null, 2)}\n`,
  );
}

const args = parseArgs(process.argv);
main(JSON.parse(args.context));
