import React from 'react';
import Button from 'antd/lib/button';
import stuff from './stuff.module.css';

export default (): JSX.Element => (
  <div
    id="new-dynamic-remote-components"
    style={{
      backgroundColor: '#b2fa18',
      color: 'lightgrey',
      padding: '1rem',
    }}
  >
    <h2>
      <strong>dynamic remote new version</strong>&nbsp;image
    </h2>
    <button
      id="new-dynamic-remote-components-button"
      style={{ marginBottom: '1rem' }}
      onClick={() =>
        alert(
          '[new-dynamic-remote-components-button] Client side Javascript works!',
        )
      }
    >
      Click me to test i'm interactive!
    </button>
    <img
      id="new-dynamic-remote-components-image"
      src="https://module-federation.io/module-federation-logo.svg"
      style={{ width: '100px' }}
      alt="serge"
    />
    <Button className={stuff['test-remote2']}>
      Button from dynamic remote new version
    </Button>
  </div>
);
