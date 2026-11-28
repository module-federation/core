import { remotes as loadRemotes } from '../remotes';
import type { Adapter } from '../types';

export const remotes: Adapter = { bundlerRuntime: { remotes: loadRemotes } };
