const FUNCTION_PLACEHOLDER = 'function(){}';
const UNDEFINED_PLACEHOLDER = '[undefined]';
const CIRCULAR_PLACEHOLDER = '[circular]';
const NON_SERIALIZABLE_PLACEHOLDER = '[unserializable]';

const toStringTag = (value: unknown) =>
  Object.prototype.toString.call(value).slice(8, -1);

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

const sanitizeValue = (
  value: unknown,
  seen: WeakMap<object, unknown>,
): unknown => {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number'
  ) {
    return Number.isNaN(value) ? '[NaN]' : value;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'function') {
    return FUNCTION_PLACEHOLDER;
  }

  if (typeof value === 'undefined') {
    return UNDEFINED_PLACEHOLDER;
  }

  if (typeof value === 'bigint' || typeof value === 'symbol') {
    return String(value);
  }

  if (!(value instanceof Object)) {
    return NON_SERIALIZABLE_PLACEHOLDER;
  }

  if (seen.has(value)) {
    return CIRCULAR_PLACEHOLDER;
  }

  if (Array.isArray(value)) {
    const next: unknown[] = [];
    seen.set(value, next);
    value.forEach((item, index) => {
      next[index] = sanitizeValue(item, seen);
    });
    return next;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value instanceof RegExp) {
    return value.toString();
  }

  if (value instanceof Error) {
    const next = {
      name: value.name,
      message: value.message,
      stack: value.stack || '',
    };
    seen.set(value, next);
    return next;
  }

  if (value instanceof Map) {
    const next: unknown[] = [];
    seen.set(value, next);
    next.push(
      ...Array.from(value.entries()).map(([key, item]) => [
        sanitizeValue(key, seen),
        sanitizeValue(item, seen),
      ]),
    );
    return next;
  }

  if (value instanceof Set) {
    const next: unknown[] = [];
    seen.set(value, next);
    next.push(
      ...Array.from(value.values()).map((item) => sanitizeValue(item, seen)),
    );
    return next;
  }

  if (ArrayBuffer.isView(value)) {
    return Array.from(new Uint8Array(value.buffer));
  }

  if (value instanceof ArrayBuffer) {
    return Array.from(new Uint8Array(value));
  }

  if (typeof Node !== 'undefined' && value instanceof Node) {
    return `[${toStringTag(value)}]`;
  }

  if (typeof Window !== 'undefined' && value instanceof Window) {
    return '[Window]';
  }

  if (typeof Document !== 'undefined' && value instanceof Document) {
    return '[Document]';
  }

  const next: Record<string, unknown> = {};
  seen.set(value, next);

  const entries = isPlainObject(value)
    ? Object.keys(value).map((key) => {
        try {
          return [key, value[key]] as const;
        } catch (_error) {
          return [key, NON_SERIALIZABLE_PLACEHOLDER] as const;
        }
      })
    : Reflect.ownKeys(value).map((key) => {
        try {
          return [
            String(key),
            (value as Record<PropertyKey, unknown>)[key],
          ] as const;
        } catch (_error) {
          return [String(key), NON_SERIALIZABLE_PLACEHOLDER] as const;
        }
      });

  entries.forEach(([key, item]) => {
    try {
      next[key] = sanitizeValue(item, seen);
    } catch (_error) {
      next[key] = NON_SERIALIZABLE_PLACEHOLDER;
    }
  });

  return next;
};

export const sanitizePostMessagePayload = <T>(payload: T): T => {
  return sanitizeValue(payload, new WeakMap<object, unknown>()) as T;
};
