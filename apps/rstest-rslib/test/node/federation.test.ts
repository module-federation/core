import { expect, test } from '@rstest/core';
import React from 'react';
import { renderToString } from 'react-dom/server';

test('rslib adapter node test imports federated remote', async () => {
  const mod = await import('rstest_remote/Button');
  const Button = mod.default;
  const html = renderToString(React.createElement(Button));

  expect(Button).toBeTypeOf('function');
  expect(html).toContain('Remote Button');
});
