import type { ModuleFederation } from '../core';
import { SharedHandler } from './index';
import { formatShareConfigs } from '../utils/share';

export const shared = {
  kind: 'shared' as const,
  create: (host: ModuleFederation) => new SharedHandler(host),
  formatShareConfigs,
};
