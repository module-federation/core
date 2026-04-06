import { SERVER_VERSION } from './constant';

const VALID_KEY_COMPONENT = /^[a-zA-Z0-9._-]+$/;

function assertValidKeyComponent(value: string, name: string) {
  if (!VALID_KEY_COMPONENT.test(value)) {
    throw new Error(`Invalid ${name}`);
  }
}

export function retrieveCDNPath({
  configHash,
  sharedKey,
}: {
  configHash: string;
  sharedKey: string;
}) {
  assertValidKeyComponent(sharedKey, 'sharedKey');
  assertValidKeyComponent(configHash, 'configHash');

  return `tree-shaking-shared/${SERVER_VERSION}/${sharedKey}/${configHash}`;
}
