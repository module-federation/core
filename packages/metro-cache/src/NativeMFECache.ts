import { NativeModules } from 'react-native';

export interface NativeMFECacheSpec {
  // Install JSI bindings (synchronous — call once from JS)
  installJSI(): boolean;

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
}

const MFECache = NativeModules.MFECache as NativeMFECacheSpec | undefined;

if (!MFECache) {
  console.warn(
    '[MFE-Cache] NativeModules.MFECache is not available. ' +
      'Make sure @module-federation/metro-cache is properly linked.',
  );
}

export default MFECache;
