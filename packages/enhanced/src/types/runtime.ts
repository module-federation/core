import type { init } from '@module-federation/runtime-tools';
import type { moduleFederationPlugin } from '@module-federation/sdk';

type Remotes = Parameters<typeof init>[0]['remotes'];

export interface NormalizedRuntimeInitOptionsWithOutShared {
  name: string;
  remotes: Array<
    Remotes[0] & { externalType: moduleFederationPlugin.ExternalsType }
  >;
}
