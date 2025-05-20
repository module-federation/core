import React from 'react';
import { kit } from '@module-federation/modern-js/runtime';
import type { Data } from './Content.data';

const { createRemoteComponent } = kit;

const RemoteSSRComponent = createRemoteComponent({
  loader: () => {
    return import('remote/BasicComponent');
  },
  loading: 'loading...',
  export: 'default',
  fallback: ({ error }) => {
    console.log('load provider failed ', error);
    // throw new Error('error no caught');
    if (error instanceof Error && error.message.includes('not exist')) {
      return <div>fallback - not existed id</div>;
    }
    return <div>fallback</div>;
  },
});

const Content = (props: { mfData?: Data }): JSX.Element => {
  return (
    <div
      style={{
        backgroundColor: '#ff8800',
        color: 'lightgrey',
        padding: '1rem',
      }}
    >
      <h2
        onClick={() => alert('nested provider Client side Javascript works!')}
      >
        <strong>{props?.mfData?.data || 'nested fallback data'}</strong>
      </h2>

      <h2>provider:</h2>
      <RemoteSSRComponent />
    </div>
  );
};

export default Content;
