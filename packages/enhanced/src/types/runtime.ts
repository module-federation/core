import type { init } from '@module-federation/runtime';

type Remotes = Parameters<typeof init>[0]['remotes'];

export interface NormalizedRuntimeInitOptionsWithOutShared {
  name: string;
  remotes: Remotes;
}
