import type { ChunkLocationSource, ChunkUrlMetadata } from './types';

const CHUNK_PREVIEW_LENGTH = 240;

const getChunkPreview = (content: string): string =>
  content.slice(0, CHUNK_PREVIEW_LENGTH).replace(/\s+/g, ' ').trim();

export const enrichChunkExecutionError = (
  error: unknown,
  options: {
    chunkName: string;
    location: string;
    source: ChunkLocationSource;
    content: string;
    hostName?: string;
    resolution?: ChunkUrlMetadata;
  },
): Error => {
  const normalizedError =
    error instanceof Error ? error : new Error(String(error));
  const preview = getChunkPreview(options.content);
  const details = [
    `Federated chunk execution failed.`,
    `chunk: ${options.chunkName}`,
    `source: ${options.source}`,
    `location: ${options.location}`,
  ];

  if (options.hostName) {
    details.push(`host: ${options.hostName}`);
  }

  if (options.resolution) {
    details.push(`resolved-from: ${options.resolution.resolvedFrom}`);
    if (options.resolution.remoteName) {
      details.push(`remote: ${options.resolution.remoteName}`);
    }
    if (options.resolution.publicPath) {
      details.push(`public-path: ${options.resolution.publicPath}`);
    }
    if (options.resolution.rootOutputDir) {
      details.push(`root-output-dir: ${options.resolution.rootOutputDir}`);
    }
    if (options.resolution.remoteEntryUrl) {
      details.push(`remote-entry: ${options.resolution.remoteEntryUrl}`);
    }
  }

  if (preview) {
    details.push(`preview: ${preview}`);
  }

  normalizedError.message = `${normalizedError.message}\n${details.join('\n')}`;

  Object.assign(normalizedError, {
    chunkName: options.chunkName,
    chunkLocation: options.location,
    chunkSource: options.source,
    chunkPreview: preview,
    chunkHostName: options.hostName,
    chunkResolution: options.resolution,
  });

  return normalizedError;
};
