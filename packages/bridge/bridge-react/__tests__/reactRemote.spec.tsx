import React, { StrictMode, createContext, useContext } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server.node';
import { createReactRemote, ReactRemote } from '../src/reactRemote';
import { remoteRuntime } from './reactRemote-utils';
import { createBridgeComponent } from '../src/provider/versions/v18';

describe('unified React remote consumption', () => {
  it('hydrates noSSR placeholders without loading during server rendering or reporting a mismatch', async () => {
    const { instance, loadRemote } = remoteRuntime({
      default: () => <strong>client weather</strong>,
    });
    const Remote = createReactRemote({
      remote: 'shop/Card',
      instance,
      noSSR: true,
      loading: <p>connecting</p>,
    });
    const container = document.createElement('div');
    container.innerHTML = renderToString(<Remote />);
    expect(container.textContent).toBe('connecting');
    expect(loadRemote).not.toHaveBeenCalled();
    document.body.appendChild(container);
    const onRecoverableError = jest.fn();
    let root: ReturnType<typeof hydrateRoot>;
    try {
      act(() => {
        root = hydrateRoot(container, <Remote />, { onRecoverableError });
      });
      await screen.findByText('client weather');
      expect(onRecoverableError).not.toHaveBeenCalled();
    } finally {
      act(() => root!.unmount());
      container.remove();
    }
  });
  it('preserves runtime load recovery when the manifest protocol lookup fails', async () => {
    const runtime = remoteRuntime({ default: () => null });
    const error = new Error('manifest unavailable');
    runtime.snapshotHandler.loadRemoteSnapshotInfo.mockRejectedValue(error);
    runtime.errorLoadRemote.mockResolvedValue({
      default: () => <p>runtime recovered weather</p>,
    });
    render(<ReactRemote remote="shop/Card" instance={runtime.instance} />);
    await screen.findByText('runtime recovered weather');
    expect(runtime.errorLoadRemote).toHaveBeenCalledTimes(1);
    expect(runtime.errorLoadRemote).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'shop/Card', error, lifecycle: 'onLoad' }),
    );
    expect(runtime.loadRemote).not.toHaveBeenCalled();
  });
  it('keeps host loading DOM outside the producer React root', async () => {
    const provider = createBridgeComponent({
      rootComponent: () => <strong>independent root</strong>,
    });
    const { instance } = remoteRuntime({ default: provider }, 'bridge');
    const view = render(
      <ReactRemote
        remote="shop/Card"
        instance={instance}
        loading={<em>host loading</em>}
      />,
    );
    await screen.findByText('independent root');
    await waitFor(() => expect(screen.queryByText('host loading')).toBeNull());
    await act(async () => view.unmount());
  });

  it('recovers an asynchronous provider render failure with a new provider instance', async () => {
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      let attempts = 0;
      const destroy = jest.fn();
      const provider = jest.fn(() => {
        const current = ++attempts;
        return {
          render: async ({ dom }: { dom: HTMLElement }) => {
            if (current === 1) throw new Error('provider failed');
            dom.textContent = 'provider recovered';
          },
          destroy,
        };
      });
      const { instance } = remoteRuntime({ default: provider }, 'bridge');
      render(
        <ReactRemote
          remote="shop/Card"
          instance={instance}
          fallback={({ error, retry }) => (
            <button onClick={retry}>{error.message}</button>
          )}
        />,
      );
      const button = await screen.findByRole('button', {
        name: 'provider failed',
      });
      act(() => button.click());
      await screen.findByText('provider recovered');
      expect(provider).toHaveBeenCalledTimes(2);
      expect(destroy).toHaveBeenCalledTimes(1);
    } finally {
      errors.mockRestore();
    }
  });
  it('accepts callable namespaces returned by runtime plugins without changing raw exports', async () => {
    const module = Object.assign(() => null, {
      default: () => <span>plugin export</span>,
    });
    const { instance } = remoteRuntime(module);
    render(<ReactRemote remote="shop/Card" instance={instance} />);
    await screen.findByText('plugin export');
    expect(typeof module).toBe('function');
    expect(Object.getOwnPropertySymbols(module)).toEqual([]);
  });
  it('renders an unmarked ordinary component in the host context and preserves props', async () => {
    const Context = createContext('missing');
    const raw = Object.freeze({
      default: ({ name }: { name: string }) => (
        <span>
          {useContext(Context)} {name}
        </span>
      ),
    });
    const { instance, loadRemote } = remoteRuntime(raw);
    const Card = createReactRemote<{ name: string }>({
      remote: 'alias/Card',
      instance,
    });
    const view = render(
      <Context.Provider value="host">
        <Card name="one" />
      </Context.Provider>,
    );
    await screen.findByText('host one');
    view.rerender(
      <Context.Provider value="host">
        <Card name="two" />
      </Context.Provider>,
    );
    await screen.findByText('host two');
    expect(loadRemote).toHaveBeenCalledTimes(1);
    expect(Object.getOwnPropertySymbols(raw)).toEqual([]);
  });
  it('supports named memo exports through the declarative API without recreating on rerender', async () => {
    const { instance, loadRemote } = remoteRuntime(
      {
        Named: React.memo(({ value }: { value: string }) => (
          <span>{value}</span>
        )),
      },
      'component',
    );
    const view = render(
      <ReactRemote
        remote="shop/Card"
        instance={instance}
        exportName="Named"
        props={{ value: 'first' }}
      />,
    );
    await screen.findByText('first');
    view.rerender(
      <ReactRemote
        remote="shop/Card"
        instance={instance}
        exportName="Named"
        props={{ value: 'second' }}
      />,
    );
    await screen.findByText('second');
    expect(loadRemote).toHaveBeenCalledTimes(1);
  });
  it('selects Bridge from metadata, keeps each provider isolated and destroys each instance', async () => {
    const providers: { render: jest.Mock; destroy: jest.Mock }[] = [];
    const factory = jest.fn(() => {
      const provider = {
        render: jest.fn(({ dom, value }) => {
          dom.textContent = value;
        }),
        destroy: jest.fn(({ dom }) => {
          dom.textContent = '';
        }),
      };
      providers.push(provider);
      return provider;
    });
    const { instance } = remoteRuntime({ default: factory }, 'bridge');
    const Card = createReactRemote<{ value: string }>({
      remote: 'shop/Card',
      instance,
    });
    const view = render(
      <>
        <Card value="left" />
        <Card value="right" />
      </>,
    );
    await screen.findByText('left');
    await screen.findByText('right');
    expect(factory).toHaveBeenCalledTimes(2);
    view.rerender(
      <>
        <Card value="updated" />
        <Card value="right" />
      </>,
    );
    await screen.findByText('updated');
    expect(factory).toHaveBeenCalledTimes(2);
    view.unmount();
    await waitFor(() =>
      expect(
        providers.every((provider) => provider.destroy.mock.calls.length === 1),
      ).toBe(true),
    );
  });
  it('keeps the final provider alive through StrictMode effect replay', async () => {
    const destroy = jest.fn();
    const factory = jest.fn(() => ({
      render: ({ dom }: { dom: HTMLElement }) => {
        dom.textContent = 'strict';
      },
      destroy,
    }));
    const { instance } = remoteRuntime({ default: factory }, 'bridge');
    const view = render(
      <StrictMode>
        <ReactRemote remote="shop/Card" instance={instance} />
      </StrictMode>,
    );
    await screen.findByText('strict');
    expect(destroy).not.toHaveBeenCalled();
    view.unmount();
    await waitFor(() => expect(destroy).toHaveBeenCalledTimes(1));
  });
  it('supports an explicit legacy Bridge hint', async () => {
    const factory = jest.fn(() => ({
      render: ({ dom }: { dom: HTMLElement }) => {
        dom.textContent = 'legacy';
      },
      destroy() {},
    }));
    const { instance } = remoteRuntime({ default: factory });
    render(
      <ReactRemote remote="shop/Card" instance={instance} render="bridge" />,
    );
    await screen.findByText('legacy');
  });
  it.each([
    ['conflict', 'bridge' as const, false, 'component' as const, /conflicts/],
    ['service', 'bridge' as const, true, undefined, /Service App/],
  ])(
    'reports %s without invoking the module loader',
    async (_name, protocol, service, hint, message) => {
      const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
      try {
        const { instance, loadRemote, errorLoadRemote } = remoteRuntime(
          { default: () => null },
          protocol,
          service,
        );
        render(
          <ReactRemote
            remote="shop/Card"
            instance={instance}
            render={hint}
            fallback={({ error }) => <span>{error.message}</span>}
          />,
        );
        await screen.findByText(message);
        expect(loadRemote).not.toHaveBeenCalled();
        expect(errorLoadRemote).not.toHaveBeenCalled();
      } finally {
        errors.mockRestore();
      }
    },
  );
  it('retries a failed lazy loader instead of reusing its rejection', async () => {
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
    const warnings = jest.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const runtime = remoteRuntime({ default: () => <span>recovered</span> });
      runtime.loadRemote.mockRejectedValueOnce(new Error('offline'));
      render(
        <ReactRemote
          remote="shop/Card"
          instance={runtime.instance}
          fallback={({ error, retry }) => (
            <button onClick={retry}>{error.message}</button>
          )}
        />,
      );
      const button = await screen.findByRole('button');
      act(() => button.click());
      await screen.findByText('recovered');
      expect(runtime.loadRemote).toHaveBeenCalledTimes(2);
    } finally {
      errors.mockRestore();
      warnings.mockRestore();
    }
  });
  it('does not instantiate a provider after its container unmounts', async () => {
    let complete!: (value: any) => void;
    const factory = jest.fn(() => ({ render() {}, destroy() {} }));
    const runtime = remoteRuntime({ default: factory }, 'bridge');
    runtime.loadRemote.mockImplementation(
      () =>
        new Promise((resolve) => {
          complete = resolve;
        }),
    );
    const view = render(
      <ReactRemote
        remote="shop/Card"
        instance={runtime.instance}
        loading={<span>waiting</span>}
      />,
    );
    await waitFor(() => expect(runtime.loadRemote).toHaveBeenCalledTimes(1));
    view.unmount();
    await act(async () => {
      complete({ default: factory });
    });
    expect(factory).not.toHaveBeenCalled();
  });
});
