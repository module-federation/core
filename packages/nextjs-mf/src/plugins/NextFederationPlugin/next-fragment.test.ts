import { hasAppDir } from './next-fragments';

describe('hasAppDir', () => {
  it('should return true if app directory exists', () => {
    const defaultShared = hasAppDir({
      // @ts-ignore - doesn't need to match the compiler interface
      options: {
        resolve: { alias: { 'private-next-app-dir': 'test' } },
      },
    });
    expect(defaultShared).toMatchObject({});
  });
});
