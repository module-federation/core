import { useEffect, useState } from 'react';
export const release = 'v1';
export const moduleInstance = Math.random().toString(36).slice(2, 10);
export default function Palette() {
  const [color, setColor] = useState('#b5a0ff');
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return (
    <section
      className="palette"
      data-testid="palette"
      data-hydrated={String(hydrated)}
      style={{ '--selected': color } as any}
    >
      <div className="eyebrow">
        COLOR STUDIO <span>{release}</span>
      </div>
      <h2>Choose a mood.</h2>
      <div className="color-field">
        <span>{color}</span>
      </div>
      <div className="swatches">
        {['#b5a0ff', '#72dac8', '#edb68a', '#7ca9ec'].map((c) => (
          <button
            key={c}
            aria-label={c}
            style={{ background: c }}
            onClick={() => setColor(c)}
          />
        ))}
      </div>
      <output className="hydration">
        {hydrated ? '● Hydrated · 可以交互' : '○ SSR · 等待水合'}
      </output>
    </section>
  );
}
