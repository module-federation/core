import type { ModuleFederationRuntimePlugin } from '@module-federation/runtime-core/types';
import { loadLazyBundle } from '@lynx-js/react/experimental/lazy/load';

import { getLynxRuntime, type LynxGlobal } from './runtimeCore';

export default function reactLynxRuntimePlugin(): ModuleFederationRuntimePlugin {
  const lynx = getLynxRuntime(globalThis as LynxGlobal);
  if (lynx) {
    lynx.loadLazyBundle = loadLazyBundle;
  }

  return { name: 'react-lynx-lazy-bundle-runtime-plugin' };
}
