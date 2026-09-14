import assert from 'node:assert/strict';
import { test } from 'node:test';
import { runProof } from './proof.ts';

test('serves federated skills and tools over MCP', async () => {
  const proof = await runProof();

  assert.deepEqual(proof.extension, { directoryRead: false });
  assert.deepEqual(proof.skillNames, [
    'diagnose-federation-runtime',
    'ship-federated-skill',
  ]);
  assert.equal(proof.resourceCount, 4);
  assert.deepEqual(proof.toolProviders.sort(), [
    'delivery_skills_provider',
    'runtime_skills_provider',
  ]);
  assert.equal(proof.digestVerified, true);
  assert.equal(proof.getMatchesList, true);
});
