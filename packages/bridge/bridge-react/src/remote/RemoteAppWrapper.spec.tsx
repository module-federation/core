import React, { createRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { act, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { RemoteAppWrapper } from './RemoteAppWrapper';
import { ErrorBoundary } from '../error-boundary';

const baseProps = {
  moduleName: 'remote/app',
  providerInfo: () => ({ render() {}, destroy() {} }),
  exportName: 'default',
  fallback: () => null,
  loading: null,
};

describe('RemoteAppWrapper SSR payload boundary', () => {
  it('injects only a valid result matching the mounted module and instance', () => {
    const result = {
      protocolVersion: 1 as const,
      moduleName: 'remote/app',
      instanceId: 'remote-1',
      html: '<p>server remote</p>',
    };
    const html = renderToStaticMarkup(
      <RemoteAppWrapper {...baseProps} instanceId="remote-1" ssr={result} />,
    );
    expect(html).toContain('data-mf-bridge-instance="remote-1"');
    expect(html).toContain('<p>server remote</p>');
    expect(html.match(/server remote/g)).toHaveLength(1);
    expect(html).toContain('data-mf-bridge-state="true"');

    const mismatch = renderToStaticMarkup(
      <RemoteAppWrapper
        {...baseProps}
        instanceId="other-instance"
        ssr={result}
      />,
    );
    expect(mismatch).not.toContain('data-mf-bridge-ssr');
    expect(mismatch).not.toContain('server remote');
  });

  it('rejects malformed host-carried results', () => {
    expect(() =>
      renderToStaticMarkup(
        <RemoteAppWrapper
          {...baseProps}
          ssr={
            {
              protocolVersion: 2,
              moduleName: 'remote/app',
              instanceId: 'remote-1',
              html: '<p>invalid</p>',
            } as any
          }
        />,
      ),
    ).toThrow(/incompatible result/);
  });
});

describe('RemoteAppWrapper lifecycle', () => {
  afterEach(() => {
    rs.restoreAllMocks();
  });

  it('supports changing between object, callback, and absent forwarded refs', async () => {
    const provider = { render: rs.fn(), destroy: rs.fn() };
    const providerInfo = () => provider;
    const objectRef = createRef<HTMLDivElement>();
    const callbackRef = rs.fn();
    const view = render(
      <RemoteAppWrapper
        {...baseProps}
        providerInfo={providerInfo}
        ref={objectRef}
      />,
    );
    await waitFor(() => expect(provider.render).toHaveBeenCalledOnce());
    expect(objectRef.current).toBeInstanceOf(HTMLDivElement);

    view.rerender(
      <RemoteAppWrapper
        {...baseProps}
        providerInfo={providerInfo}
        ref={callbackRef}
      />,
    );
    expect(callbackRef).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    view.rerender(
      <RemoteAppWrapper {...baseProps} providerInfo={providerInfo} />,
    );
  });

  it('passes replacement callback props to the existing provider', async () => {
    const provider = { render: rs.fn(), destroy: rs.fn() };
    const providerInfo = () => provider;
    const first = rs.fn();
    const second = rs.fn();
    const view = render(
      <RemoteAppWrapper
        {...baseProps}
        providerInfo={providerInfo}
        onAction={first}
      />,
    );
    await waitFor(() => expect(provider.render).toHaveBeenCalledOnce());

    view.rerender(
      <RemoteAppWrapper
        {...baseProps}
        providerInfo={providerInfo}
        onAction={second}
      />,
    );
    await waitFor(() => expect(provider.render).toHaveBeenCalledTimes(2));
    expect(provider.render.mock.calls[1][0].onAction).toBe(second);
  });

  it('routes asynchronous provider failures through the error boundary', async () => {
    const failure = new Error('remote render failed');
    const providerInfo = () => ({
      render: rs.fn(async () => {
        throw failure;
      }),
      destroy: rs.fn(),
    });
    const Fallback = ({ error }: { error: Error }) => <p>{error.message}</p>;

    const view = render(
      <ErrorBoundary FallbackComponent={Fallback as any}>
        <RemoteAppWrapper {...baseProps} providerInfo={providerInfo} />
      </ErrorBoundary>,
    );
    await expect(view.findByText('remote render failed')).resolves.toBeTruthy();
  });

  it('defers and deduplicates destructive cleanup', async () => {
    const queued: Array<() => void> = [];
    rs.spyOn(globalThis, 'queueMicrotask').mockImplementation((callback) => {
      queued.push(callback as () => void);
    });
    const provider = { render: rs.fn(), destroy: rs.fn() };
    const providerInfo = () => provider;
    const view = render(
      <RemoteAppWrapper {...baseProps} providerInfo={providerInfo} />,
    );
    await waitFor(() => expect(provider.render).toHaveBeenCalledOnce());

    view.unmount();
    expect(provider.destroy).not.toHaveBeenCalled();
    expect(queued).toHaveLength(1);
    await act(async () => queued[0]());
    expect(provider.destroy).toHaveBeenCalledOnce();
  });
});
