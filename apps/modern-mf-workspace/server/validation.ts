import type {
  PlatformConfig,
  PlatformId,
  Preferences,
} from '../shared/contracts.ts';

export class HttpError extends Error {
  status: number;
  code: string;
  details: Record<string, string>;
  constructor(
    status: number,
    code: string,
    message: string,
    details: Record<string, string> = {},
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
export function invalid(message: string): never {
  throw new HttpError(400, 'INVALID_INPUT', message);
}
export function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    invalid(`${label} 必须为对象`);
  return value as Record<string, unknown>;
}
export function textValue(value: unknown, label: string, max = 200): string {
  if (typeof value !== 'string' || value.length > max)
    invalid(`${label} 必须为长度不超过 ${max} 的字符串`);
  return value;
}
function onlyKeys(
  value: Record<string, unknown>,
  keys: string[],
  label: string,
) {
  if (Object.keys(value).some((key) => !keys.includes(key)))
    invalid(`${label} 包含未知字段`);
}
function stringArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || value.length > 12)
    invalid(`${label} 必须为最多 12 项的数组`);
  return value.map((item) => textValue(item, label, 60));
}
export function validatePreferences(value: unknown): Preferences {
  const obj = record(value, 'preferences');
  onlyKeys(
    obj,
    ['budget', 'categories', 'priorities', 'notes', 'customized'],
    'preferences',
  );
  if (obj.customized !== undefined && typeof obj.customized !== 'boolean')
    invalid('customized 必须为 boolean');
  if (
    typeof obj.budget !== 'number' ||
    !Number.isFinite(obj.budget) ||
    obj.budget < 0 ||
    obj.budget > 1000000
  )
    invalid('budget 必须在 0 到 1000000 之间');
  return {
    budget: obj.budget,
    categories: stringArray(obj.categories, 'categories'),
    priorities: stringArray(obj.priorities, 'priorities'),
    notes: textValue(obj.notes, 'notes', 1000),
  };
}
export function validateConfig(id: PlatformId, value: unknown): PlatformConfig {
  const obj = record(value, 'config');
  if (obj.delivery !== 'full' && obj.delivery !== 'ondemand')
    invalid('delivery 必须为 full 或 ondemand');
  if (id === 'recommendations') {
    onlyKeys(
      obj,
      ['delivery', 'version', 'detailsEnabled', 'defaultPreferences'],
      'config',
    );
    if (obj.version !== 'v1' && obj.version !== 'v2')
      invalid('version 必须为 v1 或 v2');
    if (typeof obj.detailsEnabled !== 'boolean')
      invalid('detailsEnabled 必须为 boolean');
    return {
      delivery: obj.delivery,
      version: obj.version,
      detailsEnabled: obj.detailsEnabled,
      defaultPreferences: validatePreferences(obj.defaultPreferences),
    };
  }
  onlyKeys(obj, ['delivery', 'entries', 'recommendationMode'], 'config');
  if (
    obj.recommendationMode !== 'fixed' &&
    obj.recommendationMode !== 'dynamic'
  )
    invalid('recommendationMode 必须为 fixed 或 dynamic');
  const entries = record(obj.entries, 'entries');
  onlyKeys(entries, ['catalog', 'preferences', 'recommendations'], 'entries');
  const validatedEntries = Object.fromEntries(
    ['catalog', 'preferences', 'recommendations'].map((key) => {
      const entry = record(entries[key], `entries.${key}`);
      onlyKeys(entry, ['path', 'title', 'props'], 'entry');
      const path = textValue(entry.path, 'path', 100);
      if (!/^\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(path))
        invalid('path 必须为不含查询参数的绝对应用路径');
      const title = textValue(entry.title, 'title', 80).trim();
      if (!title) invalid('title 不可为空');
      const props = record(entry.props, 'props');
      if (JSON.stringify(props).length > 12000) invalid('props 过大');
      const serialized = JSON.stringify(props);
      if (/"(?:__proto__|constructor|prototype)"\s*:/.test(serialized))
        invalid('props 包含保留键');
      return [key, { path, title, props: JSON.parse(serialized) }];
    }),
  );
  const paths = Object.values(validatedEntries).map((entry) => entry.path);
  if (
    paths.some((path, i) =>
      paths.some(
        (other, j) =>
          i !== j && (path === other || path.startsWith(`${other}/`)),
      ),
    )
  )
    invalid('应用路径不可重叠');
  return {
    delivery: obj.delivery,
    recommendationMode: obj.recommendationMode,
    entries: validatedEntries,
  } as PlatformConfig;
}
