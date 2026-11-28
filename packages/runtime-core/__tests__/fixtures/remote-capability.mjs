import { FederationKernel } from '@module-federation/runtime-core/kernel';
import { remote } from '@module-federation/runtime-core/remote';
import { web } from '@module-federation/runtime-core/platform/web';

export const runtime = new FederationKernel(
  { name: 'remote-only-boundary', remotes: [] },
  { remote, platform: web },
);
