import { expect, test } from '@rstest/core';
import { getByRole } from '@testing-library/dom';

test('rslib adapter browser mode executes DOM tests', () => {
  const container = document.createElement('div');
  const button = document.createElement('button');
  button.textContent = 'Click Me';
  container.appendChild(button);
  document.body.appendChild(container);

  expect(getByRole(container, 'button', { name: 'Click Me' })).toBeTruthy();
});
