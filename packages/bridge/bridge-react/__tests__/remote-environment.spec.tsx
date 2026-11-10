import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { useServerEnvironment } from '../src/remote/environment.server';
import { useBrowserEnvironment } from '../src/remote/environment.browser';
import { BridgeSSRContext, type BridgeSSRContextValue } from '../src/ssr';

it.each([
  ['server', useServerEnvironment],
  ['browser', useBrowserEnvironment],
] as const)(
  'keeps %s Hook order and identity when noSSR and Context change',
  (_name, useEnvironment) => {
    const reservation = {
      signal: new AbortController().signal,
      wait: <T,>(promise: Promise<T>) => promise,
      skip: jest.fn(),
      fail: jest.fn(),
      activate: jest.fn(),
    };
    const context: BridgeSSRContextValue = {
      reserve: jest.fn(() => reservation),
      register: jest.fn(),
      registerStyles: jest.fn(),
    };
    function Probe({ noSSR }: { noSSR: boolean }) {
      const environment = useEnvironment(
        () => ({ remote: () => null, noSSR }),
        0,
        null,
      );
      const [value, setValue] = React.useState('initial');
      return (
        <button id={environment.instanceId} onClick={() => setValue('updated')}>
          {value}
        </button>
      );
    }
    const view = render(
      <BridgeSSRContext.Provider value={null}>
        <Probe noSSR />
      </BridgeSSRContext.Provider>,
    );
    const button = view.getByRole('button');
    const id = button.id;
    fireEvent.click(button);
    expect(button.textContent).toBe('updated');
    view.rerender(
      <BridgeSSRContext.Provider value={context}>
        <Probe noSSR={false} />
      </BridgeSSRContext.Provider>,
    );
    expect(view.getByRole('button')).toBe(button);
    expect(button.id).toBe(id);
    view.rerender(
      <BridgeSSRContext.Provider value={null}>
        <Probe noSSR />
      </BridgeSSRContext.Provider>,
    );
    expect(view.getByRole('button')).toBe(button);
    expect(button.id).toBe(id);
    expect(button.textContent).toBe('updated');
  },
);
