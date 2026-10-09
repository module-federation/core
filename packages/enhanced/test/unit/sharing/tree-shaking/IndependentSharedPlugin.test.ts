import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { rs } from '@rstest/core';
import type { Compiler, Configuration } from 'webpack';
import IndependentSharedPlugin from '../../../../src/lib/sharing/tree-shaking/IndependentSharedPlugin';

const parentCache = {
  type: 'filesystem' as const,
  name: 'host-production',
  cacheDirectory: '/cache/webpack',
  cacheLocation: '/cache/webpack/host-production',
};

const shared = {
  'ui-lib-es': { treeShaking: { mode: 'runtime-infer' as const } },
  'ui-big': { treeShaking: { mode: 'runtime-infer' as const } },
};

const shareRequests = {
  'ui-lib-es': { requests: [['ui-lib-es', '1.0.0']] as [string, string][] },
  'ui-big': { requests: [['ui-big', '2.0.0']] as [string, string][] },
};

function createParentCompiler(cache: Configuration['cache']) {
  const configs: Configuration[] = [];
  const closed: Configuration[] = [];
  const webpack = rs.fn((config: Configuration) => {
    configs.push(config);
    return {
      run: (cb: (err: null, stats: unknown) => void) =>
        cb(null, { hasErrors: () => false }),
      close: (cb: (err?: Error) => void) => {
        closed.push(config);
        cb();
      },
    };
  });
  const context = fs.mkdtempSync(
    path.join(os.tmpdir(), 'independent-shared-plugin-'),
  );
  const compiler = {
    context,
    outputPath: path.join(context, 'dist'),
    options: {
      mode: 'production',
      cache,
      plugins: [],
      output: { publicPath: '/' },
      optimization: {},
    },
    webpack: { webpack },
  };
  return { compiler, configs, closed, context };
}

async function buildChildren(cache: Configuration['cache']) {
  const parent = createParentCompiler(cache);
  const plugin = new IndependentSharedPlugin({ name: 'host', shared });
  try {
    await plugin['createIndependentCompilers'](
      parent.compiler as unknown as Compiler,
      shareRequests,
    );
  } finally {
    fs.rmSync(parent.context, { recursive: true, force: true });
  }
  return parent;
}

describe('IndependentSharedPlugin child compilers', () => {
  it('gives each child compiler its own filesystem cache pack', async () => {
    const { configs } = await buildChildren(parentCache);
    const caches = configs.map((c) => c.cache as typeof parentCache);

    expect(caches).toHaveLength(2);
    expect(caches.map((c) => c.type)).toEqual(['filesystem', 'filesystem']);
    expect(caches.map((c) => c.name)).not.toContain(parentCache.name);
    expect(caches.map((c) => c.cacheLocation)).not.toContain(
      parentCache.cacheLocation,
    );
    expect(new Set(caches.map((c) => c.cacheLocation)).size).toBe(2);
  });

  it('keeps cache: false in child compilers', async () => {
    const { configs } = await buildChildren(false);
    expect(configs.map((c) => c.cache)).toEqual([false, false]);
  });

  it('closes every child compiler', async () => {
    const { configs, closed } = await buildChildren(parentCache);
    expect(closed).toEqual(configs);
  });
});
