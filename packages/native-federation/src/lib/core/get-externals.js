'use strict';

function getExternals(config) {
  const shared = Object.keys(config.shared);
  const sharedMappings = config.sharedMappings.map((m) => m.key);
  const externals = [...shared, ...sharedMappings];
  return externals;
  // return externals.filter((p) => !isInSkipList(p, PREPARED_DEFAULT_SKIP_LIST));
}

module.exports.getExternals = getExternals;
