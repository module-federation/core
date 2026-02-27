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

// Compare semver major.minor prefix: "^18.0.0" vs "18.2.0" → compatible
// Returns true if actual version satisfies the required range prefix (major only for ^, major.minor for ~)
function isSemverCompatible(required, actual) {
  const req = required.replace(/^[~^>=<\s]+/, '');
  const [reqMajor, reqMinor] = req.split('.');
  const [actMajor, actMinor] = actual.replace(/^[~^>=<\s]+/, '').split('.');
  if (required.startsWith('^')) return reqMajor === actMajor;
  if (required.startsWith('~'))
    return reqMajor === actMajor && reqMinor === actMinor;
  // exact / no prefix: compare first two segments
  return reqMajor === actMajor && reqMinor === actMinor;
}

function main(ctx) {
  const results = [];
  const shared = (ctx.mfConfig && ctx.mfConfig.shared) || {};
  const deps = ctx.dependencies || {};

  Object.entries(shared).forEach(([name, value]) => {
    const cfg =
      typeof value === 'string' ? { requiredVersion: value } : value || {};
    const required = cfg.requiredVersion;
    const actual = deps[name];
    if (!required || !actual) return;
    if (!isSemverCompatible(required, actual)) {
      results.push({
        code: 'SHARED-DEPS',
        severity: 'warning',
        message: `Shared dependency "${name}": requiredVersion "${required}" is incompatible with installed version "${actual}". Please verify alignment between host and remotes.`,
        context: { requiredVersion: required, actualVersion: actual },
      });
    }
  });

  process.stdout.write(
    `${JSON.stringify({ context: ctx, results }, null, 2)}\n`,
  );
}

const args = parseArgs(process.argv);
main(JSON.parse(args.context));
