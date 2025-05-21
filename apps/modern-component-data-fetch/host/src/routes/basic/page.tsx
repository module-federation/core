import { kit } from '@module-federation/modern-js/runtime';

const { createRemoteComponent } = kit;

const Basic = createRemoteComponent({
  loader: () => {
    return import('remote/BasicComponent');
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
      <h1>Basic usage with data fetch</h1>
      <Basic />
    </div>
  );
};

export default Index;
