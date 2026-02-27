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
  const results = [];

  const tsconfigPath = projectRoot
    ? path.join(projectRoot, 'tsconfig.json')
    : null;
  if (tsconfigPath && !fs.existsSync(tsconfigPath)) {
    results.push({
      code: 'TYPE-001',
      severity: 'warning',
      message:
        'tsconfig.json not found in project root. Type consumption (e.g., producer type files) may not be correctly configured.',
      context: { tsconfigPath },
    });
  }

  const hasTypescript = Boolean(
    ctx.dependencies && ctx.dependencies.typescript,
  );
  if (!hasTypescript) {
    results.push({
      code: 'TYPE-001',
      severity: 'warning',
      message:
        'typescript not found in dependencies/devDependencies. Skipping tsc; please verify the type generation workflow.',
      context: {},
    });
  }

  if (hasTypescript && tsconfigPath && fs.existsSync(tsconfigPath)) {
    results.push({
      code: 'TYPE-001',
      severity: 'info',
      message:
        'TypeScript dependency and tsconfig.json detected. A more complete tsc check can be triggered via the Aiden CLI when needed.',
      context: {
        typescript: ctx.dependencies.typescript,
        tsconfigPath,
      },
    });
  }

  process.stdout.write(
    `${JSON.stringify({ context: ctx, results }, null, 2)}\n`,
  );
}

const args = parseArgs(process.argv);
main(JSON.parse(args.context));
