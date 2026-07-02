import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

const rootNode = document.getElementById('root') ?? document.body;
createRoot(rootNode).render(<App />);
