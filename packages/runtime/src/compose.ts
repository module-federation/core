import type { Capabilities } from '@module-federation/runtime-core/kernel';
import { initInstance } from './instance';

export {
  getRemoteEntry,
  getGlobalSnapshotInfoByModuleInfo,
} from '@module-federation/runtime-core/kernel';
export type { Capabilities };
export { createInstance, getCurrentInstance } from './instance';

export function init(options: any, capabilities: Capabilities = {}): any {
  return initInstance(options, capabilities);
}
