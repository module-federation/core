import { NativeModules } from 'react-native';

export interface NativeMFECacheSpec {
  // File system operations
  writeFile(
    path: string,
    content: string,
    encoding: 'utf8' | 'base64',
  ): Promise<void>;
  readFile(path: string, encoding: 'utf8' | 'base64'): Promise<string>;
  deleteFile(path: string): Promise<void>;
  fileExists(path: string): Promise<boolean>;
  getDocumentDirectory(): Promise<string>;

  // SHA-256 hash
  sha256File(filePath: string): Promise<string>;
  sha256String(content: string): Promise<string>;

  // HTTP download (native: download + write + streaming SHA-256)
  downloadFile(
    url: string,
    destPath: string,
  ): Promise<{ sha256: string; bytesWritten: number }>;

  // JS evaluation (native: read disk file + JSI evaluateJavaScript)
  // sourceURL: original bundle URL for correct Metro module resolution
  evaluateJavaScript(filePath: string, sourceURL: string): Promise<void>;
}

const MFECache = NativeModules.MFECache as NativeMFECacheSpec | undefined;

if (!MFECache) {
  console.warn(
    '[MFE-Cache] NativeModules.MFECache is not available. ' +
      'Make sure @module-federation/metro-cache is properly linked.',
  );
}

export default MFECache;
