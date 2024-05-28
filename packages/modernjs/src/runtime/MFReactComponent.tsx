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
  fallback?: (err: Error) => React.FC | React.FC;
}

function getLoadedRemoteInfos(instance: FederationHost, id: string) {
  const { name, expose } = instance.remoteHandler.idToRemoteMap[id];
  if (!name) {
    return;
  }
  const module = instance.moduleCache.get(name);
  if (!module) {
    return;
  }
  const { remoteSnapshot } = instance.snapshotHandler.getGlobalRemoteInfo(
    module.remoteInfo,
  );
  return {
    ...module.remoteInfo,
    snapshot: remoteSnapshot,
    expose,
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
  const addProtocol = (url: string): string => {
    if (url.startsWith('//')) {
      return `https:${url}`;
    }
    return url;
  };
  const modules = 'modules' in snapshot ? snapshot.modules : [];
  if (modules) {
    const targetModule = modules.find(
      (m) => m.modulePath === loadedRemoteInfo.expose,
    );
    if (!targetModule) {
      return links;
    }

    [...targetModule.assets.css.sync, ...targetModule.assets.css.async].forEach(
      (file, index) => {
        // links.push(`${publicPath}${file}`)
        links.push(
          <link
            key={index}
            href={`${addProtocol(publicPath)}${file}`}
            rel="stylesheet"
            type="text/css"
          />,
        );
      },
    );
  }
  return links;
}

function MFReactComponent(props: IProps) {
  const { loading = 'loading...', id, fallback } = props;

  const Component = React.lazy(() =>
    loadRemote<Comp>(id)
      .then((mod) => {
        const links = collectLinks(id);
        if (!mod) {
          throw new Error('load remote failed');
        }
        const Com =
          typeof mod === 'object'
            ? 'default' in mod
              ? mod.default
              : mod
            : mod;
        return {
          default: () => (
            <div>
              {links}
              <Com />
            </div>
          ),
        };
      })
      .catch((err) => {
        if (!fallback) {
          throw err;
        }
        const FallbackComponent =
          typeof fallback === 'function' ? fallback(err) : fallback;
        return {
          default: () => <FallbackComponent />,
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
