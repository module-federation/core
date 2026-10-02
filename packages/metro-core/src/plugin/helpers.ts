import fs from 'node:fs';
import path from 'node:path';
import { TMP_DIR_NAME } from './constants';

export function isUsingMFCommand(command = process.argv[2]) {
  const allowedCommands = ['start', 'bundle-mf-host', 'bundle-mf-remote'];
  return allowedCommands.includes(command);
}

export function isUsingMFBundleCommand(command = process.argv[2]) {
  const allowedCommands = ['bundle-mf-host', 'bundle-mf-remote'];
  return allowedCommands.includes(command);
}

export function replaceExtension(filepath: string, extension: string) {
  // Only treat dots after the last path separator as file extensions.
  const separatorIndex = Math.max(
    filepath.lastIndexOf('/'),
    filepath.lastIndexOf('\\'),
  );
  const dotIndex = filepath.lastIndexOf('.');

  // Dotfiles and directory names with dots should not be truncated.
  const extensionStart =
    dotIndex > separatorIndex + 1 ? dotIndex : filepath.length;

  return `${filepath.slice(0, extensionStart)}${extension}`;
}

export function removeExtension(filepath: string) {
  return replaceExtension(filepath, '');
}

export function stubHostEntry(hostEntryPath: string) {
  const stub = '// host entry stub';
  fs.mkdirSync(path.dirname(hostEntryPath), { recursive: true });
  fs.writeFileSync(hostEntryPath, stub, 'utf-8');
}

export function stubRemoteEntry(remoteEntryPath: string) {
  const stub = '// remote entry stub';
  fs.mkdirSync(path.dirname(remoteEntryPath), { recursive: true });
  fs.writeFileSync(remoteEntryPath, stub, 'utf-8');
}

export function prepareTmpDir(projectRootPath: string) {
  const nodeModulesPath = path.resolve(projectRootPath, 'node_modules');
  const tmpDirPath = path.join(nodeModulesPath, TMP_DIR_NAME);
  fs.rmSync(tmpDirPath, { recursive: true, force: true });
  fs.mkdirSync(tmpDirPath, { recursive: true });
  return tmpDirPath;
}

export function toPosixPath(value: string) {
  return value.replaceAll('\\', '/');
}
