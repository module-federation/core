import {
  f as b,
  a as p,
  X as g,
  M as k,
  P as A,
  Q as u,
  N as D,
  g as _,
  _ as v,
} from './q-9ngTyHsh.js';
import { u as K, a as N, g as m, b as C } from './q-v9P9ygUp.js';
const L = async (t, e) => {
    const [a, n, r, i] = b();
    t.defaultPrevented &&
      (e.hasAttribute('q:nbs')
        ? await a(location.href, { type: 'popstate' })
        : e.href &&
          (e.setAttribute('aria-pressed', 'true'),
          await a(e.href, { forceReload: n, replaceState: r, scroll: i }),
          e.removeAttribute('aria-pressed')));
  },
  M = (t) => {
    const e = K(),
      a = N(),
      { onClick$: n, reload: r, replaceState: i, scroll: h, ...o } = t,
      l = p(() => m({ ...o, reload: r }, a)),
      f = p(() => C(t, l, a));
    (o['link:app'] = !!l), (o.href = l || t.href);
    const c =
        f != null
          ? u(
              _(
                () => v(() => import('./q-yNMDHcTE.js'), __vite__mapDeps([])),
                's_eBQ0vFsFKsk'
              )
            )
          : void 0,
      d = g((s, P) => {
        P.hasAttribute('link:app') &&
          !(s.metaKey || s.ctrlKey || s.shiftKey || s.altKey) &&
          s.preventDefault();
      }, '(event,target)=>{if(target.hasAttribute("link:app")&&!(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)){event.preventDefault();}}'),
      y = u(
        _(
          () => v(() => Promise.resolve().then(() => O), void 0),
          's_i1Cv0pYJNR0',
          [e, r, i, h]
        )
      );
    return k(
      'a',
      {
        ...o,
        children: A(D, null, 3, 'AD_0'),
        'data-prefetch': f,
        onClick$: [d, n, y],
        onFocus$: c,
        onMouseOver$: c,
        onQVisible$: c,
      },
      null,
      0,
      'AD_1'
    );
  },
  O = Object.freeze(
    Object.defineProperty(
      { __proto__: null, s_8gdLBszqbaM: M, s_i1Cv0pYJNR0: L },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  );
export { M as s_8gdLBszqbaM, L as s_i1Cv0pYJNR0 };
function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = [];
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i]);
}
