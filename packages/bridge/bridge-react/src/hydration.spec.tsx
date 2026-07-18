import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from '@rstest/core';
import {
  createBridgeHydrationRegistry,
  toBridgeSSRReference,
} from '@module-federation/bridge-shared';
import { BridgeRemoteSlot } from './hydration';

const result = {
  protocolVersion: 1 as const,
  moduleName: 'remote/app',
  instanceId: 'remote-1',
  html: '<p>server remote</p>',
  dehydratedState: { ready: true },
};

function installSlot() {
  document.body.innerHTML = renderToStaticMarkup(
    <BridgeRemoteSlot
      moduleName={result.moduleName}
      instanceId={result.instanceId}
      payload={result}
    />,
  );
}

describe('Bridge hydration registry', () => {
  it('recovers and consumes one immutable instance snapshot', () => {
    installSlot();
    const registry = createBridgeHydrationRegistry(document);
    const snapshot = registry.peek('remote/app', 'remote-1');

    expect(snapshot).toEqual({
      protocolVersion: 1,
      moduleName: 'remote/app',
      instanceId: 'remote-1',
      html: '<p>server remote</p>',
      state: { ready: true },
    });
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot?.state)).toBe(true);
    expect(registry.consume('remote/app', 'remote-1')).toBe(snapshot);
    expect(registry.peek('remote/app', 'remote-1')).toBeUndefined();
  });

  it('renders a client reference from the recovered DOM without another payload copy', () => {
    installSlot();
    const registry = createBridgeHydrationRegistry(document);
    const snapshot = registry.peek('remote/app', 'remote-1');
    const reference = toBridgeSSRReference(result);
    const clientMarkup = renderToStaticMarkup(
      <BridgeRemoteSlot
        moduleName={reference.moduleName}
        instanceId={reference.instanceId}
        snapshot={snapshot}
      />,
    );

    expect(clientMarkup).toBe(document.body.innerHTML);
    expect(JSON.stringify(reference)).not.toContain('server remote');
  });

  it('treats an absent slot as missing SSR data', () => {
    document.body.innerHTML = '';
    expect(
      createBridgeHydrationRegistry(document).peek('remote/app', 'remote-1'),
    ).toBeUndefined();
  });

  it('rejects malformed, mismatched, and duplicate slots', () => {
    installSlot();
    const original = document.body.innerHTML;
    document.body.innerHTML = original.replace(
      '"moduleName":"remote/app"',
      '"moduleName":"other/app"',
    );
    expect(() =>
      createBridgeHydrationRegistry(document).peek('remote/app', 'remote-1'),
    ).toThrow(/state metadata does not match/);

    document.body.innerHTML = original + original;
    expect(() =>
      createBridgeHydrationRegistry(document).peek('remote/app', 'remote-1'),
    ).toThrow(/Duplicate Bridge SSR identity/);

    document.body.innerHTML = original;
    expect(
      createBridgeHydrationRegistry(document).peek('other/app', 'remote-1'),
    ).toBeUndefined();

    document.body.innerHTML = original.replace(
      '</script></div>',
      '</script><span>unexpected</span></div>',
    );
    expect(() =>
      createBridgeHydrationRegistry(document).peek('remote/app', 'remote-1'),
    ).toThrow(/only its direct mount and state children/);

    document.body.innerHTML = original.replace(
      '"state":',
      '"html":"duplicate","state":',
    );
    expect(() =>
      createBridgeHydrationRegistry(document).peek('remote/app', 'remote-1'),
    ).toThrow(/incompatible state envelope/);
  });

  it('allows the same instanceId across different module names', () => {
    const second = {
      ...result,
      moduleName: 'other/app',
      html: '<p>other remote</p>',
    };
    document.body.innerHTML =
      renderToStaticMarkup(
        <BridgeRemoteSlot
          moduleName={result.moduleName}
          instanceId={result.instanceId}
          payload={result}
        />,
      ) +
      renderToStaticMarkup(
        <BridgeRemoteSlot
          moduleName={second.moduleName}
          instanceId={second.instanceId}
          payload={second}
        />,
      );
    const registry = createBridgeHydrationRegistry(document);
    expect(registry.peek('remote/app', 'remote-1')?.html).toBe(
      '<p>server remote</p>',
    );
    expect(registry.peek('other/app', 'remote-1')?.html).toBe(
      '<p>other remote</p>',
    );
  });

  it('fail clears a peeked snapshot so later peeks miss', () => {
    installSlot();
    const registry = createBridgeHydrationRegistry(document);
    expect(registry.peek('remote/app', 'remote-1')).toBeDefined();
    registry.fail('remote/app', 'remote-1');
    expect(registry.peek('remote/app', 'remote-1')).toBeUndefined();
    expect(registry.consume('remote/app', 'remote-1')).toBeUndefined();
  });
});
