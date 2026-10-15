const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const configuredAt = Date.now();

module.exports = {
  beforeExecute() {
    const diagnostic = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), '.mf/diagnostics/latest.json'),
        'utf8',
      ),
    );
    assert.ok(diagnostic.latestErrorEvent.timestamp >= configuredAt);
    assert.equal(diagnostic.latestErrorEvent.code, 'BUILD-001');
    assert.match(
      diagnostic.latestErrorEvent.message,
      /Failed to find expose module/,
    );
    assert.match(
      diagnostic.latestErrorEvent.message,
      /troubleshooting\/build#build-001/,
    );
    assert.equal(diagnostic.bundler.name, 'webpack');
    assert.equal(diagnostic.mfConfig.name, 'container');
    assert.equal(
      diagnostic.mfConfig.exposes['./Missing'],
      './does-not-exist.js',
    );
    assert.deepEqual(diagnostic.latestErrorEvent.args.exposeModules, [
      { name: './Missing', module: null, request: './does-not-exist.js' },
    ]);
  },
};
