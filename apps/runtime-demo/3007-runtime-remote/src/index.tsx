import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom';

import App from './App';

ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById('root') as HTMLElement,
);
