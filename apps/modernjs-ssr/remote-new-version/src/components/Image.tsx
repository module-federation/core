import React from 'react';
import Button from 'antd/lib/button';
import mfSvg from '../assets/module-federation.svg';
import stuff from './stuff.module.css';

export default (): JSX.Element => (
  <div
    style={{
      backgroundColor: 'aliceblue',
      color: 'lightgrey',
      padding: '1rem',
      width: '500px',
    }}
  >
    <h2>
      <strong>remote new version</strong>&nbsp;image
    </h2>
    <button
      style={{ marginBottom: '1rem' }}
      onClick={() => alert('Client side Javascript works!')}
    >
      Click me to test i'm interactive!
    </button>
    <img src={mfSvg} style={{ width: '100px' }} alt="serge" />
    <Button className={stuff['test-remote2']}>
      Button from remote new version
    </Button>
  </div>
);
