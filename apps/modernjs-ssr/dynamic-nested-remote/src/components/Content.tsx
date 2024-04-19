import React from 'react';
import Comp from 'dynamic_remote/Image';
import Button from 'antd/lib/button';
import stuff from './stuff.module.css';

export default (): JSX.Element => (
  <div className="testlll">
    <h2 onClick={() => alert('Client side Javascript works!')}>
      <strong>dynamic nested remote</strong>
    </h2>
    <Button
      className={stuff['test-remote2']}
      onClick={() => alert('Client side Javascript works!')}
    >
      Click me to test <strong>dynamic nested remote</strong> interactive!
    </Button>

    <Comp />
  </div>
);
