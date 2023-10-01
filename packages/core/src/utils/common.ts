// split the @ syntax into url and global
export function extractUrlAndGlobal(urlAndGlobal: string): [string, string] {
  const index = urlAndGlobal?.indexOf('@');
  if (index === -1 || index === urlAndGlobal.length - 1) {
    throw new Error(`@mf-core: Invalid request "${urlAndGlobal}"`);
  }

  return [urlAndGlobal.substring(index + 1), urlAndGlobal.substring(0, index)];
}
