import { useLoaderData } from '@modern-js/runtime/router';
import { useEffect } from 'react';
import '../style.css';
export default function Memo() {
  const data = useLoaderData() as any;
  useEffect(() => {
    window.parent.postMessage(
      { type: 'weather-memo', ...data },
      window.location.origin,
    );
  }, [data.id, data.count]);
  return (
    <main className="memo">
      <span className="eyebrow">留在宿主里的状态</span>
      <h2>出行备忘</h2>
      <p>出门之前，做一点准备。</p>
      <div className="memo-count">
        <b data-testid="memo-count">{data.count}</b>
        <span>次准备已记录</span>
      </div>
      <button onClick={() => location.assign('/memo?add=1&t=' + Date.now())}>
        记录一次
      </button>
      <small>这是服务端计数，刷新也会保留。</small>
      <script
        type="application/json"
        id="memo-evidence"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
    </main>
  );
}
