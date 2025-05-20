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

const Index = (): JSX.Element => {
  return (
    <div>
      <h1>Nested Remote</h1>
      <BasicNested />
    </div>
  );
};

export default Index;
