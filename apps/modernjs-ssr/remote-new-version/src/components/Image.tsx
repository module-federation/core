import React from 'react';
import Button from 'antd/lib/button';
import stuff from './stuff.module.css';

export default (): JSX.Element => (
  <div
    id="new-remote-components"
    style={{
      backgroundColor: 'aliceblue',
      color: 'lightgrey',
      padding: '1rem',
    }}
  >
    <h2>
      <strong>remote new version</strong>&nbsp;image
    </h2>
    <button
      id="new-remote-components-button"
      style={{ marginBottom: '1rem' }}
      onClick={() =>
        alert('[new-remote-components-button] Client side Javascript works!')
      }
    >
      Click me to test i'm interactive!
    </button>
    <img
      id="new-remote-components-image"
      src="https://module-federation.io/module-federation-logo.svg"
      style={{ width: '100px' }}
      alt="serge"
    />
    <Button className={stuff['test-remote2']}>
      Button from remote new version
    </Button>
  </div>
);
