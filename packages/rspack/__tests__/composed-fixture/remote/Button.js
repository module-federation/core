import { token } from 'shared-lib';

export default function Button() {
  return `Button from remoteApp, shared-lib#${token}`;
}
