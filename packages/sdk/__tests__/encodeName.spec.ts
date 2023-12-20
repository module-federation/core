import { nameMap } from './resources/constant';
import { encodeName } from '../src';

describe('encodeName', () => {
  it('should correct transform name', () => {
    Object.keys(nameMap).forEach((name) => {
      expect(encodeName(name)).toBe(nameMap[name]);
    });
  });
});
