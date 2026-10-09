import { initContainerEntry } from '../initContainerEntry';
import type { Adapter } from '../types';

export const container: Adapter = { bundlerRuntime: { initContainerEntry } };
