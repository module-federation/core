import {
  BRIDGE_SSR_PROTOCOL_VERSION,
  BridgeSSRError,
  type BridgeJSONValue,
  type BridgeSSRResult,
} from './type';

export const MF_BRIDGE_SSR_ATTR = 'data-mf-bridge-ssr';
export const MF_BRIDGE_VERSION_ATTR = 'data-mf-bridge-version';
export const MF_BRIDGE_MODULE_ATTR = 'data-mf-bridge-module';
export const MF_BRIDGE_INSTANCE_ATTR = 'data-mf-bridge-instance';

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

export function getBridgeSSRContainerAttrs(value: {
  moduleName: string;
  instanceId: string;
}): Record<string, string> {
  assertBridgeSSRIdentity(value);
  return {
    [MF_BRIDGE_SSR_ATTR]: 'true',
    [MF_BRIDGE_VERSION_ATTR]: String(BRIDGE_SSR_PROTOCOL_VERSION),
    [MF_BRIDGE_MODULE_ATTR]: value.moduleName,
    [MF_BRIDGE_INSTANCE_ATTR]: value.instanceId,
  };
}

export function hasBridgeSSRMarkup(
  dom: HTMLElement,
  value?: { moduleName?: string; instanceId?: string },
) {
  return (
    dom.getAttribute(MF_BRIDGE_SSR_ATTR) === 'true' &&
    dom.getAttribute(MF_BRIDGE_VERSION_ATTR) ===
      String(BRIDGE_SSR_PROTOCOL_VERSION) &&
    (!value?.moduleName ||
      dom.getAttribute(MF_BRIDGE_MODULE_ATTR) === value.moduleName) &&
    (!value?.instanceId ||
      dom.getAttribute(MF_BRIDGE_INSTANCE_ATTR) === value.instanceId) &&
    dom.hasChildNodes()
  );
}
