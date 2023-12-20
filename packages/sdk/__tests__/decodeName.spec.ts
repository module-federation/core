import { nameMap } from './resources/constant';
import { decodeName } from '../src';

describe('decodeName', () => {
  it('should correct decode transformed name', () => {
    Object.keys(nameMap).forEach((name) => {
      const transformedName = nameMap[name];
      expect(decodeName(transformedName)).toBe(name);
    });
  });
});
