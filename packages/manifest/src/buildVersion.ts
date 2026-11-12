import type { Compilation } from 'webpack';
import { createHash } from 'node:crypto';

/** A release can supply its own version. Otherwise use the completed build. */
export function getCompilationBuildVersion(
  compilation: Compilation,
  metadataFiles: string[],
): string {
  if (process.env['MF_BUILD_VERSION']) return process.env['MF_BUILD_VERSION'];
  // Compilation hashes can change on an empty incremental build. Hash actual
  // deployable outputs, excluding this metadata and transient HMR deltas.
  const hash = createHash('sha256');
  for (const asset of compilation
    .getAssets()
    .sort((a, b) => a.name.localeCompare(b.name))) {
    if (metadataFiles.includes(asset.name) || asset.info.hotModuleReplacement)
      continue;
    const source = asset.source.buffer();
    hash.update(JSON.stringify([asset.name, source.length]));
    hash.update(source);
  }
  return hash.digest('hex');
}
