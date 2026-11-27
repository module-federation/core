export type BridgeMemoryRouteEntry =
  | string
  | {
      pathname?: string;
      search?: string;
      hash?: string;
      state?: unknown;
      key?: string;
    };

export interface BridgeMemoryRouteOptions {
  /** Single initial entry path (e.g. '/detail/42?tab=info#top'). */
  entryPath?: string;
  /** Full initial history stack for memory routing. */
  initialEntries?: BridgeMemoryRouteEntry[];
  /** Active index into `initialEntries` (defaults to the last entry). */
  initialIndex?: number;
  /** Initial location state attached to `entryPath` when `initialEntries` is omitted. */
  initialState?: unknown;
  /** Optional basename for the memory router (defaults to '/'). */
  basename?: string;
}

export type BridgeMemoryRoute = BridgeMemoryRouteOptions;

export interface NormalizedBridgeMemoryRoute {
  initialEntries: BridgeMemoryRouteEntry[];
  initialIndex: number;
  activePath: string;
  basename: string;
}

function normalizeBasename(basename?: string): string {
  if (!basename || basename === '/') return '/';
  const leading = basename.startsWith('/') ? basename : `/${basename}`;
  return leading.replace(/\/+$/, '') || '/';
}

function hasBasenamePrefix(pathname: string, basename: string): boolean {
  if (basename === '/') return true;
  return pathname === basename || pathname.startsWith(`${basename}/`);
}

function prefixPathname(pathname: string, basename: string): string {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (basename === '/' || hasBasenamePrefix(normalizedPath, basename)) {
    return normalizedPath;
  }
  return normalizedPath === '/' ? basename : `${basename}${normalizedPath}`;
}

function parseEntryPath(input: string): {
  pathname: string;
  search: string;
  hash: string;
} {
  const url = new URL(input || '/', 'http://mf.memory');
  return {
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
  };
}

function applyBasename(
  entry: BridgeMemoryRouteEntry,
  basename: string,
): BridgeMemoryRouteEntry {
  if (basename === '/') return entry;
  if (typeof entry === 'string') {
    const parsed = parseEntryPath(entry);
    return `${prefixPathname(parsed.pathname, basename)}${parsed.search}${parsed.hash}`;
  }
  return {
    ...entry,
    pathname: prefixPathname(entry.pathname || '/', basename),
  };
}

export function bridgeMemoryEntryToPath(entry: BridgeMemoryRouteEntry): string {
  if (typeof entry === 'string') {
    const parsed = parseEntryPath(entry);
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  }
  const pathname = entry.pathname || '/';
  const normalizedPathname = pathname.startsWith('/')
    ? pathname
    : `/${pathname}`;
  const search = entry.search
    ? entry.search.startsWith('?')
      ? entry.search
      : `?${entry.search}`
    : '';
  const hash = entry.hash
    ? entry.hash.startsWith('#')
      ? entry.hash
      : `#${entry.hash}`
    : '';
  return `${normalizedPathname}${search}${hash}`;
}

/**
 * Normalize a Bridge `memoryRoute` input into `initialEntries`, `initialIndex`,
 * `activePath`, and `basename` shared across CSR, SSR, and Service App handlers.
 */
export function normalizeBridgeMemoryRoute(
  memoryRoute: BridgeMemoryRouteOptions | undefined,
): NormalizedBridgeMemoryRoute | undefined {
  if (!memoryRoute) return undefined;
  const basename = normalizeBasename(memoryRoute.basename);
  let rawEntries: BridgeMemoryRouteEntry[];

  if (
    Array.isArray(memoryRoute.initialEntries) &&
    memoryRoute.initialEntries.length > 0
  ) {
    rawEntries = memoryRoute.initialEntries;
  } else {
    const entryPath = memoryRoute.entryPath || '/';
    if (memoryRoute.initialState !== undefined) {
      const parsed = parseEntryPath(entryPath);
      rawEntries = [{ ...parsed, state: memoryRoute.initialState }];
    } else {
      rawEntries = [entryPath];
    }
  }

  const initialEntries = rawEntries.map((entry) =>
    applyBasename(entry, basename),
  );
  const rawIndex =
    typeof memoryRoute.initialIndex === 'number' &&
    Number.isInteger(memoryRoute.initialIndex)
      ? memoryRoute.initialIndex
      : initialEntries.length - 1;
  const initialIndex = Math.min(
    Math.max(rawIndex, 0),
    initialEntries.length - 1,
  );

  return {
    initialEntries,
    initialIndex,
    activePath: bridgeMemoryEntryToPath(initialEntries[initialIndex]),
    basename,
  };
}
