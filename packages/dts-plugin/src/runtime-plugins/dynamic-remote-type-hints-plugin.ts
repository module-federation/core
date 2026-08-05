import type { ModuleFederationRuntimePlugin } from '@module-federation/runtime';
import { createWebsocket } from '../server/createWebsocket';
import {
  AddDynamicRemoteAction,
  FetchTypesAction,
} from '../server/message/Action';
import { getIpFromEntry } from '../dev-worker/utils';

declare const FEDERATION_IPV4: string | undefined;
const PLUGIN_NAME = 'dynamic-remote-type-hints-plugin';

function dynamicRemoteTypeHintsPlugin(): ModuleFederationRuntimePlugin {
  // `createWebsocket` relies on the global `WebSocket`, which only exists in
  // browsers and Node >= 22. In a Node/SSR host on older Node it is undefined,
  // so guard construction to degrade gracefully instead of throwing at init.
  let ws = typeof WebSocket !== 'undefined' ? createWebsocket() : undefined;
  let isConnected = false;
  if (ws) {
    ws.onopen = () => {
      isConnected = true;
    };

    ws.onerror = (err) => {
      console.error(`[ ${PLUGIN_NAME} ] err: ${err}`);
    };
  }

  return {
    name: 'dynamic-remote-type-hints-plugin',
    registerRemote(args) {
      const { remote, origin } = args;
      try {
        if (!isConnected) {
          return args;
        }
        if (!('entry' in remote)) {
          return args;
        }
        const defaultIpV4 =
          typeof FEDERATION_IPV4 === 'string' ? FEDERATION_IPV4 : '127.0.0.1';
        const remoteIp = getIpFromEntry(remote.entry, defaultIpV4);
        const remoteInfo = {
          name: remote.name,
          url: remote.entry,
          alias: remote.alias || remote.name,
        };
        if (remoteIp) {
          ws?.send(
            JSON.stringify(
              new AddDynamicRemoteAction({
                remoteIp,
                remoteInfo,
                name: origin.name,
                ip: defaultIpV4,
              }),
            ),
          );
        }
        // fetch types
        ws?.send(
          JSON.stringify(
            new FetchTypesAction({
              name: origin.name,
              ip: defaultIpV4,
              remoteInfo,
            }),
          ),
        );

        return args;
      } catch (err) {
        console.error(new Error(err as unknown as any));
        return args;
      }
    },
  };
}

export default dynamicRemoteTypeHintsPlugin;
