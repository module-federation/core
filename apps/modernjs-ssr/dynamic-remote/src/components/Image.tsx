import React from 'react';
import Button from 'antd/lib/button';
import mfSvg from '../assets/module-federation.svg';
import stuff from './stuff.module.css';

export default ({ text }: { text: string }): JSX.Element => (
  <div
    id="dynamic-remote-components"
    style={{
      backgroundColor: '#18fa41',
      color: 'lightgrey',
      padding: '1rem',
    }}
  >
    <h2>
      <strong>dynamic remote</strong>&nbsp;image
    </h2>
    <p>{text}</p>
    <button
      id="dynamic-remote-components-button"
      style={{ marginBottom: '1rem' }}
      onClick={() =>
        alert('[dynamic-remote-components] Client side Javascript works!')
      }
    >
      Click me to test i'm interactive!
    </button>
    <img
      id="dynamic-remote-components-image"
      src="https://module-federation.io/module-federation-logo.svg"
      style={{ width: '100px' }}
      alt="serge"
    />
    <Button className={stuff['test-remote2']}>
      Button from dynamic remote
    </Button>
  </div>
);
