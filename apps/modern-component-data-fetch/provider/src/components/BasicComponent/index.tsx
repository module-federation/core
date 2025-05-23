import React from 'react';
import Button from 'antd/lib/button';
import stuff from './stuff.module.css';
import type { Data } from './index.data';

const Content = (props: {
  mfData?: Data;
  providerName?: string;
  backgroundColor?: string;
}): JSX.Element => {
  const providerName = props.providerName || 'provider';
  return (
    <div
      style={{
        backgroundColor: props.backgroundColor || '#e91ece',
        color: 'lightgrey',
        padding: '1rem',
      }}
    >
      <h2>
        <strong>{props?.mfData?.data || 'fallback data'}</strong>
      </h2>
      <Button
        id={`${providerName}-btn`}
        className={stuff['test-remote2']}
        onClick={() => alert(`[${providerName}] Client side Javascript works!`)}
      >
        Click me to test <strong>{providerName}</strong> interactive!
      </Button>
    </div>
  );
};

export default Content;
