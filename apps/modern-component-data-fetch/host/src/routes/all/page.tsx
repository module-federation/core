import { kit } from '@module-federation/modern-js/runtime';

const { createRemoteComponent } = kit;

const BasicNested = createRemoteComponent({
  loader: () => {
    return import('nested-remote/Content');
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

const ServerDowngrade = createRemoteComponent({
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

const ClientDowngrade = createRemoteComponent({
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

const Index = () => {
  return (
    <>
      <div className="container-box">
        <h1>host</h1>
        <table border={1} cellPadding={5}>
          <thead>
            <tr>
              <td>remote id</td>
              <td>desc</td>
              <td>Component</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>nested-remote/Content</td>
              <td>
                This component is nested provider, and it should render{' '}
                <strong>successfully</strong>.
              </td>
              <td>
                <BasicNested />
              </td>
            </tr>
            <tr>
              <td>remote/ServerDowngrade</td>
              <td>
                This component is from provider, and it will be{' '}
                <strong>force downgrade</strong>, fetch <strong>server</strong>{' '}
                data as fallback
              </td>
              <td>
                <ServerDowngrade />
              </td>
            </tr>
            <tr>
              <td>remote/ClientDowngrade</td>
              <td>
                This component is from provider, and it will be{' '}
                <strong>force downgrade</strong>, fetch <strong>client</strong>{' '}
                data as fallback
              </td>

              <td>
                <ClientDowngrade />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Index;
