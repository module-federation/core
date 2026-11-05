import { registerHooks } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const canaryUrl = import.meta.resolve('@rspack-canary/core');
const rsbuildUrl = import.meta.resolve('@rsbuild/core');

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === '@rspack/core') {
      return { shortCircuit: true, url: canaryUrl };
    }
    if (specifier === '@rsbuild/core') {
      return { shortCircuit: true, url: rsbuildUrl };
    }
    return nextResolve(specifier, context);
  },
});

const rspeedyPackage = fileURLToPath(
  import.meta.resolve('@lynx-js/rspeedy/package.json'),
);
const rspeedyBin = resolve(dirname(rspeedyPackage), 'bin/rspeedy.js');
process.argv = [process.execPath, rspeedyBin, ...process.argv.slice(2)];
await import(pathToFileURL(rspeedyBin).href);
