import { runSharedProviderProbe } from './probe';

export const loader = ({ request }: { request: Request }) => {
  const searchParams = new URL(request.url).searchParams;
  return runSharedProviderProbe({
    load: searchParams.has('load'),
    remove: searchParams.get('remove'),
  });
};
