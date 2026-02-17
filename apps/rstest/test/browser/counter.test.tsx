import { render } from '@rstest/browser-react';
import { expect, test } from '@rstest/core';
import { getByRole, getByTestId } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { Counter } from '../../src/Counter';

test('counter increments in browser mode', async () => {
  const { container } = await render(<Counter />);
  const button = getByRole(container, 'button', { name: 'Increment' });

  expect(getByTestId(container, 'count').textContent).toContain('0');
  await userEvent.click(button);
  expect(getByTestId(container, 'count').textContent).toContain('1');
});
