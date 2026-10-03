// Build @module-federation/managers before running this standalone protocol proof.
const assert = require('node:assert/strict');
const {
  getSelectionSlot,
  RUNTIME_SELECTION_SLOT,
} = require('../../packages/managers/dist/runtime-selection/index.js');

const invalidSlots = [
  { participants: [], finalized: false, installed: false },
  { version: 2, participants: [], finalized: false, installed: false },
  { version: 1, participants: null, finalized: false, installed: false },
  { version: 1, participants: [], finalized: true, installed: true },
  {
    version: 1,
    participants: [],
    finalized: true,
    installed: true,
    image: {},
    profile: {},
  },
  false,
];
for (const slot of invalidSlots) {
  assert.throws(() => getSelectionSlot({ [RUNTIME_SELECTION_SLOT]: slot }), {
    name: 'RuntimeSelectionError',
    code: 'invalid-selection-slot',
  });
}
const compiler = {};
const slot = getSelectionSlot(compiler);
assert.equal(slot.version, 1);
assert.equal(getSelectionSlot(compiler), slot);
console.log(
  'PASS: 6 invalid slot cases rejected; version 1 slot reused by identity.',
);
