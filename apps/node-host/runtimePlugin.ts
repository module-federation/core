import { FederationRuntimePlugin } from '@module-federation/runtime/types';

export default function () {
  return {
    name: 'node-internal-plugin',
    beforeInit(args) {
      const { userOptions } = args;
      if (userOptions.remotes) {
        userOptions.remotes.forEach((remote) => {
          const { alias, name } = remote;
          if (alias && name.startsWith('__webpack_require__')) {
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
