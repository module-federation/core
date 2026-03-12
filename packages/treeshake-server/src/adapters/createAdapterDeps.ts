import { UPLOADED_DIR } from '@/domain/upload/constant';
import { logger as defaultLogger } from '@/infra/logger';
import type {
  AdapterConfig,
  AdapterCreateResult,
  AdapterLogger,
  TreeShakeAdapter,
} from '@/adapters/types';
import type { AdapterRegistry } from './registry';

export type AdapterDeps = AdapterCreateResult;

export async function createAdapterDeps(params: {
  registry: AdapterRegistry;
  adapterId: string;
  adapterConfig?: AdapterConfig;
  logger?: AdapterLogger;
  uploadedDir?: string;
}): Promise<AdapterDeps> {
  const adapterId = params.adapterId;
  const adapter: TreeShakeAdapter = params.registry.getAdapterById(adapterId);
  return adapter.create(params.adapterConfig ?? {}, {
    logger: params.logger ?? defaultLogger,
    uploadedDir: params.uploadedDir ?? UPLOADED_DIR,
  });
}
