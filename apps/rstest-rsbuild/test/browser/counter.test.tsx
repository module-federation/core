import { render } from '@rstest/browser-react';
import { expect, test } from '@rstest/core';
import { getByRole, getByTestId } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { Counter } from '../../src/Counter';

test('rsbuild adapter browser test renders and updates counter', async () => {
  const { container } = await render(<Counter />);
  expect(getByTestId(container, 'count').textContent).toContain('0');
  await userEvent.click(getByRole(container, 'button', { name: 'Increment' }));
  expect(getByTestId(container, 'count').textContent).toContain('1');
});
