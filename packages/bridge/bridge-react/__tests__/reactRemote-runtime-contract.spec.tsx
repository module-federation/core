/** @jest-environment node */
import React from 'react';
import { renderToString } from 'react-dom/server.node';
import { useServerEnvironment } from '../src/remote/environment.server';
import { useBrowserEnvironment } from '../src/remote/environment.browser';

it.each([
  ['server', useServerEnvironment],
  ['modern browser', useBrowserEnvironment],
] as const)(
  'rejects a missing useId in the %s runtime instead of dropping SSR identity',
  (_name, useEnvironment) => {
    const descriptor = Object.getOwnPropertyDescriptor(React, 'useId')!;
    function Probe() {
      const environment = useEnvironment(
        () => ({ remote: 'shop/Card' }),
        0,
        null,
      );
      return <span>{environment.instanceId}</span>;
    }
    try {
      Object.defineProperty(React, 'useId', {
        ...descriptor,
        value: undefined,
      });
      expect(() => renderToString(<Probe />)).toThrow(/useId/);
    } finally {
      Object.defineProperty(React, 'useId', descriptor);
    }
  },
);
