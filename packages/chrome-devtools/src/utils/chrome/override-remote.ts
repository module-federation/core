import runtimeHelpers from '@module-federation/runtime/helpers';

import type { ModuleFederationRuntimePlugin } from '@module-federation/runtime';

import { definePropertyGlobalVal } from '../sdk';
import { __FEDERATION_DEVTOOLS__ } from '@/template';

type BeforeRegisterRemoteArgs = Parameters<
  NonNullable<ModuleFederationRuntimePlugin['beforeRegisterRemote']>
>[0];

const chromeOverrideRemotesPlugin: () => ModuleFederationRuntimePlugin =
  function () {
    return {
      name: 'mf-chrome-devtools-override-remotes-plugin',
      beforeRegisterRemote(args: BeforeRegisterRemoteArgs) {
        try {
          const { remote } = args;
          const overrideRemote =
            runtimeHelpers.global.nativeGlobal.localStorage.getItem(
              __FEDERATION_DEVTOOLS__,
            );
          if (!overrideRemote) {
            return args;
          }
          const parsedOverrideRemote = JSON.parse(overrideRemote);
          const overrideEntryOrVersion = parsedOverrideRemote[remote.name];
          if (overrideEntryOrVersion) {
            if (overrideEntryOrVersion.startsWith('http')) {
              delete (remote as { version?: string }).version;
              (remote as { entry?: string }).entry = overrideEntryOrVersion;
            } else {
              delete (remote as { entry?: string }).entry;
              (remote as { version?: string }).version = overrideEntryOrVersion;
            }
          }
        } catch (e) {
          console.error(e);
        }
        return args;
      },
    };
  };

if (!window?.__FEDERATION__) {
  definePropertyGlobalVal(window, '__FEDERATION__', {});
  definePropertyGlobalVal(window, '__VMOK__', window.__FEDERATION__);
}

if (!window?.__FEDERATION__.__GLOBAL_PLUGIN__) {
  window.__FEDERATION__.__GLOBAL_PLUGIN__ = [];
}

window.__FEDERATION__.__GLOBAL_PLUGIN__?.push(chromeOverrideRemotesPlugin());
