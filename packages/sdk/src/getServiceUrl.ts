/** Resolve a Service App endpoint without using the manifest or asset URL. */
export function getServiceUrl(
  serviceBaseUrl: string | undefined,
  servicePath: string,
): string {
  let base: URL;
  try {
    base = new URL(serviceBaseUrl || '');
  } catch {
    throw new Error('Service App requires an absolute serviceBaseUrl.');
  }
  if (
    !['http:', 'https:'].includes(base.protocol) ||
    base.username ||
    base.password ||
    base.search ||
    base.hash
  ) {
    throw new Error(
      'Service App serviceBaseUrl must be HTTP(S) without credentials, query or fragment.',
    );
  }
  if (!base.pathname.endsWith('/')) base.pathname += '/';

  // Do not let a module path replace the selected deployment origin or escape
  // its server base path. Encoded expose names (including %2F) stay intact.
  if (
    typeof servicePath !== 'string' ||
    !servicePath ||
    servicePath.trim() !== servicePath ||
    /^[\\/]/.test(servicePath) ||
    /[\\?#\u0000-\u0020]/.test(servicePath) ||
    /^[a-z][a-z\d+.-]*:/i.test(servicePath) ||
    servicePath.split('/').some((segment) => /^(?:\.|%2e){1,2}$/i.test(segment))
  ) {
    throw new Error(
      'Service App servicePath must be a nonempty relative path.',
    );
  }
  return new URL(servicePath, base).href;
}
