import { loadRemote } from '@module-federation/enhanced/runtime';
import { useContext, useEffect, useRef, useState } from 'react';
import { UNSAFE_RouteContext, useLocation } from 'react-router-dom';
import type {
  PackageType as PackageType_1,
  RemoteKeys as RemoteKeys_1,
} from 'remote1/apis';
import type {
  PackageType as PackageType_0,
  RemoteKeys as RemoteKeys_0,
} from 'remote2/apis';

function dispatchPopstateEnv() {
  const evt = new PopStateEvent('popstate', { state: window.history.state });
  window.dispatchEvent(evt);
}

interface RemoteModule {
  provider?: () => {
    render: (info: {
      dom: any;
      basename?: string;
      memoryMode?: boolean;
      initialEntrie?: string;
    }) => void;
    destroy: () => void;
  };
}

const RemoteApp = ({
  name,
  memoryMode,
  basename: userBasename,
  ...resProps
}: {
  name: RemoteKeys;
  basename?: string;
  memoryMode?: boolean;
}) => {
  const rootRef = useRef(null);
  const [statue, setStatue] = useState(false);
  const [pathname, setPathname] = useState('');
  const statueRef = useRef(statue);
  const providerInfoRef = useRef<any>(null);
  const location = useLocation();
  const routerContextVal = useContext(UNSAFE_RouteContext);
  let basename = '/';
  if (routerContextVal.matches[0] && routerContextVal.matches[0].pathnameBase) {
    basename = routerContextVal.matches[0].pathnameBase;
  }
  if (userBasename) {
    basename = userBasename;
  }

  useEffect(() => {
    if (pathname !== '' && pathname !== location.pathname) {
      dispatchPopstateEnv();
    }
    setPathname(location.pathname);
  }, [location]);

  useEffect(() => {
    const renderTimeout = setTimeout(() => {
      console.log('appName', name);
      loadRemote(name).then((m) => {
        const module = m as RemoteModule;
        if ('provider' in module && module.provider) {
          const providerInfo = module.provider();
          providerInfoRef.current = providerInfo;
          providerInfo.render({
            dom: rootRef.current,
            basename,
            memoryMode,
            ...resProps,
          });
          statueRef.current = true;
          console.log('component mount', providerInfo, statue);
        }
      });
    });
    return () => {
      clearTimeout(renderTimeout);
      setTimeout(() => {
        providerInfoRef?.current?.destroy({ dom: rootRef.current });
        console.log('component unmount');
      });
    };
  }, [rootRef]);

  return <div ref={rootRef}></div>;
};

type RemoteKeys = RemoteKeys_0 | RemoteKeys_1;
type PackageType<T, R = any> = T extends RemoteKeys_0
  ? PackageType_0<T>
  : T extends RemoteKeys_1
    ? PackageType_1<T>
    : R;
type GetType<T, Y extends keyof T> = T[Y];
type GetProvderComponentType<
  T extends RemoteKeys,
  Y extends keyof PackageType<T>,
> =
  GetType<PackageType<T>, Y> extends (...args: Array<any>) => any
    ? ReturnType<GetType<PackageType<T>, Y>>
    : any;

type GetObjectVal<
  T extends Record<string, any>,
  K extends string,
> = K extends keyof T ? T[K] : any;

export function createRemoteComponent<T extends RemoteKeys>(
  info: { name: T } & (
    | { export?: 'default' }
    | { export: Exclude<keyof PackageType<T>, 'default'> }
  ),
): GetObjectVal<GetProvderComponentType<T, 'default'>, 'rawComponent'>;
export function createRemoteComponent<
  T extends RemoteKeys,
  Y extends keyof PackageType<T>,
>(info: {
  name: T;
  export?: Y;
}): GetObjectVal<GetProvderComponentType<T, Y>, 'rawComponent'> {
  const res = (props: Parameters<typeof RemoteApp>[0]) => {
    // const MemoizedValue = useMemo(() => (()=><RemoteApp {...info} {...props} />), [...Object.values(info), ...Object.values(props)]);
    return <RemoteApp {...info} {...props} />;
  };
  return res as any;
}
