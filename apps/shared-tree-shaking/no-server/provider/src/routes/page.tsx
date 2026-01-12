import React from 'react';
import { Button, Badge } from 'antd';

const App = (): React.JSX.Element => {
  return (
    <div className="content">
      <Button>provider button</Button>
      <p>Start building amazing things with Rsbuild.</p>
      <Badge count={25} />
    </div>
  );
};

export default App;
