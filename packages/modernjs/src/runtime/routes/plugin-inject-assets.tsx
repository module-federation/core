import { useContext } from 'react';
import type { Plugin } from '@modern-js/runtime';
import { getInstance } from '@module-federation/enhanced/runtime';
import { collectSSRAssets } from '../createRemoteSSRComponent';
import { RuntimeReactContext } from '@meta/runtime';
import { decodeId, getRemoteId } from './utils';
import type { RouteObject } from '@modern-js/runtime/router';

function traverseRoutes(routes: RouteObject[], remoteNames: Set<string>) {
  routes.forEach((route) => {
    route.id && remoteNames.add(decodeId(route.id));
    route.children && traverseRoutes(route.children, remoteNames);
  });
}

// inject remote css assets
export const ssrDataLoaderInjectAssetsPlugin = ({
  metaName,
}: {
  metaName: string;
}): Plugin => {
  return {
    name: '@modern-js/plugin-mf-routes-inject-assets',
    pre: ['@modern-js/plugin-mf-routes'],
    post: ['@module-federation/modern-js', `@${metaName}/plugin-router`],
    setup: () => {
      return {
        wrapRoot() {
          const AppWrapper = (props: any) => {
            const instance = getInstance();
            if (!instance || !instance.options.remotes.length) {
              return <>{props.children}</>;
            }
            const context = useContext(RuntimeReactContext);
            const { remotes } = instance.options;

            const remoteNames: Set<string> = new Set();
            traverseRoutes(context.routes!, remoteNames);

            const remoteIds = [...remoteNames].reduce((sum, cur) => {
              const matchRemote = remotes.find((r) => r.name === cur);
              if (matchRemote) {
                sum.add(getRemoteId(cur));
              }
              return sum;
            }, new Set() as Set<string>);

            const assets: React.ReactNode[] = [];
            remoteIds.forEach((remoteId) => {
              assets.push(
                ...collectSSRAssets({
                  id: remoteId,
                  injectScript: false,
                }),
              );
            });

            return (
              <>
                {assets}
                {props.children}
              </>
            );
          };
          return AppWrapper;
        },
      };
    },
  };
};
