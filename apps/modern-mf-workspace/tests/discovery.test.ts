import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  ApplicationsService,
  DiscoveryError,
  SnapshotExpiredError,
} from '../src/runtime/discovery.ts';
import { PlatformStore } from '../server/platform.ts';
import type { DiscoveryParams } from '../server/platform.ts';
import { HttpError } from '../server/validation.ts';
import type {
  DiscoveryResult,
  RecommendationsConfig,
  RootConfig,
} from '../shared/contracts.ts';

const rootEndpoint = '/api/discovery/root';
const recommendationsEndpoint = '/api/discovery/recommendations';

interface RequestRecord {
  endpoint: string;
  params: DiscoveryParams;
}

async function fixture() {
  const platform = await PlatformStore.open();
  const requests: RequestRecord[] = [];
  const fetcher: typeof fetch = async (input, options) => {
    assert.equal(options?.method, 'POST');
    const endpoint = String(input);
    const params = JSON.parse(String(options?.body)) as DiscoveryParams;
    requests.push({ endpoint, params });
    try {
      const id = endpoint === rootEndpoint ? 'root' : 'recommendations';
      return Response.json(platform.discover(id, params));
    } catch (error) {
      if (!(error instanceof HttpError)) throw error;
      return Response.json(
        {
          error: { code: error.code, message: error.message, ...error.details },
        },
        { status: error.status },
      );
    }
  };
  return { platform, requests, fetcher };
}

function gate() {
  let release!: () => void;
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}

test('initial root discovery keeps the full directory without discovering dynamic children', async () => {
  const { fetcher, requests } = await fixture();
  const service = new ApplicationsService({ endpoint: rootEndpoint, fetcher });
  const result = await service.discoverApplications({ pathname: '/' });

  assert.equal(requests.length, 1);
  assert.deepEqual(requests[0], {
    endpoint: rootEndpoint,
    params: { basename: '/', pathname: '/' },
  });
  assert.deepEqual(result.chain, []);
  assert.equal(result.contexts.length, 1);
  assert.equal(result.contexts[0].routes.length, 0);
  assert.equal(result.contexts[0].capabilities.length, 3);
  const recommendation = result.contexts[0].capabilities.find(
    (entry) =>
      entry.target.kind === 'route' &&
      entry.target.routeId === 'recommendations',
  );
  assert.equal(recommendation?.tools, undefined);
  assert.equal(
    service
      .getContexts()
      .some((context) => context.consumerKey.includes('details')),
    false,
  );
  result.contexts[0].capabilities.length = 0;
  assert.equal(
    service.getContexts()[0].capabilities.length,
    3,
    'returned views do not mutate the service',
  );
});

test('a deep dynamic path prepares C then D, without treating the root as a remote application', async () => {
  const { fetcher, requests, platform } = await fixture();
  const service = new ApplicationsService({ endpoint: rootEndpoint, fetcher });
  const result = await service.discoverApplications({
    pathname: '/recommendations/detail/p001',
  });

  assert.deepEqual(
    requests.map((request) => request.endpoint),
    [rootEndpoint, recommendationsEndpoint],
  );
  assert.equal(requests[1].params.consumerKey, 'recommendations');
  assert.equal(
    requests[1].params.sid,
    undefined,
    'the independent child never receives the parent sid',
  );
  assert.equal(requests[1].params.basename, '/recommendations');
  assert.deepEqual(
    result.chain.map((app) => app.provider.name),
    ['recommendations_v1', 'details'],
  );
  assert.deepEqual(
    result.chain.map((app) => app.basename),
    ['/recommendations', '/recommendations/detail'],
  );
  assert.equal(result.contexts[0].sid, platform.platform('root').published.sid);
  assert.equal(
    result.chain[0].context.sid,
    platform.platform('recommendations').published.sid,
  );
  assert.equal(result.chain[1].context.sid, result.chain[0].context.sid);
  assert.ok(
    result.chain[0].props.defaultPreferences,
    'provider defaults survive normalization',
  );
  assert.equal(
    result.chain[0].props.greeting,
    '一些可能适合你的新发现',
    'parent props augment provider defaults',
  );

  await service.discoverApplications({
    pathname: '/recommendations/detail/p001',
  });
  assert.equal(
    requests.length,
    2,
    'completed metadata is reused without another request',
  );
});

test('fixed C full/ondemand uses copied root contexts after the independent C platform publishes v2', async () => {
  for (const delivery of ['full', 'ondemand'] as const) {
    const { platform, fetcher, requests } = await fixture();
    await platform.publish('root', {
      ...platform.platform('root').published.config,
      recommendationMode: 'fixed',
      delivery,
    } as RootConfig);
    const service = new ApplicationsService({
      endpoint: rootEndpoint,
      fetcher,
    });
    const initial = await service.discoverApplications({ pathname: '/' });
    assert.equal(
      service
        .getContexts()
        .some((context) => context.consumerKey === 'root-copy-details'),
      delivery === 'full',
    );
    await platform.publish('recommendations', {
      ...platform.platform('recommendations').published.config,
      version: 'v2',
    } as RecommendationsConfig);
    const result = await service.discoverApplications({
      pathname: '/recommendations/detail/p001',
    });

    assert.deepEqual(
      result.chain.map((app) => app.provider.name),
      ['recommendations_v1', 'details'],
    );
    assert.ok(requests.every((request) => request.endpoint === rootEndpoint));
    assert.ok(
      result.chain.every((app) => app.context.sid === initial.contexts[0].sid),
    );
    assert.deepEqual(
      result.chain.map((app) => app.context.consumerKey),
      ['root-copy-recommendations', 'root-copy-details'],
    );
    assert.equal(requests.at(-1)?.params.sid, initial.contexts[0].sid);
  }
});

test('different pathnames are queried separately; reload checks accepted sids rather than selecting latest', async () => {
  const { platform, fetcher, requests } = await fixture();
  const service = new ApplicationsService({ endpoint: rootEndpoint, fetcher });
  await service.discoverApplications({ pathname: '/recommendations' });
  const rootSid = platform.platform('root').published.sid;
  const childSid = platform.platform('recommendations').published.sid;
  await service.discoverApplications({
    pathname: '/recommendations/detail/p001',
  });
  assert.equal(requests.length, 4);
  assert.equal(requests[2].params.sid, rootSid);
  assert.equal(requests[3].params.sid, childSid);
  await service.discoverApplications({
    pathname: '/recommendations/detail/p001',
    cache: 'reload',
  });
  assert.equal(
    requests.length,
    6,
    'same-response fixed descendants do not cause redundant requests',
  );
  assert.equal(requests[4].params.sid, rootSid);
  assert.equal(requests[5].params.sid, childSid);
});

test('expiration fires once, rejects the operation, and cannot be bypassed by previously successful cache', async () => {
  const { platform, fetcher, requests } = await fixture();
  const events: SnapshotExpiredError[] = [];
  const service = new ApplicationsService({
    endpoint: rootEndpoint,
    fetcher,
    onExpired: (error) => {
      events.push(error);
    },
  });
  const accepted = await service.discoverApplications({
    pathname: '/recommendations',
  });
  const oldSid = accepted.chain[0].context.sid;
  await platform.publish('recommendations', {
    ...platform.platform('recommendations').published.config,
    version: 'v2',
  } as RecommendationsConfig);

  await assert.rejects(
    service.discoverApplications({
      pathname: '/recommendations',
      cache: 'reload',
    }),
    (error: unknown) =>
      error instanceof SnapshotExpiredError &&
      error.expectedSid === oldSid &&
      error.consumerKey === 'recommendations',
  );
  const countAfterExpiry = requests.length;
  await assert.rejects(
    service.discoverApplications({ pathname: '/recommendations' }),
    SnapshotExpiredError,
  );
  assert.equal(
    requests.length,
    countAfterExpiry,
    'expired contexts do not enter retry loops',
  );
  assert.equal(events.length, 1);
  assert.equal(
    service
      .getContexts()
      .find((context) => context.consumerKey === 'recommendations')?.sid,
    oldSid,
  );
  assert.equal(
    (await service.discoverApplications({ pathname: '/catalog' })).chain[0]
      .provider.name,
    'catalog',
    'unrelated applications remain usable',
  );

  const refreshed = new ApplicationsService({
    endpoint: rootEndpoint,
    fetcher,
  });
  const current = await refreshed.discoverApplications({
    pathname: '/recommendations',
  });
  assert.equal(current.chain[0].provider.name, 'recommendations_v2');
  assert.equal(
    current.contexts[0].sid,
    accepted.contexts[0].sid,
    'independent publication does not update A',
  );
});

test('same-path concurrent subscribers share requests and one abort does not cancel the other', async () => {
  const { fetcher, requests } = await fixture();
  const held = gate();
  let starts = 0;
  const delayed: typeof fetch = async (...args) => {
    starts++;
    await held.promise;
    return fetcher(...args);
  };
  const service = new ApplicationsService({
    endpoint: rootEndpoint,
    fetcher: delayed,
  });
  const controller = new AbortController();
  const cancelled = service.discoverApplications({
    pathname: '/recommendations',
    signal: controller.signal,
  });
  const surviving = service.discoverApplications({
    pathname: '/recommendations',
  });
  controller.abort();
  await assert.rejects(
    cancelled,
    (error: unknown) => error instanceof Error && error.name === 'AbortError',
  );
  assert.equal(starts, 1);
  held.release();
  assert.equal((await surviving).chain[0].provider.name, 'recommendations_v1');
  assert.equal(requests.length, 2);
});

test('concurrent expiration notifications coalesce and a throwing hook does not replace the protocol error', async () => {
  const { platform, fetcher } = await fixture();
  let notifications = 0;
  const service = new ApplicationsService({
    endpoint: rootEndpoint,
    fetcher,
    onExpired: () => {
      notifications++;
      throw new Error('UI hook failed');
    },
  });
  await service.discoverApplications({ pathname: '/recommendations' });
  await platform.publish('recommendations', {
    ...platform.platform('recommendations').published.config,
    version: 'v2',
  } as RecommendationsConfig);
  const results = await Promise.allSettled([
    service.discoverApplications({
      pathname: '/recommendations',
      cache: 'reload',
    }),
    service.discoverApplications({
      pathname: '/recommendations',
      cache: 'reload',
    }),
  ]);
  assert.ok(
    results.every(
      (result) =>
        result.status === 'rejected' &&
        result.reason instanceof SnapshotExpiredError,
    ),
  );
  assert.equal(notifications, 1);
});

test('a network failure is not remembered as a completed path and can be retried', async () => {
  const { fetcher, requests } = await fixture();
  let fail = true;
  const unreliable: typeof fetch = async (...args) => {
    if (fail) {
      fail = false;
      throw new TypeError('Network unavailable');
    }
    return fetcher(...args);
  };
  const service = new ApplicationsService({
    endpoint: rootEndpoint,
    fetcher: unreliable,
  });
  await assert.rejects(
    service.discoverApplications({ pathname: '/catalog' }),
    /Network unavailable/,
  );
  assert.deepEqual(service.getContexts(), []);
  assert.equal(
    (await service.discoverApplications({ pathname: '/catalog' })).chain[0]
      .provider.name,
    'catalog',
  );
  assert.equal(requests.length, 1);
});

test('a nominal 200 response cannot silently change an accepted sid', async () => {
  const { fetcher } = await fixture();
  let replace = false;
  const misleading: typeof fetch = async (...args) => {
    const body = (await (await fetcher(...args)).json()) as DiscoveryResult;
    if (replace) body.sid = 'unexpected-new-generation';
    return Response.json(body);
  };
  const service = new ApplicationsService({
    endpoint: rootEndpoint,
    fetcher: misleading,
  });
  const initial = await service.discoverApplications({ pathname: '/catalog' });
  replace = true;
  await assert.rejects(
    service.discoverApplications({ pathname: '/catalog', cache: 'reload' }),
    SnapshotExpiredError,
  );
  assert.equal(service.getContexts()[0].sid, initial.contexts[0].sid);
});

test('relative nested bindings work after the root mount path changes', async () => {
  const { platform, fetcher, requests } = await fixture();
  const config = platform.platform('root').published.config as RootConfig;
  config.entries.recommendations.path = '/personal/picks';
  await platform.publish('root', config);
  const service = new ApplicationsService({ endpoint: rootEndpoint, fetcher });
  const result = await service.discoverApplications({
    pathname: '/personal/picks/detail/p002',
  });
  assert.deepEqual(
    result.chain.map((app) => app.basename),
    ['/personal/picks', '/personal/picks/detail'],
  );
  assert.equal(requests[1].params.basename, '/personal/picks');
  assert.deepEqual(
    (await service.discoverApplications({ pathname: '/personal/picksville' }))
      .chain,
    [],
  );
});

test('responses cannot smuggle contexts belonging to an independent source into the fixed closure', async () => {
  const { fetcher } = await fixture();
  const invalidClosure: typeof fetch = async (...args) => {
    const body = (await (await fetcher(...args)).json()) as DiscoveryResult;
    body.contexts.push({
      ...structuredClone(body),
      endpoint: recommendationsEndpoint,
      consumerKey: 'foreign',
    });
    return Response.json(body);
  };
  const service = new ApplicationsService({
    endpoint: rootEndpoint,
    fetcher: invalidClosure,
  });
  await assert.rejects(
    service.discoverApplications({ pathname: '/' }),
    (error: unknown) =>
      error instanceof DiscoveryError && error.code === 'INVALID_DISCOVERY',
  );
  assert.deepEqual(
    service.getContexts(),
    [],
    'partial invalid payloads are never committed',
  );
});

test('already aborted callers do not start discovery or trigger the expiry hook', async () => {
  const { fetcher, requests } = await fixture();
  let expired = 0;
  const service = new ApplicationsService({
    endpoint: rootEndpoint,
    fetcher,
    onExpired: () => {
      expired++;
    },
  });
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    service.discoverApplications({ pathname: '/', signal: controller.signal }),
    (error: unknown) => error instanceof Error && error.name === 'AbortError',
  );
  assert.equal(requests.length, 0);
  assert.equal(expired, 0);
});

test('a child key learned on first discovery is reused with its accepted sid', async () => {
  const { fetcher, requests } = await fixture();
  const withoutChildKey: typeof fetch = async (...args) => {
    const response = await fetcher(...args);
    const body = (await response.json()) as DiscoveryResult;
    if (String(args[0]) === rootEndpoint) {
      for (const binding of body.bindings) {
        if (binding.mode === 'dynamic') delete binding.consumerKey;
      }
    }
    return Response.json(body, { status: response.status });
  };
  const service = new ApplicationsService({
    endpoint: rootEndpoint,
    fetcher: withoutChildKey,
  });
  const initial = await service.discoverApplications({
    pathname: '/recommendations',
  });
  assert.equal(requests[1].params.consumerKey, undefined);
  await service.discoverApplications({
    pathname: '/recommendations/detail/p001',
  });
  assert.equal(requests[3].params.consumerKey, 'recommendations');
  assert.equal(requests[3].params.sid, initial.chain[0].context.sid);
});

test('a late successful response cannot submit metadata after another request expires its context', async () => {
  const { fetcher, platform } = await fixture();
  const ready = gate();
  const release = gate();
  const delayed: typeof fetch = async (...args) => {
    const response = await fetcher(...args);
    const params = JSON.parse(String(args[1]?.body)) as DiscoveryParams;
    if (
      String(args[0]) === recommendationsEndpoint &&
      params.pathname === '/recommendations/detail/p001'
    ) {
      ready.release();
      await release.promise;
    }
    return response;
  };
  const service = new ApplicationsService({
    endpoint: rootEndpoint,
    fetcher: delayed,
  });
  await service.discoverApplications({ pathname: '/recommendations' });
  const pending = service.discoverApplications({
    pathname: '/recommendations/detail/p001',
  });
  await ready.promise;
  await platform.publish('recommendations', {
    ...platform.platform('recommendations').published.config,
    version: 'v2',
  } as RecommendationsConfig);
  await assert.rejects(
    service.discoverApplications({
      pathname: '/recommendations',
      cache: 'reload',
    }),
    SnapshotExpiredError,
  );
  release.release();
  await assert.rejects(pending, SnapshotExpiredError);
  assert.equal(
    service
      .getContexts()
      .find((context) => context.consumerKey === 'recommendations')
      ?.loadedPaths.includes('/recommendations/detail/p001'),
    false,
  );
});
