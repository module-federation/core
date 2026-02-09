import { SERVER_VERSION } from './constant';

export function retrieveCDNPath({
  configHash,
  sharedKey,
}: {
  configHash: string;
  sharedKey: string;
}) {
  return `tree-shaking-shared/${SERVER_VERSION}/${sharedKey}/${configHash}`;
}
