import { federationBuilder } from '../../lib/core/federation-builder';
import path from 'path';

// relys on import map since i dont know the named exports of a remote to return.
export const createVirtualRemoteModule = (name: string, ref: string) => `
export * from ${JSON.stringify('federationRemote/' + ref)}
`;

export const linkRemotesPlugin = {
  name: 'linkRemotes',
  setup(build: any) {
    //@ts-ignore
    const remotes = federationBuilder.config.remotes || {};
    const filter = new RegExp(
      Object.keys(remotes)
        .reduce((acc, key) => {
          if (!key) return acc;
          acc.push(`^${key}`);
          return acc;
        }, [] as string[])
        .join('|'),
    );

    build.onResolve({ filter: filter }, async (args: any) => {
      return { path: args.path, namespace: 'remote-module' };
    });

    build.onResolve({ filter: /^federationRemote/ }, async (args: any) => {
      return {
        path: args.path.replace('federationRemote/', ''),
        external: true,
        namespace: 'externals',
      };
    });

    build.onLoad({ filter, namespace: 'remote-module' }, async (args: any) => {
      return {
        contents: createVirtualRemoteModule(
          federationBuilder.config.name,
          args.path,
        ),
        loader: 'js',
        resolveDir: path.dirname(args.path),
      };
    });
  },
};
