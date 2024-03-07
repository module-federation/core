import {
  r as j,
  m as q,
  e as M,
  u as U,
  s as y,
  g as w,
  _ as A,
  V,
  t as R,
  h as H,
  i as K,
} from './q-9ngTyHsh.js';
const Y =
    '((i,a,r,s)=>{r=e=>{const t=document.querySelector("[q\\\\:base]");t&&a.active&&a.active.postMessage({type:"qprefetch",base:t.getAttribute("q:base"),...e})},document.addEventListener("qprefetch",e=>{const t=e.detail;a?r(t):i.push(t)}),navigator.serviceWorker.register("/service-worker.js").then(e=>{s=()=>{a=e,i.forEach(r),r({bundles:i})},e.installing?e.installing.addEventListener("statechange",t=>{t.target.state=="activated"&&s()}):e.active&&s()}).catch(e=>console.error(e))})([])',
  gt = y('qc-s'),
  yt = y('qc-c'),
  mt = y('qc-ic'),
  x = y('qc-h'),
  z = y('qc-l'),
  G = y('qc-n'),
  Ct = y('qc-a'),
  _t = y('qc-ir'),
  Et = w(
    () => A(() => import('./q-EoLAf2n0.js'), __vite__mapDeps([])),
    's_DyVc0YBIqQU'
  ),
  pt = () => {},
  wt = V(
    w(
      () => A(() => import('./q-VOwOkMaG.js'), __vite__mapDeps([])),
      's_e0ssiDXoeAM'
    )
  ),
  P = new WeakMap(),
  _ = new Map(),
  J = 'qaction',
  At = 'qfunc',
  p = (t) => t.pathname + t.search + t.hash,
  C = (t, e) => new URL(t, e.href),
  X = (t, e) => t.origin === e.origin,
  Q = (t, e) => t.pathname + t.search === e.pathname + e.search,
  Z = (t, e) => t.pathname === e.pathname,
  $ = (t, e) => t.search === e.search,
  tt = (t, e, s) => {
    let n = e ?? '';
    return (
      s && (n += (n ? '&' : '?') + J + '=' + encodeURIComponent(s.id)),
      t + (t.endsWith('/') ? '' : '/') + 'q-data.json' + n
    );
  },
  St = (t, e) => {
    const s = t.href;
    if (typeof s == 'string' && typeof t.target != 'string' && !t.reload)
      try {
        const n = C(s.trim(), e.url),
          r = C('', e.url);
        if (X(n, r)) return p(n);
      } catch (n) {
        console.error(n);
      }
    else if (t.reload) return p(C('', e.url));
    return null;
  },
  vt = (t, e, s) => {
    if (t.prefetch === !0 && e) {
      const n = C(e, s.url),
        r = C('', s.url);
      if (!Z(n, r) || !$(n, r)) return '';
    }
    return null;
  },
  et = (t) => t && typeof t.then == 'function',
  Dt = (t, e, s, n) => {
    const r = nt(),
      o = {
        head: r,
        withLocale: (a) => R(n, a),
        resolveValue: (a) => {
          const i = a.__id;
          if (a.__brand === 'server_loader' && !(i in t.loaders))
            throw new Error(
              'You can not get the returned data of a loader that has not been executed for this request.'
            );
          const l = t.loaders[i];
          if (et(l))
            throw new Error(
              'Loaders returning a function can not be referred to in the head function.'
            );
          return l;
        },
        ...e,
      };
    for (let a = s.length - 1; a >= 0; a--) {
      const i = s[a] && s[a].head;
      i &&
        (typeof i == 'function'
          ? k(
              r,
              R(n, () => i(o))
            )
          : typeof i == 'object' && k(r, i));
    }
    return o.head;
  },
  k = (t, e) => {
    typeof e.title == 'string' && (t.title = e.title),
      E(t.meta, e.meta),
      E(t.links, e.links),
      E(t.styles, e.styles),
      E(t.scripts, e.scripts),
      Object.assign(t.frontmatter, e.frontmatter);
  },
  E = (t, e) => {
    if (Array.isArray(e))
      for (const s of e) {
        if (typeof s.key == 'string') {
          const n = t.findIndex((r) => r.key === s.key);
          if (n > -1) {
            t[n] = s;
            continue;
          }
        }
        t.push(s);
      }
  },
  nt = () => ({
    title: '',
    meta: [],
    links: [],
    styles: [],
    scripts: [],
    frontmatter: {},
  });
function st(t, e) {
  const s = L(t),
    n = N(t),
    r = L(e),
    c = N(e);
  return B(t, s, n, e, r, c);
}
function B(t, e, s, n, r, c) {
  let o = null;
  for (; e < s; ) {
    const a = t.charCodeAt(e++),
      i = n.charCodeAt(r++);
    if (a === 91) {
      const l = F(t, e),
        f = e + (l ? 3 : 0),
        h = v(t, f, s, 93),
        u = t.substring(f, h),
        g = v(t, h + 1, s, 47),
        d = t.substring(h + 1, g);
      e = h + 1;
      const m = r - 1;
      if (l) {
        const O = ot(u, d, n, m, c, t, e + d.length + 1, s);
        if (O) return Object.assign(o || (o = {}), O);
      }
      const S = v(n, m, c, 47, d);
      if (S == -1) return null;
      const T = n.substring(m, S);
      if (!l && !d && !T) return null;
      (r = S), ((o || (o = {}))[u] = decodeURIComponent(T));
    } else if (a !== i && !(isNaN(i) && rt(t, e))) return null;
  }
  return b(t, e) && b(n, r) ? o || {} : null;
}
function rt(t, e) {
  return t.charCodeAt(e) === 91 && F(t, e + 1);
}
function N(t) {
  const e = t.length;
  return e > 1 && t.charCodeAt(e - 1) === 47 ? e - 1 : e;
}
function b(t, e) {
  const s = t.length;
  return e >= s || (e == s - 1 && t.charCodeAt(e) === 47);
}
function L(t) {
  return t.charCodeAt(0) === 47 ? 1 : 0;
}
function F(t, e) {
  return (
    t.charCodeAt(e) === 46 &&
    t.charCodeAt(e + 1) === 46 &&
    t.charCodeAt(e + 2) === 46
  );
}
function v(t, e, s, n, r = '') {
  for (; e < s && t.charCodeAt(e) !== n; ) e++;
  const c = r.length;
  for (let o = 0; o < c; o++)
    if (t.charCodeAt(e - c + o) !== r.charCodeAt(o)) return -1;
  return e - c;
}
let I;
(function (t) {
  (t[(t.EOL = 0)] = 'EOL'),
    (t[(t.OPEN_BRACKET = 91)] = 'OPEN_BRACKET'),
    (t[(t.CLOSE_BRACKET = 93)] = 'CLOSE_BRACKET'),
    (t[(t.DOT = 46)] = 'DOT'),
    (t[(t.SLASH = 47)] = 'SLASH');
})(I || (I = {}));
function ot(t, e, s, n, r, c, o, a) {
  s.charCodeAt(n) === 47 && n++;
  let i = r;
  const l = e + '/';
  let f = 5;
  for (; i >= n && f--; ) {
    const h = B(c, o, a, s, i, r);
    if (h) {
      let u = s.substring(n, Math.min(i, r));
      return (
        u.endsWith(l) && (u = u.substring(0, u.length - l.length)),
        (h[t] = decodeURIComponent(u)),
        h
      );
    }
    i = ct(s, n, l, i, n - 1) + l.length;
  }
  return null;
}
function ct(t, e, s, n, r) {
  let c = t.lastIndexOf(s, n);
  return (
    c == n - s.length && (c = t.lastIndexOf(s, n - s.length - 1)), c > e ? c : r
  );
}
const qt = async (t, e, s, n) => {
    if (Array.isArray(t))
      for (const r of t) {
        const c = r[0],
          o = st(c, n);
        if (o) {
          const a = r[1],
            i = r[3],
            l = new Array(a.length),
            f = [],
            h = at(e, n);
          let u;
          return (
            a.forEach((g, d) => {
              W(g, f, (m) => (l[d] = m), s);
            }),
            W(h, f, (g) => (u = g == null ? void 0 : g.default), s),
            f.length > 0 && (await Promise.all(f)),
            [c, o, l, u, i]
          );
        }
      }
    return null;
  },
  W = (t, e, s, n) => {
    if (typeof t == 'function') {
      const r = P.get(t);
      if (r) s(r);
      else {
        const c = t();
        typeof c.then == 'function'
          ? e.push(
              c.then((o) => {
                n !== !1 && P.set(t, o), s(o);
              })
            )
          : c && s(c);
      }
    }
  },
  at = (t, e) => {
    if (t) {
      e = e.endsWith('/') ? e : e + '/';
      const s = t.find(
        (n) => n[0] === e || e.startsWith(n[0] + (e.endsWith('/') ? '' : '/'))
      );
      if (s) return s[1];
    }
  },
  Tt = (t, e, s, n, r = !1) => {
    if (e !== 'popstate') {
      const c = Q(s, n),
        o = s.hash === n.hash;
      if (!c || !o) {
        const a = { _qCityScroll: it() };
        r
          ? t.history.replaceState(a, '', p(n))
          : t.history.pushState(a, '', p(n));
      }
    }
  },
  it = () => ({ x: 0, y: 0, w: 0, h: 0 }),
  lt = (t) => {
    document.dispatchEvent(new CustomEvent('qprefetch', { detail: t }));
  },
  ft = async (t, e, s, n) => {
    const r = t.pathname,
      c = t.search,
      o = tt(r, c, n);
    let a;
    n || (a = _.get(o)), lt({ links: [r] });
    let i;
    if (!a) {
      const l = ht(n);
      n && (n.data = void 0),
        (a = fetch(o, l).then((f) => {
          const h = new URL(f.url),
            u = h.pathname.endsWith('/q-data.json');
          if (h.origin !== location.origin || !u) {
            location.href = h.href;
            return;
          }
          if ((f.headers.get('content-type') || '').includes('json'))
            return f.text().then((g) => {
              const d = j(g, e);
              if (!d) {
                location.href = t.href;
                return;
              }
              if ((s && _.delete(o), d.redirect)) location.href = d.redirect;
              else if (n) {
                const m = d.loaders[n.id];
                i = () => {
                  n.resolve({ status: f.status, result: m });
                };
              }
              return d;
            });
          location.href = t.href;
        })),
        n || _.set(o, a);
    }
    return a.then((l) => (l || _.delete(o), i && i(), l));
  },
  ht = (t) => {
    const e = t == null ? void 0 : t.data;
    if (e)
      return e instanceof FormData
        ? { method: 'POST', body: e }
        : {
            method: 'POST',
            body: JSON.stringify(e),
            headers: { 'Content-Type': 'application/json, charset=UTF-8' },
          };
  },
  Ot = () => q(x),
  Rt = () => q(z),
  Pt = () => q(G),
  kt = () => M(U('qwikcity')),
  Nt = (t, e, s, n) => {
    t === 'popstate' && n
      ? window.scrollTo(n.x, n.y)
      : (t === 'link' || t === 'form') && (ut(e, s) || window.scrollTo(0, 0));
  },
  ut = (t, e) => {
    const s = t.hash.slice(1),
      n = s && document.getElementById(s);
    return n ? (n.scrollIntoView(), !0) : !!(!n && t.hash && Q(t, e));
  },
  bt = (t) => ({
    x: t.scrollLeft,
    y: t.scrollTop,
    w: Math.max(t.scrollWidth, t.clientWidth),
    h: Math.max(t.scrollHeight, t.clientHeight),
  }),
  Lt = () => {
    const t = history.state;
    return t == null ? void 0 : t._qCityScroll;
  },
  It = (t) => {
    const e = history.state || {};
    (e._qCityScroll = t), history.replaceState(e, '');
  },
  Wt = V(
    w(
      () => A(() => import('./q-WAQTkgVr.js'), __vite__mapDeps([])),
      's_TxCFOy819ag'
    )
  );
function jt(t) {
  for (; t && t.nodeType !== Node.ELEMENT_NODE; ) t = t.parentElement;
  return t.closest('[q\\:container]');
}
const Vt = (t, e) => {
  t &&
    t.href &&
    t.hasAttribute('data-prefetch') &&
    (D || (D = innerWidth), (!e || (e && D < 520)) && ft(new URL(t.href), t));
};
let D = 0;
const Qt = (t) =>
    H(
      'script',
      { nonce: K(t, 'nonce') },
      { dangerouslySetInnerHTML: Y },
      null,
      3,
      '1Z_0'
    ),
  Bt = (t) => {
    function e() {
      return w(
        () => A(() => import('./q-i0s5P0zz.js'), __vite__mapDeps([])),
        's_wOIPfiQ04l4',
        [t]
      );
    }
    return e();
  },
  Ft = async function* (t, e, s) {
    const n = t.getReader();
    try {
      let r = '';
      const c = new TextDecoder();
      for (; !(s != null && s.aborted); ) {
        const o = await n.read();
        if (o.done) break;
        r += c.decode(o.value, { stream: !0 });
        const a = r.split(/\n/);
        r = a.pop();
        for (const i of a) yield await j(i, e);
      }
    } finally {
      n.releaseLock();
    }
  };
export {
  Ot as A,
  pt as B,
  yt as C,
  x as D,
  Bt as E,
  wt as F,
  At as G,
  Ft as H,
  Vt as I,
  Wt as Q,
  z as R,
  Qt as S,
  Rt as a,
  vt as b,
  nt as c,
  mt as d,
  G as e,
  gt as f,
  St as g,
  Ct as h,
  _t as i,
  X as j,
  Q as k,
  Lt as l,
  ft as m,
  qt as n,
  kt as o,
  Z as p,
  Dt as q,
  Nt as r,
  _ as s,
  C as t,
  Pt as u,
  It as v,
  bt as w,
  Et as x,
  Tt as y,
  jt as z,
};
function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = [];
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i]);
}
