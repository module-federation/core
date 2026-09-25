import type { SharedCapability } from '../type';
import { SharedHandler } from './index';

export const shared: SharedCapability = {
  create: (host) => new SharedHandler(host),
};
