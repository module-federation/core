import Button from 'remoteApp/Button';
import { token } from 'shared-lib';

export function run() {
  return {
    button: Button(),
    hostToken: token,
    evaluations: globalThis.__sharedLibEvaluations,
  };
}
