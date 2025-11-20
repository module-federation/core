import { describe, it, expect } from '@rstest/core';
import path from 'path';
import { readConfig } from '../src/utils/readConfig';

describe('readConfig integration tests', () => {
  describe('readConfig with real jiti', () => {
    it('should handle config with complex TypeScript features', async () => {
      const resultComplex = await readConfig(
        path.join(__dirname, 'fixtures', 'complex-config.ts'),
      );
      expect(resultComplex).toMatchSnapshot();

      const result = await readConfig(
        path.join(__dirname, 'fixtures', 'test-config.ts'),
      );
      expect(result).toMatchSnapshot();
    });
  });
});
