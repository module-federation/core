import React, { ReactNode } from 'react';
import logger from './logger';
import { getInstance } from '@module-federation/enhanced/runtime';
import { Await } from './Await';
import { fetchData, getDataFetchMapKey } from './dataFetch';
import { getDataFetchInfo, getLoadedRemoteInfos } from './utils';
import { DATA_FETCH_ERROR_PREFIX, LOAD_REMOTE_ERROR_PREFIX } from '../constant';
import type { ErrorInfo } from './Await';

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
  fallback: ReactNode | ((errorInfo: ErrorInfo) => ReactNode);
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
    let loadedRemoteInfo: ReturnType<typeof getLoadedRemoteInfos>;
    let moduleId: string;
    const instance = getInstance();
    try {
      const m = await callLoader();
      moduleId = m && m[Symbol.for('mf_module_id')];
      if (!moduleId) {
        throw new Error('moduleId is empty');
      }
      loadedRemoteInfo = getLoadedRemoteInfos(moduleId, instance);
      if (!loadedRemoteInfo) {
        throw new Error(`can not find remote info for moduleId: ${moduleId}`);
      }
    } catch (e) {
      const errMsg = `${LOAD_REMOTE_ERROR_PREFIX}${e}`;
      logger.debug(e);
      throw new Error(errMsg);
    }
    try {
      const dataFetchMapKey = getDataFetchMapKey(
        getDataFetchInfo({
          name: loadedRemoteInfo.name,
          alias: loadedRemoteInfo.alias,
          id: moduleId,
        }),
        { name: instance!.name, version: instance?.options.version },
      );
      logger.debug('getData dataFetchMapKey: ', dataFetchMapKey);
      if (!dataFetchMapKey) {
        return;
      }
      const data = await fetchData(dataFetchMapKey);
      logger.debug('get data res: \n', data);
      return data;
    } catch (err) {
      const errMsg = `${DATA_FETCH_ERROR_PREFIX}${err}`;
      logger.debug(errMsg);
      throw new Error(errMsg);
    }
  };

  const LazyComponent = React.lazy(async () => {
    const m = await callLoader();
    const moduleId = m && m[Symbol.for('mf_module_id')];
    const instance = getInstance()!;
    const loadedRemoteInfo = getLoadedRemoteInfos(moduleId, instance);

    const dataFetchMapKey = loadedRemoteInfo
      ? getDataFetchMapKey(
          getDataFetchInfo({
            name: loadedRemoteInfo.name,
            alias: loadedRemoteInfo.alias,
            id: moduleId,
          }),
          { name: instance.name, version: instance?.options.version },
        )
      : undefined;
    logger.debug('LazyComponent dataFetchMapKey: ', dataFetchMapKey);

    const assets = collectSSRAssets({
      id: moduleId,
    });

    const Com = m[exportName] as React.FC<ComponentType>;
    if (exportName in m && typeof Com === 'function') {
      return {
        default: (props: Omit<ComponentType, 'key'> & { _mfData: unknown }) => (
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
  });

  return (props: ComponentType) => {
    const { key, ...args } = props;

    return (
      <Await
        resolve={getData()}
        loading={info.loading}
        errorElement={info.fallback}
      >
        {/* @ts-ignore */}
        {(data) => <LazyComponent {...args} _mfData={data} />}
      </Await>
    );
  };
}
