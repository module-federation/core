import React from 'react';
import {
  loadRemote,
  getInstance,
  type FederationHost,
} from '@module-federation/enhanced/runtime';

type Comp = React.FC | { default: React.FC };
type Id = string;
type IProps =
  | {
      id: Id;
      injectScript?: boolean;
      injectLink?: boolean;
      loading?: React.ReactNode;
      fallback?:
        | ((err: Error) => React.FC | React.ReactElement)
        | React.FC
        | React.ReactElement;
    }
  | Id;

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

function getTargetModuleInfo(id: string) {
  const instance = getInstance();
  if (!instance) {
    return;
  }
  const loadedRemoteInfo = getLoadedRemoteInfos(instance, id);
  if (!loadedRemoteInfo) {
    return;
  }
  const snapshot = loadedRemoteInfo.snapshot;
  if (!snapshot) {
    return;
  }
  const publicPath =
    'publicPath' in snapshot
      ? snapshot.publicPath
      : 'getPublicPath' in snapshot
      ? new Function(snapshot.getPublicPath)()
      : '';
  if (!publicPath) {
    return;
  }
  const modules = 'modules' in snapshot ? snapshot.modules : [];
  const targetModule = modules.find(
    (m) => m.modulePath === loadedRemoteInfo.expose,
  );
  if (!targetModule) {
    return;
  }

  const remoteEntry = 'remoteEntry' in snapshot ? snapshot.remoteEntry : '';
  if (!remoteEntry) {
    return;
  }
  return {
    module: targetModule,
    publicPath,
    remoteEntry,
  };
}

function collectAssets(options: IProps) {
  const {
    id,
    injectLink = true,
    injectScript = true,
  } = typeof options === 'string' ? { id: options } : options;
  const links: React.ReactNode[] = [];
  const scripts: React.ReactNode[] = [];
  const instance = getInstance();
  if (!instance || (!injectLink && !injectScript)) {
    return [...scripts, ...links];
  }

  const moduleAndPublicPath = getTargetModuleInfo(id);
  if (!moduleAndPublicPath) {
    return [...scripts, ...links];
  }
  const { module: targetModule, publicPath, remoteEntry } = moduleAndPublicPath;
  if (injectLink) {
    [...targetModule.assets.css.sync, ...targetModule.assets.css.async].forEach(
      (file, index) => {
        links.push(
          <link
            key={`${file.split('.')[0]}_${index}`}
            href={`${publicPath}${file}`}
            rel="stylesheet"
            type="text/css"
          />,
        );
      },
    );
  }
  if (injectScript) {
    scripts.push(
      <script
        async={true}
        key={remoteEntry.split('.')[0]}
        src={`${publicPath}${remoteEntry}`}
        crossOrigin="anonymous"
      />,
    );
    [...targetModule.assets.js.sync].forEach((file, index) => {
      scripts.push(
        <script
          key={`${file.split('.')[0]}_${index}`}
          async={true}
          src={`${publicPath}${file}`}
          crossOrigin="anonymous"
        />,
      );
    });
  }

  return [...scripts, ...links];
}

function MFReactComponent(props: IProps) {
  const {
    loading = 'loading...',
    id,
    fallback = undefined,
  } = typeof props === 'string' ? { id: props } : props;

  const Component = React.lazy(() =>
    loadRemote<Comp>(id)
      .then((mod) => {
        const assets = collectAssets(props);
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
            <>
              {assets}
              <Com />
            </>
          ),
        };
      })
      .catch((err) => {
        if (!fallback) {
          throw err;
        }
        const FallbackNode =
          typeof fallback === 'function' ? fallback(err) : fallback;
        if (React.isValidElement(FallbackNode)) {
          return {
            default: () => FallbackNode,
          };
        }
        const FallbackFunctionComponent = FallbackNode as React.FC;
        return {
          default: () => <FallbackFunctionComponent />,
        };
      }),
  );

  return (
    <React.Suspense fallback={loading}>
      <Component />
    </React.Suspense>
  );
}

export { MFReactComponent, collectAssets };
