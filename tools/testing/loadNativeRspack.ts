import path from 'node:path';

export function loadNativeRspack(): typeof import('@rspack/core') {
  // Jest 29 intercepts imported createRequire and cannot load Rspack 2's ESM
  // entry. Node 24's native loader supports it and preserves the real compiler.
  const nativeModule = process.getBuiltinModule('node:module');
  return nativeModule.createRequire(
    path.resolve(__dirname, '../../packages/rspack/package.json'),
  )('@rspack/core');
}
