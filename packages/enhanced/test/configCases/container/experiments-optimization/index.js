/* global __non_webpack_require__, __dirname, globalThis, it, expect */
const fs = __non_webpack_require__('fs');
const path = __non_webpack_require__('path');

if (!globalThis.__EXPERIMENTS_OPTIMIZATION_CASE__) {
  globalThis.__EXPERIMENTS_OPTIMIZATION_CASE__ = true;

  const readOutput = (filename) =>
    fs.readFileSync(path.join(__dirname, filename), 'utf-8');

  const webRemoteEntry = readOutput('remoteEntry-web.js');
  const nodeRemoteEntry = readOutput('remoteEntry-node.js');
  const webRemoteEntryEsm = readOutput('module/remoteEntry-web.mjs');
  const nodeRemoteEntryEsm = readOutput('module/remoteEntry-node.mjs');
  const fullCapabilities = readOutput('remoteEntry-capabilities-full.js');
  const noRemote = readOutput('remoteEntry-capabilities-no-remote.js');
  const noExpose = readOutput('remoteEntry-capabilities-no-expose.js');
  const noShared = readOutput('remoteEntry-capabilities-no-shared.js');

  it('should replace optimization define flags with static values', () => {
    expect(webRemoteEntry).not.toContain('ENV_TARGET');
    expect(webRemoteEntry).not.toContain(
      'FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN',
    );

    expect(nodeRemoteEntry).not.toContain('ENV_TARGET');
    expect(nodeRemoteEntry).not.toContain(
      'FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN',
    );

    expect(webRemoteEntryEsm).not.toContain('ENV_TARGET');
    expect(webRemoteEntryEsm).not.toContain(
      'FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN',
    );

    expect(nodeRemoteEntryEsm).not.toContain('ENV_TARGET');
    expect(nodeRemoteEntryEsm).not.toContain(
      'FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN',
    );

    [fullCapabilities, noRemote, noExpose, noShared].forEach((source) => {
      expect(source).not.toContain('FEDERATION_OPTIMIZE_NO_REMOTE');
      expect(source).not.toContain('FEDERATION_OPTIMIZE_NO_EXPOSE');
      expect(source).not.toContain('FEDERATION_OPTIMIZE_NO_SHARED');
    });
  });

  it('should eliminate snapshot plugins from the web optimized CJS bundle', () => {
    expect(webRemoteEntry).not.toContain('snapshot-plugin');
    expect(webRemoteEntry).not.toContain('generate-preload-assets-plugin');
    expect(webRemoteEntry).not.toContain('attrs:{name');
  });

  it('should preserve node loading and snapshot plugins in the node CJS bundle', () => {
    expect(nodeRemoteEntry).toContain('snapshot-plugin');
    expect(nodeRemoteEntry).toContain('generate-preload-assets-plugin');
    expect(nodeRemoteEntry).toContain('attrs:{name');
  });

  it('should eliminate snapshot plugins from the web optimized ESM bundle', () => {
    expect(webRemoteEntryEsm).not.toContain('snapshot-plugin');
    expect(webRemoteEntryEsm).not.toContain('generate-preload-assets-plugin');
    expect(webRemoteEntryEsm).not.toContain('attrs:{name');
  });

  it('should preserve node loading and snapshot plugins in the node ESM bundle', () => {
    expect(nodeRemoteEntryEsm).toContain('snapshot-plugin');
    expect(nodeRemoteEntryEsm).toContain('generate-preload-assets-plugin');
    expect(nodeRemoteEntryEsm).toContain('attrs:{name');
  });

  it('should reduce bundle size when remote loading is disabled', () => {
    expect(noRemote.length).toBeLessThan(fullCapabilities.length);
  });

  it('should reduce bundle size when expose loading is disabled', () => {
    expect(noExpose.length).toBeLessThan(fullCapabilities.length);
  });

  it('should reduce bundle size when shared loading is disabled', () => {
    expect(noShared.length).toBeLessThan(fullCapabilities.length);
  });
}
