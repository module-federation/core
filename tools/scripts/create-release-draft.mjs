import { createHash } from 'node:crypto';
import { appendFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { assetName } from './prepare-browser-release.mjs';

const start = '<!-- mf-browser-download:start -->';
const end = '<!-- mf-browser-download:end -->';
const hash = (value) => createHash('sha256').update(value).digest('hex');

export function withDownload(body, repository, metadata) {
  const section =
    `${start}\n## Browser extension\n\n` +
    `[Download Browser extension](https://github.com/${repository}/releases/download/${encodeURIComponent(metadata.tag)}/${assetName})\n\n` +
    'For extension-capable embedded browsers. Extract the ZIP, load the directory containing `manifest.json`, and refresh the page.\n\n' +
    '[Installation and WebMCP guide](https://module-federation.io/guide/debug/chrome-devtool.html)\n\n' +
    `Extension version: \`${metadata.extensionVersion}\`. Source commit: \`${metadata.sha}\`.\n\n` +
    `SHA-256: \`${metadata.sha256}\`\n${end}`;
  if (body.includes(start) !== body.includes(end))
    throw new Error('Incomplete managed download section');
  if (body.includes(start)) {
    const from = body.indexOf(start);
    const to = body.indexOf(end, from);
    if (to < from) throw new Error('Invalid managed download section');
    return body.slice(0, from) + section + body.slice(to + end.length);
  }
  return `${body.trimEnd()}\n\n${section}`.trimStart();
}

// request is injected in tests; no GitHub writes are made by local validation.
export async function createReleaseDraft({
  request,
  repository,
  metadata,
  archive,
  previousTag = '',
}) {
  if (
    !/^[\w.-]+\/[\w.-]+$/.test(repository) ||
    !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(metadata.version) ||
    metadata.tag !== `v${metadata.version}` ||
    !/^[a-f0-9]{40}$/.test(metadata.sha) ||
    metadata.channel !== 'latest' ||
    metadata.asset !== assetName ||
    !/^[a-f0-9]{64}$/.test(metadata.sha256) ||
    hash(archive) !== metadata.sha256
  )
    throw new Error('Invalid release metadata or archive checksum');
  if (metadata.version.includes('-'))
    throw new Error(
      'GitHub Release drafts are only created for stable latest versions',
    );
  const base = `/repos/${repository}`;
  const tag = encodeURIComponent(metadata.tag);
  const ref = await request(`${base}/git/ref/tags/${tag}`, { allow404: true });
  if (ref) {
    let object = ref.object;
    while (object.type === 'tag')
      object = (await request(`${base}/git/tags/${object.sha}`)).object;
    if (object.type !== 'commit' || object.sha !== metadata.sha)
      throw new Error(
        'Existing tag points to a different commit; refusing to move it',
      );
  }

  // Listing includes drafts; the get-by-tag endpoint is for published releases.
  let release;
  for (let page = 1; ; page++) {
    const releases = await request(
      `${base}/releases?per_page=100&page=${page}`,
    );
    release = releases.find((item) => item.tag_name === metadata.tag);
    if (release || releases.length < 100) break;
  }
  if (release) {
    if (!release.draft || release.immutable)
      throw new Error('Release is already published; refusing to modify it');
    // Without a tag, target_commitish may still be a mutable branch name.
    if (!ref) {
      const target = await request(
        `${base}/commits/${encodeURIComponent(release.target_commitish)}`,
      );
      if (target.sha !== metadata.sha)
        throw new Error('Existing draft targets a different commit');
    }
    if (release.prerelease)
      throw new Error('Existing draft has a different release channel');
  } else {
    const notes = await request(`${base}/releases/generate-notes`, {
      method: 'POST',
      body: {
        tag_name: metadata.tag,
        target_commitish: metadata.sha,
        ...(previousTag ? { previous_tag_name: previousTag } : {}),
        configuration_file_path: '.github/release.yml',
      },
    });
    release = await request(`${base}/releases`, {
      method: 'POST',
      body: {
        tag_name: metadata.tag,
        target_commitish: metadata.sha,
        name: metadata.tag,
        draft: true,
        prerelease: false,
        body: notes.body,
      },
    });
  }

  const assets = [];
  for (let page = 1; ; page++) {
    const batch = await request(
      `${base}/releases/${release.id}/assets?per_page=100&page=${page}`,
    );
    assets.push(...batch);
    if (batch.length < 100) break;
  }
  const existing = assets.find((asset) => asset.name === assetName);
  if (existing) {
    const digest =
      existing.digest ||
      `sha256:${hash(await request(`${base}/releases/assets/${existing.id}`, { binary: true }))}`;
    if (existing.state !== 'uploaded' || digest !== `sha256:${metadata.sha256}`)
      throw new Error(
        'Existing Browser asset differs or is incomplete; inspect the draft before replacing it',
      );
  } else {
    await request(
      `https://uploads.github.com${base}/releases/${release.id}/assets?name=${assetName}`,
      {
        method: 'POST',
        upload: archive,
      },
    );
  }
  const body = withDownload(release.body || '', repository, metadata);
  if (body !== release.body)
    await request(`${base}/releases/${release.id}`, {
      method: 'PATCH',
      body: { body, target_commitish: metadata.sha },
    });
  return release.html_url;
}

export function githubRequest(token) {
  if (!token) throw new Error('GH_TOKEN is required');
  return async (
    route,
    { method = 'GET', body, upload, binary = false, allow404 = false } = {},
  ) => {
    const url = route.startsWith('/')
      ? `https://api.github.com${route}`
      : route;
    if (
      !['https://api.github.com', 'https://uploads.github.com'].includes(
        new URL(url).origin,
      )
    )
      throw new Error('Unexpected GitHub API origin');
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: binary
          ? 'application/octet-stream'
          : 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(upload
          ? { 'Content-Type': 'application/zip' }
          : body
            ? { 'Content-Type': 'application/json' }
            : {}),
      },
      body: upload || (body ? JSON.stringify(body) : undefined),
    });
    if (allow404 && response.status === 404) return null;
    if (!response.ok)
      throw new Error(
        `GitHub ${method} ${route}: HTTP ${response.status}. Check job permissions and release/tag rules. For workflow changes, merge them into the default branch first.`,
      );
    return binary ? Buffer.from(await response.arrayBuffer()) : response.json();
  };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  const directory = path.resolve(process.argv[2]);
  const metadata = JSON.parse(
    readFileSync(path.join(directory, 'release.json'), 'utf8'),
  );
  const url = await createReleaseDraft({
    request: githubRequest(process.env.GH_TOKEN),
    repository: process.env.GITHUB_REPOSITORY,
    metadata,
    archive: readFileSync(path.join(directory, assetName)),
    previousTag: process.env.PREVIOUS_TAG,
  });
  if (process.env.GITHUB_STEP_SUMMARY)
    appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `## GitHub Release draft\n\n[Review and publish ${metadata.tag}](${url})\n\nBrowser ZIP attached. The release remains a draft until you publish it.\n\nSource commit: \`${metadata.sha}\`\n`,
    );
  console.log(`Release draft: ${url}`);
}
