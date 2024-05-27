import { inferAutoPublicPath } from '../src';

describe('inferAutoPublicPath', () => {
  it('should infer correct public path', () => {
    expect(inferAutoPublicPath('http://localhost:3009/mf-stats.json')).toEqual(
      'http://localhost:3009/',
    );
    expect(inferAutoPublicPath('http://localhost:3009/remoteEntry.js')).toEqual(
      'http://localhost:3009/',
    );
  });
});
