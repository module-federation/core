import React from 'react';
import Button from 'antd/lib/button';
import stuff from './stuff.module.css';

export default (): JSX.Element => (
  <div
    id="nested-remote-components"
    style={{
      backgroundColor: '#e91ece',
      color: 'lightgrey',
      padding: '1rem',
    }}
  >
    <h2 onClick={() => alert('Client side Javascript works!')}>
      <strong>host image</strong>
    </h2>
    <Button
      id="nested-remote-components-button"
      className={stuff['test-remote2']}
      onClick={() =>
        alert('[nested-remote-components] Client side Javascript works!')
      }
    >
      Click me to test <strong>host</strong> interactive!
    </Button>
  </div>
);
