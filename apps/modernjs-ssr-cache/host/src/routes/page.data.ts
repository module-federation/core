import { release, moduleInstance } from 'remote/Counter';
const loaderModuleInstance = Math.random().toString(36).slice(2, 10);
const loaderInitializedAt = new Date().toISOString();
let loaderCalls = 0;
export const loader = async ({ request }) => {
  return {
    ...(await globalThis.__labRequest(request)),
    loaderModuleInstance,
    loaderInitializedAt,
    loaderCalls: ++loaderCalls,
    remoteRelease: release,
    remoteModuleInstance: moduleInstance,
  };
};
