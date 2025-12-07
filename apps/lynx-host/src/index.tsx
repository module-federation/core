import '@lynx-js/preact-devtools';
import '@lynx-js/react/debug';
import { root } from '@lynx-js/react';
/**
 * Module Federation setup for Lynx/rspeedy
 */

import { App } from './App.jsx';

root.render(<App />);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}
