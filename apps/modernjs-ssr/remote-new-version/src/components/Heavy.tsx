import React from 'react';

const ITEM_COUNT = 200_000;
const PAYLOAD_SUFFIX = 'y'.repeat(96);
const createdAt = Date.now();
const heavyGlobal = globalThis as typeof globalThis & {
  __remoteNewVersionHeavyLoadCount?: number;
};
heavyGlobal.__remoteNewVersionHeavyLoadCount =
  (heavyGlobal.__remoteNewVersionHeavyLoadCount || 0) + 1;
const loadCount = heavyGlobal.__remoteNewVersionHeavyLoadCount;

export const heavyPayload = Array.from(
  { length: ITEM_COUNT },
  (_, index) => `remote-heavy-v2-${index}-${PAYLOAD_SUFFIX}`,
);

export const getHeavyPayloadStats = () => ({
  version: 'v2',
  items: heavyPayload.length,
  first: heavyPayload[0],
  last: heavyPayload[heavyPayload.length - 1],
  createdAt,
  loadCount,
});

export default function Heavy(): JSX.Element {
  return (
    <div id="remote-heavy-v2">
      remote heavy v2 payload: {heavyPayload.length} items
    </div>
  );
}
