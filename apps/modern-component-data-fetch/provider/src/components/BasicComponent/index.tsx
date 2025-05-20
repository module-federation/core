import React from 'react';
import Button from 'antd/lib/button';
import stuff from './stuff.module.css';
import type { Data } from './index.data';

const Content = (props: {
  mfData?: Data;
  providerName?: string;
  backgroundColor?: string;
}): JSX.Element => {
  return (
    <div
      style={{
        backgroundColor: props.backgroundColor || '#e91ece',
        color: 'lightgrey',
        padding: '1rem',
      }}
    >
      <h2 onClick={() => alert('provider Client side Javascript works!')}>
        <strong>{props?.mfData?.data || 'fallback data'}</strong>
      </h2>
      <Button
        className={stuff['test-remote2']}
        onClick={() => alert('[provider] Client side Javascript works!')}
      >
        Click me to test <strong>{props.providerName || 'provider'}</strong>{' '}
        interactive!
      </Button>
    </div>
  );
};

export default Content;
