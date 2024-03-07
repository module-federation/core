import {
  W as i,
  M as u,
  C as r,
  P as l,
  g as m,
  N as d,
  _ as p,
  f as _,
} from './q-9ngTyHsh.js';
import { u as f } from './q-v9P9ygUp.js';
const b = (s) => {
    const e = i(s, ['action', 'spaReset', 'reloadDocument', 'onSubmit$']),
      a = f();
    return u(
      'form',
      {
        ...e,
        children: l(d, null, 3, 'BC_0'),
        onSubmit$: m(
          () => p(() => Promise.resolve().then(() => g), void 0),
          's_p9MSze0ojs4',
          [a]
        ),
      },
      {
        action: 'get',
        'data-spa-reset': r(
          (t) => (t.spaReset ? 'true' : void 0),
          [s],
          'p0.spaReset?"true":undefined'
        ),
        'preventdefault:submit': r(
          (t) => !t.reloadDocument,
          [s],
          '!p0.reloadDocument'
        ),
      },
      0,
      'BC_1'
    );
  },
  v = async (s, e) => {
    const [a] = _(),
      t = new FormData(e),
      o = new URLSearchParams();
    t.forEach((n, c) => {
      typeof n == 'string' && o.append(c, n);
    }),
      a('?' + o.toString(), { type: 'form', forceReload: !0 }).then(() => {
        e.getAttribute('data-spa-reset') === 'true' && e.reset(),
          e.dispatchEvent(
            new CustomEvent('submitcompleted', {
              bubbles: !1,
              cancelable: !1,
              composed: !1,
              detail: { status: 200 },
            })
          );
      });
  },
  g = Object.freeze(
    Object.defineProperty(
      { __proto__: null, s_Nk9PlpjQm9Y: b, s_p9MSze0ojs4: v },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  );
export { b as s_Nk9PlpjQm9Y, v as s_p9MSze0ojs4 };
function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = [];
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i]);
}
