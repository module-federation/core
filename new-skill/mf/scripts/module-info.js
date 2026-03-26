#!/usr/bin/env node

const https = require('https');
const http = require('http');

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

function getPublicPath(remoteEntry) {
  const lastSlash = remoteEntry.lastIndexOf('/');
  return lastSlash >= 0
    ? remoteEntry.slice(0, lastSlash + 1)
    : `${remoteEntry}/`;
}

function fetchJson(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    client
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ ok: true, data: JSON.parse(data) });
          } catch {
            resolve({ ok: false, error: `Failed to parse JSON from ${url}` });
          }
        });
      })
      .on('error', (err) => {
        resolve({ ok: false, error: err.message });
      });
  });
}

function extractManifestInfo(manifest) {
  if (!manifest) return null;
  return {
    exposes: manifest.exposes || [],
    remotes: manifest.remotes || [],
    shared: manifest.shared || [],
  };
}

async function main(ctx, moduleName, explicitUrl) {
  let remoteEntry = explicitUrl || null;

  if (!remoteEntry) {
    const remotes = (ctx.mfConfig && ctx.mfConfig.remotes) || {};
    const remoteValue = remotes[moduleName];
    if (!remoteValue) {
      process.stdout.write(
        JSON.stringify(
          {
            error: `Remote "${moduleName}" not found in mfConfig.remotes`,
            availableRemotes: Object.keys(remotes),
          },
          null,
          2,
        ) + '\n',
      );
      return;
    }
    remoteEntry = extractRemoteUrl(remoteValue);
  }

  if (!remoteEntry) {
    process.stdout.write(
      JSON.stringify(
        { error: `Cannot resolve remoteEntry URL for "${moduleName}"` },
        null,
        2,
      ) + '\n',
    );
    return;
  }

  const publicPath = getPublicPath(remoteEntry);
  const typesZip = `${publicPath}@mf-types.zip`;

  const manifestUrl = `${publicPath}mf-manifest.json`;
  const manifestRes = await fetchJson(manifestUrl);
  const manifest = manifestRes.ok
    ? extractManifestInfo(manifestRes.data)
    : null;

  const hasSsr = manifestRes.ssrRemoteEntry;

  const result = {
    moduleName,
    publicPath,
    remoteEntry,
    typesZip,
    typesApi: null,
    hasSsr,
    manifest,
    manifestError: manifestRes.ok ? undefined : manifestRes.error,
  };

  process.stdout.write(JSON.stringify({ result }, null, 2) + '\n');
}

const args = parseArgs(process.argv);

if (!args.module) {
  process.stderr.write('Error: --module <module-name> is required\n');
  process.exit(1);
}

main(JSON.parse(args.context || '{}'), args.module, args.url || null).catch(
  (err) => {
    process.stderr.write(`Error: ${err.message}\n`);
    process.exit(1);
  },
);
