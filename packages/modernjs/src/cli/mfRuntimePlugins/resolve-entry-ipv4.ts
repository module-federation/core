import type { FederationRuntimePlugin } from '@module-federation/enhanced/runtime';
import { LOCALHOST } from '../../constant';

declare const FEDERATION_IPV4: string | undefined;

const ipv4 =
  typeof FEDERATION_IPV4 !== 'undefined' ? FEDERATION_IPV4 : '127.0.0.1';

const resolveEntryIpv4Plugin: () => FederationRuntimePlugin = () => ({
  name: 'resolve-entry-ipv4',

  async fetch(manifestUrl) {
    const ipv4ManifestUrl = manifestUrl.replace(LOCALHOST, ipv4);
    return globalThis.fetch(ipv4ManifestUrl);
  },
  async afterResolve(args) {
    const { remoteInfo } = args;
    if (remoteInfo.entry.includes(LOCALHOST)) {
      remoteInfo.entry = remoteInfo.entry.replace(LOCALHOST, ipv4);
    }
    return args;
  },
});
export default resolveEntryIpv4Plugin;
