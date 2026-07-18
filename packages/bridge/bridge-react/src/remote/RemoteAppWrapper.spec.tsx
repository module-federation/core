import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from '@rstest/core';
import { RemoteAppWrapper } from './RemoteAppWrapper';

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
