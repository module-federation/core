import React from 'react';
import {
  loadRemote,
  getInstance,
  type FederationHost,
} from '@module-federation/enhanced/runtime';

type Comp = React.FC | { default: React.FC };
interface IProps {
  id: string;
  loading?: React.ReactNode;
}

function getLoadedRemoteInfos(instance: FederationHost, id: string) {
  const moduleName = instance.remoteHandler.idToModuleNameMap[id];
  if (!moduleName) {
    return;
  }
  const module = instance.moduleCache.get(moduleName);
  if (!module) {
    return;
  }
  const { remoteSnapshot } = instance.snapshotHandler.getGlobalRemoteInfo(
    module.remoteInfo,
  );
  return {
    ...module.remoteInfo,
    snapshot: remoteSnapshot,
  };
}

function collectLinks(id: string) {
  const links: React.ReactNode[] = [];
  const instance = getInstance();
  if (!instance) {
    return links;
  }
  const loadedRemoteInfo = getLoadedRemoteInfos(instance, id);
  if (!loadedRemoteInfo) {
    return links;
  }
  const snapshot = loadedRemoteInfo.snapshot;
  if (!snapshot) {
    return links;
  }
  const publicPath =
    'publicPath' in snapshot
      ? snapshot.publicPath
      : 'getPublicPath' in snapshot
      ? new Function(snapshot.getPublicPath)()
      : '';
  if (!publicPath) {
    return links;
  }
  const modules = 'modules' in snapshot ? snapshot.modules : [];
  if (modules) {
    modules.forEach((module) => {
      [...module.assets.css.sync, ...module.assets.css.async].forEach(
        (file, index) => {
          // links.push(`${publicPath}${file}`)
          links.push(
            <link
              key={index}
              href={`${publicPath}${file}`}
              rel="stylesheet"
              type="text/css"
            />,
          );
        },
      );
    });
  }
  return links;
}

function MFReactComponent(props: IProps) {
  const { loading = 'loading...', id } = props;

  const Component = React.lazy(() =>
    loadRemote<Comp>(id).then((mod) => {
      const links = collectLinks(id);
      if (!mod) {
        throw new Error('load remote failed');
      }
      const Com =
        typeof mod === 'object' ? ('default' in mod ? mod.default : mod) : mod;
      return {
        default: () => (
          <div>
            {links}
            <Com />
          </div>
        ),
      };
    }),
  );

  return (
    <React.Suspense fallback={loading}>
      <Component />
    </React.Suspense>
  );
}

export { MFReactComponent, collectLinks };
