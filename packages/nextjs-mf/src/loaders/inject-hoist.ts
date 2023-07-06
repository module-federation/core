// injectTopLoader.ts
import type { LoaderContext } from 'webpack';

function injectTopLoader(
  this: LoaderContext<Record<string, unknown>>,
  source: string
): string {
  const delegateModuleHoistImport =
<<<<<<< HEAD
    "require('@ranshamay/nextjs-mf/src/internal-delegate-hoist');\n";
=======
    "require('@module-federation/nextjs-mf/src/internal-delegate-hoist');\n";
>>>>>>> ca73890b9cc05086bc0e31c9b2f4ff962695f7dd

  return `${delegateModuleHoistImport}${source}`;
}

export default injectTopLoader;
