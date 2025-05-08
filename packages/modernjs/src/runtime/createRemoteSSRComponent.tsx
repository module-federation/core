import React from 'react';
import logger from './logger';
import { getInstance } from '@module-federation/enhanced/runtime';
import {
  ErrorBoundary,
  ErrorBoundaryPropsWithComponent,
} from 'react-error-boundary';
import { Await } from './Await';
import { fetchData, getDataFetchMapKey } from './dataFetch';
import { getDataFetchInfo, getLoadedRemoteInfos } from './utils';

type IProps = {
  id: string;
  injectScript?: boolean;
  injectLink?: boolean;
};

type ReactKey = { key?: React.Key | null };

function getTargetModuleInfo(id: string) {
  const instance = getInstance();
  if (!instance) {
    return;
  }
  const loadedRemoteInfo = getLoadedRemoteInfos(id, instance);
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
    injectScript = false,
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

  const callLoader = async () => {
    const m = (await info.loader()) as Record<string, React.FC> &
      Record<symbol, string>;
    if (!m) {
      throw new Error('load remote failed');
    }
    return m;
  };

  const getData = async () => {
    const m = await callLoader();
    const moduleId = m && m[Symbol.for('mf_module_id')];
    const loadedRemoteInfo = getLoadedRemoteInfos(moduleId, getInstance());
    if (!loadedRemoteInfo) {
      return;
    }
    const dataFetchMapKey = getDataFetchMapKey(
      { name: loadedRemoteInfo.name, version: loadedRemoteInfo.version },
      getDataFetchInfo({
        name: loadedRemoteInfo.name,
        alias: loadedRemoteInfo.alias,
        id: moduleId,
      }),
    );
    logger.debug('getData dataFetchMapKey: ', dataFetchMapKey);
    if (!dataFetchMapKey) {
      return;
    }
    const data = await fetchData(dataFetchMapKey);
    logger.debug('data: \n', data);
    return data;
  };

  const LazyComponent = React.lazy(async () => {
    try {
      const m = await callLoader();
      const moduleId = m && m[Symbol.for('mf_module_id')];
      const loadedRemoteInfo = getLoadedRemoteInfos(moduleId, getInstance());

      const dataFetchMapKey = loadedRemoteInfo
        ? getDataFetchMapKey(
            { name: loadedRemoteInfo.name, version: loadedRemoteInfo.version },
            getDataFetchInfo({
              name: loadedRemoteInfo.name,
              alias: loadedRemoteInfo.alias,
              id: moduleId,
            }),
          )
        : undefined;
      logger.debug('LazyComponent dataFetchMapKey: ', dataFetchMapKey);

      const assets = collectSSRAssets({
        id: moduleId,
      });

      const Com = m[exportName] as React.FC<ComponentType>;
      if (exportName in m && typeof Com === 'function') {
        return {
          default: (
            props: Omit<ComponentType, 'key'> & { _mfData: unknown },
          ) => (
            <>
              {dataFetchMapKey && (
                <script
                  suppressHydrationWarning
                  dangerouslySetInnerHTML={{
                    __html: String.raw`
      globalThis._MF__DATA_FETCH_ID_MAP__['${dataFetchMapKey}'][1](${JSON.stringify(props._mfData)})
   `,
                  }}
                ></script>
              )}
              {assets}
              <Com {...props} />
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
        <Await resolve={getData()} loading={info.loading}>
          {/* @ts-ignore */}
          {(data) => <LazyComponent {...args} _mfData={data} />}
        </Await>
      </ErrorBoundary>
    );
  };
}
