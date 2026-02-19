import { expect, test } from '@rstest/core';
import { renderToString } from 'react-dom/server';
import { App } from '../../src/App';

test('SSR renders app shell', () => {
  const html = renderToString(<App />);

  expect(html).toContain('Rstest Demo App');
  expect(html).toContain('Count:');
  expect(html).toContain('Loading remote...');
});
