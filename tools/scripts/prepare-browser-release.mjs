import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const assetName = 'module-federation-devtools-browser.zip';

export function prepareBrowserRelease({ root, destination, channel }) {
  if (!['latest', 'next'].includes(channel))
    throw new Error('Invalid release channel');
  const read = (file) =>
    JSON.parse(readFileSync(path.join(root, file), 'utf8'));
  const version = read('packages/runtime/package.json').version;
  const extensionVersion = read(
    'packages/chrome-devtools/package.json',
  ).version;
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version))
    throw new Error('Invalid release version');
  if (channel === 'latest' && version.includes('-'))
    throw new Error('latest must use a stable version');
  if (channel === 'next' && !version.includes('-'))
    throw new Error('next must use a snapshot version');
  const directory = path.join(root, 'packages/chrome-devtools/dist/browser');
  const manifest = read('packages/chrome-devtools/dist/browser/manifest.json');
  if (
    manifest.side_panel ||
    manifest.devtools_page ||
    manifest.permissions?.includes('sidePanel') ||
    manifest.action?.default_popup !== 'html/main/index.html?view=popup' ||
    manifest.version !==
      (extensionVersion.includes('-') ? '0.0.0' : extensionVersion) ||
    !manifest.content_scripts?.some(
      (script) =>
        script.world === 'MAIN' &&
        script.run_at === 'document_start' &&
        script.js.includes('static/js/webmcp.js'),
    ) ||
    !existsSync(path.join(directory, 'static/js/webmcp.js'))
  )
    throw new Error(
      'Expected the built Browser extension, not the Chrome variant',
    );
  const sha = execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: root,
    encoding: 'utf8',
  }).trim();
  mkdirSync(destination, { recursive: true });
  const archive = path.join(destination, assetName);
  if (existsSync(archive)) throw new Error('Release archive already exists');
  execFileSync('zip', ['-q', '-r', '-X', archive, '.'], { cwd: directory });
  const metadata = {
    tag: `v${version}`,
    version,
    extensionVersion,
    sha,
    channel,
    asset: assetName,
    sha256: createHash('sha256').update(readFileSync(archive)).digest('hex'),
  };
  writeFileSync(
    path.join(destination, 'release.json'),
    JSON.stringify(metadata, null, 2) + '\n',
  );
  return metadata;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  const metadata = prepareBrowserRelease({
    root: process.cwd(),
    destination: path.resolve(process.argv[2]),
    channel: process.env.RELEASE_CHANNEL,
  });
  console.log(`Prepared ${metadata.tag} from ${metadata.sha}`);
}
