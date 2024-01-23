import { FederationRuntimePlugin } from '@module-federation/runtime/types';

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

            // const rawRemote = rawRemotes.find(rawR => rawR.alias === alias);
            // if (rawRemote) {
            //   remote.name = rawRemote.name;
            // }
          }
        });
      }
      console.log(userOptions);

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
          args.id = match[1];
        }
      }
      console.log(args.id);
      return args;
    },
    createScript({ url }) {
      return;
    },
    afterResolve(args) {
      return args;
    },
    async beforeLoadShare(args) {
      return args;
    },
  };
}
