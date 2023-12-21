import { nameMap } from './resources/constant';
import { decodeName } from '../src';

describe('decodeName', () => {
  it('should correct decode transformed name', () => {
    Object.keys(nameMap).forEach((name) => {
      const transformedName = nameMap[name];
      expect(decodeName(transformedName)).toBe(name);
    });
  });

  it('should directly return name if prefix not match', () => {
    const name = 'runtime_demo';
    expect(decodeName(name)).toBe('runtime-demo');

    expect(decodeName(name, 'CUSTOM_PREFIX')).toBe(name);
  });
});
