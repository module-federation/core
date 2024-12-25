import ComponentA from 'containerA/ComponentA';
import React from 'react';

export default function App() {
  console.log('layer 6 share scopes', __webpack_share_scopes__);
  return `App rendered with React version: [${React()}]\nand remote component: [${ComponentA()}]`;
}

