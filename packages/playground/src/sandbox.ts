export type RemoteManifest = {
  id?: string;
  name?: string;
  metaData?: {
    name?: string;
    remoteEntry?: {
      name?: string;
      path?: string;
      type?: string;
    };
    publicPath?: string;
  };
  remotes?: Array<{
    name?: string;
    alias?: string;
    entry?: string;
    version?: string;
  }>;
  exposes?: Array<{ name?: string }>;
  shared?: unknown;
};

export type ManifestExposePayload = RemoteManifest;

export function guessRemoteName(manifest: RemoteManifest): string {
  return (
    manifest.metaData?.name ||
    manifest.name ||
    manifest.id ||
    '@module-federation/unknown-remote'
  );
}

export function guessExpose(manifest: RemoteManifest): string {
  return manifest.exposes?.[0]?.name || 'default';
}

export function normalizeExpose(expose: string): string {
  const normalizedExpose = expose.trim();

  if (
    !normalizedExpose ||
    normalizedExpose === '.' ||
    normalizedExpose === './' ||
    normalizedExpose === './.'
  ) {
    return '';
  }

  return normalizedExpose.replace(/^\.\//, '').replace(/^\//, '');
}

export function formatLoadedTarget(remoteName: string, expose: string): string {
  return expose ? `${remoteName}/${expose}` : remoteName;
}

export async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Fetch failed: ${response.status} ${response.statusText} (${url})`,
    );
  }

  return (await response.json()) as T;
}

export async function fetchManifest(url: string): Promise<RemoteManifest> {
  return fetchJson<RemoteManifest>(url);
}
