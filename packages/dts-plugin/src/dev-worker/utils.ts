const DEFAULT_LOCAL_IPS = ['localhost', '127.0.0.1'];

export function getIpFromEntry(entry: string, ipv4?: string): string | void {
  let ip;
  entry.replace(/https?:\/\/([0-9|.]+|localhost):/, (str, matched) => {
    ip = matched;
    return str;
  });
  if (ip) {
    return DEFAULT_LOCAL_IPS.includes(ip) ? ipv4 : ip;
  }
}
