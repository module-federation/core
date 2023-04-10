// injectTopLoader.ts
import type { LoaderContext } from 'webpack';

function injectTopLoader(this: LoaderContext<Record<string, unknown>>, source: string): string {
  const delegateModuleHoistImport = "require('@module-federation/nextjs-mf/src/internal-delegate-hoist');\n";

  return `${delegateModuleHoistImport}${source}`;
}

export default injectTopLoader;
