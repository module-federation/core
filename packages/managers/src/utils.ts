import { PKGJsonManager } from './PKGJsonManager';
import { LOCAL_BUILD_VERSION } from './constant';
import {
  ContainerOptionsFormat,
  NormalizeSimple,
  NormalizeOptions,
  ProcessFN,
  ParsedContainerOptions,
} from './types';

function processFn<T, R>(
  options: ContainerOptionsFormat<T>,
  normalizeSimple: NormalizeSimple<R>,
  normalizeOptions: NormalizeOptions<T, R>,
  fn: ProcessFN<R>,
): void {
  const object = (obj: Record<string, string | string[] | T>): void => {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        fn(key, normalizeSimple(value, key));
      } else {
        fn(key, normalizeOptions(value as T, key));
      }
    }
  };

  const array = (
    items: (string | Record<string, string | string[] | T>)[],
  ): void => {
    for (const item of items) {
      if (typeof item === 'string') {
        fn(item, normalizeSimple(item, item));
      } else if (item && typeof item === 'object') {
        object(item as Record<string, string | string[] | T>);
      } else {
        throw new Error('Unexpected options format');
      }
    }
  };

  if (!options) {
    return;
  } else if (Array.isArray(options)) {
    array(options);
  } else if (typeof options === 'object') {
    object(options);
  } else {
    throw new Error('Unexpected options format');
  }
}

export function parseOptions<T, R>(
  options: ContainerOptionsFormat<T>,
  normalizeSimple: NormalizeSimple<R>,
  normalizeOptions: NormalizeOptions<T, R>,
): ParsedContainerOptions<R> {
  const items: ParsedContainerOptions<R> = [];
  processFn(options, normalizeSimple, normalizeOptions, (key, value) => {
    items.push([key, value]);
  });

  return items;
}

export function getBuildVersion(): string {
  if (process.env['MF_BUILD_VERSION']) {
    return process.env['MF_BUILD_VERSION'];
  }
  const pkg = new PKGJsonManager().readPKGJson();
  if (pkg?.['version'] && typeof pkg['version'] === 'string') {
    return pkg['version'];
  }
  return LOCAL_BUILD_VERSION;
}

export function getBuildName(): string | undefined {
  return process.env['MF_BUILD_NAME'];
}
