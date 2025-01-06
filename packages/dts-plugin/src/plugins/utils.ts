export function isDev(): boolean {
  return process.env['NODE_ENV'] === 'development';
}
export function isPrd(): boolean {
  return process.env['NODE_ENV'] === 'production';
}
