import React from 'react';
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
      <h2 onClick={() => alert('csr provider Client side Javascript works!')}>
        <strong>{props?.mfData?.data || 'csr fallback data'}</strong>
      </h2>
    </div>
  );
};

export default Content;
