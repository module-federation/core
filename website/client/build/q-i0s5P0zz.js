import { G as l, H as m } from './q-v9P9ygUp.js';
import { f as d, q as u, w, r as y } from './q-9ngTyHsh.js';
const b = async function (...o) {
  const [s] = d(),
    n = o.length > 0 && o[0] instanceof AbortSignal ? o.shift() : void 0;
  {
    const i = u(),
      f = o.map((t) =>
        t instanceof SubmitEvent && t.target instanceof HTMLFormElement
          ? new FormData(t.target)
          : t instanceof Event || t instanceof Node
          ? null
          : t
      ),
      a = s.getHash(),
      e = await fetch(`?${l}=${a}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/qwik-json', 'X-QRL': a },
        signal: n,
        body: await w([s, ...f]),
      }),
      c = e.headers.get('Content-Type');
    if (e.ok && c === 'text/qwik-json-stream' && e.body)
      return (async function* () {
        try {
          for await (const t of m(e.body, i ?? document.documentElement, n))
            yield t;
        } finally {
          (n != null && n.aborted) || (await e.body.cancel());
        }
      })();
    if (c === 'application/qwik-json') {
      const t = await e.text(),
        r = await y(t, i ?? document.documentElement);
      if (e.status === 500) throw r;
      return r;
    }
  }
};
export { b as s_wOIPfiQ04l4 };
