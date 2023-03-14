import { createDelegatedModule } from '@module-federation/utilities';

import { FederatedNpmOptions } from '../types';

export const federateNpmLibsForRemote = (options: FederatedNpmOptions) => {
  const { url } = options;

  return createDelegatedModule(require.resolve('./default-delegate.js'), {
    url,
  });
};

export default federateNpmLibsForRemote;
