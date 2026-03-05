import { expect, test } from '@rstest/core';
import { render } from '@rstest/browser-react';
import { getByRole } from '@testing-library/dom';
import { Counter } from '../../src/Counter';

test('browser mode renders local react component', async () => {
  const { container } = await render(<Counter />);

  expect(getByRole(container, 'button', { name: 'Increment' })).toBeTruthy();
});
