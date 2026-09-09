import { runFullProbe, runProbe } from './probe';

export const loader = ({ request }: { request: Request }) => {
  const searchParams = new URL(request.url).searchParams;

  if (searchParams.has('fast')) {
    return runFullProbe({
      delayedGcSeconds: [],
    });
  }

  return runProbe({
    update: searchParams.has('update'),
  });
};

export type { ProbeResult } from './probe';
