import React from 'react';
import Button from 'antd/lib/button';
import stuff from './stuff.module.css';

export default (): JSX.Element => (
  <div
    id="component-provider-components"
    style={{
      backgroundColor: '#1ee9c1',
      color: 'lightgrey',
      padding: '1rem',
    }}
  >
    <h2>
      <strong>sub-provider</strong>&nbsp;image
    </h2>
    <button
      id="component-provider-components-button"
      style={{ marginBottom: '1rem' }}
      onClick={() =>
        alert('[component-provider-components] Client side Javascript works!')
      }
    >
      Click me to test i'm interactive!
    </button>
    <img
      id="component-provider-components-image"
      src="https://module-federation.io/module-federation-logo.svg"
      style={{ width: '100px' }}
      alt="serge"
    />
    <Button className={stuff['test-component-provider']}>
      Button from component-provider
    </Button>
  </div>
);
