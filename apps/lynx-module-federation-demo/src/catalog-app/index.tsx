import '@lynx-js/react/experimental/lazy/import';
import { root } from '@lynx-js/react';

import { CatalogApp } from './CatalogApp';

root.render(<CatalogApp />);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}
