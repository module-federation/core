import { useLoaderData } from '@modern-js/runtime/router';

import type { ProbeResult } from './page.data';
import { ProbeView } from '../view';

export default function RegisterNewRemoteCachePage(): JSX.Element {
  const result = useLoaderData() as ProbeResult;

  return <ProbeView result={result} />;
}
