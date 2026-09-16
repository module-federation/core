import { useEffect, useState } from 'react';
export const forecast = {
  day: '明天',
  version: 'v2',
  celsius: 18,
  condition: '雨',
};
export default function Weather() {
  const [fahrenheit, setFahrenheit] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <section
      className="forecast"
      data-testid="forecast"
      data-release={forecast.version}
      data-hydrated={String(ready)}
    >
      <div className="forecast-top">
        <span>明天 · 演示预报</span>
        <span>v2</span>
      </div>
      <div className="weather-icon" aria-hidden="true">
        ☂
      </div>
      <div className="temperature" data-testid="temperature">
        {fahrenheit
          ? Number(((forecast.celsius * 9) / 5 + 32).toFixed(1))
          : forecast.celsius}
        <span>°{fahrenheit ? 'F' : 'C'}</span>
      </div>
      <h2>雨</h2>
      <p>出门前，记得看看天空。</p>
      <button
        className="unit"
        disabled={!ready}
        onClick={() => setFahrenheit((v) => !v)}
      >
        切换到 °{fahrenheit ? 'C' : 'F'}
      </button>
      <small>{ready ? '可以切换温度单位 · 已水合' : '等待交互就绪'}</small>
    </section>
  );
}
