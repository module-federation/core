import React from 'react';

const ITEM_COUNT = 200_000;
const PAYLOAD_SUFFIX = 'x'.repeat(96);
const createdAt = Date.now();
const heavyGlobal = globalThis as typeof globalThis & {
  __remoteHeavyLoadCount?: number;
};
heavyGlobal.__remoteHeavyLoadCount =
  (heavyGlobal.__remoteHeavyLoadCount || 0) + 1;
const loadCount = heavyGlobal.__remoteHeavyLoadCount;

export const heavyPayload = Array.from(
  { length: ITEM_COUNT },
  (_, index) => `remote-heavy-${index}-${PAYLOAD_SUFFIX}`,
);

export const getHeavyPayloadStats = () => ({
  version: 'v1',
  items: heavyPayload.length,
  first: heavyPayload[0],
  last: heavyPayload[heavyPayload.length - 1],
  createdAt,
  loadCount,
});

export default function Heavy(): JSX.Element {
  return (
    <div id="remote-heavy">
      remote heavy payload: {heavyPayload.length} items
    </div>
  );
}
