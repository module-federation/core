import { warn } from './utils/logger';

export const RUNTIME_IMAGE = Symbol.for('module-federation.runtime-image.v1');

export interface RuntimeImageDescriptorV1 {
  contract: 1;
  compatibilityId: string;
  required: readonly string[];
  forbidden: readonly string[];
  available: readonly string[];
  target: string;
  entryLoadingIdentity: string;
}

export function readRuntimeImage(
  instance: object,
): RuntimeImageDescriptorV1 | undefined {
  return (instance as { [RUNTIME_IMAGE]?: RuntimeImageDescriptorV1 })[
    RUNTIME_IMAGE
  ];
}

export function attachRuntimeImage(
  instance: object,
  image: RuntimeImageDescriptorV1,
): void {
  Object.defineProperty(instance, RUNTIME_IMAGE, {
    value: image,
    enumerable: false,
    configurable: true,
  });
}

export function assertRuntimeImageCompatible(
  current: RuntimeImageDescriptorV1 | undefined,
  next: RuntimeImageDescriptorV1 | undefined,
): void {
  if (!current || !next) {
    if (current || next) {
      warn(
        'Runtime image metadata is missing. Reuse stays allowed until a mismatch is known.',
      );
    }
    return;
  }
  if (current.compatibilityId !== next.compatibilityId) {
    throw new Error(
      `Refusing to reuse runtime state from ${current.compatibilityId} with ${next.compatibilityId}.`,
    );
  }
  if (current.target !== next.target) {
    throw new Error(
      `Refusing to reuse a ${current.target} runtime image for ${next.target}.`,
    );
  }
  if (current.entryLoadingIdentity !== next.entryLoadingIdentity) {
    throw new Error(
      `Refusing to reuse entry loader ${current.entryLoadingIdentity} with ${next.entryLoadingIdentity}.`,
    );
  }
  for (const capability of next.required) {
    const provided =
      current.available.includes(capability) ||
      current.required.includes(capability);
    if (!provided) {
      throw new Error(
        `Runtime image is missing required capability ${capability}.`,
      );
    }
  }
  for (const capability of next.forbidden) {
    const exposed =
      current.available.includes(capability) ||
      current.required.includes(capability);
    if (exposed) {
      throw new Error(
        `Runtime image exposes forbidden capability ${capability}.`,
      );
    }
  }
}
