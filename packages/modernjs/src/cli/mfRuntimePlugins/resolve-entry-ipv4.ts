import type { FederationRuntimePlugin } from '@module-federation/enhanced/runtime';
import { LOCALHOST } from '../../constant';

declare const FEDERATION_IPV4: string | undefined;

const ipv4 =
  typeof FEDERATION_IPV4 !== 'undefined' ? FEDERATION_IPV4 : '127.0.0.1';

function replaceLocalhost(url: string): string {
  return url.replace(LOCALHOST, ipv4);
}

const resolveEntryIpv4Plugin: () => FederationRuntimePlugin = () => ({
  name: 'resolve-entry-ipv4',

  beforeRegisterRemote(args) {
    const { remote } = args;
    if ('entry' in remote && remote.entry.includes(LOCALHOST)) {
      remote.entry = replaceLocalhost(remote.entry);
    }
    return args;
  },
  // async fetch(manifestUrl) {
  //   const ipv4ManifestUrl = manifestUrl.replace(LOCALHOST, ipv4);
  //   return globalThis.fetch(ipv4ManifestUrl);
  // },
  async afterResolve(args) {
    const { remoteInfo } = args;
    if (remoteInfo.entry.includes(LOCALHOST)) {
      remoteInfo.entry = replaceLocalhost(remoteInfo.entry);
    }
    return args;
  },
  loadRemoteSnapshot(args) {
    const { remoteSnapshot } = args;
    if (
      'publicPath' in remoteSnapshot &&
      remoteSnapshot.publicPath.includes(LOCALHOST)
    ) {
      remoteSnapshot.publicPath = replaceLocalhost(remoteSnapshot.publicPath);
    }
    if (
      'getPublicPath' in remoteSnapshot &&
      remoteSnapshot.getPublicPath.includes(LOCALHOST)
    ) {
      remoteSnapshot.getPublicPath = replaceLocalhost(
        remoteSnapshot.getPublicPath,
      );
    }
    return args;
  },
});
export default resolveEntryIpv4Plugin;
