//@ts-nocheck

import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './app';

import { of } from 'rxjs';

console.log(of);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
);
