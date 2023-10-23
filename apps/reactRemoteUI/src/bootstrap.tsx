import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

import Button from './Button';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <StrictMode>
    <div>
      UI Library Button:
      <Button>Test Button</Button>
    </div>
  </StrictMode>,
);
