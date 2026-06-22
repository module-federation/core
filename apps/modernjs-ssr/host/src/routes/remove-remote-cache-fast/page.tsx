import { useLoaderData } from '@modern-js/runtime/router';

import type { ProbeResult } from './page.data';
import { ProbeView } from '../remove-remote-cache/view';

export default function RemoveRemoteCacheFastPage(): JSX.Element {
  const result = useLoaderData() as ProbeResult;

  return <ProbeView result={result} />;
}
