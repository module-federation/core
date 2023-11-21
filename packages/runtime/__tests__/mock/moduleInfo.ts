import { GlobalModuleInfo } from '@module-federation/sdk';
import '../../src/global';

export function setMockModuleInfos(modules: GlobalModuleInfo): () => void {
  globalThis.__FEDERATION__.moduleInfo = {
    ...modules,
  };
  return () => {
    Object.keys(modules).forEach((key) => {
      delete globalThis.__FEDERATION__.moduleInfo[key];
    });
  };
}
