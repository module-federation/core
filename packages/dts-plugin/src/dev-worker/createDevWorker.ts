import { DevWorker, DevWorkerOptions } from './DevWorker';

export function createDevWorker(options: DevWorkerOptions): DevWorker {
  return new DevWorker({ ...options });
}
