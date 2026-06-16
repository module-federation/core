// Hardened port of the fetch + blob import-rewriting loader PoC
// (js-module-import/index.html). Comments are retained from the PoC where the
// logic is carried over verbatim.

export interface BlobDep {
  original: string;
  spec: string;
  quote: string;
  depUrl: string;
}

// Resolve a specifier (relative, absolute-path, or already-absolute-url)
// against a base url to a concrete fetchable url. The MF runtime resolves
// shared deps to relative loadShare asset urls, so bare specifiers never reach
// the loader; anything bare is unexpected and throws.
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
