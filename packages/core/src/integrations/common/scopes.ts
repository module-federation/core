import { SharedScopes } from '../../types';
import { WebpackSharingScopeFactory } from '../webpack/factory';
import { isWebpackAvailable } from './bundlers';

// TODO: We need a centralized scope container
export const SharingScopeFactory = {
  initializeSharingScope: (scopeName = 'default'): Promise<SharedScopes> => {
    if (isWebpackAvailable()) {
      return new WebpackSharingScopeFactory().initializeSharingScope(scopeName);
    }

    // TODO: Create a default scope?
    return Promise.resolve({
      default: {},
    });
  },
};
