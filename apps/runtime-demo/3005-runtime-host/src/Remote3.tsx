import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { loadRemote } from '@module-federation/enhanced/runtime';

class CustomElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  async connectedCallback() {
    if (!this.shadowRoot) return;

    const module = await loadRemote('dynamic-remote/ButtonOldAnt', {
      //@ts-ignore
      root: this.shadowRoot,
    });
    //@ts-ignore
    createRoot(this.shadowRoot).render(React.createElement(module.default));
  }
}

customElements.define('custom-element', CustomElement);

function DynamicRemoteButton() {
  return React.createElement('custom-element');
}

export default DynamicRemoteButton;
