import type { moduleFederationPlugin } from '@module-federation/sdk';

const REMOTE_ENTRY_PATH = /\/remoteEntry(?:\.[cm]?js)?$/;
const LEGACY_REMOTE_PREFIXES = ['promise ', 'internal '];

const shouldSkipRemoteRewrite = (value: string): boolean =>
  LEGACY_REMOTE_PREFIXES.some((prefix) => value.startsWith(prefix));

const replacePathSegment = (value: string, from: string, to: string): string =>
  value.includes(from) ? value.replace(from, to) : value;

export const normalizeNextManifestUrl = (value: string): string => {
  if (!value || shouldSkipRemoteRewrite(value)) {
    return value;
  }

  try {
    const url = new URL(value);
    url.pathname = url.pathname.replace(REMOTE_ENTRY_PATH, '/mf-manifest.json');
    return url.toString();
  } catch {
    return value.replace(REMOTE_ENTRY_PATH, '/mf-manifest.json');
  }
};

export const getBrowserManifestUrl = (value: string): string => {
  const manifestUrl = normalizeNextManifestUrl(value);

  if (!manifestUrl) {
    return manifestUrl;
  }

  try {
    const url = new URL(manifestUrl);
    url.pathname = replacePathSegment(
      url.pathname,
      '/static/ssr/',
      '/static/chunks/',
    );
    return url.toString();
  } catch {
    return replacePathSegment(manifestUrl, '/static/ssr/', '/static/chunks/');
  }
};

export const normalizeRemoteSpecifierToManifest = (value: string): string => {
  if (!value || shouldSkipRemoteRewrite(value)) {
    return value;
  }

  const atIndex = value.indexOf('@');
  const looksLikeContainerReference =
    atIndex > 0 && !value.slice(0, atIndex).includes('://');

  if (!looksLikeContainerReference) {
    return normalizeNextManifestUrl(value);
  }

  const container = value.slice(0, atIndex);
  const entry = value.slice(atIndex + 1);

  return `${container}@${normalizeNextManifestUrl(entry)}`;
};

const normalizeRemoteValue = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return normalizeRemoteSpecifierToManifest(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeRemoteValue(item));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const record = value as Record<string, unknown>;

  if ('external' in record) {
    return {
      ...record,
      external: normalizeRemoteValue(record['external']),
    };
  }

  return Object.fromEntries(
    Object.entries(record).map(([key, entry]) => [
      key,
      normalizeRemoteValue(entry),
    ]),
  );
};

export const normalizeNextRemotes = (
  remotes: moduleFederationPlugin.ModuleFederationPluginOptions['remotes'],
): moduleFederationPlugin.ModuleFederationPluginOptions['remotes'] => {
  if (!remotes) {
    return remotes;
  }

  return normalizeRemoteValue(
    remotes,
  ) as moduleFederationPlugin.ModuleFederationPluginOptions['remotes'];
};
