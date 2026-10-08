import type { Json } from '../../shared/contracts.ts';
import type { RemoteContext, RemoteSelectable } from '../remotes/types.ts';

export interface ElementSelection {
  referenceId: string;
  id: string;
  label: string;
  kind: RemoteSelectable['kind'];
  context: RemoteContext;
  data: Record<string, Json>;
}

export interface SelectableHandle {
  referenceId: string;
  id: string;
  label: string;
  kind: RemoteSelectable['kind'];
  context: RemoteContext;
  element: HTMLElement;
}

interface Registration extends SelectableHandle {
  owner: Element;
  getData: RemoteSelectable['getData'];
}

const mountSelector = '[data-selection-mount-id]';
const snapshotKey = (endpoint: string, sid: string) =>
  JSON.stringify([endpoint, sid]);
const consumerKey = (endpoint: string, consumer: string) =>
  JSON.stringify([endpoint, consumer]);

// Reject DOM nodes, functions, cycles and other non-JSON values instead of
// silently serializing page internals into the conversation.
function jsonCopy(value: unknown, seen = new Set<object>()): Json {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value))
  )
    return value;
  if (typeof value !== 'object' || seen.has(value))
    throw new Error('所选元素只允许提供 JSON 数据');
  const prototype = Object.getPrototypeOf(value);
  if (
    !Array.isArray(value) &&
    prototype !== Object.prototype &&
    prototype !== null
  )
    throw new Error('所选元素只允许提供 JSON 数据');
  seen.add(value);
  try {
    if (Array.isArray(value)) return value.map((item) => jsonCopy(item, seen));
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, jsonCopy(item, seen)]),
    );
  } finally {
    seen.delete(value);
  }
}

export class ElementSelectionRegistry {
  private registrations = new Map<string, Registration>();
  private listeners = new Set<() => void>();
  private expiredSnapshots = new Set<string>();
  private expiredConsumers = new Set<string>();
  private sequence = 0;
  private selected: ElementSelection | null = null;
  private trace: (event: string, detail?: unknown) => void;

  constructor(trace: (event: string, detail?: unknown) => void = () => {}) {
    this.trace = trace;
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private emit() {
    this.listeners.forEach((listener) => listener());
  }

  private isExpired(context: RemoteContext) {
    return (
      this.expiredSnapshots.has(snapshotKey(context.endpoint, context.sid)) ||
      this.expiredConsumers.has(
        consumerKey(context.endpoint, context.consumerKey),
      )
    );
  }

  private isActive(registration: Registration) {
    return (
      this.registrations.get(registration.referenceId) === registration &&
      !this.isExpired(registration.context) &&
      registration.element.isConnected &&
      registration.element.closest(mountSelector) === registration.owner &&
      registration.owner.getAttribute('data-selection-mount-id') ===
        registration.context.mountId
    );
  }

  private publicHandle(registration: Registration): SelectableHandle {
    const { referenceId, id, label, kind, element, context } = registration;
    return {
      referenceId,
      id,
      label,
      kind,
      element,
      context: structuredClone(context),
    };
  }

  register(context: RemoteContext, definitions: RemoteSelectable[]) {
    if (this.isExpired(context)) {
      this.trace('selection.disabled', {
        mountId: context.mountId,
        sid: context.sid,
      });
      return () => {};
    }
    const ids = new Set<string>();
    const elements = new Set<HTMLElement>();
    const owners = definitions.map((definition) => {
      const { element, id, label, kind } = definition;
      const owner = element.closest(mountSelector);
      if (
        !element.isConnected ||
        !owner ||
        owner.getAttribute('data-selection-mount-id') !== context.mountId
      )
        throw new Error('可选择元素必须属于当前已挂载页面');
      if (
        !id.trim() ||
        !label.trim() ||
        !['product', 'action', 'section'].includes(kind) ||
        typeof definition.getData !== 'function' ||
        ids.has(id) ||
        elements.has(element) ||
        [...this.registrations.values()].some(
          (registered) =>
            this.isActive(registered) &&
            (registered.element === element ||
              (registered.context.mountId === context.mountId &&
                registered.id === id)),
        )
      )
        throw new Error(`可选择元素标识重复或声明不合法：${id}`);
      ids.add(id);
      elements.add(element);
      return owner;
    });
    const registered = definitions.map((definition, index) => {
      const registration: Registration = {
        ...definition,
        context: structuredClone(context),
        owner: owners[index],
        referenceId: `selection_${context.mountId}_${++this.sequence}`,
      };
      this.registrations.set(registration.referenceId, registration);
      return registration;
    });
    this.trace('selection.register', {
      mountId: context.mountId,
      references: registered.map((entry) => entry.referenceId),
    });
    this.emit();
    let disposed = false;
    return () => {
      if (disposed) return;
      disposed = true;
      for (const registration of registered) {
        this.registrations.delete(registration.referenceId);
        if (this.selected?.referenceId === registration.referenceId)
          this.selected = null;
      }
      this.trace('selection.unregister', { mountId: context.mountId });
      this.emit();
    };
  }

  list(): SelectableHandle[] {
    return [...this.registrations.values()]
      .filter((entry) => this.isActive(entry))
      .map((entry) => this.publicHandle(entry));
  }

  findTarget(target: Element): SelectableHandle | null {
    const owner = target.closest(mountSelector);
    if (!owner || !target.isConnected) return null;
    // Walk the actual ancestry, and stop at a nested application's boundary.
    for (
      let current: Element | null = target;
      current;
      current = current.parentElement
    ) {
      const entry = [...this.registrations.values()].find(
        (registered) =>
          registered.element === current &&
          registered.owner === owner &&
          this.isActive(registered),
      );
      if (entry) return this.publicHandle(entry);
      if (current === owner) break;
    }
    return null;
  }

  private read(referenceId: string): ElementSelection | null {
    const registration = this.registrations.get(referenceId);
    if (!registration || !this.isActive(registration)) return null;
    const raw = registration.getData();
    if (!raw || Array.isArray(raw) || typeof raw !== 'object')
      throw new Error('所选元素必须提供 JSON 对象');
    const data = jsonCopy(raw) as Record<string, Json>;
    // A producer callback can synchronously trigger disposal or expiration.
    if (!this.isActive(registration)) return null;
    const { id, label, kind, context } = registration;
    return {
      referenceId,
      id,
      label,
      kind,
      context: structuredClone(context),
      data,
    };
  }

  select(referenceId: string): ElementSelection {
    const selection = this.read(referenceId);
    if (!selection)
      throw new Error(`ELEMENT_SELECTION_EXPIRED: ${referenceId}`);
    this.selected = selection;
    this.trace('selection.select', {
      referenceId,
      label: selection.label,
      mountId: selection.context.mountId,
    });
    this.emit();
    return structuredClone(selection);
  }

  getSelection(): ElementSelection | null {
    if (this.selected) {
      const registration = this.registrations.get(this.selected.referenceId);
      if (!registration || !this.isActive(registration)) this.selected = null;
    }
    return this.selected;
  }

  readSelection(): ElementSelection | null {
    const selected = this.getSelection();
    if (!selected) return null;
    this.selected = this.read(selected.referenceId);
    this.emit();
    return this.selected ? structuredClone(this.selected) : null;
  }

  clear() {
    if (!this.selected) return;
    this.selected = null;
    this.trace('selection.clear');
    this.emit();
  }

  expire(endpoint: string, consumer: string, expectedSid?: string) {
    const sids = new Set(
      expectedSid
        ? [expectedSid]
        : [...this.registrations.values()]
            .filter(
              ({ context }) =>
                context.endpoint === endpoint &&
                context.consumerKey === consumer,
            )
            .map(({ context }) => context.sid),
    );
    for (const sid of sids)
      this.expiredSnapshots.add(snapshotKey(endpoint, sid));
    if (!sids.size) this.expiredConsumers.add(consumerKey(endpoint, consumer));
    for (const [referenceId, registration] of this.registrations) {
      if (this.isExpired(registration.context)) {
        this.registrations.delete(referenceId);
        if (this.selected?.referenceId === referenceId) this.selected = null;
      }
    }
    this.trace('selection.expired', {
      endpoint,
      consumerKey: consumer,
      expectedSid,
    });
    this.emit();
  }
}
