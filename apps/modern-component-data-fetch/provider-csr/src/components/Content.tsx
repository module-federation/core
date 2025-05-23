import React from 'react';
import Button from 'antd/lib/button';
import type { Data } from './Content.data';

const Content = (props: { mfData?: Data }): JSX.Element => {
  return (
    <div
      style={{
        backgroundColor: '#ff8800',
        color: 'lightgrey',
        padding: '1rem',
      }}
    >
      <h2>
        <strong>{props?.mfData?.data || 'csr fallback data'}</strong>
      </h2>

      <Button
        id="provider-csr-btn"
        onClick={() =>
          alert('[provider-csr-btn] Client side Javascript works!')
        }
      >
        Click me to test <strong>provider-csr</strong>interactive!
      </Button>
    </div>
  );
};

export default Content;
