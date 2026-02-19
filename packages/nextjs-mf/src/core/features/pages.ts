import { exposeNextPages } from './pages-map-loader';

export function buildPagesExposes(
  cwd: string,
  pageMapFormat: 'legacy' | 'routes-v2',
): Record<string, string> {
  return exposeNextPages(cwd, pageMapFormat);
}
