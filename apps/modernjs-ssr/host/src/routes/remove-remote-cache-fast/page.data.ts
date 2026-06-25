import { runProbe } from '../remove-remote-cache/probe';

export const loader = () =>
  runProbe({
    delayedGcSeconds: [],
  });

export type { ProbeResult } from '../remove-remote-cache/probe';
