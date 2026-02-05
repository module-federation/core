import { getInstance } from '@module-federation/modern-js-v3/runtime';

const ClientDowngrade = getInstance()!.createLazyComponent({
  loader: () => {
    return import('remote/ClientDowngrade');
  },
  loading: 'loading...',
  export: 'default',
  fallback: ({ error }) => {
    console.error(error);
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
        This component will be force downgraded , and fetch dataFetch js in
        browser, and then call this request{' '}
      </h1>
      <ClientDowngrade />
    </div>
  );
};

export default Index;
