import React from 'react';
import helpers from '@module-federation/runtime/helpers';
import {
  getInstance,
  type FederationHost,
} from '@module-federation/enhanced/runtime';
import {
  ErrorBoundary,
  ErrorBoundaryPropsWithComponent,
} from 'react-error-boundary';
import { getDataFetchInfo } from './utils';

type IProps = {
  id: string;
  injectScript?: boolean;
  injectLink?: boolean;
};

type ReactKey = { key?: React.Key | null };

async function fetchData(id: string): Promise<unknown | undefined> {
  if (typeof window !== 'undefined') {
    // @ts-ignore
    return window._ssd;
  }
  const instance = getInstance();
  if (!instance) {
    return;
  }
  const { name } = instance.remoteHandler.idToRemoteMap[id] || {};
  if (!name) {
    return;
  }
  const module = instance.moduleCache.get(name);
  if (!module) {
    return;
  }
  const dataFetchInfo = getDataFetchInfo({
    id,
    name,
    alias: module.remoteInfo.alias,
  });
  if (!dataFetchInfo) {
    return;
  }
  const key = `${name}@${module.remoteInfo.version}@${dataFetchInfo.dataFetchName}`;
  console.log('------key', key);
  console.log(
    '------ helpers.global.nativeGlobal.__FEDERATION__.__DATA_FETCH_MAP__[key];',
    helpers.global.nativeGlobal.__FEDERATION__.__DATA_FETCH_MAP__,
  );
  return helpers.global.nativeGlobal.__FEDERATION__.__DATA_FETCH_MAP__.get(key);
}

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

export function collectSSRAssets(options: IProps) {
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
    [...targetModule.assets.css.sync, ...targetModule.assets.css.async]
      .sort()
      .forEach((file, index) => {
        links.push(
          <link
            key={`${file.split('.')[0]}_${index}`}
            href={`${publicPath}${file}`}
            rel="stylesheet"
            type="text/css"
          />,
        );
      });
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
    [...targetModule.assets.js.sync].sort().forEach((file, index) => {
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

export function createRemoteSSRComponent<T, E extends keyof T>(info: {
  loader: () => Promise<T>;
  loading: React.ReactNode;
  fallback: ErrorBoundaryPropsWithComponent['FallbackComponent'];
  export?: E;
}) {
  type ComponentType = T[E] extends (...args: any) => any
    ? Parameters<T[E]>[0] extends undefined
      ? ReactKey
      : Parameters<T[E]>[0] & ReactKey
    : ReactKey;
  const exportName = info?.export || 'default';

  const LazyComponent = React.lazy(async () => {
    try {
      const m = (await info.loader()) as Record<string, React.FC> &
        Record<symbol, string>;
      if (!m) {
        throw new Error('load remote failed');
      }
      const moduleId = m && m[Symbol.for('mf_module_id')];

      //@ts-ignore
      const data =
        typeof window !== 'undefined' ? window._ssd : await fetchData(moduleId);

      const assets = collectSSRAssets({
        id: moduleId,
      });
      console.log('assets: ', assets);
      console.log(assets.length);
      console.log('mfData: ', data);

      const Com = m[exportName] as React.FC<ComponentType>;
      if (exportName in m && typeof Com === 'function') {
        return {
          default: (props: Omit<ComponentType, 'key'>) => (
            <>
              <script
                dangerouslySetInnerHTML={{
                  __html: String.raw`
      window._ssd=${JSON.stringify(data)}
   `,
                }}
              ></script>
              {assets}
              <Com {...props} _mfData={data} />
            </>
          ),
        };
      } else {
        throw Error(
          `Make sure that ${moduleId} has the correct export when export is ${String(
            exportName,
          )}`,
        );
      }
    } catch (err) {
      if (!info.fallback) {
        throw err;
      }
      const FallbackFunctionComponent = info.fallback;
      const FallbackNode = (
        <FallbackFunctionComponent
          error={err}
          resetErrorBoundary={() => {
            console.log('SSR mode not support "resetErrorBoundary" !');
          }}
        />
      );
      return {
        default: () => FallbackNode,
      };
    }
  });
  return (props: ComponentType) => {
    const { key, ...args } = props;
    return (
      <ErrorBoundary FallbackComponent={info.fallback}>
        <React.Suspense fallback={info.loading}>
          {/* @ts-ignore */}
          <LazyComponent {...args} />
        </React.Suspense>
      </ErrorBoundary>
    );
  };
}
