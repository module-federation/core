import type { logger } from '@/infra/logger';
import type { ObjectStore } from '@/ports/objectStore';
import type { ProjectPublisher } from '@/ports/projectPublisher';

export type AppEnv = {
  Variables: {
    logger: typeof logger;
    objectStore: ObjectStore;
    projectPublisher?: ProjectPublisher;
  };
};
