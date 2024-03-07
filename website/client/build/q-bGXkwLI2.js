import {
  c as n,
  o as e,
  k as t,
  P as m,
  N as p,
  g as C,
  _ as R,
} from './q-9ngTyHsh.js';
import {
  c as f,
  C as g,
  d as x,
  D as y,
  R as h,
  e as P,
  f as E,
  h as I,
  i as b,
} from './q-v9P9ygUp.js';
const w = (o) => {
    const s = o.url ?? 'http://localhost/',
      a = new URL(s),
      r = n(
        { url: a, params: o.params ?? {}, isNavigating: !1, prevUrl: void 0 },
        { deep: !1 }
      ),
      c = e({}),
      i = e({ type: 'initial', dest: a }),
      l = C(
        () => R(() => Promise.resolve().then(() => S), void 0),
        's_BUbtvTyvVRE'
      ),
      d = n(f, { deep: !1 }),
      u = n({ headings: void 0, menu: void 0 }, { deep: !1 }),
      _ = e(),
      v = e();
    return (
      t(g, u),
      t(x, _),
      t(y, d),
      t(h, r),
      t(P, l),
      t(E, c),
      t(I, v),
      t(b, i),
      m(p, null, 3, 'qY_1')
    );
  },
  N = async (o) => {
    throw new Error('Not implemented');
  },
  S = Object.freeze(
    Object.defineProperty(
      { __proto__: null, s_BUbtvTyvVRE: N, s_WmYC5H00wtI: w },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  );
export { N as s_BUbtvTyvVRE, w as s_WmYC5H00wtI };
function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = [];
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i]);
}
