import React from 'react';

import App from './app';

jest.mock(
  'reactRemoteUI/Button',
  () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => (
      <button type="button">{children}</button>
    ),
  }),
  { virtual: true },
);

describe('App', () => {
  it('should create app element successfully', () => {
    const appElement = <App />;
    expect(appElement).toBeTruthy();
  });

  xit('should have a greeting as the title', () => {
    expect(true).toBeTruthy();
  });
});
