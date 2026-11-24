import React, { Suspense, startTransition, useState } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { AwaitDataFetch } from '../src/lazy/AwaitDataFetch';

describe('AwaitDataFetch', () => {
  it('does not re-suspend on parent rerenders when a promise resolves to undefined or falsy values', async () => {
    for (const value of [undefined, null, false, 0, '']) {
      let renders = 0;
      const promise = Promise.resolve(value);
      let triggerRerender!: () => void;

      function Parent() {
        const [tick, setTick] = useState(0);
        triggerRerender = () => setTick((current) => current + 1);
        return (
          <AwaitDataFetch resolve={promise} loading={<div>Loading</div>}>
            {(resolved) => {
              renders += 1;
              return (
                <div data-testid="result">
                  tick:{tick}:value:{String(resolved)}
                </div>
              );
            }}
          </AwaitDataFetch>
        );
      }

      const { unmount } = render(<Parent />);
      await waitFor(() => {
        expect(screen.getByTestId('result').textContent).toBe(
          `tick:0:value:${String(value)}`,
        );
      });
      const rendersBefore = renders;

      await act(async () => {
        triggerRerender();
      });

      expect(screen.getByTestId('result').textContent).toBe(
        `tick:1:value:${String(value)}`,
      );
      expect(renders).toBe(rendersBefore + 1);
      expect(screen.queryByText('Loading')).not.toBeInTheDocument();
      unmount();
    }
  });

  it('completes concurrent hydration without looping when a cached promise resolves to undefined', async () => {
    let resolveData!: (value: undefined) => void;
    const dataPromise = new Promise<undefined>((resolve) => {
      resolveData = resolve;
    });
    let parentRenders = 0;

    function HydratedApp({
      resolve,
    }: {
      resolve: Promise<undefined> | undefined;
    }) {
      parentRenders += 1;
      return (
        <section>
          <Suspense fallback={<div>Outer loading</div>}>
            <AwaitDataFetch
              resolve={resolve}
              loading={<div>Inner loading</div>}
            >
              {(resolved) => (
                <div data-testid="hydrated-child">ready:{String(resolved)}</div>
              )}
            </AwaitDataFetch>
          </Suspense>
        </section>
      );
    }

    const container = document.createElement('div');
    container.innerHTML = renderToString(<HydratedApp resolve={undefined} />);
    document.body.appendChild(container);

    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      await act(async () => {
        startTransition(() => {
          root = hydrateRoot(container, <HydratedApp resolve={dataPromise} />);
        });
      });

      await act(async () => {
        resolveData(undefined);
        await dataPromise;
      });

      await waitFor(() => {
        expect(
          container.querySelector('[data-testid="hydrated-child"]')
            ?.textContent,
        ).toBe('ready:undefined');
      });
      // Previously, concurrent hydration restarted from the root indefinitely.
      expect(parentRenders).toBeLessThan(10);
    } finally {
      await act(async () => {
        root?.unmount();
      });
      container.remove();
    }
  });

  it('tracks rejected promises without repeating console warnings on rerender', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const promise = Promise.reject(new Error('boom'));
      let triggerRerender!: () => void;

      function Parent() {
        const [tick, setTick] = useState(0);
        triggerRerender = () => setTick((current) => current + 1);
        return (
          <AwaitDataFetch
            resolve={promise}
            loading={<div>Loading</div>}
            errorElement={(info) => (
              <div data-testid="error">
                tick:{tick}:{info.error.message}
              </div>
            )}
          >
            {() => <div>ok</div>}
          </AwaitDataFetch>
        );
      }

      render(<Parent />);
      await waitFor(() => {
        expect(screen.getByTestId('error').textContent).toBe(
          'tick:0:Error: boom',
        );
      });

      await act(async () => {
        triggerRerender();
      });

      expect(screen.getByTestId('error').textContent).toBe(
        'tick:1:Error: boom',
      );
      expect(warn).toHaveBeenCalledTimes(1);
    } finally {
      warn.mockRestore();
    }
  });
});
