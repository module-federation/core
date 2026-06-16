import { resolveSpec, rewriteModuleCode } from '../src/blobLoad';

describe('resolveSpec', () => {
  it('returns absolute urls untouched', () => {
    expect(resolveSpec('https://x.com/a.js', 'https://b.com/')).toBe(
      'https://x.com/a.js',
    );
    expect(resolveSpec('blob:abc', 'https://b.com/')).toBe('blob:abc');
    expect(resolveSpec('data:text/js,1', 'https://b.com/')).toBe(
      'data:text/js,1',
    );
  });

  it('resolves relative and absolute-path specifiers against the base', () => {
    expect(resolveSpec('./dep.js', 'https://b.com/app/entry.js')).toBe(
      'https://b.com/app/dep.js',
    );
    expect(resolveSpec('/root.js', 'https://b.com/app/entry.js')).toBe(
      'https://b.com/root.js',
    );
  });

  it('throws on bare specifiers', () => {
    expect(() => resolveSpec('react', 'https://b.com/')).toThrow(
      'bare specifier',
    );
  });
});

describe('rewriteModuleCode', () => {
  const url = 'https://b.com/app/entry.js';

  it('pins import.meta.url to the module url', () => {
    const { code } = rewriteModuleCode('const u = import.meta.url;', url);
    expect(code).toBe(`const u = ${JSON.stringify(url)};`);
  });

  it('routes dynamic import() through __mfDyn with the base url', () => {
    const { code } = rewriteModuleCode('const m = import("./x.js");', url);
    expect(code).toBe(`const m = __mfDyn(${JSON.stringify(url)},"./x.js");`);
  });

  it('collects static relative/absolute deps and leaves bare imports alone', () => {
    const src = `import a from "./a.js";\nexport { b } from "/b.js";\nimport c from "react";`;
    const { deps } = rewriteModuleCode(src, url);
    expect(deps.map((d) => d.spec).sort()).toEqual(['./a.js', '/b.js']);
    expect(deps.find((d) => d.spec === './a.js')!.depUrl).toBe(
      'https://b.com/app/a.js',
    );
    const aDep = deps.find((d) => d.spec === './a.js')!;
    expect(aDep.original).toBe('from "./a.js"');
    expect(aDep.quote).toBe('"');
  });

  it('collects side-effect imports', () => {
    const { deps } = rewriteModuleCode('import "./side.js";', url);
    expect(deps.map((d) => d.spec)).toEqual(['./side.js']);
  });
});
