import { lazy, Suspense } from 'react';
const Weather = lazy(() => globalThis.__weatherLoad());
export default function DynamicWeather() {
  return (
    <Suspense fallback={<p>正在加载后天预报…</p>}>
      <Weather />
    </Suspense>
  );
}
