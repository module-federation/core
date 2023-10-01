import { extractUrlAndGlobal } from './common';

describe('Common utils', () => {
  it('extraUrlAndGlobal returns a url and module scope when "at symbol" present', () => {
    const result = extractUrlAndGlobal('test@http://test.com');

    expect(result).toEqual(['http://test.com', 'test']);
  });

  it('extraUrlAndGlobal throws an error when "at symbol" not present', () => {
    const extract = () => {
      extractUrlAndGlobal('test');
    };

    expect(extract).toThrowError('Invalid request "test"');
  });
});
