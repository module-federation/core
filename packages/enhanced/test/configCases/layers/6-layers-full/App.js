import ComponentA from 'containerA/ComponentA';
import React from 'react';
import LocalComponentA from './ComponentA';

export default function App() {
  return `App rendered with React version: [${React()}]\nand remote component: [${ComponentA()}]\n and local component: [${LocalComponentA()}]`;
}
