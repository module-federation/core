import { getInstance } from '@module-federation/modern-js-v3/runtime';

const ServerDowngrade = getInstance()!.createLazyComponent({
  loader: () => {
    return import('remote/ServerDowngrade');
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
        This component will be force downgraded , and send fetchData request to
        host server{' '}
      </h1>
      <h2>
        Check this request:{' '}
        <strong>
          http://localhost:5001/?x-mf-data-fetch=provider%2FServerDowngrade.data%3Ahost&params=%7B%22isDowngrade%22%3Afalse%7D
        </strong>{' '}
        in network
      </h2>
      <ServerDowngrade />
    </div>
  );
};

export default Index;
