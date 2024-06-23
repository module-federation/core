import React from 'react';
import {
  loadRemote,
  getInstance,
  type FederationHost,
} from '@module-federation/enhanced/runtime';
import {
  ErrorBoundary,
  ErrorBoundaryPropsWithComponent,
} from 'react-error-boundary';

type Comp = React.FC | { default: React.FC };
type Id = string;
type IProps = {
  id: Id;
  loading: React.ReactNode;
  fallback: ErrorBoundaryPropsWithComponent['FallbackComponent'];
  injectScript?: boolean;
  injectLink?: boolean;
  remoteProps?: Record<string, any>;
};

function getLoadedRemoteInfos(instance: FederationHost, id: string) {
  const { name, expose } = instance.remoteHandler.idToRemoteMap[id] || {};
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
  const { loading = 'loading...', id, remoteProps = {}, fallback } = props;

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
              <Com {...remoteProps} />
            </>
          ),
        };
      })
      .catch((err) => {
        if (!fallback) {
          throw err;
        }
        const FallbackFunctionComponent = fallback;
        const FallbackNode = (
          <FallbackFunctionComponent
            error={err}
            resetErrorBoundary={() => {}}
          />
        );
        return {
          default: () => FallbackNode,
        };
      }),
  );

  return (
    <ErrorBoundary FallbackComponent={fallback}>
      <React.Suspense fallback={loading}>
        <Component />
      </React.Suspense>
    </ErrorBoundary>
  );
}

export { MFReactComponent, collectAssets };
