import { useState } from 'react';
import { getInstance } from '@module-federation/modern-js-v3/runtime';

type NoDataMetrics = {
  loaderCalls: number;
};

const loadCsrWithoutData = () => {
  const globalWithMetrics = globalThis as typeof globalThis & {
    __MF_NO_DATA_METRICS__?: NoDataMetrics;
  };
  const metrics = (globalWithMetrics.__MF_NO_DATA_METRICS__ ||= {
    loaderCalls: 0,
  });
  metrics.loaderCalls += 1;
  return import('provider-csr/no-data');
};

const CsrWithFetchDataFromServerComponent = getInstance()!.createLazyComponent({
  noSSR: true,
  loader: () => {
    console.log('calling');
    return import('provider-csr');
  },
  loading: 'loading...',
  export: 'default',
  fallback: ({ error }) => {
    // throw new Error('error no caught');
    if (error instanceof Error && error.message.includes('not exist')) {
      return <div>fallback - not existed id</div>;
    }
    return <div>fallback</div>;
  },
});

const CsrWithoutDataLoaderComponent = getInstance()!.createLazyComponent({
  noSSR: true,
  loader: loadCsrWithoutData,
  loading: 'loading...',
  export: 'default',
  fallback: <div>fallback</div>,
});

const DataLoaderReloadDemo = getInstance()!.createLazyComponent({
  noSSR: true,
  loader: async () => {
    const remoteModule = await getInstance()!.loadRemote<{
      default: (props: {
        mfData?: { requestCount: number; fetchedAt: string };
      }) => JSX.Element;
    }>('provider-csr/reload-demo');
    if (!remoteModule) {
      throw new Error('Failed to load provider-csr/reload-demo');
    }
    return remoteModule;
  },
  loading: null,
  export: 'default',
  fallback: <div>reload demo fallback</div>,
});

const Index = (): JSX.Element => {
  const [rerenderCount, setRerenderCount] = useState(0);
  const [mountKey, setMountKey] = useState(0);

  return (
    <div>
      <h1>
        The component will be render in csr but <i>fetch data from server</i>
      </h1>
      <CsrWithFetchDataFromServerComponent />
      <CsrWithoutDataLoaderComponent />
      <section>
        <h2>DataLoader rerender and remount behavior</h2>
        <p>Parent rerenders: {rerenderCount}</p>
        <button
          id="rerender-data-loader-demo"
          onClick={() => setRerenderCount((count) => count + 1)}
        >
          Rerender parent
        </button>
        <button
          id="remount-data-loader-demo"
          onClick={() => setMountKey((key) => key + 1)}
        >
          Remount remote
        </button>
        <DataLoaderReloadDemo key={mountKey} />
      </section>
    </div>
  );
};

export default Index;
