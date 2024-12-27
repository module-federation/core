import React from 'react';
import ComponentA from 'containerA/ComponentA';
import RemoteApp from 'containerA/App';

export default function App() {
  return `App rendered with React version: ${React.version} Non-layered remote component: ${ComponentA()} Layered remote component: ${RemoteApp()}`;
}
