import React, { forwardRef, memo, useState } from 'react';
import { act, render, screen } from '@testing-library/react';
import { helpers } from '@module-federation/enhanced/runtime';
import { createReactRemote, ReactRemote } from '../src/reactRemote';
import { snapshotRuntime } from './reactRemote-runtime-utils';
import { remoteRuntime } from './reactRemote-utils';

beforeEach(() => helpers.global.resetFederationGlobalInfo());

const Stateful = ({ label }: { label: string }) => {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      {label} {count}
    </button>
  );
};

describe('remote callback inputs', () => {
  it.each(['namespace', 'default', 'memo', 'forwardRef'])(
    'retains the exact preloaded %s without calling it outside React',
    async (kind) => {
      const Component =
        kind === 'memo'
          ? memo(Stateful)
          : kind === 'forwardRef'
            ? forwardRef<HTMLButtonElement, { label: string }>(
                (props, _ref) => <Stateful {...props} />,
              )
            : Stateful;
      const raw = Object.freeze({ default: Component });
      const runtime = snapshotRuntime({ module: raw, render: 'component' });
      const preloaded =
        await runtime.instance.loadRemote<typeof raw>('alias/Card');
      const loader = jest.fn(() =>
        kind === 'namespace' ? preloaded : preloaded!.default,
      );
      const Remote = createReactRemote<{ label: string }>({
        remote: loader,
        instance: runtime.instance,
      });
      const view = render(<Remote label="before" />);
      const button = await screen.findByRole('button', { name: 'before 0' });
      act(() => button.click());
      view.rerender(<Remote label="after" />);
      await screen.findByRole('button', { name: 'after 1' });
      expect(loader).toHaveBeenCalledTimes(1);
      expect(runtime.beforeRequest).toHaveBeenCalledTimes(1);
      expect(runtime.afterResolve).toHaveBeenCalledTimes(1);
      expect(preloaded).toBe(raw);
      expect(Object.getOwnPropertySymbols(raw)).toEqual([]);
    },
  );

  it('supports concurrent async namespace and default callbacks without resolving twice', async () => {
    const first = snapshotRuntime({ module: { default: () => <p>first</p> } });
    const second = snapshotRuntime({
      module: { default: () => <p>second</p> },
    });
    const a = jest.fn(() => first.instance.loadRemote('alias/Card'));
    const b = jest.fn(
      async () =>
        (await second.instance.loadRemote<{ default: React.ComponentType }>(
          'alias/Card',
        ))!.default,
    );
    render(
      <>
        <ReactRemote remote={a} instance={first.instance} />
        <ReactRemote remote={b} instance={second.instance} />
      </>,
    );
    await screen.findByText('first');
    await screen.findByText('second');
    for (const runtime of [first, second])
      expect(runtime.afterResolve).toHaveBeenCalledTimes(1);
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });

  it('retries a rejected callback once with a fresh attempt', async () => {
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const runtime = snapshotRuntime({
        module: { default: () => <p>recovered callback</p> },
      });
      const loader = jest
        .fn()
        .mockRejectedValueOnce(new Error('callback failed'))
        .mockImplementation(() => runtime.instance.loadRemote('alias/Card'));
      render(
        <ReactRemote
          remote={loader}
          instance={runtime.instance}
          fallback={({ error, retry }) => (
            <button onClick={retry}>{error.message}</button>
          )}
        />,
      );
      const retry = await screen.findByRole('button', {
        name: 'callback failed',
      });
      act(() => retry.click());
      await screen.findByText('recovered callback');
      expect(loader).toHaveBeenCalledTimes(2);
      expect(runtime.afterResolve).toHaveBeenCalledTimes(1);
    } finally {
      errors.mockRestore();
    }
  });

  it('rejects a preloaded object belonging only to another runtime instance', async () => {
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const first = snapshotRuntime({
        module: { default: () => <p>wrong source</p> },
      });
      const second = snapshotRuntime({ module: { default: () => null } });
      const value = await first.instance.loadRemote('alias/Card');
      render(
        <ReactRemote
          remote={() => value}
          instance={second.instance}
          fallback={({ error }) => <p>{error.message}</p>}
        />,
      );
      await screen.findByText(
        /no MF module identity for this runtime instance/,
      );
      expect(second.afterResolve).not.toHaveBeenCalled();
    } finally {
      errors.mockRestore();
    }
  });

  it('keeps legacy namespace identity compatibility without requiring a sidecar', async () => {
    const raw = {
      default: () => <p>legacy namespace</p>,
      [Symbol.for('mf_module_id')]: 'shop/Card',
    };
    const runtime = remoteRuntime(raw);
    await runtime.loadRemote('shop/Card');
    const loader = jest.fn(() => raw);
    render(<ReactRemote remote={loader} instance={runtime.instance} />);
    await screen.findByText('legacy namespace');
    expect(loader).toHaveBeenCalledTimes(1);
    expect(runtime.getRemoteModuleAndOptions).toHaveBeenCalledTimes(1);
    expect(runtime.loadRemote).toHaveBeenCalledTimes(1);
  });
});

it('initializes data fetching for a truly preloaded component without replaying its load', async () => {
  globalThis.__MF_DATA_FETCH_MAP__ = undefined;
  const dataFetch = jest.fn(async () => ({ weather: 'sunny' }));
  const raw = {
    default: ({ mfData }: { mfData?: { weather: string } }) => (
      <p>{mfData?.weather}</p>
    ),
  };
  const runtime = snapshotRuntime({ module: raw, dataFetch });
  const preloaded = await runtime.instance.loadRemote<typeof raw>('alias/Card');
  expect(globalThis.__MF_DATA_FETCH_MAP__).toBeUndefined();
  const loader = jest.fn(() => preloaded!.default);
  render(<ReactRemote remote={loader} instance={runtime.instance} />);
  await screen.findByText('sunny');
  expect(dataFetch).toHaveBeenCalledTimes(1);
  expect(loader).toHaveBeenCalledTimes(1);
  expect(runtime.factory).toHaveBeenCalledTimes(1);
  expect(
    runtime.afterResolve.mock.calls.filter(
      ([args]) => args.expose === './Card',
    ),
  ).toHaveLength(1);
});

it.each(['namespace', 'default'])(
  'consumes a deferred plugin factory decorated %s',
  async (kind) => {
    const original = { default: () => <p>original export</p> };
    const Decorated = () => <p>decorated static import</p>;
    const decorated = Object.freeze({ default: Decorated });
    const runtime = snapshotRuntime({ module: original });
    runtime.instance.registerPlugins([
      {
        name: 'decorate-static-factory',
        onLoad: ({ exposeModuleFactory }) =>
          exposeModuleFactory
            ? () => {
                exposeModuleFactory();
                return decorated;
              }
            : undefined,
      },
    ]);
    const factory = await runtime.instance.loadRemote<() => typeof decorated>(
      'alias/Card',
      { loadFactory: false },
    );
    const preloaded = factory!();
    const loader = jest.fn(() =>
      kind === 'namespace' ? preloaded : preloaded.default,
    );
    render(<ReactRemote remote={loader} instance={runtime.instance} />);
    await screen.findByText('decorated static import');
    expect(loader).toHaveBeenCalledTimes(1);
    expect(runtime.afterResolve).toHaveBeenCalledTimes(1);
    expect(runtime.factory).toHaveBeenCalledTimes(1);
  },
);

it('identifies only the selected export of a synthetic interop namespace', async () => {
  const a = { default: () => <p>interop default</p> };
  const b = { default: () => <p>interop named</p> };
  const runtime = snapshotRuntime({ module: a });
  runtime.get.mockImplementation(
    (expose: string) => () => (expose === './Other' ? b : a),
  );
  await runtime.instance.loadRemote('alias/Card');
  await runtime.instance.loadRemote('alias/Other');
  const interop = Object.freeze({
    get default() {
      return a.default;
    },
    get Named() {
      return b.default;
    },
  });
  render(
    <>
      <ReactRemote remote={() => interop} instance={runtime.instance} />
      <ReactRemote
        remote={() => interop}
        exportName="Named"
        instance={runtime.instance}
      />
    </>,
  );
  await screen.findByText('interop default');
  await screen.findByText('interop named');
  expect(runtime.afterResolve).toHaveBeenCalledTimes(2);
});

it('renders runtime loader recovery values through callback inputs', async () => {
  const fallback = { default: () => <p>runtime callback recovery</p> };
  const runtime = snapshotRuntime({ module: {} });
  runtime.instance.registerPlugins([
    {
      name: 'recover-callback',
      errorLoadRemote: ({ lifecycle }) =>
        lifecycle === 'onLoad' ? fallback : undefined,
    },
  ]);
  const loader = jest.fn(() => runtime.instance.loadRemote('missing/Card'));
  render(<ReactRemote remote={loader} instance={runtime.instance} />);
  await screen.findByText('runtime callback recovery');
  expect(loader).toHaveBeenCalledTimes(1);
  expect(runtime.afterResolve).not.toHaveBeenCalled();
});
