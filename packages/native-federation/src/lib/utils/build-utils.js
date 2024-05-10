const build_adapter_1 = require('../core/build-adapter');

async function bundle(options) {
  const adapter = await build_adapter_1.getBuildAdapter();
  return await adapter(options);
}

module.exports = {
  bundle: bundle,
};
