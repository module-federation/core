import { s as V, m as O, V as P, g as w, _ as x } from './q-9ngTyHsh.js';
const A = V('qwikspeak'),
  u = {},
  T =
    (s) =>
    (...n) => {
      const t = JSON.stringify(n);
      return t in u ? u[t] : (u[t] = s(...n));
    },
  E = async (s, n, t, r, a) => {
    if (t) {
      const { locale: e, translation: o, translationFn: c } = s;
      let l;
      if (((l = [...(t ?? [])]), l.length === 0)) return;
      const f = new Set(r || []);
      f.add(e.lang);
      for (const d of f) {
        const v = T(c.loadTranslation$),
          S = l.map((i) => v(d, i, a)),
          _ = (await Promise.all(S)).map((i, m) => ({
            asset: l[m],
            source: i,
          }));
        for (const i of _)
          i != null && i.source && Object.assign(o[d], i.source);
      }
    }
  },
  g = (s, n, t, r = '.', a = '@@') => {
    if (Array.isArray(s)) return s.map((c) => g(c, n, t, r, a));
    let e;
    [s, e] = b(s, a);
    const o = s
      .split(r)
      .reduce((c, l) => (c && c[l] !== void 0 ? c[l] : void 0), n);
    if (o) {
      if (typeof o == 'string' || o instanceof String)
        return t ? p(o.toString(), t) : o.toString();
      if (typeof o == 'object') return o;
    }
    return e
      ? !/^[[{].*[\]}]$/.test(e) || /^{{/.test(e)
        ? t
          ? p(e, t)
          : e
        : JSON.parse(e)
      : s;
  },
  b = (s, n) => s.split(n),
  p = (s, n) =>
    s.replace(/{{\s?([^{}\s]*)\s?}}/g, (r, a) => {
      const e = n[a];
      return e !== void 0 ? e : r;
    }),
  h = P(
    w(
      () => x(() => import('./q-NXuWezL-.js'), __vite__mapDeps([])),
      's_yigdOibvcXE'
    )
  ),
  j = () => O(A),
  k = (s, n, t) => {
    const r = j(),
      { locale: a, translation: e, config: o } = r;
    return (
      t ?? (t = a.lang), g(s, e[t], n, o.keySeparator, o.keyValueSeparator)
    );
  };
export { h as Q, A as S, j as a, E as l, g as t, k as u };
function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = [];
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i]);
}
