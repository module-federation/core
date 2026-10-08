import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ElementSelectionRegistry } from '../src/runtime/selection.ts';
import type { RemoteContext, RemoteSelectable } from '../src/remotes/types.ts';

// Only the ancestry/connection surface used by the registry is modeled here.
// This is a DOM test double; it does not imply browser WebMCP availability.
class FakeElement {
  connected = true;
  parentElement: FakeElement | null;
  mountId: string | null;
  constructor(
    parentElement: FakeElement | null = null,
    mountId: string | null = null,
  ) {
    this.parentElement = parentElement;
    this.mountId = mountId;
  }
  get isConnected(): boolean {
    return this.connected && (this.parentElement?.isConnected ?? true);
  }
  getAttribute(name: string) {
    return name === 'data-selection-mount-id' ? this.mountId : null;
  }
  closest(selector: string): FakeElement | null {
    assert.equal(selector, '[data-selection-mount-id]');
    for (let node: FakeElement | null = this; node; node = node.parentElement)
      if (node.mountId !== null) return node;
    return null;
  }
  asElement() {
    return this as unknown as HTMLElement;
  }
}

function context(overrides: Partial<RemoteContext> = {}): RemoteContext {
  return {
    endpoint: '/api/discovery/recommendations',
    consumerKey: 'recommendations',
    sid: 'snapshot-1',
    mountId: 'recommendations-1',
    basename: '/recommendations',
    providerName: 'recommendations_v1',
    version: '1.0.0',
    ...overrides,
  };
}

function selectable(
  element: FakeElement,
  overrides: Partial<RemoteSelectable> = {},
): RemoteSelectable {
  return {
    id: 'flow-keyboard',
    label: 'Flow 机械键盘',
    kind: 'product',
    element: element.asElement(),
    getData: () => ({ productId: 'flow', price: 699 }),
    ...overrides,
  };
}

test('only producer-declared elements can be selected; nested buttons take precedence over their card', () => {
  const registry = new ElementSelectionRegistry();
  const root = new FakeElement(null, context().mountId);
  const card = new FakeElement(root);
  const image = new FakeElement(card);
  const button = new FakeElement(card);
  const icon = new FakeElement(button);
  const other = new FakeElement(root);
  registry.register(context(), [
    selectable(card),
    selectable(button, {
      id: 'view-details',
      label: '查看详情',
      kind: 'action',
    }),
  ]);
  assert.equal(registry.findTarget(other.asElement()), null);
  assert.equal(registry.findTarget(image.asElement())?.id, 'flow-keyboard');
  assert.equal(registry.findTarget(icon.asElement())?.id, 'view-details');
  const handles = registry.list();
  assert.equal(handles.length, 2);
  assert.equal('getData' in handles[0], false);
  assert.throws(
    () => registry.select('not-exposed'),
    /ELEMENT_SELECTION_EXPIRED/,
  );
});

test('same local id in separate mounts stays isolated; cleanup removes only its own registration batch', () => {
  const registry = new ElementSelectionRegistry();
  const leftContext = context({ mountId: 'left' });
  const rightContext = context({ mountId: 'right' });
  const left = new FakeElement(new FakeElement(null, 'left'));
  const right = new FakeElement(new FakeElement(null, 'right'));
  const cleanup = registry.register(leftContext, [selectable(left)]);
  registry.register(rightContext, [
    selectable(right, { getData: () => ({ productId: 'flow', price: 799 }) }),
  ]);
  const leftId = registry.findTarget(left.asElement())!.referenceId;
  const rightId = registry.findTarget(right.asElement())!.referenceId;
  assert.notEqual(leftId, rightId);
  registry.select(rightId);
  cleanup();
  cleanup();
  assert.equal(registry.getSelection()?.context.mountId, 'right');
  assert.equal(registry.readSelection()?.data.price, 799);
  assert.throws(() => registry.select(leftId), /ELEMENT_SELECTION_EXPIRED/);
  const button = new FakeElement(right);
  const offButton = registry.register(rightContext, [
    selectable(button, { id: 'details', label: '详情', kind: 'action' }),
  ]);
  offButton();
  assert.equal(registry.list().length, 1);
});

test('nested application elements cannot be claimed by a parent or fall back to a parent card', () => {
  const registry = new ElementSelectionRegistry();
  const outerRoot = new FakeElement(null, 'outer');
  const outerCard = new FakeElement(outerRoot);
  const innerRoot = new FakeElement(outerCard, 'inner');
  const innerCard = new FakeElement(innerRoot);
  registry.register(context({ mountId: 'outer' }), [selectable(outerCard)]);
  assert.equal(registry.findTarget(innerCard.asElement()), null);
  assert.throws(
    () =>
      registry.register(context({ mountId: 'outer' }), [selectable(innerCard)]),
    /必须属于当前/,
  );
  registry.register(context({ mountId: 'inner' }), [selectable(innerCard)]);
  assert.equal(
    registry.findTarget(innerCard.asElement())?.context.mountId,
    'inner',
  );
  assert.equal(
    registry.findTarget(outerCard.asElement())?.context.mountId,
    'outer',
  );
});

test('selection reads the latest business state and returns only JSON metadata, never DOM references', () => {
  const registry = new ElementSelectionRegistry();
  const element = new FakeElement(new FakeElement(null, context().mountId));
  const state = { price: 699, tags: ['机械键盘'] };
  registry.register(context(), [selectable(element, { getData: () => state })]);
  const handle = registry.list()[0];
  const selection = registry.select(handle.referenceId);
  assert.equal('element' in selection, false);
  assert.equal('getData' in selection, false);
  assert.deepEqual(JSON.parse(JSON.stringify(selection)), selection);
  state.price = 599;
  state.tags.push('限时优惠');
  assert.equal(registry.getSelection()?.data.price, 699);
  assert.deepEqual(registry.readSelection()?.data, state);
  assert.deepEqual(selection.data, { price: 699, tags: ['机械键盘'] });
});

test('unmounted, moved or disconnected elements cannot execute getData; references never revive', () => {
  const registry = new ElementSelectionRegistry();
  const root = new FakeElement(null, context().mountId);
  const element = new FakeElement(root);
  let reads = 0;
  const definition = selectable(element, {
    getData: () => {
      reads++;
      return {};
    },
  });
  const cleanup = registry.register(context(), [definition]);
  const oldId = registry.list()[0].referenceId;
  registry.select(oldId);
  cleanup();
  assert.equal(registry.getSelection(), null);
  assert.equal(registry.readSelection(), null);
  registry.register(context(), [definition]);
  const freshId = registry.list()[0].referenceId;
  assert.notEqual(freshId, oldId);
  assert.throws(() => registry.select(oldId), /ELEMENT_SELECTION_EXPIRED/);
  element.connected = false;
  assert.throws(() => registry.select(freshId), /ELEMENT_SELECTION_EXPIRED/);
  assert.equal(registry.findTarget(element.asElement()), null);
  assert.equal(reads, 1);
  element.connected = true;
  element.parentElement = new FakeElement(null, 'different-mount');
  assert.throws(() => registry.select(freshId), /ELEMENT_SELECTION_EXPIRED/);
  assert.equal(reads, 1);
});

test('expired source generation invalidates nested consumers and prevents late registration; a new generation remains usable', () => {
  const registry = new ElementSelectionRegistry();
  let reads = 0;
  for (const mountId of ['root', 'child']) {
    registry.register(context({ mountId, consumerKey: mountId }), [
      selectable(new FakeElement(new FakeElement(null, mountId)), {
        getData: () => {
          reads++;
          return {};
        },
      }),
    ]);
  }
  const child = registry
    .list()
    .find((entry) => entry.context.mountId === 'child')!;
  registry.select(child.referenceId);
  registry.expire(context().endpoint, 'root', 'snapshot-1');
  assert.equal(registry.getSelection(), null);
  assert.equal(registry.readSelection(), null);
  assert.deepEqual(registry.list(), []);
  assert.throws(
    () => registry.select(child.referenceId),
    /ELEMENT_SELECTION_EXPIRED/,
  );
  registry.register(context({ mountId: 'late' }), [
    selectable(new FakeElement(new FakeElement(null, 'late'))),
  ]);
  assert.deepEqual(registry.list(), []);
  registry.register(context({ mountId: 'new', sid: 'snapshot-2' }), [
    selectable(new FakeElement(new FakeElement(null, 'new'))),
  ]);
  assert.equal(
    registry.select(registry.list()[0].referenceId).context.sid,
    'snapshot-2',
  );
  assert.equal(reads, 1);
});

test('expiration before registration blocks that snapshot while keeping another endpoint independent', () => {
  const registry = new ElementSelectionRegistry();
  registry.expire(context().endpoint, 'root', 'snapshot-1');
  registry.register(context(), [
    selectable(new FakeElement(new FakeElement(null, context().mountId))),
  ]);
  registry.register(context({ endpoint: '/other' }), [
    selectable(new FakeElement(new FakeElement(null, context().mountId))),
  ]);
  assert.equal(registry.list().length, 1);
  assert.equal(registry.list()[0].context.endpoint, '/other');
});

test('registration validates whole batches and getData rejects DOM/non-JSON or synchronously expired results', () => {
  const registry = new ElementSelectionRegistry();
  const root = new FakeElement(null, context().mountId);
  const first = new FakeElement(root);
  const second = new FakeElement(root);
  assert.throws(
    () => registry.register(context(), [selectable(first), selectable(second)]),
    /标识重复/,
  );
  assert.deepEqual(registry.list(), []);
  const cleanup = registry.register(context(), [
    selectable(first, { getData: () => ({ dom: first as never }) }),
  ]);
  assert.throws(
    () => registry.select(registry.list()[0].referenceId),
    /JSON 数据/,
  );
  cleanup();
  registry.register(context(), [
    selectable(second, {
      getData: () => {
        registry.expire(
          context().endpoint,
          context().consumerKey,
          context().sid,
        );
        return { stale: true };
      },
    }),
  ]);
  assert.throws(
    () => registry.select(registry.list()[0].referenceId),
    /ELEMENT_SELECTION_EXPIRED/,
  );
  assert.equal(registry.getSelection(), null);
});
