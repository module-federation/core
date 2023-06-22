import { getContainerKey, getScope } from '../../containers';
import { WebpackScriptFactory } from '../webpack/factory';
import { AsyncContainer, RemoteOptions } from '../../types';
import { isWebpackAvailable } from './bundlers';

export const ScriptFactory = {
  loadScript: (remoteOptions: RemoteOptions): AsyncContainer | undefined => {
    const scope = getScope();
    const containerKey = getContainerKey(remoteOptions);

    if (isWebpackAvailable()) {
      return new WebpackScriptFactory().loadScript(
        scope,
        containerKey,
        remoteOptions
      );
    }

    return undefined;
  },
};
