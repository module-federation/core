import { getInstance } from '@module-federation/modern-js-v3/runtime';

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

const Index = (): JSX.Element => {
  return (
    <div>
      <h1>
        The component will be render in csr but <i>fetch data from server</i>
      </h1>
      <CsrWithFetchDataFromServerComponent />
    </div>
  );
};

export default Index;
