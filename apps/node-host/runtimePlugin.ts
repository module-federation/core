import { FederationRuntimePlugin } from '@module-federation/runtime/types';

if (typeof __webpack_require__ !== 'undefined' && __webpack_require__.l) {
  __webpack_require__.l = (url, callback, chunkId) => {
    async function executeLoad(url, callback, name) {
      if (!name) {
        throw new Error('__webpack_require__.l name is required for ' + url);
      }
      if (name.startsWith('__webpack_require__')) {
        const regex =
          /__webpack_require__\.federation\.instance\.moduleCache\.get\(([^)]+)\)/;
        const match = name.match(regex);
        if (match) {
          name = match[1].replace(/["']/g, '');
        }
      }
      try {
        const federation = __webpack_require__.federation;
        const res = await __webpack_require__.federation.runtime.loadScriptNode(
          url,
          { attrs: {} },
        );
        const enhancedRemote = await federation.instance.initRawContainer(
          name,
          url,
          res,
        );
        callback(enhancedRemote);
      } catch (error) {
        callback(error);
      }
    }
    executeLoad(url, callback, chunkId);
  };
}

export default function () {
  return {
    name: 'node-internal-plugin',
    beforeInit(args) {
      const { userOptions } = args;
      if (userOptions.remotes) {
        userOptions.remotes.forEach((remote) => {
          const { alias } = remote;
          if (alias) {
            remote.name = remote.alias;
          }
        });
      }
      return args;
    },
    init(args) {
      return args;
    },
    beforeRequest(args) {
      if (args.id.startsWith('__webpack_require__')) {
        const regex =
          /__webpack_require__\.federation\.instance\.moduleCache\.get\(([^)]+)\)/;
        const match = args.id.match(regex);
        if (match !== null) {
          const req = args.id.replace(match[0], '');
          const remoteID = match[1].replace(/["']/g, '');
          args.id = [remoteID, req].join('');
        }
      }
      return args;
    },
  };
}
