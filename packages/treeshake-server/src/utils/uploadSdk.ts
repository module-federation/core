export interface UploadDirectoryOptions {
  outputDir: string;
  cdnBaseUrl: string;
  targetPath: string;
}

/**
 * Placeholder for a real CDN upload SDK.
 * In real usage you should import the vendor SDK and replace this implementation.
 */
export async function uploadDirectory({
  outputDir,
  cdnBaseUrl,
  targetPath,
}: UploadDirectoryOptions): Promise<string> {
  if (!outputDir) {
    throw new Error('outputDir is required for upload');
  }
  if (!cdnBaseUrl) {
    throw new Error('cdnBaseUrl is required for upload');
  }
  if (!targetPath) {
    throw new Error('targetPath is required for upload');
  }

  // This simulates an asynchronous upload call.
  await new Promise((resolve) => setTimeout(resolve, 100));

  const normalisedTarget = targetPath.replace(/^\/+/, '');
  const targetWithSlash = normalisedTarget.endsWith('/')
    ? normalisedTarget
    : `${normalisedTarget}/`;
  const baseUrl = cdnBaseUrl.endsWith('/') ? cdnBaseUrl : `${cdnBaseUrl}/`;
  const publicUrl = new URL(targetWithSlash, baseUrl).toString();

  return publicUrl;
}
