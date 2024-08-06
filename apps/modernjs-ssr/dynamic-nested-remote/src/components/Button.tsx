import React from 'react';
import Button from 'antd/lib/button';

export default (): JSX.Element => (
  <div className="testlll">
    <Button onClick={() => alert('Client side Javascript works!')}>
      This button will appear after 1000ms
    </Button>
  </div>
);
