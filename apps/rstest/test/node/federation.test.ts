import { expect, test } from '@rstest/core';
import React from 'react';
import { renderToString } from 'react-dom/server';

test('node can import federated remote component', async () => {
  const mod = await import('rstest_remote/Button');
  const RemoteButton = mod.default;
  const html = renderToString(React.createElement(RemoteButton));

  expect(RemoteButton).toBeTypeOf('function');
  expect(html).toContain('Remote Button');
});
