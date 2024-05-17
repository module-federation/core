import React from 'react';
import { MFReactComponent, collectLinks } from '@modern-js/runtime/mf';
import Comp from 'remote/Image';
import Button from 'antd/lib/button';
import stuff from './stuff.module.css';

export default (): JSX.Element => (
  <div className="testlll">
    <h2 onClick={() => alert('Client side Javascript works!')}>
      <strong>nested remote</strong>
    </h2>
    <Button
      className={stuff['test-remote2']}
      onClick={() => alert('Client side Javascript works!')}
    >
      Click me to test <strong>nested remote</strong> interactive!
    </Button>
    {collectLinks('remote/Image')}
    <Comp />
  </div>
);
