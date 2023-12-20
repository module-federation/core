//@ts-nocheck
import { FederationRuntimePlugin } from '@module-federation/runtime/type';
import * as React from 'react';
export default function (): FederationRuntimePlugin {
  return {
    name: 'next-internal-plugin',
    errorLoadRemote(args) {
      console.log('errorLoadRemote', args.id);
      const pg = function () {
        console.log('i should be executed in console');
        return React.createElement('div', {}, 'testing');
      };
      // @ts-ignore
      pg.getInitialProps = function (ctx) {
        console.log('in get initial props');
        console.log(ctx);
      };
      return { default: pg };
    },
    beforeInit(args) {
      if (
        typeof __webpack_runtime_id__ === 'string' &&
        !__webpack_runtime_id__.startsWith('webpack')
      ) {
        return args;
      }

      // if (__webpack_runtime_id__ && !__webpack_runtime_id__.startsWith('webpack')) return args;
      const { moduleCache, name } = args.origin;
      const gs = __webpack_require__.g || new Function('return globalThis');
      const attachedRemote = gs[name];
      if (attachedRemote) {
        moduleCache.set(name, attachedRemote);
      }

      return args;
    },
    init(args) {
      return args;
    },
    beforeLoadRemote(args) {
      return args;
    },
    // createScript(args) {
    //   return args;
    // },
    loadRemoteMatch(args) {
      return args;
    },
    loadRemote(args) {
      return args;
    },
    resolveShare(args) {
      if (
        args.pkgName !== 'react' &&
        args.pkgName !== 'react-dom' &&
        !args.pkgName.startsWith('next/')
      ) {
        return args;
      }
      const { shareScopeMap, scope, pkgName, version, GlobalFederation } = args;

      const host = GlobalFederation['__INSTANCES__'][0];
      if (!host) {
        return args;
      }
      args.resolver = function () {
        shareScopeMap[scope][pkgName][version] = host.options.shared[pkgName]; // replace local share scope manually with desired module
        return shareScopeMap[scope][pkgName][version];
      };
      return args;
    },
    async beforeLoadShare(args) {
      return args;
    },
  };
}
