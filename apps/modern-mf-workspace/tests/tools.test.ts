import assert from 'node:assert/strict';
import { setImmediate } from 'node:timers/promises';
import { test } from 'node:test';
import { ToolRegistry } from '../src/runtime/tools.ts';
import type { NativeModelContext } from '../src/runtime/tools.ts';
import type { RemoteContext, RemoteTool } from '../src/remotes/types.ts';
import type { Json, ToolDeclaration } from '../shared/contracts.ts';

const endpoint = '/api/discovery/recommendations';
const rootEndpoint = '/api/discovery/root';
const declaration: ToolDeclaration = {
  name: 'set_value',
  description: 'Update this instance value',
  inputSchema: {
    type: 'object',
    properties: { value: { type: 'integer', minimum: 0, maximum: 10 } },
    required: ['value'],
    additionalProperties: false,
  },
};

function context(overrides: Partial<RemoteContext> = {}): RemoteContext {
  return {
    endpoint,
    consumerKey: 'recommendations',
    sid: 'c1',
    mountId: 'mount_c',
    basename: '/recommendations',
    providerName: 'recommendations_v1',
    version: '1.0.0',
    ...overrides,
  };
}

function tool(execute: RemoteTool['execute'] = (input) => input): RemoteTool {
  return { ...structuredClone(declaration), execute };
}

function gate() {
  let release!: () => void;
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}

type NativeDefinition = Record<string, unknown> & {
  name: string;
  execute(
    input: Record<string, Json>,
    options?: { signal?: AbortSignal },
  ): Promise<unknown>;
};

/** A transport double, not a claim that the Node runtime implements native WebMCP. */
function nativeTransport() {
  const entries = new Map<string, NativeDefinition>();
  const calls: string[] = [];
  const state: {
    failAfterExecution?: boolean;
    errorResult?: boolean;
    registrationGate?: ReturnType<typeof gate>;
    registrationStarted?: ReturnType<typeof gate>;
  } = {};
  const native: NativeModelContext = {
    async registerTool(definition, options) {
      const entry = definition as NativeDefinition;
      if (entry.name.startsWith('mf_') && state.registrationGate) {
        state.registrationStarted?.release();
        await state.registrationGate.promise;
      }
      options?.signal?.throwIfAborted();
      entries.set(entry.name, entry);
      options?.signal?.addEventListener(
        'abort',
        () => entries.delete(entry.name),
        { once: true },
      );
    },
    async getTools() {
      return [...entries.keys()].map((name) => ({ name }));
    },
    async executeTool(registered, input, options) {
      const entry = entries.get(registered.name);
      if (!entry) throw new Error('native tool was unregistered');
      calls.push(registered.name);
      const result = await entry.execute(input, options);
      if (registered.name.startsWith('mf_')) {
        if (state.failAfterExecution)
          throw new Error('native transport failed after execution');
        if (state.errorResult)
          return {
            isError: true,
            content: [{ type: 'text', text: 'native business failure' }],
          };
      }
      return result;
    },
  };
  return { native, entries, calls, state };
}

test('schema mismatch is visible and blocks execution; disabled declarations do not register', async () => {
  let calls = 0;
  const registry = new ToolRegistry(() => {}, null);
  const mismatched = tool(() => {
    calls++;
    return {};
  });
  mismatched.inputSchema = {
    type: 'object',
    properties: {},
    additionalProperties: false,
  };
  const dispose = registry.register(context(), [mismatched], [declaration]);
  const handle = registry.list()[0];
  assert.equal(handle.status, 'error');
  assert.match(handle.error!, /Schema/);
  await assert.rejects(
    registry.execute(handle.name, { value: 3 }),
    /TOOL_UNAVAILABLE.*Schema/,
  );
  assert.equal(calls, 0);
  dispose();
  registry.register(context(), [tool()], []);
  assert.deepEqual(registry.list(), []);
});

test('schema validation rejects missing, extra and out-of-range input before side effects', async () => {
  let calls = 0;
  const registry = new ToolRegistry(() => {}, null);
  registry.register(
    context(),
    [
      tool((input) => {
        calls++;
        return input;
      }),
    ],
    [declaration],
  );
  const name = registry.list()[0].name;
  await assert.rejects(registry.execute(name, {}), /必填/);
  await assert.rejects(registry.execute(name, { value: 12 }), /允许范围/);
  await assert.rejects(
    registry.execute(name, { value: 2, extra: true }),
    /不是已声明参数/,
  );
  await assert.rejects(
    registry.execute(name, Object.create({ value: 2 }) as Record<string, Json>),
    /必填/,
  );
  assert.equal(calls, 0);
  assert.deepEqual(await registry.execute(name, { value: 2 }), { value: 2 });
  assert.equal(calls, 1);
});

test('a bad registration batch does not leave previously installed tools behind', () => {
  const registry = new ToolRegistry(() => {}, null);
  assert.throws(
    () => registry.register(context(), [tool(), tool()], [declaration]),
    /重复/,
  );
  assert.deepEqual(registry.list(), []);
});

test('an old name stays retired even when the same mount and local name register again', async () => {
  let oldCalls = 0;
  let newCalls = 0;
  const registry = new ToolRegistry(() => {}, null);
  const dispose = registry.register(
    context(),
    [
      tool(() => {
        oldCalls++;
        return {};
      }),
    ],
    [declaration],
  );
  const oldName = registry.list()[0].name;
  dispose();
  dispose();
  registry.register(
    context(),
    [
      tool(() => {
        newCalls++;
        return {};
      }),
    ],
    [declaration],
  );
  const newName = registry.list()[0].name;
  assert.notEqual(newName, oldName);
  await assert.rejects(
    registry.execute(oldName, { value: 1 }),
    /TOOL_INSTANCE_EXPIRED/,
  );
  await registry.execute(newName, { value: 1 });
  assert.equal(oldCalls, 0);
  assert.equal(newCalls, 1);
});

test('unmount discards a pending result and never redirects it to a replacement instance', async () => {
  const pending = gate();
  const events: string[] = [];
  const registry = new ToolRegistry((event) => {
    events.push(event);
  }, null);
  const dispose = registry.register(
    context(),
    [
      tool(async () => {
        await pending.promise;
        return { old: true };
      }),
    ],
    [declaration],
  );
  const operation = registry.execute(registry.list()[0].name, { value: 1 });
  dispose();
  registry.register(
    context(),
    [tool(() => ({ replacement: true }))],
    [declaration],
  );
  pending.release();
  await assert.rejects(operation, /TOOL_INSTANCE_EXPIRED/);
  assert.equal(events.filter((event) => event === 'tool.result').length, 0);
  assert.deepEqual(
    await registry.execute(registry.list()[0].name, { value: 1 }),
    { replacement: true },
  );
});

test('two mounts with the same local tool name only modify their own state', async () => {
  const state = { left: 0, right: 0 };
  const registry = new ToolRegistry(() => {}, null);
  const left = registry.register(
    context({ mountId: 'left' }),
    [
      tool((input) => {
        state.left = Number(input.value);
        return state.left;
      }),
    ],
    [declaration],
  );
  registry.register(
    context({ mountId: 'right' }),
    [
      tool((input) => {
        state.right = Number(input.value);
        return state.right;
      }),
    ],
    [declaration],
  );
  const handles = registry.list();
  await registry.execute(
    handles.find((handle) => handle.context.mountId === 'left')!.name,
    { value: 7 },
  );
  assert.deepEqual(state, { left: 7, right: 0 });
  left();
  await registry.execute(registry.list()[0].name, { value: 4 });
  assert.deepEqual(state, { left: 7, right: 4 });
});

test('C expiration pauses different child consumer keys in the same source generation', async () => {
  const registry = new ToolRegistry(() => {}, null);
  registry.register(context(), [tool()], [declaration]);
  registry.register(
    context({
      mountId: 'mount_d',
      consumerKey: 'recommendations-details',
      providerName: 'details',
    }),
    [tool()],
    [declaration],
  );
  registry.register(
    context({
      mountId: 'mount_b',
      endpoint: rootEndpoint,
      consumerKey: 'root',
      sid: 'a1',
    }),
    [tool()],
    [declaration],
  );
  registry.register(
    context({
      mountId: 'other_source',
      endpoint: '/other',
      consumerKey: 'recommendations-details',
    }),
    [tool()],
    [declaration],
  );
  registry.expire(endpoint, 'recommendations', 'c1');
  for (const handle of registry.list()) {
    if (handle.context.endpoint === endpoint) {
      assert.equal(handle.status, 'expired');
      await assert.rejects(
        registry.execute(handle.name, { value: 1 }),
        /TOOL_INSTANCE_EXPIRED/,
      );
    } else
      assert.deepEqual(await registry.execute(handle.name, { value: 1 }), {
        value: 1,
      });
  }
});

test('fixed copied C/D expire with the root even when no tool is registered for the root key', async () => {
  const registry = new ToolRegistry(() => {}, null);
  for (const consumerKey of [
    'root-copy-recommendations',
    'root-copy-details',
  ]) {
    registry.register(
      context({
        endpoint: rootEndpoint,
        sid: 'a1',
        consumerKey,
        mountId: consumerKey,
      }),
      [tool()],
      [declaration],
    );
  }
  registry.expire(rootEndpoint, 'root', 'a1');
  assert.ok(registry.list().every((handle) => handle.status === 'expired'));
  registry.register(
    context({
      endpoint: rootEndpoint,
      sid: 'a1',
      consumerKey: 'root-copy-late',
      mountId: 'late',
    }),
    [tool()],
    [declaration],
  );
  const late = registry
    .list()
    .find((handle) => handle.context.mountId === 'late')!;
  assert.equal(late.status, 'expired');
  await assert.rejects(
    registry.execute(late.name, { value: 1 }),
    /TOOL_INSTANCE_EXPIRED/,
  );
  registry.register(
    context({
      endpoint: rootEndpoint,
      sid: 'a2',
      consumerKey: 'root-copy-new',
      mountId: 'new_generation',
    }),
    [tool()],
    [declaration],
  );
  assert.equal(
    registry.list().at(-1)?.status,
    'ready',
    'expiration is scoped to a generation, not every future result from the endpoint',
  );
});

test('expiration discards an already running child result', async () => {
  const pending = gate();
  const registry = new ToolRegistry(() => {}, null);
  registry.register(
    context({ consumerKey: 'recommendations-details' }),
    [
      tool(async () => {
        await pending.promise;
        return { stale: true };
      }),
    ],
    [declaration],
  );
  const operation = registry.execute(registry.list()[0].name, { value: 1 });
  registry.expire(endpoint, 'recommendations', 'c1');
  pending.release();
  await assert.rejects(operation, /TOOL_INSTANCE_EXPIRED/);
});

test('native business failure never falls back and replays an already executed operation', async () => {
  const transport = nativeTransport();
  const registry = new ToolRegistry(() => {}, transport.native);
  await registry.initialize();
  assert.equal(registry.mode, 'native');
  let sideEffects = 0;
  registry.register(
    context(),
    [
      tool(() => {
        sideEffects++;
        return {};
      }),
    ],
    [declaration],
  );
  await registry.waitFor('recommendations_v1');
  transport.state.failAfterExecution = true;
  await assert.rejects(
    registry.execute(registry.list()[0].name, { value: 1 }),
    /native transport failed/,
  );
  assert.equal(sideEffects, 1);
  assert.equal(
    transport.calls.filter((name) => name.startsWith('mf_')).length,
    1,
  );
  assert.equal(registry.mode, 'native');
});

test('native isError results reject instead of being reported as successful business data', async () => {
  const transport = nativeTransport();
  const registry = new ToolRegistry(() => {}, transport.native);
  await registry.initialize();
  registry.register(context(), [tool()], [declaration]);
  await registry.waitFor('recommendations_v1');
  transport.state.errorResult = true;
  await assert.rejects(
    registry.execute(registry.list()[0].name, { value: 1 }),
    /native business failure/,
  );
  assert.equal(registry.mode, 'native');
});

test('late native registration cannot revive an expired generation', async () => {
  const transport = nativeTransport();
  const registry = new ToolRegistry(() => {}, transport.native);
  await registry.initialize();
  transport.state.registrationGate = gate();
  transport.state.registrationStarted = gate();
  registry.register(context(), [tool()], [declaration]);
  const handle = registry.list()[0];
  await transport.state.registrationStarted.promise;
  registry.expire(endpoint, 'recommendations', 'c1');
  transport.state.registrationGate.release();
  await setImmediate();
  assert.equal(handle.status, 'expired');
  assert.equal(transport.entries.has(handle.name), false);
  await assert.rejects(
    registry.execute(handle.name, { value: 1 }),
    /TOOL_INSTANCE_EXPIRED/,
  );
});

test('native calls receive cancellation and cannot publish a late successful result', async () => {
  const transport = nativeTransport();
  const registry = new ToolRegistry(() => {}, transport.native);
  await registry.initialize();
  const pending = gate();
  const started = gate();
  let executionSignal: AbortSignal | undefined;
  registry.register(
    context(),
    [
      tool(async (_input, options) => {
        executionSignal = options?.signal;
        started.release();
        await pending.promise;
        return { complete: true };
      }),
    ],
    [declaration],
  );
  await registry.waitFor('recommendations_v1');
  const controller = new AbortController();
  const operation = registry.execute(
    registry.list()[0].name,
    { value: 1 },
    controller.signal,
  );
  await started.promise;
  controller.abort();
  assert.equal(executionSignal?.aborted, true);
  pending.release();
  await assert.rejects(
    operation,
    (error: unknown) => error instanceof Error && error.name === 'AbortError',
  );
  assert.equal(
    registry.list()[0].status,
    'ready',
    'cancelling a call does not retire its mounted instance',
  );
});

test('native probe failure requires explicit local fallback and does not leave the probe registered', async () => {
  const transport = nativeTransport();
  transport.native.getTools = async () => {
    throw new Error('enumeration unavailable');
  };
  const registry = new ToolRegistry(() => {}, transport.native);
  await Promise.all([registry.initialize(), registry.initialize()]);
  assert.equal(registry.mode, 'unavailable');
  assert.equal(transport.entries.size, 0);
  registry.useLocalFallback();
  assert.equal(registry.mode, 'local');
  registry.register(context(), [tool()], [declaration]);
  assert.deepEqual(
    await registry.execute(registry.list()[0].name, { value: 1 }),
    { value: 1 },
  );
});
