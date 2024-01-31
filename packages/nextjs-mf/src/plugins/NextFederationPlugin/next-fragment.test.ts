import { hasAppDir } from './next-fragments';

describe('hasAppDir', () => {
  it('should return true if app directory exists', () => {
    const compiler = {
      options: {
        resolve: { alias: { 'private-next-app-dir': 'test' } },
      },
    };
    // @ts-ignore - not a full `compiler` object
    expect(hasAppDir(compiler)).toEqual(true);
  });
});
