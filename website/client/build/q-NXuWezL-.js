import {
  u as r,
  g as c,
  k as g,
  A as d,
  P as m,
  _ as f,
  N as v,
  f as k,
  v as L,
} from './q-9ngTyHsh.js';
import { S as y, l as A } from './q-Scd2ZB6o.js';
const P = (e) => {
    var i;
    r('url');
    const s = null,
      t = r('locale'),
      a = {
        loadTranslation$:
          ((i = e.translationFn) == null ? void 0 : i.loadTranslation$) ??
          c(
            () => f(() => Promise.resolve().then(() => u), void 0),
            's_MIDC22ueZrk'
          ),
      };
    let o = e.locale ?? e.config.supportedLocales.find((l) => l.lang === t);
    o || (o = e.config.defaultLocale);
    const n = {
        locale: Object.assign({}, o),
        translation: Object.fromEntries(
          e.config.supportedLocales.map((l) => [l.lang, {}])
        ),
        config: {
          defaultLocale: e.config.defaultLocale,
          supportedLocales: e.config.supportedLocales,
          assets: e.config.assets,
          runtimeAssets: e.config.runtimeAssets,
          keySeparator: e.config.keySeparator || '.',
          keyValueSeparator: e.config.keyValueSeparator || '@@',
        },
        translationFn: a,
      },
      { config: _ } = n;
    return (
      g(y, n),
      d(
        c(
          () => f(() => Promise.resolve().then(() => u), void 0),
          's_sfbNflx0Y2A',
          [_, e, n, s]
        )
      ),
      m(v, null, 3, 'gB_0')
    );
  },
  S = async () => {
    const [e, s, t, a] = k();
    await A(
      t,
      e.assets,
      e.runtimeAssets,
      s.langs,
      a == null ? void 0 : a.origin
    );
  },
  b = () => null,
  u = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        _hW: L,
        s_MIDC22ueZrk: b,
        s_sfbNflx0Y2A: S,
        s_yigdOibvcXE: P,
      },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  );
export { L as _hW, b as s_MIDC22ueZrk, S as s_sfbNflx0Y2A, P as s_yigdOibvcXE };
function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = [];
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i]);
}
