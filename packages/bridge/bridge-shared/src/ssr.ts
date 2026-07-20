import {
  BRIDGE_SSR_PROTOCOL_VERSION,
  BridgeSSRError,
  type BridgeHydrationRegistry,
  type BridgeHydrationSnapshot,
  type BridgeJSONValue,
  type BridgeSSRReference,
  type BridgeSSRResult,
  type BridgeSSRStateEnvelope,
} from './type';

export const MF_BRIDGE_SSR_ATTR = 'data-mf-bridge-ssr';
export const MF_BRIDGE_VERSION_ATTR = 'data-mf-bridge-version';
export const MF_BRIDGE_MODULE_ATTR = 'data-mf-bridge-module';
export const MF_BRIDGE_INSTANCE_ATTR = 'data-mf-bridge-instance';
export const MF_BRIDGE_SLOT_ATTR = 'data-mf-bridge-slot';
export const MF_BRIDGE_MOUNT_ATTR = 'data-mf-bridge-mount';
export const MF_BRIDGE_STATE_ATTR = 'data-mf-bridge-state';

function assertPrintable(value: string, label: string) {
  if (!value || /[\u0000-\u001f\u007f]/.test(value)) {
    throw new BridgeSSRError(
      `Bridge SSR ${label} must be a non-empty printable string`,
    );
  }
}

export function assertBridgeSSRIdentity(value: {
  moduleName: string;
  instanceId: string;
}) {
  assertPrintable(value.moduleName, 'moduleName');
  assertPrintable(value.instanceId, 'instanceId');
}

function validateJSON(
  value: unknown,
  path: string,
  ancestors: WeakSet<object>,
): void {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean'
  ) {
    return;
  }
  if (typeof value === 'number') {
    if (Number.isFinite(value)) return;
    throw new BridgeSSRError(`Bridge SSR value at ${path} must be finite`);
  }
  if (typeof value !== 'object' || value === undefined) {
    throw new BridgeSSRError(
      `Bridge SSR value at ${path} must be JSON serializable`,
    );
  }
  if (ancestors.has(value)) {
    throw new BridgeSSRError(`Bridge SSR value at ${path} must not be cyclic`);
  }
  ancestors.add(value);
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      if (!Object.prototype.hasOwnProperty.call(value, index)) {
        throw new BridgeSSRError(
          `Bridge SSR array at ${path} must not be sparse`,
        );
      }
      validateJSON(value[index], `${path}[${index}]`, ancestors);
    }
  } else {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new BridgeSSRError(
        `Bridge SSR value at ${path} must use plain objects`,
      );
    }
    for (const [key, descriptor] of Object.entries(
      Object.getOwnPropertyDescriptors(value),
    )) {
      if (key === '__proto__' || key === 'prototype' || key === 'constructor') {
        throw new BridgeSSRError(
          `Bridge SSR value at ${path} must not contain ${key}`,
        );
      }
      if (
        !descriptor.enumerable ||
        !Object.prototype.hasOwnProperty.call(descriptor, 'value')
      ) {
        throw new BridgeSSRError(
          `Bridge SSR value at ${path}.${key} must be an enumerable data property`,
        );
      }
      validateJSON(descriptor.value, `${path}.${key}`, ancestors);
    }
    if (Object.getOwnPropertySymbols(value).length > 0) {
      throw new BridgeSSRError(
        `Bridge SSR value at ${path} must not contain symbol keys`,
      );
    }
  }
  ancestors.delete(value);
}

export function assertBridgeJSONValue(
  value: unknown,
): asserts value is BridgeJSONValue {
  validateJSON(value, 'state', new WeakSet());
}

export function serializeBridgeJSON(value: BridgeJSONValue): string {
  assertBridgeJSONValue(value);
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export function serializeBridgeSSRResult(result: BridgeSSRResult): string {
  assertBridgeSSRResult(result);
  return JSON.stringify(result)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export function toBridgeSSRReference(
  result: BridgeSSRResult,
): BridgeSSRReference {
  assertBridgeSSRResult(result);
  return Object.freeze({
    protocolVersion: result.protocolVersion,
    moduleName: result.moduleName,
    instanceId: result.instanceId,
  });
}

export function assertBridgeSSRReference(
  value: unknown,
): asserts value is BridgeSSRReference {
  if (!value || typeof value !== 'object') {
    throw new BridgeSSRError('Bridge SSR reference is invalid');
  }
  const reference = value as Partial<BridgeSSRReference>;
  if (
    Object.keys(reference).some(
      (key) =>
        key !== 'protocolVersion' &&
        key !== 'moduleName' &&
        key !== 'instanceId',
    ) ||
    reference.protocolVersion !== BRIDGE_SSR_PROTOCOL_VERSION ||
    typeof reference.moduleName !== 'string' ||
    typeof reference.instanceId !== 'string'
  ) {
    throw new BridgeSSRError('Bridge SSR reference is incompatible');
  }
  assertBridgeSSRIdentity({
    moduleName: reference.moduleName,
    instanceId: reference.instanceId,
  });
}

export function serializeBridgeSSRStateEnvelope(
  envelope: BridgeSSRStateEnvelope,
): string {
  const allowedKeys = new Set([
    'protocolVersion',
    'moduleName',
    'instanceId',
    'state',
  ]);
  if (
    !envelope ||
    typeof envelope !== 'object' ||
    Array.isArray(envelope) ||
    Object.keys(envelope).some((key) => !allowedKeys.has(key))
  ) {
    throw new BridgeSSRError('Bridge SSR state envelope is incompatible');
  }
  assertBridgeSSRReference({
    protocolVersion: envelope.protocolVersion,
    moduleName: envelope.moduleName,
    instanceId: envelope.instanceId,
  });
  if (envelope.state !== undefined) assertBridgeJSONValue(envelope.state);
  return JSON.stringify(envelope)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export function assertBridgeSSRResult(
  value: unknown,
): asserts value is BridgeSSRResult {
  if (!value || typeof value !== 'object') {
    throw new BridgeSSRError('Bridge SSR returned an invalid result');
  }
  const result = value as Partial<BridgeSSRResult>;
  const allowedKeys = new Set([
    'protocolVersion',
    'moduleName',
    'instanceId',
    'html',
    'dehydratedState',
  ]);
  if (Object.keys(result).some((key) => !allowedKeys.has(key))) {
    throw new BridgeSSRError('Bridge SSR returned unsupported result fields');
  }
  if (
    result.protocolVersion !== BRIDGE_SSR_PROTOCOL_VERSION ||
    typeof result.moduleName !== 'string' ||
    typeof result.instanceId !== 'string' ||
    typeof result.html !== 'string'
  ) {
    throw new BridgeSSRError('Bridge SSR returned an incompatible result');
  }
  assertBridgeSSRIdentity({
    moduleName: result.moduleName,
    instanceId: result.instanceId,
  });
  if (result.dehydratedState !== undefined) {
    assertBridgeJSONValue(result.dehydratedState);
  }
}

export function getMatchingBridgeSSRResult(
  value: unknown,
  expected: { moduleName?: string; instanceId?: string },
): BridgeSSRResult | undefined {
  if (value === undefined) return undefined;
  assertBridgeSSRResult(value);
  if (
    (expected.moduleName !== undefined &&
      value.moduleName !== expected.moduleName) ||
    (expected.instanceId !== undefined &&
      value.instanceId !== expected.instanceId)
  ) {
    return undefined;
  }
  return value;
}

export function getMatchingBridgeSSRPayload(
  value: unknown,
  expected: { moduleName?: string; instanceId?: string },
): BridgeSSRResult | BridgeSSRReference | undefined {
  if (value === undefined) return undefined;
  if (value && typeof value === 'object' && 'html' in value) {
    assertBridgeSSRResult(value);
  } else {
    assertBridgeSSRReference(value);
  }
  if (
    (expected.moduleName !== undefined &&
      value.moduleName !== expected.moduleName) ||
    (expected.instanceId !== undefined &&
      value.instanceId !== expected.instanceId)
  ) {
    return undefined;
  }
  return value;
}

export function getBridgeSSRContainerAttrs(value: {
  moduleName: string;
  instanceId: string;
}): Record<string, string> {
  assertBridgeSSRIdentity(value);
  return {
    [MF_BRIDGE_SSR_ATTR]: 'true',
    [MF_BRIDGE_MOUNT_ATTR]: 'true',
    [MF_BRIDGE_VERSION_ATTR]: String(BRIDGE_SSR_PROTOCOL_VERSION),
    [MF_BRIDGE_MODULE_ATTR]: value.moduleName,
    [MF_BRIDGE_INSTANCE_ATTR]: value.instanceId,
  };
}

export function getBridgeSSRSlotAttrs(value: {
  moduleName: string;
  instanceId: string;
}): Record<string, string> {
  assertBridgeSSRIdentity(value);
  return {
    [MF_BRIDGE_SLOT_ATTR]: 'true',
    [MF_BRIDGE_VERSION_ATTR]: String(BRIDGE_SSR_PROTOCOL_VERSION),
    [MF_BRIDGE_MODULE_ATTR]: value.moduleName,
    [MF_BRIDGE_INSTANCE_ATTR]: value.instanceId,
  };
}

export function hasBridgeSSRMarkup(
  dom: HTMLElement,
  value?: { moduleName?: string; instanceId?: string },
) {
  // Empty SSR output is still hydration-eligible: trust markers/identity, not
  // child presence. Remotes may render null/empty fragments with state only.
  return (
    dom.getAttribute(MF_BRIDGE_SSR_ATTR) === 'true' &&
    dom.getAttribute(MF_BRIDGE_VERSION_ATTR) ===
      String(BRIDGE_SSR_PROTOCOL_VERSION) &&
    (!value?.moduleName ||
      dom.getAttribute(MF_BRIDGE_MODULE_ATTR) === value.moduleName) &&
    (!value?.instanceId ||
      dom.getAttribute(MF_BRIDGE_INSTANCE_ATTR) === value.instanceId)
  );
}

function directChildrenWithAttribute<T extends Element>(
  parent: Element,
  attribute: string,
): T[] {
  return Array.from(parent.children).filter(
    (child) => child.getAttribute(attribute) === 'true',
  ) as T[];
}

function freezeJSONValue(
  value: BridgeJSONValue | undefined,
): BridgeJSONValue | undefined {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) {
    return value;
  }
  if (Array.isArray(value)) value.forEach((item) => freezeJSONValue(item));
  else Object.values(value).forEach((item) => freezeJSONValue(item));
  Object.freeze(value);
  return value;
}

function hydrationError(message: string, cause?: unknown) {
  return new BridgeSSRError(message, cause);
}

function hydrationIdentityKey(moduleName: string, instanceId: string) {
  return `${moduleName}\0${instanceId}`;
}

function readSlotSnapshot(slot: HTMLElement): BridgeHydrationSnapshot {
  const versionAttr = slot.getAttribute(MF_BRIDGE_VERSION_ATTR);
  const moduleName = slot.getAttribute(MF_BRIDGE_MODULE_ATTR) || '';
  const instanceId = slot.getAttribute(MF_BRIDGE_INSTANCE_ATTR) || '';
  assertBridgeSSRIdentity({ moduleName, instanceId });
  if (versionAttr !== String(BRIDGE_SSR_PROTOCOL_VERSION)) {
    throw hydrationError(
      `Bridge SSR slot ${moduleName}:${instanceId} uses unsupported protocol version ${versionAttr}`,
    );
  }
  const protocolVersion = BRIDGE_SSR_PROTOCOL_VERSION;

  const mounts = directChildrenWithAttribute<HTMLElement>(
    slot,
    MF_BRIDGE_MOUNT_ATTR,
  );
  const scripts = directChildrenWithAttribute<HTMLScriptElement>(
    slot,
    MF_BRIDGE_STATE_ATTR,
  );
  if (mounts.length !== 1 || scripts.length !== 1) {
    throw hydrationError(
      `Bridge SSR slot ${instanceId} must contain exactly one direct mount and state child`,
    );
  }

  const [mount] = mounts;
  const [script] = scripts;
  if (
    slot.children.length !== 2 ||
    slot.children[0] !== mount ||
    slot.children[1] !== script ||
    script.tagName !== 'SCRIPT'
  ) {
    throw hydrationError(
      `Bridge SSR slot ${instanceId} must contain only its direct mount and state children in order`,
    );
  }
  if (
    mount.getAttribute(MF_BRIDGE_MODULE_ATTR) !== moduleName ||
    mount.getAttribute(MF_BRIDGE_INSTANCE_ATTR) !== instanceId ||
    mount.getAttribute(MF_BRIDGE_VERSION_ATTR) !== String(protocolVersion)
  ) {
    throw hydrationError(
      `Bridge SSR slot ${instanceId} mount metadata does not match its slot`,
    );
  }
  if (script.type !== 'application/json' || !script.textContent) {
    throw hydrationError(
      `Bridge SSR slot ${instanceId} has an invalid state envelope`,
    );
  }

  let envelope: BridgeSSRStateEnvelope;
  try {
    envelope = JSON.parse(script.textContent) as BridgeSSRStateEnvelope;
  } catch (error) {
    throw hydrationError(
      `Bridge SSR slot ${instanceId} state envelope is not valid JSON`,
      error,
    );
  }
  const envelopeKeys = Object.keys(envelope);
  if (
    !envelope ||
    typeof envelope !== 'object' ||
    Array.isArray(envelope) ||
    envelopeKeys.some(
      (key) =>
        key !== 'protocolVersion' &&
        key !== 'moduleName' &&
        key !== 'instanceId' &&
        key !== 'state',
    )
  ) {
    throw hydrationError(
      `Bridge SSR slot ${instanceId} has an incompatible state envelope`,
    );
  }
  if (
    envelope.protocolVersion !== protocolVersion ||
    envelope.moduleName !== moduleName ||
    envelope.instanceId !== instanceId
  ) {
    throw hydrationError(
      `Bridge SSR slot ${instanceId} state metadata does not match its slot`,
    );
  }
  if (envelope.state !== undefined) assertBridgeJSONValue(envelope.state);

  return Object.freeze({
    protocolVersion: BRIDGE_SSR_PROTOCOL_VERSION,
    moduleName,
    instanceId,
    html: mount.innerHTML,
    state: freezeJSONValue(envelope.state),
  });
}

export function createBridgeHydrationRegistry(
  root?: ParentNode,
): BridgeHydrationRegistry {
  const hydrationRoot =
    root ?? (typeof document === 'undefined' ? undefined : document);
  if (!hydrationRoot) {
    throw hydrationError(
      'createBridgeHydrationRegistry requires a document root',
    );
  }
  const snapshots = new Map<string, BridgeHydrationSnapshot>();
  const errors = new Map<string, BridgeSSRError>();

  for (const slot of Array.from(
    hydrationRoot.querySelectorAll<HTMLElement>(
      `[${MF_BRIDGE_SLOT_ATTR}="true"]`,
    ),
  )) {
    const moduleName = slot.getAttribute(MF_BRIDGE_MODULE_ATTR) || '';
    const instanceId = slot.getAttribute(MF_BRIDGE_INSTANCE_ATTR) || '';
    const key = hydrationIdentityKey(moduleName, instanceId);
    if (snapshots.has(key) || errors.has(key)) {
      snapshots.delete(key);
      errors.set(
        key,
        hydrationError(
          `Duplicate Bridge SSR identity ${moduleName}:${instanceId}`,
        ),
      );
      continue;
    }
    try {
      const snapshot = readSlotSnapshot(slot);
      snapshots.set(
        hydrationIdentityKey(snapshot.moduleName, snapshot.instanceId),
        snapshot,
      );
    } catch (error) {
      errors.set(
        key,
        error instanceof BridgeSSRError
          ? error
          : hydrationError(
              `Unable to read Bridge SSR slot ${moduleName}:${instanceId}`,
              error,
            ),
      );
    }
  }

  const peek = (moduleName: string, instanceId: string) => {
    const key = hydrationIdentityKey(moduleName, instanceId);
    const error = errors.get(key);
    if (error) throw error;
    return snapshots.get(key);
  };

  return {
    peek,
    consume(moduleName, instanceId) {
      const key = hydrationIdentityKey(moduleName, instanceId);
      const snapshot = peek(moduleName, instanceId);
      snapshots.delete(key);
      errors.delete(key);
      return snapshot;
    },
    fail(moduleName, instanceId) {
      const key = hydrationIdentityKey(moduleName, instanceId);
      snapshots.delete(key);
      errors.delete(key);
    },
  };
}
