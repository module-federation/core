import { getInstance } from '@module-federation/modern-js-v3/runtime';
import { ERROR_TYPE } from '@module-federation/modern-js-v3/react';

const Basic = getInstance()!.createLazyComponent({
  loader: () => {
    return import('remote/BasicComponent');
  },
  loading: 'loading...',
  export: 'default',
  fallback: ({ error, errorType, dataFetchMapKey }) => {
    console.error(error);
    if (errorType === ERROR_TYPE.LOAD_REMOTE) {
      return <div>load remote failed</div>;
    }
    if (errorType === ERROR_TYPE.DATA_FETCH) {
      return (
        <div>
          data fetch failed, the dataFetchMapKey key is: {dataFetchMapKey}
        </div>
      );
    }
    return <div>error type is unknown</div>;
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
