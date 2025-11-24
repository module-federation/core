import type { ModuleFederationRuntimePlugin } from '@module-federation/runtime';

/**
 * Runtime plugin that makes Module Federation use Lynx's native chunk loader
 * (`lynx.requireModuleAsync`) instead of DOM-based JSONP/script tags.
 */
export default function RspeedyCorePlugin(): ModuleFederationRuntimePlugin;
