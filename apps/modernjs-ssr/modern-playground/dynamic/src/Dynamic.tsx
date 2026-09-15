import { lazy, Suspense, useState } from 'react';
import { getInstance } from '@module-federation/modern-js-v3/runtime';
import { useLoaderData } from '@modern-js/runtime/router';
const load = () =>
  getInstance((instance) => instance.name === 'lab_dynamic')!.loadRemote<any>(
    ['lab', 'palette'].join('_') + '/Palette',
  );
const Panel = lazy(load);
export default function Dynamic() {
  const data = useLoaderData() as any;
  const [visible, setVisible] = useState(Boolean(data.dynamic));
  return (
    <div className="dynamic">
      <p className="eyebrow">
        REMOTE B · {data.dynamic ? '服务端动态加载' : '浏览器动态加载'}
      </p>
      {visible ? (
        <Suspense fallback={<p>正在加载配色面板…</p>}>
          <Panel />
        </Suspense>
      ) : (
        <button
          onClick={async () => {
            try {
              const response = await fetch('/__lab/client-remote');
              if (!response.ok) throw Error(await response.text());
              const remote = await response.json();
              getInstance(
                (instance) => instance.name === 'lab_dynamic',
              )!.registerRemotes([remote]);
              await load();
              setVisible(true);
            } catch (error) {
              window.alert(String(error));
            }
          }}
        >
          ＋ 加载配色面板
        </button>
      )}
    </div>
  );
}
