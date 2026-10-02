import type { ObservabilityReactLike } from '../type';
import { getObjectValue, isRecord } from '../utils';

export function isReactLike(value: unknown): value is ObservabilityReactLike {
  if (!isRecord(value)) {
    return false;
  }

  return typeof getObjectValue(value, 'createElement') === 'function';
}

export function resolveReactLike(
  value: unknown,
): ObservabilityReactLike | undefined {
  if (isReactLike(value)) {
    return value;
  }

  if (isRecord(value)) {
    const defaultExport = getObjectValue(value, 'default');
    if (isReactLike(defaultExport)) {
      return defaultExport;
    }
  }

  return undefined;
}

export function getReactComponentName(component: unknown, fallback: string) {
  if (typeof component === 'function') {
    const displayName = (component as { displayName?: string }).displayName;
    return displayName || component.name || fallback;
  }

  if (!isRecord(component)) {
    return fallback;
  }

  const displayName = getObjectValue(component, 'displayName');
  if (typeof displayName === 'string' && displayName) {
    return displayName;
  }

  const render = getObjectValue(component, 'render');
  if (typeof render === 'function') {
    const renderFunction = render as { displayName?: string; name?: string };
    return renderFunction.displayName || renderFunction.name || fallback;
  }

  return fallback;
}

export function isLikelyReactFunctionComponent(
  component: unknown,
  allowAnonymousComponent = false,
) {
  if (typeof component !== 'function') {
    return false;
  }

  const name =
    (component as { displayName?: string }).displayName || component.name || '';
  if (/^use[A-Z0-9]/.test(name)) {
    return false;
  }

  if (allowAnonymousComponent) {
    return true;
  }

  if (!name) {
    return false;
  }

  return /^[A-Z]/.test(name);
}

export function copyComponentStatics(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
) {
  const reserved = new Set([
    'arguments',
    'caller',
    'length',
    'name',
    'prototype',
    'displayName',
  ]);

  Object.getOwnPropertyNames(source).forEach((key) => {
    if (reserved.has(key)) {
      return;
    }

    const descriptor = Object.getOwnPropertyDescriptor(source, key);
    if (!descriptor || !descriptor.configurable) {
      return;
    }

    try {
      Object.defineProperty(target, key, descriptor);
    } catch {
      // Static metadata is best effort and must not affect remote rendering.
    }
  });
}

export function cloneModuleWithDefaultExport(
  moduleExports: Record<string, unknown>,
  defaultExport: unknown,
) {
  const descriptors = Object.getOwnPropertyDescriptors(moduleExports);
  const defaultDescriptor = descriptors['default'];

  descriptors['default'] = {
    configurable: true,
    enumerable: defaultDescriptor?.enumerable ?? true,
    writable: true,
    value: defaultExport,
  };

  return Object.defineProperties(
    Object.create(Object.getPrototypeOf(moduleExports)),
    descriptors,
  );
}

export function resolveReactComponentTarget(
  component: unknown,
  defaultExportMode: 'preserve' | 'component' = 'preserve',
  allowAnonymousComponent = false,
):
  | {
      component: unknown;
      createResult: (wrappedComponent: unknown) => unknown;
    }
  | undefined {
  if (isLikelyReactFunctionComponent(component, allowAnonymousComponent)) {
    return {
      component,
      createResult: (wrappedComponent) => wrappedComponent,
    };
  }

  if (!isRecord(component)) {
    return undefined;
  }

  const defaultExport = getObjectValue(component, 'default');
  if (!isLikelyReactFunctionComponent(defaultExport, allowAnonymousComponent)) {
    return undefined;
  }

  return {
    component: defaultExport,
    createResult: (wrappedComponent) => {
      const descriptor = Object.getOwnPropertyDescriptor(component, 'default');
      let defaultExportReplaced = false;

      try {
        if (!descriptor || descriptor.writable || descriptor.set) {
          component['default'] = wrappedComponent;
          defaultExportReplaced = true;
        } else if (descriptor.configurable) {
          Object.defineProperty(component, 'default', {
            configurable: true,
            enumerable: descriptor.enumerable,
            writable: true,
            value: wrappedComponent,
          });
          defaultExportReplaced = true;
        }
      } catch {
        // If the module namespace is read-only, leave the remote module untouched.
      }

      if (defaultExportMode === 'component') {
        return wrappedComponent;
      }

      return defaultExportReplaced
        ? undefined
        : cloneModuleWithDefaultExport(component, wrappedComponent);
    },
  };
}
