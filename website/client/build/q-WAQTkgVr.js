import {
  _ as S,
  f as G,
  q as K,
  Z as st,
  u as it,
  c as U,
  b as lt,
  o as N,
  k as v,
  A as ct,
  P as ut,
  g as M,
  N as dt,
  d as _t,
  e as mt,
  j as pt,
  v as vt,
} from './q-9ngTyHsh.js';
import {
  t as ft,
  j as $,
  k as x,
  r as tt,
  l as et,
  m as ot,
  n as Q,
  o as yt,
  c as ht,
  C as St,
  d as Ct,
  D as Et,
  R as gt,
  e as qt,
  f as bt,
  h as wt,
  i as Rt,
  p as Lt,
  q as Pt,
  s as At,
  v as A,
  w,
  x as Dt,
  y as It,
  z as kt,
} from './q-v9P9ygUp.js';
const Tt = ':root{view-transition-name:none}';
const z = () => S(() => import('./q-9THZec9p.js'), __vite__mapDeps([])),
  J = [
    [
      '[...lang]/privacy-policy/',
      [z, () => S(() => import('./q-oetCl3_F.js'), __vite__mapDeps([]))],
    ],
    [
      '[...lang]/showcase/',
      [z, () => S(() => import('./q-pgd5M9oM.js'), __vite__mapDeps([]))],
    ],
    [
      '[...lang]',
      [z, () => S(() => import('./q-c2pXVZkc.js'), __vite__mapDeps([]))],
    ],
  ],
  B = [];
const X = !0;
const Ot = async (f, n) => {
    const [y, C, a, E] = G(),
      {
        type: i = 'link',
        forceReload: _ = f === void 0,
        replaceState: m = !1,
        scroll: g = !0,
      } = typeof n == 'object' ? n : { forceReload: n },
      l = a.value.dest,
      o = f === void 0 ? l : ft(f, E.url);
    if (!$(o, l)) {
      location.href = o.href;
      return;
    }
    if (!_ && x(o, l)) {
      i === 'link' &&
        o.href !== location.href &&
        history.pushState(null, '', o),
        tt(i, o, new URL(location.href), et()),
        i === 'popstate' && (window._qCityScrollEnabled = !0);
      return;
    }
    return (
      (a.value = {
        type: i,
        dest: o,
        forceReload: _,
        replaceState: m,
        scroll: g,
      }),
      ot(o, K()),
      Q(J, B, X, o.pathname),
      (y.value = void 0),
      (E.isNavigating = !0),
      new Promise((q) => {
        C.r = q;
      })
    );
  },
  Ut = (f) => {
    st(
      M(() => S(() => Promise.resolve().then(() => W), void 0), 's_RPDJAz33WLA')
    );
    const n = yt();
    if (!(n != null && n.params)) throw new Error('Missing Qwik City Env Data');
    const y = it('url');
    if (!y) throw new Error('Missing Qwik URL Env Data');
    const C = new URL(y),
      a = U(
        { url: C, params: n.params, isNavigating: !1, prevUrl: void 0 },
        { deep: !1 }
      ),
      E = {},
      i = lt(U(n.response.loaders, { deep: !1 })),
      _ = N({
        type: 'initial',
        dest: C,
        forceReload: !1,
        replaceState: !1,
        scroll: !0,
      }),
      m = U(ht),
      g = U({ headings: void 0, menu: void 0 }),
      l = N(),
      o = n.response.action,
      q = o ? n.response.loaders[o] : void 0,
      u = N(
        q
          ? {
              id: o,
              data: n.response.formData,
              output: { result: q, status: n.response.status },
            }
          : void 0
      ),
      R = M(
        () => S(() => Promise.resolve().then(() => W), void 0),
        's_fX0bDjeJa0E',
        [u, E, _, a]
      );
    return (
      v(St, g),
      v(Ct, l),
      v(Et, m),
      v(gt, a),
      v(qt, R),
      v(bt, i),
      v(wt, u),
      v(Rt, _),
      ct(
        M(
          () => S(() => Promise.resolve().then(() => W), void 0),
          's_02wMImzEAbk',
          [u, g, l, m, n, R, i, E, f, _, a]
        )
      ),
      ut(dt, null, 3, 'qY_0')
    );
  },
  xt = ({ track: f }) => {
    const [n, y, C, a, E, i, _, m, g, l, o] = G();
    async function q() {
      var Z;
      const [u, R] = f(() => [l.value, n.value]),
        nt = _t(''),
        L = o.url,
        d = R ? 'form' : u.type,
        rt = u.replaceState;
      let r,
        P,
        H = null,
        D;
      {
        (r = new URL(u.dest, location)),
          r.pathname.endsWith('/') || (r.pathname += '/');
        let I = Q(J, B, X, r.pathname);
        D = K();
        const k = (P = await ot(r, D, !0, R));
        if (!k) {
          l.untrackedValue = { type: d, dest: r };
          return;
        }
        const V = k.href,
          T = new URL(V, r);
        Lt(T, r) || ((r = T), (I = Q(J, B, X, r.pathname))), (H = await I);
      }
      if (H) {
        const [I, k, V, T] = H,
          O = V,
          at = O[O.length - 1];
        (o.prevUrl = L),
          (o.url = r),
          (o.params = { ...k }),
          (l.untrackedValue = { type: d, dest: r });
        const b = Pt(P, o, O, nt);
        (y.headings = at.headings),
          (y.menu = T),
          (C.value = mt(O)),
          (a.links = b.links),
          (a.meta = b.meta),
          (a.styles = b.styles),
          (a.scripts = b.scripts),
          (a.title = b.title),
          (a.frontmatter = b.frontmatter);
        {
          g.viewTransition !== !1 && (document.__q_view_transition__ = !0);
          let F;
          d === 'popstate' && (F = et()),
            ((u.scroll &&
              (!u.forceReload || !x(r, L)) &&
              (d === 'link' || d === 'popstate')) ||
              (d === 'form' && !x(r, L))) &&
              (document.__q_scroll_restore__ = () => tt(d, r, L, F));
          const Y = P == null ? void 0 : P.loaders,
            t = window;
          if ((Y && Object.assign(_, Y), At.clear(), !t._qCitySPA)) {
            if (
              ((t._qCitySPA = !0),
              (history.scrollRestoration = 'manual'),
              t.addEventListener('popstate', () => {
                (t._qCityScrollEnabled = !1),
                  clearTimeout(t._qCityScrollDebounce),
                  i(location.href, { type: 'popstate' });
              }),
              t.removeEventListener('popstate', t._qCityInitPopstate),
              (t._qCityInitPopstate = void 0),
              !t._qCityHistoryPatch)
            ) {
              t._qCityHistoryPatch = !0;
              const s = history.pushState,
                p = history.replaceState,
                h = (e) => (
                  e === null || typeof e > 'u'
                    ? (e = {})
                    : (e == null ? void 0 : e.constructor) !== Object &&
                      (e = { _data: e }),
                  (e._qCityScroll =
                    e._qCityScroll || w(document.documentElement)),
                  e
                );
              (history.pushState = (e, c, j) => (
                (e = h(e)), s.call(history, e, c, j)
              )),
                (history.replaceState = (e, c, j) => (
                  (e = h(e)), p.call(history, e, c, j)
                ));
            }
            document.body.addEventListener('click', (s) => {
              if (s.defaultPrevented) return;
              const p = s.target.closest('a[href]');
              if (p && !p.hasAttribute('preventdefault:click')) {
                const h = p.getAttribute('href'),
                  e = new URL(location.href),
                  c = new URL(h, e);
                if ($(c, e) && x(c, e)) {
                  if ((s.preventDefault(), !c.hash && !c.href.endsWith('#'))) {
                    c.href !== e.href && history.pushState(null, '', c),
                      (t._qCityScrollEnabled = !1),
                      clearTimeout(t._qCityScrollDebounce),
                      A({ ...w(document.documentElement), x: 0, y: 0 }),
                      location.reload();
                    return;
                  }
                  i(p.getAttribute('href'));
                }
              }
            }),
              document.body.removeEventListener('click', t._qCityInitAnchors),
              (t._qCityInitAnchors = void 0),
              window.navigation ||
                (document.addEventListener(
                  'visibilitychange',
                  () => {
                    if (
                      t._qCityScrollEnabled &&
                      document.visibilityState === 'hidden'
                    ) {
                      const s = w(document.documentElement);
                      A(s);
                    }
                  },
                  { passive: !0 }
                ),
                document.removeEventListener(
                  'visibilitychange',
                  t._qCityInitVisibility
                ),
                (t._qCityInitVisibility = void 0)),
              t.addEventListener(
                'scroll',
                () => {
                  t._qCityScrollEnabled &&
                    (clearTimeout(t._qCityScrollDebounce),
                    (t._qCityScrollDebounce = setTimeout(() => {
                      const s = w(document.documentElement);
                      A(s), (t._qCityScrollDebounce = void 0);
                    }, 200)));
                },
                { passive: !0 }
              ),
              removeEventListener('scroll', t._qCityInitScroll),
              (t._qCityInitScroll = void 0),
              (Z = t._qCityBootstrap) == null || Z.remove(),
              (t._qCityBootstrap = void 0),
              Dt.resolve();
          }
          if (d !== 'popstate') {
            (t._qCityScrollEnabled = !1), clearTimeout(t._qCityScrollDebounce);
            const s = w(document.documentElement);
            A(s);
          }
          It(window, d, L, r, rt),
            pt(D).then(() => {
              var h;
              kt(D).setAttribute('q:route', I);
              const p = w(document.documentElement);
              A(p),
                (t._qCityScrollEnabled = !0),
                (o.isNavigating = !1),
                (h = m.r) == null || h.call(m);
            });
        }
      }
    }
    q();
  },
  W = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        _hW: vt,
        s_02wMImzEAbk: xt,
        s_RPDJAz33WLA: Tt,
        s_TxCFOy819ag: Ut,
        s_fX0bDjeJa0E: Ot,
      },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  );
export {
  vt as _hW,
  xt as s_02wMImzEAbk,
  Tt as s_RPDJAz33WLA,
  Ut as s_TxCFOy819ag,
  Ot as s_fX0bDjeJa0E,
};
function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = [];
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i]);
}
