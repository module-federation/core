import React from 'react';
import Button from 'antd/lib/button';

const Content = (): JSX.Element => {
  return (
    <div
      id="nested-remote-components333"
      style={{
        backgroundColor: '#e91ece',
        color: 'lightgrey',
        padding: '1rem',
      }}
    >
      <h2 onClick={() => alert('Client side Javascript works!')}>
        <strong>Coccococococ</strong>
      </h2>
      <Button
        id="nested-remote-components-button333"
        onClick={() => {
          console.log(3333);
        }}
      >
        Click me to test <strong>nested remote</strong> interactive!
      </Button>
    </div>
  );
};

export default Content;
