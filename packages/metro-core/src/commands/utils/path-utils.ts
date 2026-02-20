import { pathToFileURL } from 'node:url';
import { toPosixPath } from '../../plugin/helpers';

export function normalizeOutputRelativePath(relativePath: string) {
  return toPosixPath(relativePath);
}

export function toFileSourceUrl(relativePath: string) {
  const normalizedRelativePath = normalizeOutputRelativePath(relativePath);
  return pathToFileURL(`/${normalizedRelativePath}`).href;
}
