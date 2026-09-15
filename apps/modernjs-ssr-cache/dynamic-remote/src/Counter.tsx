import { useEffect, useState } from 'react';
export const release = 'v1';
export const moduleInstance = Math.random().toString(36).slice(2, 10);
export default function Counter() {
  const [bpm, setBpm] = useState(120);
  const [playing, setPlaying] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return (
    <section
      className={'instrument ' + release}
      data-release={release}
      data-hydrated={String(hydrated)}
    >
      <div className="eyebrow">
        REMOTE A <span>{release}</span>
      </div>
      <h2>Find your rhythm.</h2>
      <div
        className={'rhythm ' + (playing ? 'playing' : '')}
        style={{ '--beat': 60 / bpm + 's' } as any}
        aria-hidden="true"
      >
        {[2, 5, 8, 4, 6, 3, 7, 5, 2].map((height, i) => (
          <i
            key={i}
            style={{
              height: height * 10 + '%',
              animationDelay: i * 0.07 + 's',
            }}
          />
        ))}
      </div>
      <div className="tempo">
        <button
          aria-label="降低 BPM"
          onClick={() => setBpm(Math.max(40, bpm - 5))}
        >
          −
        </button>
        <strong data-testid="bpm">
          {bpm}
          <small>BPM</small>
        </strong>
        <button
          aria-label="增加 BPM"
          onClick={() => setBpm(Math.min(220, bpm + 5))}
        >
          +
        </button>
      </div>
      <button className="play" onClick={() => setPlaying(!playing)}>
        {playing ? '暂停节拍' : '播放节拍'}
      </button>
      <p className="caption">视觉节拍 · 无声音</p>
      <output className="hydration">
        {hydrated ? '● Hydrated · 可以交互' : '○ SSR · 等待水合'}
      </output>
    </section>
  );
}
