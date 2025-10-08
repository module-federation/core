export function normalizeCode(source: string): string {
  return source
    .replace(/[ \t]+/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\n+/g, '\n')
    .trim();
}
