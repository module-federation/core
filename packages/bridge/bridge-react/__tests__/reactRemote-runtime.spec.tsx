import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { helpers } from '@module-federation/enhanced/runtime';
import { ReactRemote } from '../src/reactRemote';
import { snapshotRuntime } from './reactRemote-runtime-utils';

const provider = () => ({
  default: () => ({
    render({ dom }: { dom: HTMLElement }) {
      dom.textContent = 'platform bridge';
    },
    destroy() {},
  }),
});

beforeEach(() => helpers.global.resetFederationGlobalInfo());

describe('React remote runtime snapshot resolution', () => {
  it.each([false, true])(
    'selects the platform snapshot once through the normal lifecycle (global: %s)',
    async (globalSnapshot) => {
      const runtime = snapshotRuntime({
        module: provider(),
        render: 'bridge',
        globalSnapshot,
      });
      const view = render(
        <ReactRemote remote="alias/Card" instance={runtime.instance} />,
      );
      await screen.findByText('platform bridge');
      expect(runtime.beforeRequest).toHaveBeenCalledTimes(1);
      expect(runtime.loadSnapshot).toHaveBeenCalledTimes(1);
      expect(runtime.afterResolve).toHaveBeenCalledTimes(1);
      expect(
        runtime.loadSnapshot.mock.calls[0][0].remoteSnapshot?.version,
      ).toBe(globalSnapshot ? 'selected' : undefined);
      expect(runtime.events).toEqual(['afterResolve', 'factory']);
      expect(runtime.onLoad).toHaveBeenCalledTimes(1);
      expect(runtime.afterLoadRemote).toHaveBeenCalledTimes(1);
      await act(async () => view.unmount());
    },
  );

  it('uses the rewritten request and expose from beforeRequest', async () => {
    const runtime = snapshotRuntime({ module: provider(), render: 'bridge' });
    runtime.snapshot.modules[0].moduleName = 'Selected';
    runtime.snapshot.modules[0].modulePath = './Selected';
    runtime.beforeRequest.mockImplementation((args) => ({
      ...args,
      id: `${runtime.name}/Selected`,
    }));
    const view = render(
      <ReactRemote remote="deployment/Card" instance={runtime.instance} />,
    );
    await screen.findByText('platform bridge');
    expect(runtime.get).toHaveBeenCalledWith('./Selected');
    expect(runtime.beforeRequest).toHaveBeenCalledTimes(1);
    expect(runtime.onLoad).toHaveBeenCalledWith(
      expect.objectContaining({ id: `${runtime.name}/Selected` }),
    );
    await act(async () => view.unmount());
  });

  it('uses the final afterResolve snapshot even for a pure entry URL', async () => {
    const runtime = snapshotRuntime({
      module: provider(),
      pureEntry: true,
      render: 'bridge',
    });
    // Registered later: the consumer must not retain an earlier hook's result.
    runtime.instance.registerPlugins([
      {
        name: 'late-platform-resolution',
        afterResolve: async (args) => ({
          ...args,
          remoteSnapshot: runtime.snapshot,
        }),
      },
    ]);
    const view = render(
      <ReactRemote remote="alias/Card" instance={runtime.instance} />,
    );
    await screen.findByText('platform bridge');
    expect(runtime.loadSnapshot).not.toHaveBeenCalled();
    expect(runtime.afterResolve).toHaveBeenCalledTimes(1);
    await act(async () => view.unmount());
  });

  it.each(['component', 'bridge'] as const)(
    'preserves pure entry compatibility without a snapshot (%s)',
    async (renderHint) => {
      const runtime = snapshotRuntime({
        pureEntry: true,
        module:
          renderHint === 'bridge'
            ? provider()
            : { default: () => <p>legacy component</p> },
      });
      const view = render(
        <ReactRemote
          remote="alias/Card"
          instance={runtime.instance}
          render={renderHint === 'bridge' ? renderHint : undefined}
        />,
      );
      await screen.findByText(
        renderHint === 'bridge' ? 'platform bridge' : 'legacy component',
      );
      expect(runtime.loadSnapshot).not.toHaveBeenCalled();
      expect(runtime.beforeRequest).toHaveBeenCalledTimes(1);
      await act(async () => view.unmount());
    },
  );

  it('rejects Service App metadata supplied by a late platform hook before executing the expose', async () => {
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
    const runtime = snapshotRuntime({
      module: provider(),
      pureEntry: true,
      isService: true,
    });
    runtime.instance.registerPlugins([
      {
        name: 'service-snapshot',
        afterResolve: (args) => ({ ...args, remoteSnapshot: runtime.snapshot }),
      },
    ]);
    try {
      render(
        <ReactRemote
          remote="alias/Card"
          instance={runtime.instance}
          fallback={({ error }) => <p>{error.message}</p>}
        />,
      );
      await screen.findByText(/Service App.*not supported/);
      expect(runtime.loadEntry).not.toHaveBeenCalled();
      expect(runtime.factory).not.toHaveBeenCalled();
    } finally {
      errors.mockRestore();
    }
  });

  it('runs final runtime recovery and diagnostics once when resolution fails', async () => {
    const runtime = snapshotRuntime({ module: provider() });
    const error = new Error('platform resolution unavailable');
    const recover = jest.fn(() => ({ default: () => <p>runtime recovery</p> }));
    runtime.instance.registerPlugins([
      {
        name: 'resolution-recovery',
        afterResolve() {
          throw error;
        },
        errorLoadRemote: recover,
      },
    ]);
    const warnings = jest.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      render(<ReactRemote remote="alias/Card" instance={runtime.instance} />);
      await screen.findByText('runtime recovery');
      expect(runtime.beforeRequest).toHaveBeenCalledTimes(1);
      expect(recover).toHaveBeenCalledTimes(1);
      expect(recover).toHaveBeenCalledWith(
        expect.objectContaining({ error, lifecycle: 'onLoad' }),
      );
      expect(runtime.afterLoadRemote).toHaveBeenCalledTimes(1);
      expect(runtime.afterLoadRemote).toHaveBeenCalledWith(
        expect.objectContaining({ error, recovered: true }),
      );
      expect(runtime.factory).not.toHaveBeenCalled();
      expect(runtime.onLoad).not.toHaveBeenCalled();
    } finally {
      warnings.mockRestore();
    }
  });
});

it('retries failed platform resolution with a fresh request', async () => {
  const runtime = snapshotRuntime({
    module: { default: () => <p>resolution restored</p> },
    render: 'component',
  });
  let attempts = 0;
  runtime.instance.registerPlugins([
    {
      name: 'temporary-resolution-failure',
      afterResolve(args) {
        if (++attempts === 1) throw new Error('platform offline');
        return args;
      },
    },
  ]);
  const warnings = jest.spyOn(console, 'warn').mockImplementation(() => {});
  const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
  try {
    render(
      <ReactRemote
        remote="alias/Card"
        instance={runtime.instance}
        fallback={({ error, retry }) => (
          <button onClick={retry}>{error.message}</button>
        )}
      />,
    );
    const retry = await screen.findByRole('button', {
      name: '[ Federation Runtime ]: platform offline',
    });
    expect(runtime.loadEntry).not.toHaveBeenCalled();
    act(() => retry.click());
    await screen.findByText('resolution restored');
    expect(runtime.beforeRequest).toHaveBeenCalledTimes(2);
    expect(runtime.onLoad).toHaveBeenCalledTimes(1);
    expect(runtime.afterLoadRemote).toHaveBeenCalledTimes(2);
    expect(runtime.afterLoadRemote.mock.calls[0][0]).toEqual(
      expect.objectContaining({ error: expect.any(Error) }),
    );
    expect(runtime.afterLoadRemote.mock.calls[1][0].error).toBeUndefined();
  } finally {
    warnings.mockRestore();
    errors.mockRestore();
  }
});

it('preserves onLoad wrappers when continuing a resolved request', async () => {
  const runtime = snapshotRuntime({ module: provider(), render: 'component' });
  const wrapped = Object.assign(() => null, {
    default: () => <p>runtime wrapped export</p>,
  });
  runtime.instance.registerPlugins([
    {
      name: 'wrap-loaded-module',
      onLoad() {
        return wrapped;
      },
    },
  ]);
  render(<ReactRemote remote="alias/Card" instance={runtime.instance} />);
  await screen.findByText('runtime wrapped export');
  expect(runtime.factory).toHaveBeenCalledTimes(1);
  expect(runtime.onLoad).toHaveBeenCalledTimes(1);
  expect(runtime.beforeRequest).toHaveBeenCalledTimes(1);
});
