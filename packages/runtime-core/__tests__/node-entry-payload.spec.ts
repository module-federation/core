import path from 'node:path';
import { runNodeWithConditions } from '../../../tools/testing/runNodeWithConditions';

const packageDir = path.resolve(__dirname, '..');

describe('image-backed Node entry payload', () => {
  it.each(['malformed-payload', 'restored-global'])(
    'rejects %s through the actual SDK evaluator',
    (scenario) => {
      expect(
        runNodeWithConditions(
          packageDir,
          [],
          `process.argv[2] = '${scenario}'; require('../../tools/scripts/prove-runtime-node-payload.cjs');`,
        ),
      ).toBe(`PASS ${scenario} rejection`);
    },
  );
});
