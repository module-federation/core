import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ShadowRoot } from './shadow';

function createShadowDomDiv(target: Element) {
  const shadowRoot = target.attachShadow({ mode: 'open' });
  const container = document.createElement('div');
  container.id = 'container';
  shadowRoot.appendChild(container);
  return {
    shadowRoot,
    container,
  };
}

// const info = createShadowDomDiv(document.getElementById('root')!);

// //@ts-ignore
// const root = ReactDOM.createRoot(info.container);
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <ShadowRoot>
      <App basename={'/'} />
    </ShadowRoot>
  </React.StrictMode>,
);
