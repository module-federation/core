import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it } from '@rstest/core';
import App from '../src/App';

it('composes and interacts with both federation remotes in JSDOM', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: 'Federated shop' })).toBeTruthy();
  expect(screen.getByText('Ada Lovelace')).toBeTruthy();
  expect(screen.getByText('Member since 1843')).toBeTruthy();

  const button = screen.getByRole('button', { name: 'Add item (0)' });
  fireEvent.click(button);
  expect(screen.getByRole('button', { name: 'Add item (1)' })).toBeTruthy();
});
