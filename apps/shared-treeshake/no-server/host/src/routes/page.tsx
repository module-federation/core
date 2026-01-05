import RemoteApp from 'mf_remote/App';
import React, { useState } from 'react';
import { Button, Space, Switch, Divider } from 'antd';
// import 'antd/dist/antd.css';

const App = () => {
  const [disabled, setDisabled] = useState(true);
  const toggle = () => {
    setDisabled(!disabled);
  };

  return (
    <>
      <h1>Remote Content</h1>
      <RemoteApp />

      <Divider />
      <h1>Consumer Content</h1>

      <Space direction="vertical">
        <Switch disabled={disabled} defaultChecked />
        <Button type="primary" onClick={toggle}>
          Toggle disabled
        </Button>
      </Space>
    </>
  );
};

export default App;
