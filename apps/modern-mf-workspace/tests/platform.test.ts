import assert from 'node:assert/strict';
import {
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
  mkdir,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import type { AddressInfo } from 'node:net';
import type { RootConfig, RecommendationsConfig } from '../shared/contracts.ts';
import { createWorkspaceServer } from '../server/index.ts';
import {
  PlatformStore,
  initialRootConfig,
  initialRecommendationsConfig,
} from '../server/platform.ts';
import { HttpError } from '../server/validation.ts';
import { requestAgent, modelStatus } from '../server/model.ts';

test('root discovery keeps its full direct capability directory but stops at the dynamic boundary', async () => {
  const store = await PlatformStore.open();
  const root = store.discover('root', { pathname: '/catalog' });
  assert.equal(root.capabilities.length, 3);
  assert.deepEqual(
    root.routes.map((route) => route.id),
    ['catalog'],
  );
  assert.deepEqual(root.loadedConsumerKeys, ['root']);
  assert.deepEqual(root.contexts, []);
  const recommendation = root.bindings.find(
    (binding) => binding.id === 'recommendations',
  )!;
  assert.equal(recommendation.mode, 'dynamic');
  assert.equal(recommendation.childEndpoint, '/api/discovery/recommendations');
  assert.equal(recommendation.consumerKey, 'recommendations');
  assert.equal(recommendation.sid, undefined);
  assert.equal(recommendation.provider, undefined);
  assert.equal(
    root.capabilities.find(
      (item) =>
        item.target.kind === 'route' &&
        item.target.routeId === 'recommendations',
    )?.tools,
    undefined,
  );
  const fullConfig = { ...initialRootConfig, delivery: 'full' };
  await store.publish('root', fullConfig);
  const full = store.discover('root', { pathname: '/catalog' });
  assert.equal(full.routes.length, 3);
  assert.equal(
    full.contexts.length,
    0,
    'full must never cross the independent C source',
  );
});

test('C publishes independently; accepted C sid expires without changing root sid', async () => {
  const store = await PlatformStore.open();
  const rootBefore = store.discover('root', {});
  const cBefore = store.discover('recommendations', {
    basename: '/recommendations',
    pathname: '/recommendations/detail',
  });
  assert.equal(cBefore.provider?.name, 'recommendations_v1');
  assert.equal(cBefore.contexts[0]?.provider?.name, 'details');
  await store.publish('recommendations', {
    ...initialRecommendationsConfig,
    version: 'v2',
  });
  const rootAfter = store.discover('root', { sid: rootBefore.sid });
  assert.equal(rootAfter.sid, rootBefore.sid);
  assert.throws(
    () =>
      store.discover('recommendations', {
        consumerKey: cBefore.consumerKey,
        sid: cBefore.sid,
      }),
    (error: unknown) =>
      error instanceof HttpError &&
      error.status === 409 &&
      error.code === 'SNAPSHOT_EXPIRED' &&
      error.details.expectedSid === cBefore.sid,
  );
  const cAfter = store.discover('recommendations', {});
  assert.equal(cAfter.provider?.name, 'recommendations_v2');
  assert.notEqual(cAfter.sid, cBefore.sid);
});

test('fixed C@v1 is copied into root and stays pinned after C changes', async () => {
  const store = await PlatformStore.open();
  await store.publish('root', {
    ...initialRootConfig,
    recommendationMode: 'fixed',
    delivery: 'full',
  });
  const root = store.discover('root', {});
  const binding = root.bindings.find(
    (binding) => binding.id === 'recommendations',
  )!;
  assert.equal(binding.provider?.name, 'recommendations_v1');
  assert.equal(binding.childEndpoint, '/api/discovery/root');
  assert.equal(binding.sid, root.sid);
  assert.deepEqual(
    root.contexts.map((item) => item.consumerKey),
    ['root-copy-recommendations', 'root-copy-details'],
  );
  assert.ok(
    root.contexts.every(
      (context) =>
        context.sid === root.sid && context.endpoint === root.endpoint,
    ),
  );
  await store.publish('recommendations', {
    ...initialRecommendationsConfig,
    version: 'v2',
    detailsEnabled: false,
  });
  const copied = store.discover('root', {
    consumerKey: binding.consumerKey,
    sid: root.sid,
    basename: '/recommendations',
    pathname: '/recommendations/detail',
  });
  assert.equal(copied.provider?.name, 'recommendations_v1');
  assert.equal(copied.bindings[0]?.id, 'details');
  assert.throws(
    () =>
      store.discover('recommendations', { consumerKey: binding.consumerKey }),
    (error: unknown) =>
      error instanceof HttpError && error.code === 'CONSUMER_NOT_FOUND',
  );
});

test('schema validation rejects malformed configurations without publishing partial state', async () => {
  const store = await PlatformStore.open();
  const sid = store.platform('root').published.sid;
  const bad = structuredClone(initialRootConfig);
  bad.entries.preferences.path = bad.entries.catalog.path;
  await assert.rejects(store.publish('root', bad), /应用路径不可重叠/);
  await assert.rejects(
    store.publish('root', { ...initialRootConfig, unexpected: true }),
    /未知字段/,
  );
  await assert.rejects(
    store.publish('recommendations', {
      ...initialRecommendationsConfig,
      version: 'v3',
    }),
    /version/,
  );
  await assert.rejects(
    store.setPreferences({
      budget: -1,
      categories: [],
      priorities: [],
      notes: '',
    }),
    /budget/,
  );
  assert.equal(store.platform('root').published.sid, sid);
  assert.throws(
    () => store.discover('root', { pathname: '/catalog?sid=forged' }),
    /路径/,
  );
  assert.throws(() => store.discover('root', { sid: '' }), /sid/);
});

test('deployed defaults stay separate from explicit user preferences', async () => {
  const store = await PlatformStore.open();
  assert.equal(store.preferences().customized, false);
  await store.publish('recommendations', {
    ...initialRecommendationsConfig,
    defaultPreferences: {
      ...initialRecommendationsConfig.defaultPreferences,
      budget: 450,
      customized: true,
    },
  });
  const config = store.platform('recommendations').published
    .config as RecommendationsConfig;
  assert.equal(config.defaultPreferences.budget, 450);
  assert.equal(config.defaultPreferences.customized, undefined);
  assert.equal(store.preferences().customized, false);
  assert.equal(
    (
      store.discover('recommendations', {}).props?.defaultPreferences as {
        budget: number;
      }
    ).budget,
    450,
  );
  const personal = await store.setPreferences({
    ...store.preferences(),
    budget: 950,
    customized: false,
  });
  assert.equal(
    personal.customized,
    true,
    'client cannot forge the server-owned customization marker',
  );
  assert.equal(personal.budget, 950);
  await store.reset();
  assert.equal(store.preferences().customized, false);
});

test('atomic file persistence survives reopen with fixed copy, preferences, and ordered history', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'modern-mf-state-'));
  try {
    const file = join(directory, 'state.json');
    const store = await PlatformStore.open(file);
    const rootConfig = {
      ...initialRootConfig,
      recommendationMode: 'fixed',
    } as RootConfig;
    await Promise.all([
      store.publish('root', rootConfig),
      store.publish('recommendations', {
        ...initialRecommendationsConfig,
        version: 'v2',
      } as RecommendationsConfig),
    ]);
    await store.setPreferences({
      budget: 800,
      categories: ['audio'],
      priorities: ['comfort'],
      notes: 'commute',
    });
    const reopened = await PlatformStore.open(file);
    assert.equal(reopened.platform('recommendations').history.length, 2);
    assert.equal(reopened.preferences().budget, 800);
    assert.equal(
      reopened.discover('root', { consumerKey: 'root-copy-recommendations' })
        .provider?.name,
      'recommendations_v1',
    );
    const raw = JSON.parse(await readFile(file, 'utf8'));
    assert.equal(
      raw.platforms.root.published.sid,
      reopened.platform('root').published.sid,
    );
    assert.equal(reopened.preferences().customized, true);
    delete raw.preferences.customized;
    await writeFile(file, JSON.stringify(raw));
    const legacy = await PlatformStore.open(file);
    assert.equal(legacy.preferences().customized, false);
    const oldSid = reopened.platform('root').published.sid;
    await reopened.reset();
    assert.notEqual(reopened.platform('root').published.sid, oldSid);
    assert.equal(
      (reopened.platform('root').published.config as RootConfig)
        .recommendationMode,
      'dynamic',
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('HTTP protocol returns structured stale errors, supports POST discovery and serves real data', async () => {
  const store = await PlatformStore.open();
  const server = await createWorkspaceServer({ store, modelEnvironment: {} });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  try {
    const response = await fetch(`${base}/api/discovery/root`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ pathname: '/preferences' }),
    });
    assert.equal(response.status, 200);
    const original = await response.json();
    assert.equal(original.protocolVersion, '1.0');
    await store.publish('root', initialRootConfig);
    const stale = await fetch(`${base}/api/discovery/root?sid=${original.sid}`);
    assert.equal(stale.status, 409);
    const error = await stale.json();
    assert.equal(error.error.code, 'SNAPSHOT_EXPIRED');
    assert.equal(error.error.expectedSid, original.sid);
    const catalog = await (
      await fetch(`${base}/api/products?category=audio`)
    ).json();
    assert.ok(catalog.length >= 3);
    assert.ok(
      catalog.every(
        (product: { category: string }) => product.category === 'audio',
      ),
    );
    const status = await (await fetch(`${base}/api/model/status`)).json();
    assert.deepEqual(status, { configured: false, model: 'gpt-4.1-mini' });
    const agent = await fetch(`${base}/api/agent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: '你好' }],
        tools: [],
      }),
    });
    assert.equal(agent.status, 503);
    assert.equal((await agent.json()).error.code, 'MODEL_NOT_CONFIGURED');
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

test('model endpoint forwards browser tools and returns calls without executing them', async () => {
  let requestBody: Record<string, unknown> | undefined;
  const fetcher: typeof fetch = async (_input, init) => {
    requestBody = JSON.parse(String(init?.body));
    return new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              role: 'assistant',
              content: null,
              tool_calls: [
                {
                  id: 'call_1',
                  type: 'function',
                  function: {
                    name: 'mounted_update_preferences',
                    arguments: '{"budget":500}',
                  },
                },
              ],
            },
          },
        ],
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
  };
  const response = await requestAgent(
    {
      messages: [{ role: 'user', content: '将预算改成500' }],
      tools: [
        {
          type: 'function',
          function: {
            name: 'mounted_update_preferences',
            description: 'Update preference in browser',
            parameters: {
              type: 'object',
              properties: { budget: { type: 'number' } },
            },
          },
        },
      ],
    },
    {
      MODEL_API_KEY: 'test-key-not-a-secret',
      MODEL_NAME: 'mock-model',
      MODEL_BASE_URL: 'http://localhost:9999/v1',
    },
    fetcher,
  );
  assert.equal(
    response.message.tool_calls?.[0]?.function.name,
    'mounted_update_preferences',
  );
  assert.equal(response.model, 'mock-model');
  assert.equal((requestBody?.tools as unknown[]).length, 1);
  assert.deepEqual(
    modelStatus({ MODEL_API_KEY: 'hidden', MODEL_NAME: 'demo' }),
    { configured: true, model: 'demo' },
  );
});

test('remote static serving does not escape its directory through symlinks', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'modern-mf-static-'));
  const remoteRoot = join(directory, 'remotes');
  await mkdir(remoteRoot);
  const staticRoot = join(directory, 'dist');
  await mkdir(join(staticRoot, 'html/index'), { recursive: true });
  await writeFile(
    join(staticRoot, 'html/index/index.html'),
    '<!doctype html><title>Modern production</title>',
  );
  await writeFile(join(directory, 'outside.txt'), 'private-data');
  await symlink(join(directory, 'outside.txt'), join(remoteRoot, 'escape.txt'));
  const server = await createWorkspaceServer({
    stateFile: null,
    remotesRoot: remoteRoot,
    staticRoot,
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const response = await fetch(
      `http://127.0.0.1:${(server.address() as AddressInfo).port}/remotes/escape.txt`,
    );
    assert.equal(response.status, 403);
    assert.ok(!(await response.text()).includes('private-data'));
    const page = await fetch(
      `http://127.0.0.1:${(server.address() as AddressInfo).port}/deploy/root`,
    );
    assert.equal(page.status, 200);
    assert.match(await page.text(), /Modern production/);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await rm(directory, { recursive: true, force: true });
  }
});
