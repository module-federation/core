import React, { layeredComponentsReact } from 'react';
import ComponentA from './ComponentA';
export default function App() {
  return `App rendered with [${React()}] with layered value: [${layeredComponentsReact()}] and ${ComponentA()}`;
}
