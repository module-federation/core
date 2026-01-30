const encodeName = function (
  name: string,
  prefix = '',
  withExt = false,
): string {
  const ext = withExt ? '.js' : '';
  return `${prefix}${name
    .replace(/@/g, 'scope_')
    .replace(/-/g, '_')
    .replace(/\//g, '__')
    .replace(/\./g, '')}${ext}`;
};

export function retrieveGlobalName(
  mfName: string,
  sharedName: string,
  version: string,
) {
  return encodeName(`${mfName}_${sharedName}_${version}`);
}
