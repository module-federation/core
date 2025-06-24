import React, { ReactNode } from 'react';
import logger from './logger';
import { AwaitDataFetch } from './AwaitDataFetch';
import {
  fetchData,
  getDataFetchItem,
  getDataFetchMapKey,
  getDataFetchInfo,
  getLoadedRemoteInfos,
  setDataFetchItemLoadedStatus,
  wrapDataFetchId,
} from './utils';
import {
  DATA_FETCH_ERROR_PREFIX,
  DATA_FETCH_FUNCTION,
  FS_HREF,
  LOAD_REMOTE_ERROR_PREFIX,
  MF_DATA_FETCH_TYPE,
} from './constant';

import type { ErrorInfo } from './AwaitDataFetch';
import type { DataFetchParams, NoSSRRemoteInfo } from './types';
import type { FederationHost, getInstance } from '@module-federation/runtime';

export type IProps = {
  id: string;
  instance: ReturnType<typeof getInstance>;
  injectScript?: boolean;
  injectLink?: boolean;
};

export type CreateLazyComponentOptions<T, E extends keyof T> = {
  loader: () => Promise<T>;
  instance: ReturnType<typeof getInstance>;
  loading: React.ReactNode;
  fallback: ReactNode | ((errorInfo: ErrorInfo) => ReactNode);
  export?: E;
  dataFetchParams?: DataFetchParams;
  noSSR?: boolean;
};

type ReactKey = { key?: React.Key | null };

function getTargetModuleInfo(id: string, instance?: FederationHost) {
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
  const instance = options.instance;
  if (!instance || (!injectLink && !injectScript)) {
    return [...scripts, ...links];
  }

  const moduleAndPublicPath = getTargetModuleInfo(id, instance);
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

function getServerNeedRemoteInfo(
  loadedRemoteInfo: ReturnType<typeof getLoadedRemoteInfos>,
  id: string,
  noSSR?: boolean,
): NoSSRRemoteInfo | undefined {
  if (
    noSSR ||
    (typeof window !== 'undefined' && window.location.href !== window[FS_HREF])
  ) {
    if (!loadedRemoteInfo?.version) {
      throw new Error(`${loadedRemoteInfo?.name} version is empty`);
    }
    const { snapshot } = loadedRemoteInfo;
    if (!snapshot) {
      throw new Error(`${loadedRemoteInfo?.name} snapshot is empty`);
    }
    const dataFetchItem = getDataFetchItem(id);
    const isFetchServer =
      dataFetchItem?.[0]?.[1] === MF_DATA_FETCH_TYPE.FETCH_SERVER;

    if (
      isFetchServer &&
      (!('ssrPublicPath' in snapshot) || !snapshot.ssrPublicPath)
    ) {
      throw new Error(
        `ssrPublicPath is required while fetching ${loadedRemoteInfo?.name} data in SSR project!`,
      );
    }

    if (
      isFetchServer &&
      (!('ssrRemoteEntry' in snapshot) || !snapshot.ssrRemoteEntry)
    ) {
      throw new Error(
        `ssrRemoteEntry is required while loading ${loadedRemoteInfo?.name} data loader in SSR project!`,
      );
    }

    return {
      name: loadedRemoteInfo.name,
      version: loadedRemoteInfo.version,
      ssrPublicPath:
        'ssrPublicPath' in snapshot ? snapshot.ssrPublicPath || '' : '',
      ssrRemoteEntry:
        'ssrRemoteEntry' in snapshot ? snapshot.ssrRemoteEntry || '' : '',
      globalName: loadedRemoteInfo.entryGlobalName,
    };
  }
  return;
}

export function createLazyComponent<T, E extends keyof T>(
  options: CreateLazyComponentOptions<T, E>,
) {
  const { instance } = options;
  if (!instance) {
    throw new Error(
      'instance is required if used in "@module-federation/bridge-react"!',
    );
  }
  type ComponentType = T[E] extends (...args: any) => any
    ? Parameters<T[E]>[0] extends undefined
      ? ReactKey
      : Parameters<T[E]>[0] & ReactKey
    : ReactKey;
  const exportName = options?.export || 'default';

  const callLoader = async () => {
    logger.debug('callLoader start', Date.now());
    const m = (await options.loader()) as Record<string, React.FC> &
      Record<symbol, string>;
    logger.debug('callLoader end', Date.now());
    if (!m) {
      throw new Error('load remote failed');
    }
    return m;
  };

  const getData = async (noSSR?: boolean) => {
    let loadedRemoteInfo: ReturnType<typeof getLoadedRemoteInfos>;
    let moduleId: string;
    try {
      const m = await callLoader();
      moduleId = m && m[Symbol.for('mf_module_id')];
      if (!moduleId) {
        throw new Error('moduleId is empty');
      }
      loadedRemoteInfo = getLoadedRemoteInfos(moduleId, instance);
      if (!loadedRemoteInfo) {
        throw new Error(`can not find loaded remote('${moduleId}') info!`);
      }
    } catch (e) {
      const errMsg = `${LOAD_REMOTE_ERROR_PREFIX}${e}`;
      logger.debug(e);
      throw new Error(errMsg);
    }
    let dataFetchMapKey: string | undefined;
    try {
      dataFetchMapKey = getDataFetchMapKey(
        getDataFetchInfo({
          name: loadedRemoteInfo.name,
          alias: loadedRemoteInfo.alias,
          id: moduleId,
          remoteSnapshot: loadedRemoteInfo.snapshot,
        }),
        { name: instance!.name, version: instance?.options.version },
      );
      logger.debug('getData dataFetchMapKey: ', dataFetchMapKey);
      if (!dataFetchMapKey) {
        return;
      }
      const data = await fetchData(
        dataFetchMapKey,
        {
          ...options.dataFetchParams,
          isDowngrade: false,
        },
        getServerNeedRemoteInfo(loadedRemoteInfo, dataFetchMapKey, noSSR),
      );
      setDataFetchItemLoadedStatus(dataFetchMapKey);
      logger.debug('get data res: \n', data);
      return data;
    } catch (err) {
      const errMsg = `${DATA_FETCH_ERROR_PREFIX}${wrapDataFetchId(dataFetchMapKey)}${err}`;
      logger.debug(errMsg);
      throw new Error(errMsg);
    }
  };

  const LazyComponent = React.lazy(async () => {
    const m = await callLoader();
    const moduleId = m && m[Symbol.for('mf_module_id')];
    const loadedRemoteInfo = getLoadedRemoteInfos(moduleId, instance);
    loadedRemoteInfo?.snapshot;
    const dataFetchMapKey = loadedRemoteInfo
      ? getDataFetchMapKey(
          getDataFetchInfo({
            name: loadedRemoteInfo.name,
            alias: loadedRemoteInfo.alias,
            id: moduleId,
            remoteSnapshot: loadedRemoteInfo.snapshot,
          }),
          { name: instance.name, version: instance?.options.version },
        )
      : undefined;
    logger.debug('LazyComponent dataFetchMapKey: ', dataFetchMapKey);

    const assets = collectSSRAssets({
      id: moduleId,
      instance,
    });

    const Com = m[exportName] as React.FC<ComponentType>;
    if (exportName in m && typeof Com === 'function') {
      return {
        default: (props: Omit<ComponentType, 'key'> & { mfData?: unknown }) => (
          <>
            {globalThis.FEDERATION_SSR && dataFetchMapKey && (
              <script
                suppressHydrationWarning
                dangerouslySetInnerHTML={{
                  __html: String.raw`
                  globalThis['${DATA_FETCH_FUNCTION}'] = globalThis['${DATA_FETCH_FUNCTION}'] || [];
                  globalThis['${DATA_FETCH_FUNCTION}'].push(['${dataFetchMapKey}',${JSON.stringify(props.mfData)}]);
                  `,
                }}
              ></script>
            )}
            {globalThis.FEDERATION_SSR && assets}
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
  });

  return (props: ComponentType) => {
    const { key, ...args } = props;

    return (
      <AwaitDataFetch
        resolve={getData(options.noSSR)}
        loading={options.loading}
        errorElement={options.fallback}
      >
        {/* @ts-ignore */}
        {(data) => <LazyComponent {...args} mfData={data} />}
      </AwaitDataFetch>
    );
  };
}
