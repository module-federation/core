#!/usr/bin/env node

// TODO: finish
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

function extractRemoteUrl(remoteValue) {
  const raw =
    typeof remoteValue === 'string'
      ? remoteValue
      : (remoteValue && remoteValue.external) || null;
  if (!raw) return null;
  const atIndex = raw.indexOf('@');
  return atIndex >= 0 ? raw.slice(atIndex + 1) : raw;
}

function main(ctx, moduleName) {
  const remotes = (ctx.mfConfig && ctx.mfConfig.remotes) || {};
  const remoteValue = remotes[moduleName];

  if (!remoteValue) {
    process.stdout.write(
      JSON.stringify(
        {
          error: `Remote "${moduleName}" not found`,
          availableRemotes: Object.keys(remotes),
        },
        null,
        2,
      ) + '\n',
    );
    return;
  }

  const remoteEntry = extractRemoteUrl(remoteValue);

  if (!remoteEntry) {
    process.stdout.write(
      JSON.stringify(
        {
          error: `Cannot resolve URL for remote "${moduleName}"`,
          rawValue: remoteValue,
        },
        null,
        2,
      ) + '\n',
    );
    return;
  }

  const lastSlash = remoteEntry.lastIndexOf('/');
  const publicPath =
    lastSlash >= 0 ? remoteEntry.slice(0, lastSlash + 1) : `${remoteEntry}/`;

  // TODO: user-defined logic — fill in checks below as needed

  const infoList = [
    'publicPath',
    'remoteEntry',
    'typesZip',
    'typesApi',
    'hasSsr',
  ];

  const result = {
    moduleName,
    publicPath,
    remoteEntry,
    typesZip: `${publicPath}@mf-types.zip`,
    typesApi: null, // TODO: detect / verify
    hasSsr: null, // TODO: detect SSR artifacts
  };

  process.stdout.write(
    JSON.stringify({ context: ctx, infoList, result }, null, 2) + '\n',
  );
}

const args = parseArgs(process.argv);

if (!args.module) {
  process.stderr.write('Error: --module <module-name> is required\n');
  process.exit(1);
}

main(JSON.parse(args.context), args.module);
