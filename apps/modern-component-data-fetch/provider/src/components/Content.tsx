import React from 'react';
import Button from 'antd/lib/button';
import stuff from './stuff.module.css';
import type { Data } from './Content.data';

const Content = (props: { _mfData: Data }): JSX.Element => {
  return (
    <div
      id="nested-remote-components"
      style={{
        backgroundColor: '#e91ece',
        color: 'lightgrey',
        padding: '1rem',
      }}
    >
      <h2 onClick={() => alert('Client side Javascript works!')}>
        <strong>{props?._mfData?.data || 'fallback data'}</strong>
      </h2>
      <Button
        id="nested-remote-components-button"
        className={stuff['test-remote2']}
        onClick={() =>
          alert('[nested-remote-components] Client side Javascript works!')
        }
      >
        Click me to test <strong>nested remote</strong> interactive!
      </Button>
    </div>
  );
};

export default Content;
