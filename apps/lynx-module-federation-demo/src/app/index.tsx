import '@lynx-js/react/experimental/lazy/import';
import { root } from '@lynx-js/react';

import { App } from './App';

root.render(<App />);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}
