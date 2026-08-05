/** @rstest-environment jsdom */

import { fireEvent, render } from '@testing-library/react';
import { expect, it } from '@rstest/core';
import RemoteButton from 'rstestHttpRemote/button';

it('renders and interacts with the HTTP React federation remote in JSDOM', () => {
  expect(document).toBeDefined();

  const { getByRole } = render(<RemoteButton />);
  const button = getByRole('button');

  expect(button.textContent).toBe('Rsbuild federation button: 0');
  fireEvent.click(button);
  expect(button.textContent).toBe('Rsbuild federation button: 1');
});
