export interface BlobDep {
  original: string;
  spec: string;
  quote: string;
  depUrl: string;
}

// Resolve a specifier (relative, absolute-path, or already-absolute-url)
// against a base url to a concrete fetchable url.
// Shared dependencies should have already been resolved by the MF runtime
// as relative loadShare asset urls, so anything bare is unexpected and throws.
export function resolveSpec(spec: string, base: string): string {
  if (/^(blob:|https?:|data:)/.test(spec)) return spec;
  if (spec.startsWith('.') || spec.startsWith('/'))
    return new URL(spec, base).href;
  throw new Error(
    `[loader] cannot resolve bare specifier "${spec}" (from ${base})`,
  );
}

// Rewrite a module's source: pin import.meta.url, route dynamic imports through
// __mfDyn, and collect static relative/absolute specifiers (to be replaced with
// recursively-loaded blob urls by the caller).
export function rewriteModuleCode(
  code: string,
  url: string,
): { code: string; deps: BlobDep[] } {
  // import.meta.url -> the module's real url.
  // In this case, modules with publicPath:"auto" can derive paths from it.
  code = code.replace(/\bimport\.meta\.url\b/g, JSON.stringify(url));

  // Dynamic import(...) -> __mfDyn("<url>", ...).
  code = code.replace(
    /(?<![.\w$])import\s*\(/g,
    `__mfDyn(${JSON.stringify(url)},`,
  );

  // Static `import * from ...` and `import ...` -> recursively-loaded blob urls.
  const specRe = /(?<![.\w$])(from|import)\s*(['"])([^'"]+)\2/g;
  const deps: BlobDep[] = [];
  for (const m of code.matchAll(specRe)) {
    const spec = m[3];
    if (spec.startsWith('.') || spec.startsWith('/')) {
      deps.push({
        original: m[0],
        spec,
        quote: m[2],
        depUrl: resolveSpec(spec, url),
      });
    }
  }
  return { code, deps };
}

export type BlobFetcher = (
  url: string,
  init: RequestInit,
) => Promise<Response | void | false> | Response | void | false;

export interface BlobLoadContext {
  fetchOptions?: RequestInit;
  // Optional custom fetch (e.g. routed through the runtime loaderHook.fetch so
  // existing fetch-hook plugins still compose). Falls back to native fetch.
  customFetch?: BlobFetcher;
}

// The dynamic-import shim installed on globalThis as __mfDyn. Its context
// registry (absolute url -> fetcher + options) hangs off the function itself
// rather than living in a second global: if two bundled copies/versions of the
// SDK coexist, every copy reads and writes the same map through whichever shim
// is installed, so a blob module's dynamic imports never lose their fetch
// context — and we don't pollute globalThis with an extra variable.
type MFDynShim = ((base: string, spec: string) => Promise<unknown>) & {
  contexts?: Map<string, BlobLoadContext>;
};

// Resolve the blob loader context registry, lazily installing the global __mfDyn
// shim on first use (loadModule can run before the shim is formally installed).
function getContexts(): Map<string, BlobLoadContext> {
  const g = globalThis as Record<string, unknown>;
  let shim = g['__mfDyn'] as MFDynShim | undefined;
  // If an existing shim from another SDK copy is installed, we reuse it instead of reinstalling.
  if (typeof shim !== 'function') {
    shim = createDynImportShim();
    g['__mfDyn'] = shim;
  }
  if (!shim.contexts) {
    shim.contexts = new Map<string, BlobLoadContext>();
  }
  return shim.contexts;
}
// absolute url -> Promise<blob url> for JS modules
const jsCache = new Map<string, Promise<string>>();
// absolute url -> in-flight/settled promise, used to prevent double-inject the stylesheet.
const cssCache = new Map<string, Promise<void>>();

function isResponseLike(res: unknown): res is Response {
  return (
    !!res &&
    typeof res === 'object' &&
    typeof (res as Response).text === 'function' &&
    'ok' in (res as Response)
  );
}

// Create and normalize a const copy of headers, to avoid the case when the original headers are mutated by fetcher.
export function toHeaderObject(
  headers: RequestInit['headers'],
): Record<string, string> {
  if (!headers) return {};
  if (typeof Headers !== 'undefined' && headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
  return { ...(headers as Record<string, string>) };
}

export async function fetchText(
  url: string,
  ctx: BlobLoadContext,
): Promise<string> {
  const init: RequestInit = {
    ...(ctx.fetchOptions || {}),
    headers: toHeaderObject(ctx.fetchOptions?.headers),
  };
  let res: Response | void | false = undefined;
  if (ctx.customFetch) {
    res = await ctx.customFetch(url, init);
  }
  if (!isResponseLike(res)) {
    res = await fetch(url, init);
  }
  if (!res.ok) {
    throw new Error(
      `BlobLoaderNetworkError: ${res.status} ${res.statusText} for ${url}`,
    );
  }
  return res.text();
}

// Fetch a module with headers, rewrite its imports.
// Dynamic imports are handled lazily at runtime via __mfDyn,
// Static relative imports are pre-loaded recursively.
function loadModuleImpl(url: string, ctx: BlobLoadContext): Promise<string> {
  // Register the context for this url on every call so __mfDyn uses the latest
  // headers for that module's dynamic imports, even when the blob is cached.
  getContexts().set(url, ctx);
  if (jsCache.has(url)) return jsCache.get(url)!;

  const promise = (async () => {
    const raw = await fetchText(url, ctx);
    // Stage 1 rewrite: replace import.meta.url with url, and dynamic import(), collect static deps.
    const { code: rewritten, deps } = rewriteModuleCode(raw, url);
    let code = rewritten;
    const blobUrls = await Promise.all(
      deps.map((d) => loadModule(d.depUrl, ctx)),
    );
    // Stage 2 rewrite: replace static deps with blob urls.
    deps.forEach((d, i) => {
      const replaced = d.original.replace(
        `${d.quote}${d.spec}${d.quote}`,
        `${d.quote}${blobUrls[i]}${d.quote}`,
      );
      code = code.split(d.original).join(replaced);
    });
    return URL.createObjectURL(
      new Blob([code], { type: 'application/javascript' }),
    );
  })();

  jsCache.set(url, promise);
  // Don't permanently cache a failed load — allow a later retry (e.g. via the
  // runtime loadEntryError hook) to re-fetch instead of replaying the rejection.
  promise.catch(() => {
    if (jsCache.get(url) === promise) jsCache.delete(url);
  });
  return promise;
}

// Exported with a clearCache test seam.
export const loadModule: ((
  url: string,
  ctx: BlobLoadContext,
) => Promise<string>) & {
  clearCache: () => void;
} = Object.assign(loadModuleImpl, {
  clearCache: () => {
    jsCache.clear();
    getContexts().clear();
    cssCache.clear();
  },
});

// Runtime dynamic-import shim: resolve url + fetch from cache or with headers +
// import as blob. Reads its context off the shared registry (getContexts) so it
// works for blob modules created by any bundled copy of the SDK.
function createDynImportShim(): MFDynShim {
  return (async (base: string, spec: string) => {
    const resolved = resolveSpec(spec, base);
    if (/^(blob:|data:)/.test(resolved)) {
      return import(/* webpackIgnore: true */ /* @vite-ignore */ resolved);
    }
    const ctx = getContexts().get(base) || {};
    return import(
      /* webpackIgnore: true */ /* @vite-ignore */ await loadModule(
        resolved,
        ctx,
      )
    );
  }) as MFDynShim;
}

// The vite preload helper creates native <link> preloads (no auth header) as a
// perf hint; those 401 errors should be ignored instead of throwing — real
// loads go via __mfDyn. A stable handler ref lets addEventListener dedupe repeat
// installs (identical callback + capture is a no-op per the DOM spec).
const ignoreVitePreloadError = (e: Event) => e.preventDefault();

function installMFDynImportShim(): void {
  // Ensure the single global __mfDyn shim (and its shared contexts map) exists.
  // getContexts() is idempotent: it installs the shim on first use and never
  // clobbers one already installed by another bundled copy of the SDK.
  getContexts();

  if (typeof window !== 'undefined') {
    window.addEventListener('vite:preloadError', ignoreVitePreloadError);
  }
}

export async function loadEsmEntryWithFetch({
  entry,
  fetchOptions,
  customFetch,
}: {
  entry: string;
  fetchOptions?: RequestInit;
  customFetch?: BlobFetcher;
}): Promise<Record<string, unknown>> {
  installMFDynImportShim();
  const blobUrl = await loadModule(entry, { fetchOptions, customFetch });
  return import(/* webpackIgnore: true */ /* @vite-ignore */ blobUrl);
}

export function loadCssWithFetch({
  href,
  fetchOptions,
  customFetch,
}: {
  href: string;
  fetchOptions?: RequestInit;
  customFetch?: BlobFetcher;
}): Promise<void> {
  const cached = cssCache.get(href);
  if (cached) return cached;
  const promise = (async () => {
    const text = await fetchText(href, { fetchOptions, customFetch });
    const blob = URL.createObjectURL(new Blob([text], { type: 'text/css' }));
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = blob;
    document.head.appendChild(link);
  })();
  cssCache.set(href, promise);
  // Don't permanently cache a failed css load — allow a later retry.
  promise.catch(() => {
    if (cssCache.get(href) === promise) cssCache.delete(href);
  });
  return promise;
}
