const co = (function () {
    const t = typeof document < 'u' && document.createElement('link').relList;
    return t && t.supports && t.supports('modulepreload')
      ? 'modulepreload'
      : 'preload';
  })(),
  uo = function (e) {
    return '/' + e;
  },
  An = {},
  ao = function (t, n, r) {
    let o = Promise.resolve();
    if (n && n.length > 0) {
      const s = document.getElementsByTagName('link');
      o = Promise.all(
        n.map((l) => {
          if (((l = uo(l)), l in An)) return;
          An[l] = !0;
          const i = l.endsWith('.css'),
            c = i ? '[rel="stylesheet"]' : '';
          if (!!r)
            for (let h = s.length - 1; h >= 0; h--) {
              const m = s[h];
              if (m.href === l && (!i || m.rel === 'stylesheet')) return;
            }
          else if (document.querySelector(`link[href="${l}"]${c}`)) return;
          const a = document.createElement('link');
          if (
            ((a.rel = i ? 'stylesheet' : co),
            i || ((a.as = 'script'), (a.crossOrigin = '')),
            (a.href = l),
            document.head.appendChild(a),
            i)
          )
            return new Promise((h, m) => {
              a.addEventListener('load', h),
                a.addEventListener('error', () =>
                  m(new Error(`Unable to preload CSS for ${l}`))
                );
            });
        })
      );
    }
    return o
      .then(() => t())
      .catch((s) => {
        const l = new Event('vite:preloadError', { cancelable: !0 });
        if (((l.payload = s), window.dispatchEvent(l), !l.defaultPrevented))
          throw s;
      });
  },
  it = (e) => e && typeof e.nodeType == 'number',
  fo = (e) => e.nodeType === 9,
  Ae = (e) => e.nodeType === 1,
  ke = (e) => {
    const t = e.nodeType;
    return t === 1 || t === 111;
  },
  ho = (e) => {
    const t = e.nodeType;
    return t === 1 || t === 111 || t === 3;
  },
  Y = (e) => e.nodeType === 111,
  Zn = (e) => e.nodeType === 3,
  lt = (e) => e.nodeType === 8,
  he = (e, ...t) => Gt(!0, e, ...t),
  po = (e, ...t) => {
    throw Gt(!1, e, ...t);
  },
  Ut = (e, ...t) => Gt(!0, e, ...t),
  Gt = (e, t, ...n) => {
    const r = t instanceof Error ? t : new Error(t);
    return (
      console.error('%cQWIK ERROR', '', r.stack || r.message, ...n),
      e &&
        setTimeout(() => {
          throw r;
        }, 0),
      r
    );
  },
  A = (e, ...t) => {
    const n = ct(e);
    return Ut(n, ...t);
  },
  ct = (e) => `Code(${e})`,
  mo = () => ({
    isServer: !1,
    importSymbol(e, t, n) {
      if (!t) throw A(31, n);
      if (!e) throw A(30, t, n);
      const r = go(e.ownerDocument, e, t).toString(),
        o = new URL(r);
      return (
        (o.hash = ''),
        (o.search = ''),
        ao(() => import(o.href), __vite__mapDeps([])).then((s) => s[n])
      );
    },
    raf: (e) =>
      new Promise((t) => {
        requestAnimationFrame(() => {
          t(e());
        });
      }),
    nextTick: (e) =>
      new Promise((t) => {
        setTimeout(() => {
          t(e());
        });
      }),
    chunkForSymbol: (e, t) => [e, t ?? '_'],
  }),
  go = (e, t, n) => {
    const r = e.baseURI,
      o = new URL(t.getAttribute('q:base') ?? r, r);
    return new URL(n, o);
  };
let vo = mo();
const zt = () => vo,
  ut = (e) => {
    const t = Object.getPrototypeOf(e);
    return t === Object.prototype || t === null;
  },
  le = (e) => e && typeof e == 'object',
  T = (e) => Array.isArray(e),
  Ee = (e) => typeof e == 'string',
  M = (e) => typeof e == 'function',
  H = (e) => e && typeof e.then == 'function',
  at = (e, t, n) => {
    try {
      const r = e();
      return H(r) ? r.then(t, n) : t(r);
    } catch (r) {
      return n(r);
    }
  },
  q = (e, t) => (H(e) ? e.then(t) : t(e)),
  Jt = (e) => (e.some(H) ? Promise.all(e) : e),
  ze = (e) => (e.length > 0 ? Promise.all(e) : e),
  yo = (e) => e != null,
  wo = (e) =>
    new Promise((t) => {
      setTimeout(t, e);
    }),
  z = [],
  P = {},
  Je = () => document,
  We = 'q:renderFn',
  Qt = '⭐️',
  Q = 'q:slot',
  Vt = 'q:sref',
  we = 'q:s',
  Zt = 'q:style',
  bo = 'q:sstyle',
  _t = 'q:container',
  Kn = '[q\\:container]',
  Kt = 'qRender',
  Yn = 'qTask',
  er = 'q:id',
  xt = Symbol('proxy target'),
  de = Symbol('proxy flags'),
  O = Symbol('proxy manager'),
  N = Symbol('IMMUTABLE'),
  ge = '$$',
  Le = '__virtual',
  Yt = '_qc_',
  F = (e, t, n) => e.setAttribute(t, n),
  B = (e, t) => e.getAttribute(t),
  en = (e) => e.replace(/([A-Z])/g, '-$1').toLowerCase(),
  Wn = Symbol('ContainerState'),
  De = (e) => {
    let t = e[Wn];
    return t || (e[Wn] = t = tr(e, B(e, 'q:base') ?? '/')), t;
  },
  tr = (e, t) => {
    const n = {
      t: e,
      o: 0,
      l: !1,
      u: new WeakMap(),
      $: new Set(),
      p: new Set(),
      v: new Set(),
      m: new Set(),
      S: new Set(),
      q: new Set(),
      C: new Set(),
      k: {},
      j: t,
      M: void 0,
      P: void 0,
      O: void 0,
      T: null,
      I: new Map(),
    };
    return (n.T = pi(n)), n;
  },
  nr = (e, t) => {
    if (M(e)) return e(t);
    if (le(e) && 'value' in e) return (e.value = t);
    throw A(32, e);
  },
  je = (e) => e.toString(36),
  $ = (e) => parseInt(e, 36),
  So = (e) => {
    const t = e.indexOf(':');
    return e && e.slice(t + 1).replace(/-./g, (n) => n[1].toUpperCase());
  },
  ko = /^(on|window:|document:)/,
  Eo = 'preventdefault:',
  rr = (e) => e.endsWith('$') && ko.test(e),
  or = (e, t, n, r) => {
    if ((t.endsWith('$'), (t = Tt(t.slice(0, -1))), n))
      if (T(n)) {
        const o = n
          .flat(1 / 0)
          .filter((s) => s != null)
          .map((s) => [t, jn(s, r)]);
        e.push(...o);
      } else e.push([t, jn(n, r)]);
    return t;
  },
  Ln = ['on', 'window:on', 'document:on'],
  Co = ['on', 'on-window', 'on-document'],
  Tt = (e) => {
    let t = 'on';
    for (let n = 0; n < Ln.length; n++) {
      const r = Ln[n];
      if (e.startsWith(r)) {
        (t = Co[n]), (e = e.slice(r.length));
        break;
      }
    }
    return t + ':' + (e.startsWith('-') ? en(e.slice(1)) : e.toLowerCase());
  },
  jn = (e, t) => {
    const n = kn(e) ? e : bi(e);
    return n.R(t), n;
  },
  qo = (e, t) => {
    ir(sr(e, void 0), t);
  },
  Pn = (e, t) => {
    ir(sr(e, 'document'), t);
  },
  sr = (e, t) => {
    const n = t !== void 0 ? t + ':' : '';
    return Array.isArray(e) ? e.map((r) => `${n}on-${r}`) : `${n}on-${e}`;
  },
  ir = (e, t) => {
    if (t) {
      const n = Er(),
        r = L(n.A, n.F.N.L);
      typeof e == 'string'
        ? r.li.push([Tt(e), t])
        : r.li.push(...e.map((o) => [Tt(o), t])),
        (r.W |= Pt);
    }
  },
  Mi = (e, t, n) => new Nt(e, t, n);
var lr;
const _o = (e, t, n, r) => {
    const o = t.T.D(r);
    return new Qe(e, o, n);
  },
  Pe = Symbol('proxy manager'),
  cr = Symbol('unassigned signal');
class Xe {}
class Qe extends Xe {
  constructor(t, n, r) {
    super(),
      (this[lr] = 0),
      (this.untrackedValue = t),
      (this[O] = n),
      (this[Pe] = r);
  }
  valueOf() {}
  toString() {
    return `[Signal ${String(this.value)}]`;
  }
  toJSON() {
    return { value: this.value };
  }
  get value() {
    var n;
    if (2 & this[Pe]) throw cr;
    const t = (n = I()) == null ? void 0 : n.H;
    return t && this[O].U(t), this.untrackedValue;
  }
  set value(t) {
    const n = this[O];
    n && this.untrackedValue !== t && ((this.untrackedValue = t), n.J());
  }
}
lr = Pe;
class Nt extends Xe {
  constructor(t, n, r) {
    super(), (this.B = t), (this.G = n), (this.Y = r);
  }
  get value() {
    return this.B.apply(void 0, this.G);
  }
}
class At extends Xe {
  constructor(t, n) {
    super(), (this.ref = t), (this.prop = n);
  }
  get [O]() {
    return ee(this.ref);
  }
  get value() {
    return this.ref[this.prop];
  }
  set value(t) {
    this.ref[this.prop] = t;
  }
}
const R = (e) => e instanceof Xe,
  xo = (e, t) => {
    var o, s;
    if (!le(e)) return e[t];
    if (e instanceof Xe) return e;
    const n = Ce(e);
    if (n) {
      const l = n[ge + t];
      if (l) return l;
      if (((o = n[N]) == null ? void 0 : o[t]) !== !0) return new At(e, t);
    }
    const r = (s = e[N]) == null ? void 0 : s[t];
    return R(r) ? r : N;
  },
  Ri = (e, t) => {
    const n = xo(e, t);
    return n === N ? e[t] : n;
  },
  tn = (e, t, n = 0) => t.u.get(e) || (n !== 0 && ht(e, n), ft(e, t, void 0)),
  ft = (e, t, n) => {
    bt(e), t.u.has(e);
    const r = t.T.D(n),
      o = new Proxy(e, new ur(t, r));
    return t.u.set(e, o), o;
  },
  nn = () => {
    const e = {};
    return ht(e, 2), e;
  },
  ht = (e, t) => {
    Object.defineProperty(e, de, { value: t, enumerable: !1 });
  },
  Ii = (e, t) => {
    const n = {};
    for (const r in e) t.includes(r) || (n[r] = e[r]);
    return n;
  };
class ur {
  constructor(t, n) {
    (this.L = t), (this.K = n);
  }
  deleteProperty(t, n) {
    if (2 & t[de]) throw A(17);
    return (
      typeof n == 'string' && delete t[n] && (this.K.J(T(t) ? void 0 : n), !0)
    );
  }
  get(t, n) {
    var u;
    if (typeof n == 'symbol') return n === xt ? t : n === O ? this.K : t[n];
    const r = t[de] ?? 0,
      o = I(),
      s = (1 & r) != 0,
      l = t[ge + n];
    let i, c;
    if (
      (o && (i = o.H),
      !(2 & r) ||
        (n in t && !To((u = t[N]) == null ? void 0 : u[n])) ||
        (i = null),
      l ? ((c = l.value), (i = null)) : (c = t[n]),
      i)
    ) {
      const a = T(t);
      this.K.U(i, a ? void 0 : n);
    }
    return s ? No(c, this.L) : c;
  }
  set(t, n, r) {
    if (typeof n == 'symbol') return (t[n] = r), !0;
    const o = t[de] ?? 0;
    if (2 & o) throw A(17);
    const s = 1 & o ? bt(r) : r;
    if (T(t)) return (t[n] = s), this.K.J(), !0;
    const l = t[n];
    return (t[n] = s), l !== s && this.K.J(n), !0;
  }
  has(t, n) {
    if (n === xt) return !0;
    const r = Object.prototype.hasOwnProperty;
    return !!r.call(t, n) || !(typeof n != 'string' || !r.call(t, ge + n));
  }
  ownKeys(t) {
    if (!(2 & (t[de] ?? 0))) {
      let n = null;
      const r = I();
      r && (n = r.H), n && this.K.U(n);
    }
    return T(t)
      ? Reflect.ownKeys(t)
      : Reflect.ownKeys(t).map((n) =>
          typeof n == 'string' && n.startsWith(ge) ? n.slice(2) : n
        );
  }
  getOwnPropertyDescriptor(t, n) {
    return T(t) || typeof n == 'symbol'
      ? Object.getOwnPropertyDescriptor(t, n)
      : { enumerable: !0, configurable: !0 };
  }
}
const To = (e) => e === N || R(e),
  No = (e, t) => {
    if (le(e)) {
      if (Object.isFrozen(e)) return e;
      const n = bt(e);
      if (n !== e || Ur(n)) return e;
      if (ut(n) || T(n)) return t.u.get(n) || tn(n, t, 1);
    }
    return e;
  },
  Ao = (e, t = 0) => {
    for (let n = 0; n < e.length; n++)
      (t = (t << 5) - t + e.charCodeAt(n)), (t |= 0);
    return Number(Math.abs(t)).toString(36);
  },
  ar = (e, t, n, r, o, s) => {
    const l = s == null ? null : String(s);
    return new He(e, t || P, n, r, o, l);
  },
  Di = (e, t, n, r, o, s) => {
    let l = null;
    return (
      t && 'children' in t && ((l = t.children), delete t.children),
      ar(e, t, n, l, r, o)
    );
  },
  rn = (e, t, n, r, o) => {
    const s = r == null ? null : String(r),
      l = t ?? P;
    if (typeof e == 'string' && N in l) {
      const c = {};
      for (const [u, a] of Object.entries(l[N])) c[u] = a === N ? l[u] : a;
      return ar(e, null, c, l.children, n, r);
    }
    const i = new He(e, l, null, l.children, n, s);
    return typeof e == 'string' && t && delete t.children, i;
  },
  Ve = ':skipRender';
class He {
  constructor(t, n, r, o, s, l = null) {
    (this.type = t),
      (this.props = n),
      (this.immutableProps = r),
      (this.children = o),
      (this.flags = s),
      (this.key = l);
  }
}
const $e = (e) => e.children,
  dt = (e) => e instanceof He,
  Wt = (e) => e.children,
  fr = Symbol('skip render'),
  on = (e, t, n) => {
    const r = !(t.W & fn),
      o = t.X,
      s = e.N.L;
    return (
      s.S.delete(t),
      s.T.bt(o),
      q($t(e, t), (l) => {
        const i = e.N,
          c = l.rCtx,
          u = X(e.N.nt, o);
        if ((i.yt.add(o), (u.H = [0, o]), (u.F = c), r && t.ft))
          for (const h of t.ft) _s(i, h);
        const a = Z(l.node, u);
        return q(a, (h) => {
          const m = Wo(o, h),
            d = sn(t);
          return q(et(c, d, m, n), () => {
            t.gt = m;
          });
        });
      })
    );
  },
  sn = (e) => (e.gt || (e.gt = tt(e.X)), e.gt);
class J {
  constructor(t, n, r, o, s, l) {
    (this.xt = t),
      (this.ht = n),
      (this.St = r),
      (this.qt = o),
      (this.W = s),
      (this.Ct = l),
      (this.kt = null),
      (this.jt = ''),
      (this.Mt = null),
      (this.ct = t + (l ? ':' + l : ''));
  }
}
const hr = (e, t) => {
    const {
      key: n,
      type: r,
      props: o,
      children: s,
      flags: l,
      immutableProps: i,
    } = e;
    let c = '';
    if (Ee(r)) c = r;
    else {
      if (r !== $e) {
        if (M(r)) {
          const a = D(t, r, o, n, l, e.dev);
          return hs(a, e) ? hr(rn($e, { children: a }, 0, n), t) : Z(a, t);
        }
        throw A(25, r);
      }
      c = Se;
    }
    let u = z;
    return s != null
      ? q(
          Z(s, t),
          (a) => (a !== void 0 && (u = T(a) ? a : [a]), new J(c, o, i, u, l, n))
        )
      : new J(c, o, i, u, l, n);
  },
  Wo = (e, t) => {
    const n = t === void 0 ? z : T(t) ? t : [t],
      r = new J(':virtual', {}, null, n, 0, null);
    return (r.kt = e), r;
  },
  Z = (e, t) => {
    if (e != null && typeof e != 'boolean') {
      if (dr(e)) {
        const n = new J('#text', P, null, z, 0, null);
        return (n.jt = String(e)), n;
      }
      if (dt(e)) return hr(e, t);
      if (R(e)) {
        const n = new J('#signal', P, null, z, 0, null);
        return (n.Mt = e), n;
      }
      if (T(e)) {
        const n = Jt(e.flatMap((r) => Z(r, t)));
        return q(n, (r) => r.flat(100).filter(yo));
      }
      return H(e)
        ? e.then((n) => Z(n, t))
        : e === fr
        ? new J(Ve, P, null, z, 0, null)
        : void 0;
    }
  },
  dr = (e) => Ee(e) || typeof e == 'number',
  pr = (e) => {
    B(e, _t) === 'paused' && Lo(e);
  },
  Xi = (e, t) => {
    const n = JSON.parse(e);
    if (typeof n != 'object') return null;
    const { _objs: r, _entry: o } = n;
    if (r === void 0 || o === void 0) return null;
    let s = {},
      l = {};
    if (it(t) && ke(t)) {
      const u = mt(t);
      u && ((l = De(u)), (s = u.ownerDocument));
    }
    const i = Xr(l, s);
    for (let u = 0; u < r.length; u++) {
      const a = r[u];
      Ee(a) && (r[u] = a === wt ? void 0 : i.prepare(a));
    }
    const c = (u) => r[$(u)];
    for (const u of r) mr(u, c, i);
    return c(o);
  },
  Lo = (e) => {
    if (!Ae((t = e)) || !t.hasAttribute(_t)) return;
    var t;
    const n =
      e._qwikjson_ ??
      ((f) => {
        const g = Je(),
          w = Oo(f === g.documentElement ? g.body : f, 'type');
        if (w) return JSON.parse(Po(w.firstChild.data) || '{}');
      })(e);
    if (((e._qwikjson_ = null), !n)) return;
    const r = Je(),
      o = $o(e),
      s = De(e),
      l = new Map(),
      i = new Map();
    let c = null,
      u = 0;
    const a = r.createTreeWalker(e, 128);
    for (; (c = a.nextNode()); ) {
      const f = c.data;
      if (u === 0) {
        if (f.startsWith('qv ')) {
          const g = Mo(f);
          g >= 0 && l.set(g, c);
        } else if (f.startsWith('t=')) {
          const g = f.slice(2),
            w = $(g),
            S = Fo(c);
          l.set(w, S), i.set(w, S.data);
        }
      }
      f === 'cq' ? u++ : f === '/cq' && u--;
    }
    const h = e.getElementsByClassName('qc📦').length !== 0;
    e.querySelectorAll('[q\\:id]').forEach((f) => {
      if (h && f.closest('[q\\:container]') !== e) return;
      const g = B(f, er),
        w = $(g);
      l.set(w, f);
    });
    const m = Xr(s, r),
      d = new Map(),
      v = new Set(),
      y = (f) => (d.has(f) ? d.get(f) : p(f)),
      p = (f) => {
        if (f.startsWith('#')) {
          const x = f.slice(1),
            k = $(x);
          l.has(k);
          const C = l.get(k);
          if (lt(C)) {
            if (!C.isConnected) return void d.set(f, void 0);
            const U = Ie(C);
            return d.set(f, U), L(U, s), U;
          }
          return Ae(C) ? (d.set(f, C), L(C, s), C) : (d.set(f, C), C);
        }
        if (f.startsWith('@')) {
          const x = f.slice(1),
            k = $(x);
          return o[k];
        }
        if (f.startsWith('*')) {
          const x = f.slice(1),
            k = $(x);
          l.has(k);
          const C = i.get(k);
          return d.set(f, C), C;
        }
        const g = $(f);
        let w = n.objs[g];
        Ee(w) && (w = w === wt ? void 0 : m.prepare(w));
        let S = w;
        for (let x = f.length - 1; x >= 0; x--) {
          const k = ui[f[x]];
          if (!k) break;
          S = k(S, s);
        }
        return (
          d.set(f, S),
          dr(w) ||
            v.has(g) ||
            (v.add(g), jo(w, g, n.subs, y, s, m), mr(w, y, m)),
          S
        );
      };
    (s.o = 1e5),
      (s.O = { getObject: y, meta: n.ctx, refs: n.refs }),
      F(e, _t, 'resumed'),
      ((f) => {
        f &&
          f.dispatchEvent(
            new CustomEvent('qresume', {
              detail: void 0,
              bubbles: !0,
              composed: !0,
            })
          );
      })(e);
  },
  jo = (e, t, n, r, o, s) => {
    const l = n[t];
    if (l) {
      const i = [];
      let c = 0;
      for (const u of l)
        if (u.startsWith('_')) c = parseInt(u.slice(1), 10);
        else {
          const a = di(u, r);
          a && i.push(a);
        }
      if ((c > 0 && ht(e, c), !s.subs(e, i))) {
        const u = o.u.get(e);
        u ? ee(u).Pt(i) : ft(e, o, i);
      }
    }
  },
  mr = (e, t, n) => {
    if (!n.fill(e, t) && e && typeof e == 'object') {
      if (T(e)) for (let r = 0; r < e.length; r++) e[r] = t(e[r]);
      else if (ut(e)) for (const r in e) e[r] = t(e[r]);
    }
  },
  Po = (e) => e.replace(/\\x3C(\/?script)/g, '<$1'),
  $o = (e) => e.qFuncs ?? z,
  Oo = (e, t) => {
    let n = e.lastElementChild;
    for (; n; ) {
      if (n.tagName === 'SCRIPT' && B(n, t) === 'qwik/json') return n;
      n = n.previousElementSibling;
    }
  },
  Fo = (e) => {
    const t = e.nextSibling;
    if (Zn(t)) return t;
    {
      const n = e.ownerDocument.createTextNode('');
      return e.parentElement.insertBefore(n, e), n;
    }
  },
  Mo = (e) => {
    const t = e.indexOf('q:id=');
    return t > 0 ? $(e.slice(t + 5)) : -1;
  },
  Ro = () => {
    const e = rs();
    let t = e.Et;
    if (!t) {
      const n = e.X,
        r = mt(n);
      (t = yt(decodeURIComponent(String(e.Ot)), r)), pr(r);
      const o = L(n, De(r));
      Ir(t, o);
    }
    return t.vt;
  },
  Io = (e, t) => {
    if (e[0] === 0) {
      const n = e[1];
      an(n) ? ln(n, t) : Do(n, t);
    } else Xo(e, t);
  },
  Do = (e, t) => {
    pr(t.t);
    const n = L(e, t);
    n.W & Fe ||
      ((n.W |= Fe), t.P !== void 0 ? t.S.add(n) : (t.m.add(n), cn(t)));
  },
  Xo = (e, t) => {
    const n = t.P !== void 0;
    t.$.add(e), n || cn(t);
  },
  ln = (e, t) => {
    e.W & be ||
      ((e.W |= be), t.P !== void 0 ? t.v.add(e) : (t.p.add(e), cn(t)));
  },
  cn = (e) => (e.M === void 0 && (e.M = zt().nextTick(() => gr(e))), e.M),
  Ho = () => {
    const [e] = Ro();
    ln(e, De(mt(e.Tt)));
  },
  gr = async (e) => {
    const t = e.t,
      n = Je();
    try {
      const r = cs(n, e),
        o = r.N,
        s = (e.P = new Set(e.m));
      e.m.clear(),
        await Uo(e, r),
        e.S.forEach((c) => {
          s.add(c);
        }),
        e.S.clear();
      const l = Array.from(e.$);
      e.$.clear();
      const i = Array.from(s);
      zo(i),
        !e.l &&
          i.length > 0 &&
          ((e.l = !0),
          (t === n.documentElement ? n.body : t)
            .querySelectorAll('style[q\\:style]')
            .forEach((c) => {
              e.q.add(B(c, Zt)), $r(o, n.head, c);
            }));
      for (const c of i) {
        const u = c.X;
        if (!o.yt.has(u) && c.it) {
          o.zt.push(c);
          try {
            await on(r, c, Bo(u.parentElement));
          } catch (a) {
            he(a);
          }
        }
      }
      return (
        l.forEach((c) => {
          ((u, a) => {
            try {
              const h = a[0],
                m = u.N;
              switch (h) {
                case 1:
                case 2: {
                  let d, v;
                  h === 1 ? ((d = a[1]), (v = a[3])) : ((d = a[3]), (v = a[1]));
                  const y = K(d);
                  if (y == null) return;
                  const p = a[4],
                    f = d.namespaceURI === Be;
                  m.L.T.It(a);
                  let g = ie(a[2], a.slice(0, -1));
                  p === 'class'
                    ? (g = pn(g, K(v)))
                    : p === 'style' && (g = mn(g));
                  const w = sn(y);
                  return p in w.ht && w.ht[p] === g
                    ? void 0
                    : ((w.ht[p] = g), yn(m, d, p, g, f));
                }
                case 3:
                case 4: {
                  const d = a[3];
                  if (!m.Rt.includes(d)) {
                    m.L.T.It(a);
                    const v = void 0;
                    let y = ie(a[2], a.slice(0, -1));
                    const p = Jr;
                    Array.isArray(y) && (y = new He($e, {}, null, y, 0, null));
                    let f = Z(y, v);
                    if (H(f))
                      he('Rendering promises in JSX signals is not supported');
                    else {
                      f === void 0 && (f = Z('', v));
                      const g = xr(d),
                        w = (function (S) {
                          for (; S; ) {
                            if (ke(S)) return S;
                            S = S.parentElement;
                          }
                          throw new Error('Not found');
                        })(a[1]);
                      if (
                        ((u.lt = L(w, u.N.L)),
                        g.xt == f.xt && g.Ct == f.Ct && g.ct == f.ct)
                      )
                        ae(u, g, f, 0);
                      else {
                        const S = [],
                          x = g.kt,
                          k = se(u, f, 0, S);
                        S.length &&
                          he(
                            'Rendering promises in JSX signals is not supported'
                          ),
                          (p[3] = k),
                          me(u.N, d.parentElement, k, x),
                          x && bn(m, x);
                      }
                    }
                  }
                }
              }
            } catch {}
          })(r, c);
        }),
        o.At.push(...o.Lt),
        o.At.length === 0
          ? (Xn(o), void (await $n(e, r)))
          : (await bs(o), Xn(o), $n(e, r))
      );
    } catch (r) {
      he(r);
    }
  },
  Bo = (e) => {
    let t = 0;
    return (
      e &&
        (e.namespaceURI === Be && (t |= j), e.tagName === 'HEAD' && (t |= Ke)),
      t
    );
  },
  $n = async (e, t) => {
    const n = t.N.yt;
    await Go(e, t, (r, o) => (r.W & yr) != 0 && (!o || n.has(r.Tt))),
      e.S.forEach((r) => {
        e.m.add(r);
      }),
      e.S.clear(),
      (e.P = void 0),
      (e.M = void 0),
      e.m.size + e.p.size + e.$.size > 0 && (e.M = gr(e));
  },
  Uo = async (e, t) => {
    const n = e.t,
      r = [],
      o = [],
      s = (i) => (i.W & wr) != 0,
      l = (i) => (i.W & br) != 0;
    e.p.forEach((i) => {
      s(i) && (o.push(q(i.Et._t(n), () => i)), e.p.delete(i)),
        l(i) && (r.push(q(i.Et._t(n), () => i)), e.p.delete(i));
    });
    do
      if (
        (e.v.forEach((i) => {
          s(i)
            ? o.push(q(i.Et._t(n), () => i))
            : l(i)
            ? r.push(q(i.Et._t(n), () => i))
            : e.p.add(i);
        }),
        e.v.clear(),
        o.length > 0)
      ) {
        const i = await Promise.all(o);
        Lt(i), await Promise.all(i.map((c) => jt(c, e, t))), (o.length = 0);
      }
    while (e.v.size > 0);
    if (r.length > 0) {
      const i = await Promise.all(r);
      Lt(i), i.forEach((c) => jt(c, e, t));
    }
  },
  Go = async (e, t, n) => {
    const r = [],
      o = e.t;
    e.p.forEach((s) => {
      n(s, !1) &&
        (s.Tt.isConnected && r.push(q(s.Et._t(o), () => s)), e.p.delete(s));
    });
    do
      if (
        (e.v.forEach((s) => {
          s.Tt.isConnected &&
            (n(s, !0) ? r.push(q(s.Et._t(o), () => s)) : e.p.add(s));
        }),
        e.v.clear(),
        r.length > 0)
      ) {
        const s = await Promise.all(r);
        Lt(s);
        for (const l of s) jt(l, e, t);
        r.length = 0;
      }
    while (e.v.size > 0);
  },
  zo = (e) => {
    e.sort((t, n) => (2 & t.X.compareDocumentPosition(rt(n.X)) ? 1 : -1));
  },
  Lt = (e) => {
    e.sort((t, n) =>
      t.Tt === n.Tt
        ? t.Nt < n.Nt
          ? -1
          : 1
        : 2 & t.Tt.compareDocumentPosition(rt(n.Tt))
        ? 1
        : -1
    );
  },
  ce = () => {
    const e = Er(),
      t = L(e.A, e.F.N.L),
      n = t.Ft || (t.Ft = []),
      r = e.Wt++;
    return { val: n[r], set: (o) => (n[r] = o), i: r, iCtx: e, elCtx: t };
  },
  Jo = (e) => Object.freeze({ id: en(e) }),
  Hi = (e, t) => {
    const { val: n, set: r, elCtx: o } = ce();
    n === void 0 && ((o.Z || (o.Z = new Map())).set(e.id, t), r(!0));
  },
  Bi = (e, t) => {
    const { val: n, set: r, iCtx: o, elCtx: s } = ce();
    if (n !== void 0) return n;
    const l = vr(e, s, o.F.N.L);
    if (typeof t == 'function') return r(D(void 0, t, l));
    if (l !== void 0) return r(l);
    if (t !== void 0) return r(t);
    throw A(13, e.id);
  },
  Qo = (e, t) => (
    e.dt === void 0 &&
      (e.dt = ((n, r) => {
        var l;
        let o = n,
          s = 1;
        for (
          ;
          o && !((l = o.hasAttribute) != null && l.call(o, 'q:container'));

        ) {
          for (; (o = o.previousSibling); )
            if (lt(o)) {
              const i = o[Le];
              if (i) {
                const c = i[Yt];
                if (o === i.open) return c ?? L(i, r);
                if (c != null && c.dt) return c.dt;
                o = i;
                continue;
              }
              if (o.data === '/qv') s++;
              else if (o.data.startsWith('qv ') && (s--, s === 0))
                return L(Ie(o), r);
            }
          (o = n.parentElement), (n = o);
        }
        return null;
      })(e.X, t)),
    e.dt
  ),
  vr = (e, t, n) => {
    var s;
    const r = e.id;
    if (!t) return;
    let o = t;
    for (; o; ) {
      const l = (s = o.Z) == null ? void 0 : s.get(r);
      if (l) return l;
      o = Qo(o, n);
    }
  },
  Vo = Jo('qk-error'),
  un = (e, t, n) => {
    const r = K(t);
    {
      const o = vr(Vo, r, n.N.L);
      if (o === void 0) throw e;
      o.error = e;
    }
  },
  yr = 1,
  wr = 2,
  br = 4,
  be = 16,
  Ui = (e) => {
    const { val: t, set: n, iCtx: r, i: o, elCtx: s } = ce();
    if (t) return;
    const l = r.F.N.L,
      i = new pt(be | wr, o, s.X, e, void 0);
    n(!0),
      e._t(l.t),
      s.Dt || (s.Dt = []),
      s.Dt.push(i),
      ss(r, () => Sr(i, l, r.F));
  },
  Gi = (e, t) => {
    const { val: n, set: r, i: o, iCtx: s, elCtx: l } = ce(),
      i = (t == null ? void 0 : t.strategy) ?? 'intersection-observer';
    if (n) return;
    const c = new pt(yr, o, l.X, e, void 0),
      u = s.F.N.L;
    l.Dt || (l.Dt = []), l.Dt.push(c), r(c), ts(c, i), e._t(u.t), ln(c, u);
  },
  Zo = (e) => (e.W & br) != 0,
  jt = async (e, t, n) =>
    Zo(e)
      ? Ko(e, t, n)
      : ((r) => (8 & r.W) != 0)(e)
      ? Yo(e, t, n)
      : Sr(e, t, n),
  Ko = (e, t, n, r) => {
    (e.W &= ~be), Oe(e);
    const o = X(n.N.nt, e.Tt, void 0, Yn),
      { T: s } = t;
    o.F = n;
    const l = e.Et.getFn(o, () => {
        s.bt(e);
      }),
      i = [],
      c = e.Ht,
      u = bt(c),
      a = {
        track: (f, g) => {
          if (M(f)) {
            const S = X();
            return (S.F = n), (S.H = [0, e]), D(S, f);
          }
          const w = ee(f);
          return (
            w ? w.U([0, e], g) : Ut(ct(26), f), g ? f[g] : R(f) ? f.value : f
          );
        },
        cleanup(f) {
          i.push(f);
        },
        cache(f) {
          let g = 0;
          (g = f === 'immutable' ? 1 / 0 : f), (c._cache = g);
        },
        previous: u._resolved,
      };
    let h,
      m,
      d = !1;
    const v = (f, g) =>
      !d &&
      ((d = !0),
      f
        ? ((d = !0),
          (c.loading = !1),
          (c._state = 'resolved'),
          (c._resolved = g),
          (c._error = void 0),
          h(g))
        : ((d = !0),
          (c.loading = !1),
          (c._state = 'rejected'),
          (c._error = g),
          m(g)),
      !0);
    D(o, () => {
      (c._state = 'pending'),
        (c.loading = !0),
        (c.value = new Promise((f, g) => {
          (h = f), (m = g);
        }));
    }),
      (e.Ut = zr(() => {
        (d = !0), i.forEach((f) => f());
      }));
    const y = at(
        () => q(r, () => l(a)),
        (f) => {
          v(!0, f);
        },
        (f) => {
          v(!1, f);
        }
      ),
      p = u._timeout;
    return p > 0
      ? Promise.race([
          y,
          wo(p).then(() => {
            v(!1, new Error('timeout')) && Oe(e);
          }),
        ])
      : y;
  },
  Sr = (e, t, n) => {
    (e.W &= ~be), Oe(e);
    const r = e.Tt,
      o = X(n.N.nt, r, void 0, Yn);
    o.F = n;
    const { T: s } = t,
      l = e.Et.getFn(o, () => {
        s.bt(e);
      }),
      i = [];
    e.Ut = zr(() => {
      i.forEach((u) => u());
    });
    const c = {
      track: (u, a) => {
        if (M(u)) {
          const m = X();
          return (m.H = [0, e]), D(m, u);
        }
        const h = ee(u);
        return (
          h ? h.U([0, e], a) : Ut(ct(26), u), a ? u[a] : R(u) ? u.value : u
        );
      },
      cleanup(u) {
        i.push(u);
      },
    };
    return at(
      () => l(c),
      (u) => {
        M(u) && i.push(u);
      },
      (u) => {
        un(u, r, n);
      }
    );
  },
  Yo = (e, t, n) => {
    (e.W &= ~be), Oe(e);
    const r = e.Tt,
      o = X(n.N.nt, r, void 0, 'qComputed');
    (o.H = [0, e]), (o.F = n);
    const { T: s } = t,
      l = e.Et.getFn(o, () => {
        s.bt(e);
      });
    return at(
      l,
      (i) =>
        is(() => {
          const c = e.Ht;
          (c[Pe] &= -3), (c.untrackedValue = i), c[O].J();
        }),
      (i) => {
        un(i, r, n);
      }
    );
  },
  Oe = (e) => {
    const t = e.Ut;
    if (t) {
      e.Ut = void 0;
      try {
        t();
      } catch (n) {
        he(n);
      }
    }
  },
  es = (e) => {
    32 & e.W ? ((e.W &= -33), (0, e.Et)()) : Oe(e);
  },
  ts = (e, t) => {
    t === 'visible' || t === 'intersection-observer'
      ? qo('qvisible', Ct(e))
      : t === 'load' || t === 'document-ready'
      ? Pn('qinit', Ct(e))
      : (t !== 'idle' && t !== 'document-idle') || Pn('qidle', Ct(e));
  },
  Ct = (e) => {
    const t = e.Et;
    return qe(t.Jt, '_hW', Ho, null, null, [e], t.Bt);
  },
  an = (e) => le(e) && e instanceof pt;
class pt {
  constructor(t, n, r, o, s) {
    (this.W = t), (this.Nt = n), (this.Tt = r), (this.Et = o), (this.Ht = s);
  }
}
const Fe = 1,
  Pt = 2,
  fn = 4,
  kr = 8,
  K = (e) => e[Yt],
  L = (e, t) => {
    const n = K(e);
    if (n) return n;
    const r = hn(e),
      o = B(e, 'q:id');
    if (o) {
      const l = t.O;
      if (((r.ct = o), l)) {
        const { getObject: i, meta: c, refs: u } = l;
        if (
          (function (a) {
            return a && typeof a.nodeType == 'number';
          })((s = e)) &&
          s.nodeType === 1
        ) {
          const a = u[o];
          a &&
            ((r.Gt = a.split(' ').map(i)),
            (r.li = ((h, m) => {
              const d = h.X.attributes,
                v = [];
              for (let y = 0; y < d.length; y++) {
                const { name: p, value: f } = d.item(y);
                if (
                  p.startsWith('on:') ||
                  p.startsWith('on-window:') ||
                  p.startsWith('on-document:')
                ) {
                  const g = f.split(`
`);
                  for (const w of g) {
                    const S = yt(w, m);
                    S.Qt && Ir(S, h), v.push([p, S]);
                  }
                }
              }
              return v;
            })(r, t.t)));
        } else {
          const a = e.getAttribute(bo);
          r.$t = a ? a.split('|') : null;
          const h = c[o];
          if (h) {
            const m = h.s,
              d = h.h,
              v = h.c,
              y = h.w;
            if (
              (m && (r.Ft = m.split(' ').map(i)),
              y && (r.Dt = y.split(' ').map(i)),
              v)
            ) {
              r.Z = new Map();
              for (const p of v.split(' ')) {
                const [f, g] = p.split('=');
                r.Z.set(f, i(g));
              }
            }
            if (d) {
              const [p, f] = d.split(' ');
              if (((r.W = fn), p && (r.it = i(p)), f)) {
                const g = i(f);
                (r.ht = g), ht(g, 2), (g[N] = ns(g));
              } else r.ht = ft(nn(), t);
            }
          }
        }
      }
    }
    var s;
    return r;
  },
  ns = (e) => {
    const t = {},
      n = Ce(e);
    for (const r in n) r.startsWith(ge) && (t[r.slice(2)] = n[r]);
    return t;
  },
  hn = (e) => {
    const t = {
      W: 0,
      ct: '',
      X: e,
      Gt: [],
      li: [],
      Dt: null,
      Ft: null,
      Yt: null,
      $t: null,
      ft: null,
      ht: null,
      gt: null,
      it: null,
      Z: null,
      wt: null,
      dt: void 0,
    };
    return (e[Yt] = t), t;
  };
let ve, Te;
function zi(e) {
  if (ve === void 0) {
    const t = I();
    if (t && t.nt) return t.nt;
    if (e !== void 0) return e;
    throw new Error('Reading `locale` outside of context.');
  }
  return ve;
}
function Ji(e, t) {
  const n = ve;
  try {
    return (ve = e), t();
  } finally {
    ve = n;
  }
}
const I = () => {
    if (!Te) {
      const e = typeof document < 'u' && document && document.__q_context__;
      return e ? (T(e) ? (document.__q_context__ = Cr(e)) : e) : void 0;
    }
    return Te;
  },
  rs = () => {
    const e = I();
    if (!e) throw A(14);
    return e;
  },
  Er = () => {
    const e = I();
    if (!e || e.Kt !== Kt) throw A(20);
    return e;
  };
function D(e, t, ...n) {
  return os.call(this, e, t, n);
}
function os(e, t, n) {
  const r = Te;
  let o;
  try {
    (Te = e), (o = t.apply(this, n));
  } finally {
    Te = r;
  }
  return o;
}
const ss = (e, t) => {
    const n = e.Xt;
    if (n.length === 0) {
      const r = t();
      H(r) && n.push(r);
    } else n.push(Promise.all(n).then(t));
  },
  Cr = ([e, t, n]) => {
    const r = e.closest(Kn),
      o = (r == null ? void 0 : r.getAttribute('q:locale')) || void 0;
    return (
      o &&
        (function (s) {
          ve = s;
        })(o),
      X(o, void 0, e, t, n)
    );
  },
  X = (e, t, n, r, o) => ({
    Ot: o,
    Wt: 0,
    A: t,
    X: n,
    Kt: r,
    Et: void 0,
    Xt: void 0,
    H: void 0,
    F: void 0,
    nt: e,
  }),
  mt = (e) => e.closest(Kn),
  is = (e) => D(void 0, e),
  On = X(void 0, void 0, void 0, Kt),
  ie = (e, t) => ((On.H = t), D(On, () => e.value)),
  Qi = () => {
    var t;
    const e = I();
    if (e) return e.X ?? e.A ?? ((t = e.Et) == null ? void 0 : t.R(void 0));
  },
  Vi = (e) => {
    const t = I();
    return t && t.A && t.F && (L(t.A, t.F.N.L).W |= kr), e;
  },
  Zi = (e) => {
    const t = mt(e);
    return t ? De(t).M ?? Promise.resolve() : Promise.resolve();
  },
  ls = new Set([
    'animationIterationCount',
    'aspectRatio',
    'borderImageOutset',
    'borderImageSlice',
    'borderImageWidth',
    'boxFlex',
    'boxFlexGroup',
    'boxOrdinalGroup',
    'columnCount',
    'columns',
    'flex',
    'flexGrow',
    'flexShrink',
    'gridArea',
    'gridRow',
    'gridRowEnd',
    'gridRowStart',
    'gridColumn',
    'gridColumnEnd',
    'gridColumnStart',
    'fontWeight',
    'lineClamp',
    'lineHeight',
    'opacity',
    'order',
    'orphans',
    'scale',
    'tabSize',
    'widows',
    'zIndex',
    'zoom',
    'MozAnimationIterationCount',
    'MozBoxFlex',
    'msFlex',
    'msFlexPositive',
    'WebkitAnimationIterationCount',
    'WebkitBoxFlex',
    'WebkitBoxOrdinalGroup',
    'WebkitColumnCount',
    'WebkitColumns',
    'WebkitFlex',
    'WebkitFlexGrow',
    'WebkitFlexShrink',
    'WebkitLineClamp',
  ]),
  $t = (e, t) => {
    (t.W &= ~Fe), (t.W |= fn), (t.Yt = []), (t.li.length = 0);
    const n = t.X,
      r = t.it,
      o = t.ht,
      s = X(e.N.nt, n, void 0, Kt),
      l = (s.Xt = []),
      i = dn(e);
    (i.lt = t), (i.ut = null), (s.H = [0, n]), (s.F = e), r.R(e.N.L.t);
    const c = r.getFn(s);
    return at(
      () => c(o),
      (u) => q(ze(l), () => (t.W & Fe ? $t(e, t) : { node: u, rCtx: i })),
      (u) =>
        u === cr
          ? q(ze(l), () => $t(e, t))
          : (un(u, n, e), { node: fr, rCtx: i })
    );
  },
  cs = (e, t) => ({
    N: {
      Vt: e,
      nt: t.k.locale,
      L: t,
      yt: new Set(),
      At: [],
      Lt: [],
      zt: [],
      Zt: [],
      tn: [],
      Rt: [],
    },
    lt: null,
    ut: null,
  }),
  dn = (e) => ({ N: e.N, lt: e.lt, ut: e.ut }),
  pn = (e, t) => (t && t.$t ? t.$t.join(' ') + ' ' + Ot(e) : Ot(e)),
  Ot = (e) => {
    if (!e) return '';
    if (Ee(e)) return e.trim();
    const t = [];
    if (T(e))
      for (const n of e) {
        const r = Ot(n);
        r && t.push(r);
      }
    else for (const [n, r] of Object.entries(e)) r && t.push(n.trim());
    return t.join(' ');
  },
  mn = (e) => {
    if (e == null) return '';
    if (typeof e == 'object') {
      if (T(e)) throw A(0, e, 'style');
      {
        const t = [];
        for (const n in e)
          if (Object.prototype.hasOwnProperty.call(e, n)) {
            const r = e[n];
            r != null &&
              (n.startsWith('--')
                ? t.push(n + ':' + r)
                : t.push(en(n) + ':' + us(n, r)));
          }
        return t.join(';');
      }
    }
    return String(e);
  },
  us = (e, t) => (typeof t != 'number' || t === 0 || ls.has(e) ? t : t + 'px'),
  as = (e) => je(e.N.L.o++),
  qr = (e, t) => {
    const n = as(e);
    t.ct = n;
  },
  gn = (e) =>
    R(e) ? gn(e.value) : e == null || typeof e == 'boolean' ? '' : String(e);
function fs(e) {
  return e.startsWith('aria-');
}
const hs = (e, t) => !!t.key && (!dt(e) || (!M(e.type) && e.key != t.key)),
  Ze = 2,
  oe = 'dangerouslySetInnerHTML',
  Be = 'http://www.w3.org/2000/svg',
  j = 1,
  Ke = 2,
  Ye = [],
  et = (e, t, n, r) => {
    const o = n.qt;
    if (o.length === 1 && o[0].xt === Ve) return void (n.qt = t.qt);
    const s = t.kt;
    let l = nt;
    t.qt === Ye && s.nodeName === 'HEAD' && ((l = ms), (r |= Ke));
    const i = ds(t, l);
    return i.length > 0 && o.length > 0
      ? ps(e, s, i, o, r)
      : i.length > 0 && o.length === 0
      ? vn(e.N, i, 0, i.length - 1)
      : o.length > 0
      ? Nr(e, s, null, o, 0, o.length - 1, r)
      : void 0;
  },
  ds = (e, t) => {
    const n = e.qt;
    return n === Ye ? (e.qt = _r(e.kt, t)) : n;
  },
  ps = (e, t, n, r, o) => {
    let s,
      l,
      i,
      c = 0,
      u = 0,
      a = n.length - 1,
      h = n[0],
      m = n[a],
      d = r.length - 1,
      v = r[0],
      y = r[d];
    const p = [],
      f = e.N;
    for (; c <= a && u <= d; )
      if (h == null) h = n[++c];
      else if (m == null) m = n[--a];
      else if (v == null) v = r[++u];
      else if (y == null) y = r[--d];
      else if (h.ct === v.ct)
        p.push(ae(e, h, v, o)), (h = n[++c]), (v = r[++u]);
      else if (m.ct === y.ct)
        p.push(ae(e, m, y, o)), (m = n[--a]), (y = r[--d]);
      else if (h.Ct && h.ct === y.ct)
        p.push(ae(e, h, y, o)),
          qs(f, t, h.kt, m.kt),
          (h = n[++c]),
          (y = r[--d]);
      else if (m.Ct && m.ct === v.ct)
        p.push(ae(e, m, v, o)),
          me(f, t, m.kt, h.kt),
          (m = n[--a]),
          (v = r[++u]);
      else {
        if ((s === void 0 && (s = ks(n, c, a)), (l = s[v.Ct]), l === void 0)) {
          const w = se(e, v, o, p);
          me(f, t, w, h == null ? void 0 : h.kt);
        } else if (((i = n[l]), i.xt !== v.xt)) {
          const w = se(e, v, o, p);
          q(w, (S) => {
            me(f, t, S, h == null ? void 0 : h.kt);
          });
        } else p.push(ae(e, i, v, o)), (n[l] = void 0), me(f, t, i.kt, h.kt);
        v = r[++u];
      }
    u <= d &&
      p.push(Nr(e, t, r[d + 1] == null ? null : r[d + 1].kt, r, u, d, o));
    let g = Jt(p);
    return (
      c <= a &&
        (g = q(g, () => {
          vn(f, n, c, a);
        })),
      g
    );
  },
  pe = (e, t) => {
    const n = Y(e) ? e.close : null,
      r = [];
    let o = e.firstChild;
    for (; (o = Mr(o)) && (t(o) && r.push(o), (o = o.nextSibling), o !== n); );
    return r;
  },
  _r = (e, t) => pe(e, t).map(xr),
  xr = (e) => {
    var t;
    return Ae(e) ? ((t = K(e)) == null ? void 0 : t.gt) ?? tt(e) : tt(e);
  },
  tt = (e) => {
    if (ke(e)) {
      const t = new J(e.localName, {}, null, Ye, 0, Mt(e));
      return (t.kt = e), t;
    }
    if (Zn(e)) {
      const t = new J(e.nodeName, P, null, Ye, 0, null);
      return (t.jt = e.data), (t.kt = e), t;
    }
  },
  ms = (e) => {
    const t = e.nodeType;
    return t === 1 ? e.hasAttribute('q:head') : t === 111;
  },
  Ft = (e) => e.nodeName === 'Q:TEMPLATE',
  nt = (e) => {
    const t = e.nodeType;
    if (t === 3 || t === 111) return !0;
    if (t !== 1) return !1;
    const n = e.nodeName;
    return (
      n !== 'Q:TEMPLATE' &&
      (n === 'HEAD'
        ? e.hasAttribute('q:head')
        : n !== 'STYLE' || !e.hasAttribute(Zt))
    );
  },
  Tr = (e) => {
    const t = {};
    for (const n of e) {
      const r = gs(n);
      (t[r] ?? (t[r] = new J(Se, { [we]: '' }, null, [], 0, r))).qt.push(n);
    }
    return t;
  },
  ae = (e, t, n, r) => {
    const o = t.kt,
      s = n.xt,
      l = e.N,
      i = l.L,
      c = e.lt;
    if (((n.kt = o), s === '#text')) {
      l.Rt.push(o);
      const m = n.Mt;
      return (
        m && (n.jt = gn(ie(m, [4, c.X, m, o]))), void V(l, o, 'data', n.jt)
      );
    }
    if (s === '#signal') return;
    const u = n.ht,
      a = n.W,
      h = L(o, i);
    if (s !== Se) {
      let m = (r & j) != 0;
      if ((m || s !== 'svg' || ((r |= j), (m = !0)), u !== P)) {
        !(1 & a) && (h.li.length = 0);
        const d = t.ht;
        n.ht = d;
        for (const v in u) {
          let y = u[v];
          if (v !== 'ref')
            if (rr(v)) {
              const p = or(h.li, v, y, i.t);
              Lr(l, o, p);
            } else
              R(y) && (y = ie(y, [1, c.X, y, o, v])),
                v === 'class' ? (y = pn(y, c)) : v === 'style' && (y = mn(y)),
                d[v] !== y && ((d[v] = y), yn(l, o, v, y, m));
          else y !== void 0 && nr(y, o);
        }
      }
      return a & Ze ||
        (m && s === 'foreignObject' && (r &= ~j), u[oe] !== void 0) ||
        s === 'textarea'
        ? void 0
        : et(e, t, n, r);
    }
    if (We in u) {
      const m = u.props;
      ws(i, h, m);
      let d = !!(h.W & Fe);
      return (
        d ||
          h.it ||
          h.X.hasAttribute(er) ||
          (qr(e, h), (h.it = m[We]), (d = !0)),
        d ? q(on(e, h, r), () => Fn(e, h, n, r)) : Fn(e, h, n, r)
      );
    }
    if (we in u) c.Yt.push(n);
    else if (oe in u) V(l, o, 'innerHTML', u[oe]);
    else if (!(a & Ze)) return et(e, t, n, r);
  },
  Fn = (e, t, n, r) => {
    if (n.W & Ze) return;
    const o = e.N,
      s = Tr(n.qt),
      l = Wr(t);
    for (const i in l.slots)
      if (!s[i]) {
        const c = l.slots[i],
          u = _r(c, nt);
        if (u.length > 0) {
          const a = K(c);
          a && a.gt && (a.gt.qt = []), vn(o, u, 0, u.length - 1);
        }
      }
    for (const i in l.templates) {
      const c = l.templates[i];
      c && !s[i] && ((l.templates[i] = void 0), bn(o, c));
    }
    return Jt(
      Object.keys(s).map((i) => {
        const c = s[i],
          u = Ar(o, l, t, i, e.N.L),
          a = sn(u),
          h = dn(e),
          m = u.X;
        (h.ut = u), (u.gt = c), (c.kt = m);
        let d = r & ~j;
        m.isSvg && (d |= j);
        const v = o.Zt.findIndex((y) => y[0] === m);
        return v >= 0 && o.Zt.splice(v, 1), et(h, a, c, d);
      })
    );
  },
  Nr = (e, t, n, r, o, s, l) => {
    const i = [];
    for (; o <= s; ++o) {
      const c = se(e, r[o], l, i);
      me(e.N, t, c, n);
    }
    return ze(i);
  },
  vn = (e, t, n, r) => {
    for (; n <= r; ++n) {
      const o = t[n];
      o && bn(e, o.kt);
    }
  },
  Ar = (e, t, n, r, o) => {
    const s = t.slots[r];
    if (s) return L(s, o);
    const l = t.templates[r];
    if (l) return L(l, o);
    const i = Or(e.Vt, r),
      c = hn(i);
    return (c.dt = n), Ts(e, n.X, i), (t.templates[r] = i), c;
  },
  gs = (e) => e.ht[Q] ?? '',
  se = (e, t, n, r) => {
    const o = t.xt,
      s = e.N.Vt,
      l = e.lt;
    if (o === '#text') return (t.kt = s.createTextNode(t.jt));
    if (o === '#signal') {
      const p = t.Mt,
        f = p.value;
      if (dt(f)) {
        const g = Z(f);
        if (R(g)) throw new Error('NOT IMPLEMENTED: Promise');
        if (Array.isArray(g)) throw new Error('NOT IMPLEMENTED: Array');
        {
          const w = se(e, g, n, r);
          return ie(p, 4 & n ? [3, w, p, w] : [4, l.X, p, w]), (t.kt = w);
        }
      }
      {
        const g = s.createTextNode(t.jt);
        return (
          (g.data = t.jt = gn(f)),
          ie(p, 4 & n ? [3, g, p, g] : [4, l.X, p, g]),
          (t.kt = g)
        );
      }
    }
    let i,
      c = !!(n & j);
    c || o !== 'svg' || ((n |= j), (c = !0));
    const u = o === Se,
      a = t.ht,
      h = e.N,
      m = h.L;
    u
      ? (i = js(s, c))
      : o === 'head'
      ? ((i = s.head), (n |= Ke))
      : ((i = wn(s, o, c)), (n &= ~Ke)),
      t.W & Ze && (n |= 4),
      (t.kt = i);
    const d = hn(i);
    if (((d.dt = e.ut ?? e.lt), u)) {
      if (We in a) {
        const p = a[We],
          f = nn(),
          g = m.T.D(),
          w = new Proxy(f, new ur(m, g)),
          S = a.props;
        if ((m.u.set(f, w), (d.ht = w), S !== P)) {
          const k = (f[N] = S[N] ?? P);
          for (const C in S)
            if (C !== 'children' && C !== Q) {
              const U = k[C];
              R(U) ? (f[ge + C] = U) : (f[C] = S[C]);
            }
        }
        qr(e, d), (d.it = p);
        const x = q(on(e, d, n), () => {
          let k = t.qt;
          if (k.length === 0) return;
          k.length === 1 && k[0].xt === Ve && (k = k[0].qt);
          const C = Wr(d),
            U = [],
            _n = Tr(k);
          for (const xn in _n) {
            const St = _n[xn],
              kt = Ar(h, C, d, xn, h.L),
              Tn = dn(e),
              Et = kt.X;
            (Tn.ut = kt), (kt.gt = St), (St.kt = Et);
            let Nn = n & ~j;
            Et.isSvg && (Nn |= j);
            for (const io of St.qt) {
              const lo = se(Tn, io, Nn, U);
              $r(h, Et, lo);
            }
          }
          return ze(U);
        });
        return H(x) && r.push(x), i;
      }
      if (we in a)
        Ws(i, t.Ct),
          F(i, Vt, l.ct),
          F(i, we, ''),
          l.Yt.push(t),
          h.Zt.push([i, l.X]);
      else if (oe in a) return V(h, i, 'innerHTML', a[oe]), i;
    } else {
      if (
        (t.St && Rn(h, d, l, t.St, c, !0),
        a !== P && ((d.gt = t), (t.ht = Rn(h, d, l, a, c, !1))),
        c && o === 'foreignObject' && ((c = !1), (n &= ~j)),
        l)
      ) {
        const p = l.$t;
        p &&
          p.forEach((f) => {
            i.classList.add(f);
          }),
          l.W & Pt && (d.li.push(...l.li), (l.W &= ~Pt));
      }
      for (const p of d.li) Lr(h, i, p[0]);
      if (a[oe] !== void 0) return i;
      c && o === 'foreignObject' && ((c = !1), (n &= ~j));
    }
    let v = t.qt;
    if (v.length === 0) return i;
    v.length === 1 && v[0].xt === Ve && (v = v[0].qt);
    const y = v.map((p) => se(e, p, n, r));
    for (const p of y) Me(i, p);
    return i;
  },
  Wr = (e) => {
    const t = ((s) => s.Yt || (s.Yt = vs(s)))(e),
      n = {},
      r = {},
      o = Array.from(e.X.childNodes).filter(Ft);
    for (const s of t) n[s.Ct ?? ''] = s.kt;
    for (const s of o) r[B(s, Q) ?? ''] = s;
    return { slots: n, templates: r };
  },
  vs = (e) => Ps(e.X.parentElement, Vt, e.ct).map(tt),
  Mn = (e, t, n, r) => (
    r in t &&
      t[r] !== n &&
      (t.tagName === 'SELECT' ? Cs(e, t, r, n) : V(e, t, r, n)),
    !0
  ),
  _e = (e, t, n, r) => (Re(e, t, r.toLowerCase(), n), !0),
  ys = {
    style: (e, t, n) => (V(e, t.style, 'cssText', n), !0),
    class: (e, t, n) => (
      t.namespaceURI === Be ? Re(e, t, 'class', n) : V(e, t, 'className', n), !0
    ),
    value: Mn,
    checked: Mn,
    href: _e,
    list: _e,
    form: _e,
    tabIndex: _e,
    download: _e,
    innerHTML: () => !0,
    [oe]: (e, t, n) => (V(e, t, 'innerHTML', n), !0),
  },
  yn = (e, t, n, r, o) => {
    if (fs(n)) return void Re(e, t, n, r != null ? String(r) : r);
    const s = ys[n];
    (s && s(e, t, r, n)) ||
      (o || !(n in t)
        ? (n.startsWith(Eo) && jr(n.slice(15)), Re(e, t, n, r))
        : V(e, t, n, r));
  },
  Rn = (e, t, n, r, o, s) => {
    const l = {},
      i = t.X;
    for (const c in r) {
      let u = r[c];
      if (c !== 'ref')
        if (rr(c)) or(t.li, c, u, e.L.t);
        else {
          if (
            (R(u) && (u = ie(u, s ? [1, i, u, n.X, c] : [2, n.X, u, i, c])),
            c === 'class')
          ) {
            if (((u = pn(u, n)), !u)) continue;
          } else c === 'style' && (u = mn(u));
          (l[c] = u), yn(e, i, c, u, o);
        }
      else u !== void 0 && nr(u, i);
    }
    return l;
  },
  ws = (e, t, n) => {
    let r = t.ht;
    if ((r || (t.ht = r = ft(nn(), e)), n === P)) return;
    const o = ee(r),
      s = Ce(r),
      l = (s[N] = n[N] ?? P);
    for (const i in n)
      if (i !== 'children' && i !== Q && !l[i]) {
        const c = n[i];
        s[i] !== c && ((s[i] = c), o.J(i));
      }
  },
  Ne = (e, t, n, r) => {
    if ((n.bt(e), ke(e))) {
      if (r && e.hasAttribute(we)) return void t.tn.push(e);
      const o = K(e);
      o &&
        ((i, c) => {
          var u;
          (u = i.Dt) == null ||
            u.forEach((a) => {
              c.bt(a), es(a);
            }),
            (i.it = null),
            (i.Ft = null),
            (i.Dt = null);
        })(o, n);
      const s = Y(e) ? e.close : null;
      let l = e.firstChild;
      for (; (l = Mr(l)) && (Ne(l, t, n, !0), (l = l.nextSibling), l !== s); );
    }
  },
  In = () => {
    document.__q_scroll_restore__ &&
      (document.__q_scroll_restore__(),
      (document.__q_scroll_restore__ = void 0));
  },
  bs = async (e) => {
    document.__q_view_transition__ &&
    ((document.__q_view_transition__ = void 0), document.startViewTransition)
      ? await document.startViewTransition(() => {
          Dn(e), In();
        }).finished
      : (Dn(e), In());
  },
  Me = (e, t) => {
    Y(t) ? t.appendTo(e) : e.appendChild(t);
  },
  Ss = (e, t, n) => {
    Y(t)
      ? t.insertBeforeTo(e, (n == null ? void 0 : n.nextSibling) ?? null)
      : e.insertBefore(t, (n == null ? void 0 : n.nextSibling) ?? null);
  },
  gt = (e, t, n) => {
    Y(t) ? t.insertBeforeTo(e, rt(n)) : e.insertBefore(t, rt(n));
  },
  ks = (e, t, n) => {
    const r = {};
    for (let o = t; o <= n; ++o) {
      const s = e[o].Ct;
      s != null && (r[s] = o);
    }
    return r;
  },
  Lr = (e, t, n) => {
    n.startsWith('on:') || Re(e, t, n, ''), jr(n);
  },
  jr = (e) => {
    var t;
    {
      const n = So(e);
      try {
        ((t = globalThis).qwikevents || (t.qwikevents = [])).push(n);
      } catch {}
    }
  },
  Re = (e, t, n, r) => {
    e.At.push({ nn: Es, G: [t, n, r] });
  },
  Es = (e, t, n) => {
    if (n == null || n === !1) e.removeAttribute(t);
    else {
      const r = n === !0 ? '' : String(n);
      F(e, t, r);
    }
  },
  V = (e, t, n, r) => {
    e.At.push({ nn: Pr, G: [t, n, r] });
  },
  Cs = (e, t, n, r) => {
    e.Lt.push({ nn: Pr, G: [t, n, r] });
  },
  Pr = (e, t, n) => {
    try {
      (e[t] = n ?? ''), n == null && it(e) && Ae(e) && e.removeAttribute(t);
    } catch (r) {
      he(ct(6), { node: e, key: t, value: n }, r);
    }
  },
  wn = (e, t, n) => (n ? e.createElementNS(Be, t) : e.createElement(t)),
  me = (e, t, n, r) => (e.At.push({ nn: gt, G: [t, n, r || null] }), n),
  qs = (e, t, n, r) => (e.At.push({ nn: Ss, G: [t, n, r || null] }), n),
  $r = (e, t, n) => (e.At.push({ nn: Me, G: [t, n] }), n),
  _s = (e, t) => {
    e.L.q.add(t.styleId), e.Lt.push({ nn: xs, G: [e.L, t] });
  },
  xs = (e, t) => {
    const n = e.t,
      r = Je(),
      o = r.documentElement === n,
      s = r.head,
      l = r.createElement('style');
    F(l, Zt, t.styleId),
      F(l, 'hidden', ''),
      (l.textContent = t.content),
      o && s ? Me(s, l) : gt(n, l, n.firstChild);
  },
  Ts = (e, t, n) => {
    e.At.push({ nn: Ns, G: [t, n] });
  },
  Ns = (e, t) => {
    gt(e, t, e.firstChild);
  },
  bn = (e, t) => {
    ke(t) && Ne(t, e, e.L.T, !0), e.At.push({ nn: As, G: [t, e] });
  },
  As = (e) => {
    const t = e.parentElement;
    t &&
      ((n, r) => {
        Y(r) ? r.remove() : n.removeChild(r);
      })(t, e);
  },
  Or = (e, t) => {
    const n = wn(e, 'q:template', !1);
    return F(n, Q, t), F(n, 'hidden', ''), F(n, 'aria-hidden', 'true'), n;
  },
  Dn = (e) => {
    for (const t of e.At) t.nn.apply(void 0, t.G);
    Ls(e);
  },
  Mt = (e) => B(e, 'q:key'),
  Ws = (e, t) => {
    t !== null && F(e, 'q:key', t);
  },
  Ls = (e) => {
    const t = e.L.T;
    for (const n of e.tn) {
      const r = Mt(n),
        o = pe(n, nt);
      if (o.length > 0) {
        const s = n.getAttribute(Vt),
          l = e.zt.find((i) => i.ct === s);
        if (l) {
          const i = l.X;
          if (i.isConnected)
            if (pe(i, Ft).some((c) => B(c, Q) === r)) Ne(n, e, t, !1);
            else {
              const c = Or(e.Vt, r);
              for (const u of o) Me(c, u);
              gt(i, c, i.firstChild);
            }
          else Ne(n, e, t, !1);
        } else Ne(n, e, t, !1);
      }
    }
    for (const [n, r] of e.Zt) {
      const o = Mt(n),
        s = pe(r, Ft).find((l) => l.getAttribute(Q) === o);
      s &&
        (pe(s, nt).forEach((l) => {
          Me(n, l);
        }),
        s.remove());
    }
  },
  Xn = () => {},
  js = (e, t) => {
    const n = e.createComment('qv '),
      r = e.createComment('/qv');
    return new Fr(n, r, t);
  },
  Ps = (e, t, n) => {
    const r = ((l, i, c) =>
        l.ownerDocument.createTreeWalker(l, 128, {
          acceptNode(u) {
            const a = Ie(u);
            return a && B(a, i) === c ? 1 : 2;
          },
        }))(e, t, n),
      o = [];
    let s = null;
    for (; (s = r.nextNode()); ) o.push(Ie(s));
    return o;
  },
  Se = ':virtual';
class Fr {
  constructor(t, n, r) {
    (this.open = t),
      (this.close = n),
      (this.isSvg = r),
      (this._qc_ = null),
      (this.nodeType = 111),
      (this.localName = Se),
      (this.nodeName = Se);
    const o = (this.ownerDocument = t.ownerDocument);
    (this.en = wn(o, 'template', !1)),
      (this.rn = ((s) => {
        if (!s) return {};
        const l = s.split(' ');
        return Object.fromEntries(
          l.map((i) => {
            const c = i.indexOf('=');
            return c >= 0
              ? [i.slice(0, c), ((u = i.slice(c + 1)), u.replace(/\+/g, ' '))]
              : [i, ''];
            var u;
          })
        );
      })(t.data.slice(3))),
      t.data.startsWith('qv '),
      (t[Le] = this),
      (n[Le] = this);
  }
  insertBefore(t, n) {
    const r = this.parentElement;
    return (
      r ? r.insertBefore(t, n || this.close) : this.en.insertBefore(t, n), t
    );
  }
  remove() {
    const t = this.parentElement;
    if (t) {
      const n = this.childNodes;
      t.removeChild(this.open);
      for (let r = 0; r < n.length; r++) this.en.appendChild(n[r]);
      t.removeChild(this.close);
    }
  }
  appendChild(t) {
    return this.insertBefore(t, null);
  }
  insertBeforeTo(t, n) {
    const r = this.childNodes;
    t.insertBefore(this.open, n);
    for (const o of r) t.insertBefore(o, n);
    t.insertBefore(this.close, n);
  }
  appendTo(t) {
    this.insertBeforeTo(t, null);
  }
  get namespaceURI() {
    var t;
    return ((t = this.parentElement) == null ? void 0 : t.namespaceURI) ?? '';
  }
  removeChild(t) {
    this.parentElement
      ? this.parentElement.removeChild(t)
      : this.en.removeChild(t);
  }
  getAttribute(t) {
    return this.rn[t] ?? null;
  }
  hasAttribute(t) {
    return t in this.rn;
  }
  setAttribute(t, n) {
    this.rn[t] = n;
  }
  removeAttribute(t) {
    delete this.rn[t];
  }
  matches(t) {
    return !1;
  }
  compareDocumentPosition(t) {
    return this.open.compareDocumentPosition(t);
  }
  closest(t) {
    const n = this.parentElement;
    return n ? n.closest(t) : null;
  }
  querySelectorAll(t) {
    const n = [];
    return (
      pe(this, ho).forEach((r) => {
        ke(r) &&
          (r.matches(t) && n.push(r),
          n.concat(Array.from(r.querySelectorAll(t))));
      }),
      n
    );
  }
  querySelector(t) {
    for (const n of this.childNodes)
      if (Ae(n)) {
        if (n.matches(t)) return n;
        const r = n.querySelector(t);
        if (r !== null) return r;
      }
    return null;
  }
  get innerHTML() {
    return '';
  }
  set innerHTML(t) {
    const n = this.parentElement;
    n
      ? (this.childNodes.forEach((r) => this.removeChild(r)),
        (this.en.innerHTML = t),
        n.insertBefore(this.en.content, this.close))
      : (this.en.innerHTML = t);
  }
  get firstChild() {
    if (this.parentElement) {
      const t = this.open.nextSibling;
      return t === this.close ? null : t;
    }
    return this.en.firstChild;
  }
  get nextSibling() {
    return this.close.nextSibling;
  }
  get previousSibling() {
    return this.open.previousSibling;
  }
  get childNodes() {
    if (!this.parentElement) return Array.from(this.en.childNodes);
    const t = [];
    let n = this.open;
    for (; (n = n.nextSibling) && n !== this.close; ) t.push(n);
    return t;
  }
  get isConnected() {
    return this.open.isConnected;
  }
  get parentElement() {
    return this.open.parentElement;
  }
}
const Mr = (e) => {
    if (e == null) return null;
    if (lt(e)) {
      const t = Ie(e);
      if (t) return t;
    }
    return e;
  },
  Ie = (e) => {
    var n;
    const t = e[Le];
    if (t) return t;
    if (e.data.startsWith('qv ')) {
      const r = ((o) => {
        let s = o,
          l = 1;
        for (; (s = s.nextSibling); )
          if (lt(s)) {
            const i = s[Le];
            if (i) s = i;
            else if (s.data.startsWith('qv ')) l++;
            else if (s.data === '/qv' && (l--, l === 0)) return s;
          }
      })(e);
      return new Fr(
        e,
        r,
        ((n = e.parentElement) == null ? void 0 : n.namespaceURI) === Be
      );
    }
    return null;
  },
  rt = (e) => (e == null ? null : Y(e) ? e.open : e),
  Ki = async (e) => {
    const t = tr(null, null),
      n = $s(t);
    let r;
    for (E(e, n, !1); (r = n.on).length > 0; )
      (n.on = []), await Promise.all(r);
    const o = Array.from(n.sn.keys());
    let s = 0;
    const l = new Map();
    for (const u of o) l.set(u, je(s)), s++;
    if (n.cn.length > 0) {
      const u = l.get(void 0);
      for (const a of n.cn) l.set(a, u);
    }
    const i = (u) => {
        let a = '';
        if (H(u)) {
          const m = Ms(u);
          if (!m) throw A(27, u);
          (u = m.value), (a += m.resolved ? '~' : '_');
        }
        if (le(u)) {
          const m = Ce(u);
          m && ((a += '!'), (u = m));
        }
        const h = l.get(u);
        if (h === void 0) throw A(27, u);
        return h + a;
      },
      c = Is(o, i, null, n, t);
    return JSON.stringify({ _entry: i(e), _objs: c });
  },
  Rt = (e, t, n) => {
    let r = '';
    for (const o of e) {
      const s = t(o);
      s !== null && (r !== '' && (r += n), (r += s));
    }
    return r;
  },
  $s = (e) => {
    const t = [];
    return (
      e.I.forEach((n, r) => {
        for (; t.length <= n; ) t.push('');
        t[n] = r;
      }),
      {
        L: e,
        ln: new Set(),
        sn: new Set(),
        pn: 0,
        cn: [],
        hn: t,
        un: [],
        an: [],
        fn: [],
        $n: [],
        on: [],
      }
    );
  },
  Os = (e, t) => {
    const n = K(e);
    t.an.includes(n) ||
      (t.an.push(n), t.pn++, n.W & kr ? Fs(n, t, !0) : t.$n.push(n), t.pn--);
  },
  Fs = (e, t, n) => {
    if (
      (e.ht && !Rs(e.ht) && (E(e.ht, t, n), vt(ee(e.ht), t, n)),
      e.it && E(e.it, t, n),
      e.Ft)
    )
      for (const r of e.Ft) E(r, t, n);
    if (e.Dt) {
      const r = t.L.T.vn;
      for (const o of e.Dt) r.has(o) && E(o, t, n);
    }
    if (n === !0 && (Hn(e, t), e.wt)) for (const r of e.wt) Hn(r, t);
  },
  Hn = (e, t) => {
    for (; e; ) {
      if (e.Z) for (const n of e.Z.values()) E(n, t, !0);
      e = e.dt;
    }
  },
  vt = (e, t, n) => {
    if (t.ln.has(e)) return;
    t.ln.add(e);
    const r = e.dn;
    for (const o of r) {
      const s = o[0];
      if ((s > 0 && E(o[2], t, n), n === !0)) {
        const l = o[1];
        it(l) && Y(l) ? s === 0 && Os(l, t) : E(l, t, !0);
      }
    }
  },
  It = Symbol(),
  Ms = (e) => e[It],
  E = (e, t, n) => {
    if (e !== null) {
      const o = typeof e;
      switch (o) {
        case 'function':
        case 'object': {
          const s = t.ln;
          if (s.has(e)) return;
          if ((s.add(e), Ur(e))) return t.sn.add(void 0), void t.cn.push(e);
          const l = e,
            i = Ce(e);
          if (i) {
            const c = (2 & hi((e = i))) == 0;
            if ((n && c && vt(ee(l), t, n), Gr(l))) return void t.sn.add(e);
          }
          if (li(e, t, n)) return void t.sn.add(e);
          if (H(e))
            return void t.on.push(
              ((r = e),
              r.then(
                (c) => ((r[It] = { resolved: !0, value: c }), c),
                (c) => ((r[It] = { resolved: !1, value: c }), c)
              )).then((c) => {
                E(c, t, n);
              })
            );
          if (o === 'object') {
            if (it(e)) return;
            if (T(e)) for (let c = 0; c < e.length; c++) E(l[c], t, n);
            else if (ut(e)) for (const c in e) E(l[c], t, n);
          }
          break;
        }
        case 'string':
          if (t.ln.has(e)) return;
      }
    }
    var r;
    t.sn.add(e);
  },
  Rs = (e) => Object.keys(e).length === 0;
function Is(e, t, n, r, o) {
  return e.map((s) => {
    if (s === null) return null;
    const l = typeof s;
    switch (l) {
      case 'undefined':
        return wt;
      case 'number':
        if (!Number.isFinite(s)) break;
        return s;
      case 'string':
        if (s.charCodeAt(0) < 32) break;
        return s;
      case 'boolean':
        return s;
    }
    const i = ci(s, t, r, o);
    if (i !== void 0) return i;
    if (l === 'object') {
      if (T(s)) return s.map(t);
      if (ut(s)) {
        const c = {};
        for (const u in s)
          if (n) {
            const a = n(s[u]);
            a !== null && (c[u] = a);
          } else c[u] = t(s[u]);
        return c;
      }
    }
    throw A(3, s);
  });
}
const Bn = new Set(),
  Yi = (e, t, n = z) => {
    let r = null,
      o = null;
    if (M(e)) o = e;
    else {
      if (!Ee(e)) throw A(12, e);
      r = e;
    }
    return (
      Bn.has(t) || (Bn.add(t), Vr('qprefetch', { symbols: [Qr(t)] })),
      qe(r, t, null, o, null, n, null)
    );
  },
  el = (e, t = z) => qe(null, e, null, null, null, t, null),
  Rr = (e, t = {}) => {
    let n = e.Bt,
      r = e.Jt;
    const o = e.mn ?? n,
      s = zt();
    if (s) {
      const u = s.chunkForSymbol(o, r);
      u && ((r = u[1]), e.mn || (n = u[0]));
    }
    if (r == null) throw A(31, e.Bt);
    if ((r.startsWith('./') && (r = r.slice(2)), gi(e)))
      if (t.L) {
        const u = t.L,
          a = e.resolved.toString();
        let h = u.I.get(a);
        h === void 0 && ((h = u.I.size), u.I.set(a, h)), (n = String(h));
      } else po('Sync QRL without containerState');
    let l = `${r}#${n}`;
    const i = e.Qt,
      c = e.vt;
    return (
      c && c.length
        ? t.wn
          ? (l += `[${Rt(c, t.wn, ' ')}]`)
          : t.bn && (l += `[${Rt(c, t.bn, ' ')}]`)
        : i && i.length > 0 && (l += `[${i.join(' ')}]`),
      l
    );
  },
  yt = (e, t) => {
    const n = e.length,
      r = Un(e, 0, '#'),
      o = Un(e, r, '['),
      s = Math.min(r, o),
      l = e.substring(0, s),
      i = r == n ? r : r + 1,
      c = i == o ? 'default' : e.substring(i, o),
      u = o === n ? z : e.substring(o + 1, n - 1).split(' '),
      a = qe(l, c, null, null, u, null, null);
    return t && a.R(t), a;
  },
  Un = (e, t, n) => {
    const r = e.length,
      o = e.indexOf(n, t == r ? 0 : t);
    return o == -1 ? r : o;
  },
  Ir = (e, t) =>
    (e.vt = e.Qt.map((n) => {
      const r = parseInt(n, 10);
      return t.Gt[r];
    })),
  Ds = (e) => ({
    __brand: 'resource',
    value: void 0,
    loading: !0,
    _resolved: void 0,
    _error: void 0,
    _state: 'pending',
    _timeout: (e == null ? void 0 : e.timeout) ?? -1,
    _cache: 0,
  }),
  Xs = (e) => le(e) && e.__brand === 'resource',
  Dt = (e) => rn($e, { [we]: '' }, 0, e.name ?? ''),
  wt = '';
function _(e) {
  return {
    yn: e.gn.charCodeAt(0),
    xn: e.gn,
    Sn: e.Sn,
    qn: e.qn,
    Cn: e.Cn,
    kn: e.kn,
    jn: e.jn,
    dn: e.dn,
  };
}
const Hs = _({
    gn: '',
    Sn: (e) => kn(e),
    jn: (e, t, n) => {
      if (e.vt) for (const r of e.vt) E(r, t, n);
      t.pn === 0 && t.fn.push(e);
    },
    qn: (e, t) => Rr(e, { wn: t }),
    Cn: (e, t) => yt(e, t.t),
    kn: (e, t) => {
      e.Qt && e.Qt.length > 0 && ((e.vt = e.Qt.map(t)), (e.Qt = null));
    },
  }),
  Bs = _({
    gn: '',
    Sn: (e) => an(e),
    jn: (e, t, n) => {
      E(e.Et, t, n),
        e.Ht &&
          (E(e.Ht, t, n), n === !0 && e.Ht instanceof Qe && vt(e.Ht[O], t, !0));
    },
    qn: (e, t) =>
      ((n, r) => {
        let o = `${je(n.W)} ${je(n.Nt)} ${r(n.Et)} ${r(n.Tt)}`;
        return n.Ht && (o += ` ${r(n.Ht)}`), o;
      })(e, t),
    Cn: (e) =>
      ((t) => {
        const [n, r, o, s, l] = t.split(' ');
        return new pt($(n), $(r), s, o, l);
      })(e),
    kn: (e, t) => {
      (e.Tt = t(e.Tt)), (e.Et = t(e.Et)), e.Ht && (e.Ht = t(e.Ht));
    },
  }),
  Us = _({
    gn: '',
    Sn: (e) => Xs(e),
    jn: (e, t, n) => {
      E(e.value, t, n), E(e._resolved, t, n);
    },
    qn: (e, t) =>
      ((n, r) => {
        const o = n._state;
        return o === 'resolved'
          ? `0 ${r(n._resolved)}`
          : o === 'pending'
          ? '1'
          : `2 ${r(n._error)}`;
      })(e, t),
    Cn: (e) =>
      ((t) => {
        const [n, r] = t.split(' '),
          o = Ds(void 0);
        return (
          (o.value = Promise.resolve()),
          n === '0'
            ? ((o._state = 'resolved'), (o._resolved = r), (o.loading = !1))
            : n === '1'
            ? ((o._state = 'pending'),
              (o.value = new Promise(() => {})),
              (o.loading = !0))
            : n === '2' &&
              ((o._state = 'rejected'), (o._error = r), (o.loading = !1)),
          o
        );
      })(e),
    kn: (e, t) => {
      if (e._state === 'resolved')
        (e._resolved = t(e._resolved)),
          (e.value = Promise.resolve(e._resolved));
      else if (e._state === 'rejected') {
        const n = Promise.reject(e._error);
        n.catch(() => null), (e._error = t(e._error)), (e.value = n);
      }
    },
  }),
  Gs = _({
    gn: '',
    Sn: (e) => e instanceof URL,
    qn: (e) => e.href,
    Cn: (e) => new URL(e),
    kn: void 0,
  }),
  zs = _({
    gn: '',
    Sn: (e) => e instanceof Date,
    qn: (e) => e.toISOString(),
    Cn: (e) => new Date(e),
    kn: void 0,
  }),
  Js = _({
    gn: '\x07',
    Sn: (e) => e instanceof RegExp,
    qn: (e) => `${e.flags} ${e.source}`,
    Cn: (e) => {
      const t = e.indexOf(' '),
        n = e.slice(t + 1),
        r = e.slice(0, t);
      return new RegExp(n, r);
    },
    kn: void 0,
  }),
  Qs = _({
    gn: '',
    Sn: (e) => e instanceof Error,
    qn: (e) => e.message,
    Cn: (e) => {
      const t = new Error(e);
      return (t.stack = void 0), t;
    },
    kn: void 0,
  }),
  Vs = _({
    gn: '',
    Sn: (e) => fo(e),
    qn: void 0,
    Cn: (e, t, n) => n,
    kn: void 0,
  }),
  ot = Symbol('serializable-data'),
  Zs = _({
    gn: '',
    Sn: (e) => Zr(e),
    qn: (e, t) => {
      const [n] = e[ot];
      return Rr(n, { wn: t });
    },
    Cn: (e, t) => {
      const n = yt(e, t.t);
      return Si(n);
    },
    kn: (e, t) => {
      const [n] = e[ot];
      n.Qt && n.Qt.length > 0 && ((n.vt = n.Qt.map(t)), (n.Qt = null));
    },
  }),
  Ks = _({
    gn: '',
    Sn: (e) => e instanceof Nt,
    jn: (e, t, n) => {
      if (e.G) for (const r of e.G) E(r, t, n);
    },
    qn: (e, t, n) => {
      const r = ((s) => {
        let l = '';
        for (let i = 0; i < s.G.length; i++) l += `p${i},`;
        return `(${l})=>(null)`;
      })(e);
      let o = n.hn.indexOf(r);
      return (
        o < 0 && ((o = n.hn.length), n.hn.push(r)),
        Rt(e.G, t, ' ') + ' @' + je(o)
      );
    },
    Cn: (e) => {
      const t = e.split(' '),
        n = t.slice(0, -1),
        r = t[t.length - 1];
      return new Nt(r, n, r);
    },
    kn: (e, t) => {
      (e.B = t(e.B)), (e.G = e.G.map(t));
    },
  }),
  Ys = _({
    gn: '',
    Sn: (e) => e instanceof Qe,
    jn: (e, t, n) => (
      E(e.untrackedValue, t, n), n === !0 && !(1 & e[Pe]) && vt(e[O], t, !0), e
    ),
    qn: (e, t) => t(e.untrackedValue),
    Cn: (e, t) => {
      var n;
      return new Qe(
        e,
        (n = t == null ? void 0 : t.T) == null ? void 0 : n.D(),
        0
      );
    },
    dn: (e, t) => {
      e[O].Pt(t);
    },
    kn: (e, t) => {
      e.untrackedValue = t(e.untrackedValue);
    },
  }),
  ei = _({
    gn: '',
    Sn: (e) => e instanceof At,
    jn(e, t, n) {
      if ((E(e.ref, t, n), Gr(e.ref))) {
        const r = ee(e.ref);
        ai(t.L.T, r, n) && E(e.ref[e.prop], t, n);
      }
      return e;
    },
    qn: (e, t) => `${t(e.ref)} ${e.prop}`,
    Cn: (e) => {
      const [t, n] = e.split(' ');
      return new At(t, n);
    },
    kn: (e, t) => {
      e.ref = t(e.ref);
    },
  }),
  ti = _({
    gn: '',
    Sn: (e) => typeof e == 'number',
    qn: (e) => String(e),
    Cn: (e) => Number(e),
    kn: void 0,
  }),
  ni = _({
    gn: '',
    Sn: (e) => e instanceof URLSearchParams,
    qn: (e) => e.toString(),
    Cn: (e) => new URLSearchParams(e),
    kn: void 0,
  }),
  ri = _({
    gn: '',
    Sn: (e) => typeof FormData < 'u' && e instanceof globalThis.FormData,
    qn: (e) => {
      const t = [];
      return (
        e.forEach((n, r) => {
          t.push(typeof n == 'string' ? [r, n] : [r, n.name]);
        }),
        JSON.stringify(t)
      );
    },
    Cn: (e) => {
      const t = JSON.parse(e),
        n = new FormData();
      for (const [r, o] of t) n.append(r, o);
      return n;
    },
    kn: void 0,
  }),
  oi = _({
    gn: '',
    Sn: (e) => dt(e),
    jn: (e, t, n) => {
      E(e.children, t, n), E(e.props, t, n), E(e.immutableProps, t, n);
      let r = e.type;
      r === Dt ? (r = ':slot') : r === Wt && (r = ':fragment'), E(r, t, n);
    },
    qn: (e, t) => {
      let n = e.type;
      return (
        n === Dt ? (n = ':slot') : n === Wt && (n = ':fragment'),
        `${t(n)} ${t(e.props)} ${t(e.immutableProps)} ${t(e.children)} ${
          e.flags
        }`
      );
    },
    Cn: (e) => {
      const [t, n, r, o, s] = e.split(' ');
      return new He(t, n, r, o, parseInt(s, 10));
    },
    kn: (e, t) => {
      (e.type = fi(t(e.type))),
        (e.props = t(e.props)),
        (e.immutableProps = t(e.immutableProps)),
        (e.children = t(e.children));
    },
  }),
  si = _({
    gn: '',
    Sn: (e) => typeof e == 'bigint',
    qn: (e) => e.toString(),
    Cn: (e) => BigInt(e),
    kn: void 0,
  }),
  ue = Symbol(),
  Sn = [
    Hs,
    Bs,
    Us,
    Gs,
    zs,
    Js,
    Qs,
    Vs,
    Zs,
    Ks,
    Ys,
    ei,
    ti,
    ni,
    ri,
    oi,
    si,
    _({
      gn: '',
      Sn: (e) => e instanceof Set,
      jn: (e, t, n) => {
        e.forEach((r) => E(r, t, n));
      },
      qn: (e, t) => Array.from(e).map(t).join(' '),
      Cn: (e) => {
        const t = new Set();
        return (t[ue] = e), t;
      },
      kn: (e, t) => {
        const n = e[ue];
        e[ue] = void 0;
        const r = n.length === 0 ? [] : n.split(' ');
        for (const o of r) e.add(t(o));
      },
    }),
    _({
      gn: '',
      Sn: (e) => e instanceof Map,
      jn: (e, t, n) => {
        e.forEach((r, o) => {
          E(r, t, n), E(o, t, n);
        });
      },
      qn: (e, t) => {
        const n = [];
        return (
          e.forEach((r, o) => {
            n.push(t(o) + ' ' + t(r));
          }),
          n.join(' ')
        );
      },
      Cn: (e) => {
        const t = new Map();
        return (t[ue] = e), t;
      },
      kn: (e, t) => {
        const n = e[ue];
        e[ue] = void 0;
        const r = n.length === 0 ? [] : n.split(' ');
        for (let o = 0; o < r.length; o += 2) e.set(t(r[o]), t(r[o + 1]));
      },
    }),
    _({
      gn: '\x1B',
      Sn: (e) => !!Dr(e) || e === wt,
      qn: (e) => e,
      Cn: (e) => e,
      kn: void 0,
    }),
  ],
  Gn = (() => {
    const e = [];
    return (
      Sn.forEach((t) => {
        const n = t.yn;
        for (; e.length < n; ) e.push(void 0);
        e.push(t);
      }),
      e
    );
  })();
function Dr(e) {
  if (typeof e == 'string') {
    const t = e.charCodeAt(0);
    if (t < Gn.length) return Gn[t];
  }
}
const ii = Sn.filter((e) => e.jn),
  li = (e, t, n) => {
    for (const r of ii) if (r.Sn(e)) return r.jn(e, t, n), !0;
    return !1;
  },
  ci = (e, t, n, r) => {
    for (const o of Sn)
      if (o.Sn(e)) {
        let s = o.xn;
        return o.qn && (s += o.qn(e, t, n, r)), s;
      }
    if (typeof e == 'string') return e;
  },
  Xr = (e, t) => {
    const n = new Map(),
      r = new Map();
    return {
      prepare(o) {
        const s = Dr(o);
        if (s) {
          const l = s.Cn(o.slice(1), e, t);
          return s.kn && n.set(l, s), s.dn && r.set(l, s), l;
        }
        return o;
      },
      subs(o, s) {
        const l = r.get(o);
        return !!l && (l.dn(o, s, e), !0);
      },
      fill(o, s) {
        const l = n.get(o);
        return !!l && (l.kn(o, s, e), !0);
      },
    };
  },
  ui = {
    '!': (e, t) => t.u.get(e) ?? tn(e, t),
    '~': (e) => Promise.resolve(e),
    _: (e) => Promise.reject(e),
  },
  ai = (e, t, n) => {
    if (typeof n == 'boolean') return n;
    const r = e.vn.get(n);
    return !!(r && r.length > 0) && (r.length !== 1 || r[0] !== t);
  },
  fi = (e) => (e === ':slot' ? Dt : e === ':fragment' ? Wt : e),
  Hr = new WeakSet(),
  Br = new WeakSet(),
  Ur = (e) => Hr.has(e),
  Gr = (e) => Br.has(e),
  zr = (e) => (e != null && Hr.add(e), e),
  tl = (e) => (Br.add(e), e),
  bt = (e) => (le(e) ? Ce(e) ?? e : e),
  Ce = (e) => e[xt],
  ee = (e) => e[O],
  hi = (e) => e[de],
  di = (e, t) => {
    const n = e.split(' '),
      r = parseInt(n[0], 10),
      o = t(n[1]);
    if (!o || (an(o) && !o.Tt)) return;
    const s = [r, o];
    return (
      r === 0
        ? s.push(qt(n[2]))
        : r <= 2
        ? s.push(t(n[2]), t(n[3]), n[4], qt(n[5]))
        : r <= 4 && s.push(t(n[2]), t(n[3]), qt(n[4])),
      s
    );
  },
  qt = (e) => {
    if (e !== void 0) return decodeURI(e);
  },
  pi = (e) => {
    const t = new Map();
    return {
      vn: t,
      D: (n) => new mi(t, e, n),
      bt: (n) => {
        const r = t.get(n);
        if (r) {
          for (const o of r) o.Mn(n);
          t.delete(n), (r.length = 0);
        }
      },
      It: (n) => {
        const r = t.get(n[1]);
        if (r) for (const o of r) o.Pn(n);
      },
    };
  };
class mi {
  constructor(t, n, r) {
    (this.vn = t), (this.L = n), (this.dn = []), r && this.Pt(r);
  }
  Pt(t) {
    this.dn.push(...t);
    for (const n of this.dn) this.En(n[1], this);
  }
  En(t, n) {
    let r = this.vn.get(t);
    r || this.vn.set(t, (r = [])), r.includes(n) || r.push(n);
  }
  Mn(t) {
    const n = this.dn;
    for (let r = 0; r < n.length; r++) n[r][1] === t && (n.splice(r, 1), r--);
  }
  Pn(t) {
    const [n, r, o, s] = t,
      l = this.dn;
    if (n === 1 || n === 2) {
      const i = t[4];
      for (let c = 0; c < l.length; c++) {
        const u = l[c];
        u[0] === n &&
          u[1] === r &&
          u[2] === o &&
          u[3] === s &&
          u[4] === i &&
          (l.splice(c, 1), c--);
      }
    } else if (n === 3 || n === 4)
      for (let i = 0; i < l.length; i++) {
        const c = l[i];
        c[0] === n &&
          c[1] === r &&
          c[2] === o &&
          c[3] === s &&
          (l.splice(i, 1), i--);
      }
  }
  U(t, n) {
    const r = this.dn,
      o = t[1];
    (t[0] === 0 && r.some(([s, l, i]) => s === 0 && l === o && i === n)) ||
      (r.push((Jr = [...t, n])), this.En(o, this));
  }
  J(t) {
    const n = this.dn;
    for (const r of n) {
      const o = r[r.length - 1];
      (t && o && o !== t) || Io(r, this.L);
    }
  }
}
let Jr;
const kn = (e) => typeof e == 'function' && typeof e.getSymbol == 'function',
  En = '<sync>',
  gi = (e) => kn(e) && e.Bt == En,
  qe = (e, t, n, r, o, s, l) => {
    let i;
    const c = async function (...p) {
        return await m.call(this, I())(...p);
      },
      u = (p) => (i || (i = p), i),
      a = async (p) => {
        if (
          (p && u(p), e == '' && (n = (i.qFuncs || [])[Number(t)]), n !== null)
        )
          return n;
        if (r !== null) return (n = r().then((f) => (c.resolved = n = f[t])));
        {
          const f = zt().importSymbol(i, e, t);
          return (n = q(f, (g) => (c.resolved = n = g)));
        }
      },
      h = (p) => (n !== null ? n : a(p));
    function m(p, f) {
      return (...g) => {
        const w = yi(),
          S = h();
        return q(S, (x) => {
          if (M(x)) {
            if (f && f() === !1) return;
            const k = { ...d(p), Et: c };
            return (
              k.Kt === void 0 && (k.Kt = this),
              vi(t, k.X, w),
              D.call(this, k, x, ...g)
            );
          }
          throw A(10);
        });
      };
    }
    const d = (p) => (p == null ? X() : T(p) ? Cr(p) : p),
      v = l ?? t,
      y = Qr(v);
    return (
      Object.assign(c, {
        getSymbol: () => v,
        getHash: () => y,
        getCaptured: () => s,
        resolve: a,
        _t: h,
        R: u,
        Jt: e,
        Bt: t,
        mn: l,
        On: y,
        getFn: m,
        Qt: o,
        vt: s,
        dev: null,
        resolved: t == En ? n : void 0,
      }),
      c
    );
  },
  Qr = (e) => {
    const t = e.lastIndexOf('_');
    return t > -1 ? e.slice(t + 1) : e;
  },
  zn = new Set(),
  vi = (e, t, n) => {
    zn.has(e) ||
      (zn.add(e), Vr('qsymbol', { symbol: e, element: t, reqTime: n }));
  },
  Vr = (e, t) => {
    typeof document == 'object' &&
      document.dispatchEvent(new CustomEvent(e, { bubbles: !1, detail: t }));
  },
  yi = () => (typeof performance == 'object' ? performance.now() : 0);
let wi = 0;
const bi = (e) => qe(null, 's' + wi++, e, null, null, null, null),
  nl = (e) => e,
  rl = function (e, t) {
    return (
      t === void 0 && (t = e.toString()), qe('', En, e, null, null, null, null)
    );
  },
  Si = (e) => {
    function t(n, r, o) {
      const s = e.On.slice(0, 4);
      return rn(
        $e,
        { [We]: e, [Q]: n[Q], [N]: n[N], children: n.children, props: n },
        o,
        s + ':' + (r || '')
      );
    }
    return (t[ot] = [e]), t;
  },
  Zr = (e) => typeof e == 'function' && e[ot] !== void 0,
  ol = (e, t) => {
    const { val: n, set: r, iCtx: o } = ce();
    if (n != null) return n;
    const s = M(e) ? D(void 0, e) : e;
    if ((t == null ? void 0 : t.reactive) === !1) return r(s), s;
    {
      const l = tn(s, o.F.N.L, (t == null ? void 0 : t.deep) ?? 1 ? 1 : 0);
      return r(l), l;
    }
  };
function sl(e, t) {
  var r;
  const n = I();
  return ((r = n == null ? void 0 : n.F) == null ? void 0 : r.N.L.k[e]) ?? t;
}
const Jn = new Map(),
  ki = (e, t) => {
    let n = Jn.get(t);
    return n || Jn.set(t, (n = Ei(e, t))), n;
  },
  Ei = (e, t) => {
    const n = e.length,
      r = [],
      o = [];
    let s = 0,
      l = s,
      i = ye,
      c = 0;
    for (; s < n; ) {
      const d = s;
      let v = e.charCodeAt(s++);
      v === Li && (s++, (v = ro));
      const y = Fi[i];
      for (let p = 0; p < y.length; p++) {
        const f = y[p],
          [g, w, S] = f;
        if (
          (g === c || g === b || (g === st && Ge(c)) || (g === Xt && Vn(c))) &&
          (w === v ||
            w === b ||
            (w === st && Ge(v)) ||
            (w === G && !Ge(v) && v !== qn) ||
            (w === Xt && Vn(v))) &&
          (f.length == 3 || h(f))
        ) {
          if ((f.length > 3 && (v = e.charCodeAt(s - 1)), S === W || S == ne)) {
            S === ne &&
              (i !== Kr || m()
                ? Qn(v) || a(s - (w == G ? 1 : w == Ht ? 2 : 0))
                : (Qn(v) ? u(s - 2) : a(s - 2), l++)),
              w === G && (s--, (v = c));
            do (i = o.pop() || ye), i === re && (u(s - 1), l++);
            while (Ci(i));
          } else
            o.push(i),
              i === re && S === ye ? (u(s - 8), (l = s)) : S === Yr && a(d),
              (i = S);
          break;
        }
      }
      c = v;
    }
    return u(s), r.join('');
    function u(d) {
      r.push(e.substring(l, d)), (l = d);
    }
    function a(d) {
      i === re || m() || (u(d), r.push('.', Qt, t));
    }
    function h(d) {
      let v = 0;
      if (e.charCodeAt(s) === Bt) {
        for (let y = 1; y < 10; y++)
          if (e.charCodeAt(s + y) === Bt) {
            v = y + 1;
            break;
          }
      }
      e: for (let y = 3; y < d.length; y++) {
        const p = d[y];
        for (let f = 0; f < p.length; f++)
          if ((e.charCodeAt(s + f + v) | Pi) !== p.charCodeAt(f)) continue e;
        return (s += p.length + v), !0;
      }
      return !1;
    }
    function m() {
      return o.indexOf(re) !== -1 || o.indexOf(Cn) !== -1;
    }
  },
  Ge = (e) =>
    (e >= Ni && e <= Ai) ||
    (e >= ro && e <= Wi) ||
    (e >= $i && e <= Oi) ||
    e >= 128 ||
    e === ji ||
    e === Bt,
  Qn = (e) => e === fe || e === qn || e === oo || e === no || Ge(e),
  Ci = (e) => e === eo || e === Cn || e === to || e === re,
  Vn = (e) => e === Ti || e === qi || e === _i || e === xi,
  ye = 0,
  Kr = 2,
  re = 5,
  Yr = 6,
  Cn = 10,
  eo = 11,
  to = 12,
  W = 17,
  ne = 18,
  b = 0,
  st = 1,
  G = 2,
  Xt = 3,
  qi = 9,
  _i = 10,
  xi = 13,
  Ti = 32,
  no = 35,
  Ht = 41,
  Bt = 45,
  qn = 46,
  Ni = 48,
  Ai = 57,
  fe = 58,
  ro = 65,
  Wi = 90,
  oo = 91,
  Li = 92,
  ji = 95,
  Pi = 32,
  $i = 97,
  Oi = 122,
  xe = 123,
  Ue = 125,
  te = [
    [b, 39, 14],
    [b, 34, 15],
    [b, 47, 16, '*'],
  ],
  Fi = [
    [
      [b, 42, Kr],
      [b, oo, 7],
      [b, fe, Yr, ':', 'before', 'after', 'first-letter', 'first-line'],
      [b, fe, re, 'global'],
      [b, fe, 3, 'has', 'host-context', 'not', 'where', 'is', 'matches', 'any'],
      [b, fe, 4],
      [b, st, 1],
      [b, qn, 1],
      [b, no, 1],
      [b, 64, Cn, 'keyframe'],
      [b, 64, eo, 'media', 'supports'],
      [b, 64, to],
      [b, xe, 13],
      [47, 42, 16],
      [b, 59, W],
      [b, Ue, W],
      [b, Ht, W],
      ...te,
    ],
    [[b, G, ne]],
    [[b, G, ne]],
    [
      [b, 40, ye],
      [b, G, ne],
    ],
    [
      [b, 40, 8],
      [b, G, ne],
    ],
    [
      [b, 40, ye],
      [b, G, W],
    ],
    [[b, G, W]],
    [
      [b, 93, ne],
      [b, 39, 14],
      [b, 34, 15],
    ],
    [[b, Ht, W], ...te],
    [[b, Ue, W], ...te],
    [[b, Ue, W], [Xt, st, 1], [b, fe, re, 'global'], [b, xe, 13], ...te],
    [[b, xe, ye], [b, 59, W], ...te],
    [[b, 59, W], [b, xe, 9], ...te],
    [[b, Ue, W], [b, xe, 13], [b, 40, 8], ...te],
    [[b, 39, W]],
    [[b, 34, W]],
    [[42, 47, W]],
  ],
  il = (e) => {
    so(e, (t) => t, !1);
  },
  ll = (e) => ({ scopeId: Qt + so(e, ki, !0) }),
  so = (e, t, n) => {
    const { val: r, set: o, iCtx: s, i: l, elCtx: i } = ce();
    if (r) return r;
    const c = ((u = l), `${Ao(e.On)}-${u}`);
    var u;
    const a = s.F.N.L;
    if (
      (o(c),
      i.ft || (i.ft = []),
      i.$t || (i.$t = []),
      n && i.$t.push(((d) => Qt + d)(c)),
      a.q.has(c))
    )
      return c;
    a.q.add(c);
    const h = e._t(a.t),
      m = (d) => {
        i.ft.push({ styleId: c, content: t(d, c) });
      };
    return H(h) ? s.Xt.push(h.then(m)) : m(h), c;
  },
  cl = (e) => {
    const { val: t, set: n, iCtx: r } = ce();
    if (t != null) return t;
    const o = r.F.N.L,
      s = M(e) && !Zr(e) ? D(void 0, e) : e;
    return n(_o(s, o, 0, void 0));
  };
export {
  Ui as A,
  Mi as C,
  fr as F,
  N as K,
  Wt as L,
  Di as M,
  Dt as N,
  rn as P,
  nl as Q,
  xo as R,
  el as S,
  Si as V,
  Ii as W,
  rl as X,
  il as Z,
  ao as _,
  is as a,
  tl as b,
  ol as c,
  zi as d,
  zr as e,
  Ro as f,
  Yi as g,
  ar as h,
  Ri as i,
  Zi as j,
  Hi as k,
  Vi as l,
  Bi as m,
  ll as n,
  cl as o,
  Gi as p,
  Qi as q,
  Xi as r,
  Jo as s,
  Ji as t,
  sl as u,
  Ho as v,
  Ki as w,
};
function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = [];
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i]);
}
