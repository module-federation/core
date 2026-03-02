import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

const rootNode = document.getElementById('root');
ReactDOM.render(<App basename={'/'} />, rootNode);

declare module '*.css' {
  const classex: any;
  export default classex;
}
