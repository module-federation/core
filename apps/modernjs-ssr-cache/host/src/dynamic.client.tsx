import { lazy, Suspense } from 'react';
import { getInstance } from '@module-federation/modern-js-v3/runtime';
const Weather = lazy(() =>
  getInstance((i) => i.name === 'lab_static')!.loadRemote<any>(
    'lab_palette/Weather',
  ),
);
export default function DynamicWeather() {
  return (
    <Suspense fallback={<p>正在加载后天预报…</p>}>
      <Weather />
    </Suspense>
  );
}
