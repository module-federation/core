import React from 'react';
import Comp from 'nested_remote/Content';
import { useNavigate } from '@modern-js/runtime/router';
import './index.css';

const Index = (): JSX.Element => {
  const navi = useNavigate();

  return (
    <div className="container-box">
      host page , router: nested-remote
      <button
        style={{ marginBottom: '1rem' }}
        onClick={() => alert('Client side Javascript works!')}
      >
        Click me to test host interactive!
      </button>
      <button style={{ marginBottom: '1rem' }} onClick={() => navi('/user')}>
        Click to jump router!
      </button>
      <Comp />
    </div>
  );
};

export default Index;
