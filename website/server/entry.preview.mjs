import { getNotFound as sa } from './@qwik-city-not-found-paths.js';
import { isStaticPath as oa } from './@qwik-city-static-paths.js';
import { createReadStream as ra } from 'fs';
import { join as Xt, basename as la, extname as aa } from 'path';
import { fileURLToPath as ia } from 'url';
import { Http2ServerRequest as ca } from 'http2';
import {
  TextEncoderStream as ua,
  TextDecoderStream as da,
  WritableStream as pa,
  ReadableStream as ma,
} from 'stream/web';
import {
  fetch as fa,
  Headers as ha,
  Request as ga,
  Response as ya,
  FormData as $a,
} from 'undici';
import ba from 'crypto';
var or = class extends Error {
  constructor(e, t) {
    super(t), (this.status = e);
  }
};
function wa(e, t) {
  let n = 'Server Error';
  return (
    t != null &&
      (typeof t.message == 'string' ? (n = t.message) : (n = String(t))),
    '<html>' + rr(e, n) + '</html>'
  );
}
function rr(e, t) {
  typeof e != 'number' && (e = 500),
    typeof t == 'string' ? (t = _a(t)) : (t = '');
  const n = typeof t == 'string' ? '600px' : '300px',
    s = e >= 500 ? ka : xa;
  return `
<head>
  <meta charset="utf-8">
  <meta http-equiv="Status" content="${e}">
  <title>${e} ${t}</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body { color: ${s}; background-color: #fafafa; padding: 30px; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Roboto, sans-serif; }
    p { max-width: ${n}; margin: 60px auto 30px auto; background: white; border-radius: 4px; box-shadow: 0px 0px 50px -20px ${s}; overflow: hidden; }
    strong { display: inline-block; padding: 15px; background: ${s}; color: white; }
    span { display: inline-block; padding: 15px; }
  </style>
</head>
<body><p><strong>${e}</strong> <span>${t}</span></p></body>
`;
}
var va = /[&<>]/g,
  _a = (e) =>
    e.replace(va, (t) => {
      switch (t) {
        case '&':
          return '&amp;';
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        default:
          return '';
      }
    }),
  xa = '#006ce9',
  ka = '#713fc2',
  Sa = { lax: 'Lax', none: 'None', strict: 'Strict' },
  qa = {
    seconds: 1,
    minutes: 1 * 60,
    hours: 1 * 60 * 60,
    days: 1 * 60 * 60 * 24,
    weeks: 1 * 60 * 60 * 24 * 7,
  },
  Ca = (e, t, n) => {
    const s = [`${e}=${t}`];
    typeof n.domain == 'string' && s.push(`Domain=${n.domain}`),
      typeof n.maxAge == 'number'
        ? s.push(`Max-Age=${n.maxAge}`)
        : Array.isArray(n.maxAge)
        ? s.push(`Max-Age=${n.maxAge[0] * qa[n.maxAge[1]]}`)
        : typeof n.expires == 'number' || typeof n.expires == 'string'
        ? s.push(`Expires=${n.expires}`)
        : n.expires instanceof Date &&
          s.push(`Expires=${n.expires.toUTCString()}`),
      n.httpOnly && s.push('HttpOnly'),
      typeof n.path == 'string' && s.push(`Path=${n.path}`);
    const o = Ta(n.sameSite);
    return (
      o && s.push(`SameSite=${o}`), n.secure && s.push('Secure'), s.join('; ')
    );
  };
function bo(e) {
  try {
    return decodeURIComponent(e);
  } catch {
    return e;
  }
}
var ja = (e) => {
  const t = {};
  if (typeof e == 'string' && e !== '') {
    const n = e.split(';');
    for (const s of n) {
      const o = s.indexOf('=');
      o !== -1 && (t[bo(s.slice(0, o).trim())] = bo(s.slice(o + 1).trim()));
    }
  }
  return t;
};
function Ta(e) {
  if (e === !0) return 'Strict';
  if (e === !1) return 'None';
  if (e) return Sa[e];
}
var St = Symbol('request-cookies'),
  os = Symbol('response-cookies'),
  Ve = Symbol('live-cookies'),
  lr,
  ar,
  Ea = class {
    constructor(e) {
      (this[lr] = {}),
        (this[ar] = {}),
        (this[St] = ja(e)),
        (this[Ve] = { ...this[St] });
    }
    get(e, t = !0) {
      const n = this[t ? Ve : St][e];
      return n
        ? {
            value: n,
            json() {
              return JSON.parse(n);
            },
            number() {
              return Number(n);
            },
          }
        : null;
    }
    getAll(e = !0) {
      return Object.keys(this[e ? Ve : St]).reduce(
        (t, n) => ((t[n] = this.get(n)), t),
        {}
      );
    }
    has(e, t = !0) {
      return !!this[t ? Ve : St][e];
    }
    set(e, t, n = {}) {
      this[Ve][e] = typeof t == 'string' ? t : JSON.stringify(t);
      const s =
        typeof t == 'string' ? t : encodeURIComponent(JSON.stringify(t));
      this[os][e] = Ca(e, s, n);
    }
    delete(e, t) {
      this.set(e, 'deleted', { ...t, maxAge: 0 }), (this[Ve][e] = null);
    }
    headers() {
      return Object.values(this[os]);
    }
  };
(lr = os), (ar = Ve);
var xs = class {},
  rn = class extends xs {},
  wo = new WeakMap(),
  vo = 'qaction',
  La = 'qfunc';
function Na(e) {
  const { url: t, params: n, request: s, status: o, locale: r } = e,
    a = {};
  s.headers.forEach((w, h) => (a[h] = w));
  const i = e.sharedMap.get(qn),
    c = e.sharedMap.get(fr),
    u = e.sharedMap.get(mr),
    p = e.sharedMap.get(Va),
    f = e.request.headers,
    m = new URL(t.pathname + t.search, t),
    g = f.get('X-Forwarded-Host'),
    b = f.get('X-Forwarded-Proto');
  return (
    g && ((m.port = ''), (m.host = g)),
    b && (m.protocol = b),
    {
      url: m.href,
      requestHeaders: a,
      locale: r(),
      nonce: p,
      containerAttributes: { 'q:route': u },
      qwikcity: {
        routeName: u,
        ev: e,
        params: { ...n },
        loadedRoute: Ya(e),
        response: { status: o(), loaders: Cn(e), action: i, formData: c },
      },
    }
  );
}
var Aa = (e, t, n, s, o) => {
    const r = [],
      a = [],
      i = [],
      c = !!(t && Da(t[2]));
    if ((e && _o(r, a, i, e, c, n), t)) {
      const u = t[0];
      s &&
        (n === 'POST' || n === 'PUT' || n === 'PATCH' || n === 'DELETE') &&
        i.unshift(Fa),
        c && (n === 'POST' && i.push(Ra), i.push(Ma), i.push(Ua)),
        i.push(Ha),
        _o(r, a, i, t[2], c, n),
        c &&
          (i.push((p) => {
            p.sharedMap.set(mr, u);
          }),
          i.push(za(r, a)),
          i.push(o));
    }
    return i;
  },
  _o = (e, t, n, s, o, r) => {
    for (const a of s) {
      typeof a.onRequest == 'function'
        ? n.push(a.onRequest)
        : Array.isArray(a.onRequest) && n.push(...a.onRequest);
      let i;
      switch (r) {
        case 'GET': {
          i = a.onGet;
          break;
        }
        case 'POST': {
          i = a.onPost;
          break;
        }
        case 'PUT': {
          i = a.onPut;
          break;
        }
        case 'PATCH': {
          i = a.onPatch;
          break;
        }
        case 'DELETE': {
          i = a.onDelete;
          break;
        }
        case 'OPTIONS': {
          i = a.onOptions;
          break;
        }
        case 'HEAD': {
          i = a.onHead;
          break;
        }
      }
      if (
        (typeof i == 'function' ? n.push(i) : Array.isArray(i) && n.push(...i),
        o)
      ) {
        const c = Object.values(a).filter((p) => xo(p, 'server_loader'));
        e.push(...c);
        const u = Object.values(a).filter((p) => xo(p, 'server_action'));
        t.push(...u);
      }
    }
  },
  xo = (e, t) => e && typeof e == 'function' && e.__brand === t;
function za(e, t) {
  return async (n) => {
    if (n.headersSent) {
      n.exit();
      return;
    }
    const { method: s } = n,
      o = Cn(n),
      r = jn(n) === 'dev',
      a = n[Sn];
    if (
      (r &&
        s === 'GET' &&
        n.query.has(vo) &&
        console.warn(`Seems like you are submitting a Qwik Action via GET request. Qwik Actions should be submitted via POST request.
Make sure your <form> has method="POST" attribute, like this: <form method="POST">`),
      s === 'POST')
    ) {
      const i = n.query.get(vo);
      if (i) {
        const c = globalThis._qwikActionsMap,
          u = t.find((p) => p.__id === i) ?? (c == null ? void 0 : c.get(i));
        if (u) {
          n.sharedMap.set(qn, i);
          const p = await n.parseBody();
          if (!p || typeof p != 'object')
            throw new Error('Expected request data to be an object');
          const f = await ko(n, u.__validators, p, r);
          if (!f.success) o[i] = n.fail(f.status ?? 500, f.error);
          else {
            const m = r
              ? await an(n, u.__qrl.getSymbol().split('_', 1)[0], () =>
                  u.__qrl.call(n, f.data, n)
                )
              : await u.__qrl.call(n, f.data, n);
            r && ln(a, m, u.__qrl), (o[i] = m);
          }
        }
      }
    }
    e.length > 0 &&
      (await Promise.all(
        e.map((i) => {
          const c = i.__id;
          return (o[c] = ko(n, i.__validators, void 0, r)
            .then((u) =>
              u.success
                ? r
                  ? an(n, i.__qrl.getSymbol().split('_', 1)[0], () =>
                      i.__qrl.call(n, n)
                    )
                  : i.__qrl.call(n, n)
                : n.fail(u.status ?? 500, u.error)
            )
            .then(
              (u) => (
                typeof u == 'function'
                  ? (o[c] = u())
                  : (r && ln(a, u, i.__qrl), (o[c] = u)),
                u
              )
            ));
        })
      ));
  };
}
async function ko(e, t, n, s) {
  let o = { success: !0, data: n };
  if (t)
    for (const r of t)
      if (
        (s
          ? (o = await an(e, 'validator$', () => r.validate(e, n)))
          : (o = await r.validate(e, n)),
        o.success)
      )
        n = o.data;
      else return o;
  return o;
}
function Ia(e) {
  return e ? typeof e == 'object' && Symbol.asyncIterator in e : !1;
}
async function Ra(e) {
  const t = e.query.get(La);
  if (
    t &&
    e.request.headers.get('X-QRL') === t &&
    e.request.headers.get('Content-Type') === 'application/qwik-json'
  ) {
    e.exit();
    const n = jn(e) === 'dev',
      s = e[Sn],
      o = await e.parseBody();
    if (Array.isArray(o)) {
      const [r, ...a] = o;
      if (Pa(r) && r.getHash() === t) {
        let i;
        try {
          n
            ? (i = await an(e, `server_${r.getSymbol()}`, () => r.apply(e, a)))
            : (i = await r.apply(e, a));
        } catch (c) {
          e.headers.set('Content-Type', 'application/qwik-json'),
            e.send(500, await s._serializeData(c, !0));
          return;
        }
        if (Ia(i)) {
          e.headers.set('Content-Type', 'text/qwik-json-stream');
          const u = e.getWritableStream().getWriter();
          for await (const p of i) {
            n && ln(s, p, r);
            const f = await s._serializeData(p, !0);
            if (e.signal.aborted) break;
            await u.write(
              kn.encode(`${f}
`)
            );
          }
          u.close();
        } else {
          ln(s, i, r), e.headers.set('Content-Type', 'application/qwik-json');
          const c = await s._serializeData(i, !0);
          e.send(200, c);
        }
        return;
      }
    }
    throw e.error(500, 'Invalid request');
  }
}
function Ma(e) {
  const t = ks(e),
    { basePathname: n, pathname: s, url: o, sharedMap: r } = e;
  if (!r.has(Ft) && s !== n && !s.endsWith('.html')) {
    if (t) {
      if (!s.endsWith('/')) throw e.redirect(302, s + '/' + o.search);
    } else if (s.endsWith('/'))
      throw e.redirect(302, s.slice(0, s.length - 1) + o.search);
  }
}
function ln(e, t, n) {
  try {
    e._verifySerializable(t, void 0);
  } catch (s) {
    throw (s instanceof Error && n.dev && (s.loc = n.dev), s);
  }
}
var Pa = (e) => typeof e == 'function' && typeof e.getSymbol == 'function';
function Da(e) {
  const t = e[e.length - 1];
  return t && typeof t.default == 'function';
}
function ir(e, t) {
  return (
    (e = new URL(e)),
    e.pathname.endsWith(ft) && (e.pathname = e.pathname.slice(0, -ft.length)),
    t
      ? e.pathname.endsWith('/') || (e.pathname += '/')
      : e.pathname.endsWith('/') && (e.pathname = e.pathname.slice(0, -1)),
    e.toString().substring(e.origin.length)
  );
}
var kn = new TextEncoder();
function Fa(e) {
  if (
    Wa(
      e.request.headers,
      'application/x-www-form-urlencoded',
      'multipart/form-data',
      'text/plain'
    )
  ) {
    const n = e.request.headers.get('origin'),
      s = e.url.origin;
    if (n !== s)
      throw e.error(
        403,
        `CSRF check failed. Cross-site ${e.method} form submissions are forbidden.
The request origin "${n}" does not match the server origin "${s}".`
      );
  }
}
function Oa(e) {
  return async (t) => {
    if (t.headersSent || t.sharedMap.has(Ft)) return;
    t.request.headers.forEach((f, m) => f);
    const s = t.headers;
    s.has('Content-Type') || s.set('Content-Type', 'text/html; charset=utf-8');
    const o = ks(t),
      { readable: r, writable: a } = new TextEncoderStream(),
      i = t.getWritableStream(),
      c = r.pipeTo(i, { preventClose: !0 }),
      u = a.getWriter(),
      p = t.status();
    try {
      const f = jn(t) === 'static',
        m = Na(t),
        g = await e({
          base: t.basePathname + 'build/',
          stream: u,
          serverData: m,
          containerAttributes: {
            'q:render': f ? 'static' : '',
            ...m.containerAttributes,
          },
        }),
        b = {
          loaders: Cn(t),
          action: t.sharedMap.get(qn),
          status: p !== 200 ? p : 200,
          href: ir(t.url, o),
        };
      typeof g.html == 'string' && (await u.write(g.html)),
        t.sharedMap.set('qData', b);
    } finally {
      await u.ready, await u.close(), await c;
    }
    await i.close();
  };
}
async function Ha(e) {
  if (e.sharedMap.has(Ft)) {
    try {
      await e.next();
    } catch (r) {
      if (!(r instanceof rn)) throw r;
    }
    if (e.headersSent) return;
    const n = e.status(),
      s = e.headers.get('Location');
    if (n >= 301 && n <= 308 && s) {
      const r = Ba(s);
      if (r) {
        e.headers.set('Location', r), e.getWritableStream().close();
        return;
      } else e.status(200), e.headers.delete('Location');
    }
  }
}
async function Ua(e) {
  if (e.sharedMap.has(Ft)) {
    if ((await e.next(), e.headersSent || e.exited)) return;
    const n = e.status(),
      s = e.headers.get('Location'),
      o = ks(e);
    e.request.headers.forEach((u, p) => u),
      e.headers.set('Content-Type', 'application/json; charset=utf-8');
    const r = {
        loaders: Cn(e),
        action: e.sharedMap.get(qn),
        status: n !== 200 ? n : 200,
        href: ir(e.url, o),
        redirect: s ?? void 0,
      },
      a = e.getWritableStream().getWriter(),
      c = await e[Sn]._serializeData(r, !0);
    a.write(kn.encode(c)), e.sharedMap.set('qData', r), a.close();
  }
}
function Ba(e) {
  if (e.startsWith('/')) {
    const t = ft,
      n = new URL(e, 'http://localhost');
    return (
      (n.pathname.endsWith('/') ? n.pathname.slice(0, -1) : n.pathname) +
      (t.startsWith('/') ? '' : '/') +
      t +
      n.search
    );
  } else return;
}
function So() {
  return typeof performance < 'u' ? performance.now() : 0;
}
async function an(e, t, n) {
  const s = So();
  try {
    return await n();
  } finally {
    const o = So() - s;
    let r = e.sharedMap.get('@serverTiming');
    r || e.sharedMap.set('@serverTiming', (r = [])), r.push([t, o]);
  }
}
function Wa(e, ...t) {
  var n;
  const s =
    ((n = e.get('content-type')) == null
      ? void 0
      : n.split(/;,/, 1)[0].trim()) ?? '';
  return t.includes(s);
}
function Qa(e) {
  const t = [];
  return (
    e === 'day'
      ? (e = 60 * 60 * 24)
      : e === 'week'
      ? (e = 60 * 60 * 24 * 7)
      : e === 'month'
      ? (e = 60 * 60 * 24 * 30)
      : e === 'year'
      ? (e = 60 * 60 * 24 * 365)
      : e === 'private'
      ? (e = { private: !0, noCache: !0 })
      : e === 'immutable'
      ? (e = {
          public: !0,
          immutable: !0,
          maxAge: 60 * 60 * 24 * 365,
          staleWhileRevalidate: 60 * 60 * 24 * 365,
        })
      : e === 'no-cache' && (e = { noCache: !0 }),
    typeof e == 'number' &&
      (e = { maxAge: e, sMaxAge: e, staleWhileRevalidate: e }),
    e.immutable && t.push('immutable'),
    e.maxAge && t.push(`max-age=${e.maxAge}`),
    e.sMaxAge && t.push(`s-maxage=${e.sMaxAge}`),
    e.noStore && t.push('no-store'),
    e.noCache && t.push('no-cache'),
    e.private && t.push('private'),
    e.public && t.push('public'),
    e.staleWhileRevalidate &&
      t.push(`stale-while-revalidate=${e.staleWhileRevalidate}`),
    e.staleIfError && t.push(`stale-if-error=${e.staleIfError}`),
    t.join(', ')
  );
}
var Ka = (e) => e && typeof e.then == 'function',
  cr = Symbol('RequestEvLoaders'),
  ur = Symbol('RequestEvMode'),
  dr = Symbol('RequestEvRoute'),
  Sn = Symbol('RequestEvQwikSerializer'),
  pr = Symbol('RequestEvTrailingSlash'),
  mr = '@routeName',
  qn = '@actionId',
  fr = '@actionFormData',
  Va = '@nonce';
function Za(e, t, n, s, o, r, a, i) {
  const { request: c, platform: u, env: p } = e,
    f = new Map(),
    m = new Ea(c.headers.get('cookie')),
    g = new Headers(),
    b = new URL(c.url);
  b.pathname.endsWith(ft) &&
    ((b.pathname = b.pathname.slice(0, -hr)),
    o && !b.pathname.endsWith('/') && (b.pathname += '/'),
    f.set(Ft, !0)),
    f.set('@manifest', s);
  let w = -1,
    h = null,
    y,
    k = e.locale,
    _ = 200;
  const v = async () => {
      for (w++; w < n.length; ) {
        const C = n[w],
          L = C(A);
        Ka(L) && (await L), w++;
      }
    },
    q = () => {
      if (h !== null) throw new Error('Response already sent');
    },
    E = (C, L) => {
      if ((q(), typeof C == 'number')) {
        _ = C;
        const G = A.getWritableStream().getWriter();
        G.write(typeof L == 'string' ? kn.encode(L) : L), G.close();
      } else if (
        ((_ = C.status),
        C.headers.forEach((z, G) => {
          g.append(G, z);
        }),
        C.body)
      ) {
        const z = A.getWritableStream();
        C.body.pipeTo(z);
      } else {
        if (_ >= 300 && _ < 400) return new rn();
        A.getWritableStream().getWriter().close();
      }
      return S();
    },
    S = () => ((w = qo), new xs()),
    T = {},
    A = {
      [cr]: T,
      [ur]: e.mode,
      [pr]: o,
      [dr]: t,
      [Sn]: a,
      cookie: m,
      headers: g,
      env: p,
      method: c.method,
      signal: c.signal,
      params: (t == null ? void 0 : t[1]) ?? {},
      pathname: b.pathname,
      platform: u,
      query: b.searchParams,
      request: c,
      url: b,
      basePathname: r,
      sharedMap: f,
      get headersSent() {
        return h !== null;
      },
      get exited() {
        return w >= qo;
      },
      get clientConn() {
        return e.getClientConn();
      },
      next: v,
      exit: S,
      cacheControl: (C, L = 'Cache-Control') => {
        q(), g.set(L, Qa(C));
      },
      resolveValue: async (C) => {
        const L = C.__id;
        if (C.__brand === 'server_loader' && !(L in T))
          throw new Error(
            'You can not get the returned data of a loader that has not been executed for this request.'
          );
        return T[L];
      },
      status: (C) => (typeof C == 'number' ? (q(), (_ = C), C) : _),
      locale: (C) => (typeof C == 'string' && (k = C), k || ''),
      error: (C, L) => ((_ = C), g.delete('Cache-Control'), new or(C, L)),
      redirect: (C, L) => {
        if ((q(), (_ = C), L)) {
          const z = L.replace(/([^:])\/{2,}/g, '$1/');
          L !== z &&
            console.warn(`Redirect URL ${L} is invalid, fixing to ${z}`),
            g.set('Location', z);
        }
        return (
          g.delete('Cache-Control'),
          C > 301 && g.set('Cache-Control', 'no-store'),
          S(),
          new rn()
        );
      },
      defer: (C) => (typeof C == 'function' ? C : () => C),
      fail: (C, L) => (
        q(), (_ = C), g.delete('Cache-Control'), { failed: !0, ...L }
      ),
      text: (C, L) => (
        g.set('Content-Type', 'text/plain; charset=utf-8'), E(C, L)
      ),
      html: (C, L) => (
        g.set('Content-Type', 'text/html; charset=utf-8'), E(C, L)
      ),
      parseBody: async () => (y !== void 0 ? y : (y = Ga(A.request, f, a))),
      json: (C, L) => (
        g.set('Content-Type', 'application/json; charset=utf-8'),
        E(C, JSON.stringify(L))
      ),
      send: E,
      isDirty: () => h !== null,
      getWritableStream: () => {
        if (h === null) {
          if (e.mode === 'dev') {
            const C = f.get('@serverTiming');
            C &&
              g.set(
                'Server-Timing',
                C.map((L) => `${L[0]};dur=${L[1]}`).join(',')
              );
          }
          h = e.getWritableStream(_, g, m, i, A);
        }
        return h;
      },
    };
  return Object.freeze(A);
}
function Cn(e) {
  return e[cr];
}
function ks(e) {
  return e[pr];
}
function Ya(e) {
  return e[dr];
}
function jn(e) {
  return e[ur];
}
var qo = Number.MAX_SAFE_INTEGER,
  Ga = async (e, t, n) => {
    var s;
    const o =
      ((s = e.headers.get('content-type')) == null
        ? void 0
        : s.split(/[;,]/, 1)[0].trim()) ?? '';
    if (
      o === 'application/x-www-form-urlencoded' ||
      o === 'multipart/form-data'
    ) {
      const r = await e.formData();
      return t.set(fr, r), Xa(r);
    } else {
      if (o === 'application/json') return await e.json();
      if (o === 'application/qwik-json')
        return n._deserializeData(await e.text());
    }
  },
  Xa = (e) =>
    [...e.entries()].reduce(
      (n, [s, o]) => (
        s.split('.').reduce((r, a, i, c) => {
          if (a.endsWith('[]')) {
            const u = a.slice(0, -2);
            return (r[u] = r[u] || []), (r[u] = [...r[u], o]);
          }
          return i < c.length - 1
            ? (r[a] = r[a] || (Number.isNaN(+c[i + 1]) ? {} : []))
            : (r[a] = o);
        }, n),
        n
      ),
      {}
    );
function Ja(e, t, n, s, o = !0, r = '/', a) {
  let i;
  const c = new Promise((p) => (i = p)),
    u = Za(e, t, n, s, o, r, a, i);
  return { response: c, requestEv: u, completion: ei(u, i) };
}
async function ei(e, t) {
  try {
    await e.next();
  } catch (n) {
    if (n instanceof rn) await e.getWritableStream().close();
    else if (n instanceof or) {
      if ((console.error(n), !e.headersSent)) {
        const s = wa(n.status, n),
          o = n.status;
        e.html(o, s);
      }
    } else if (!(n instanceof xs)) {
      if (jn(e) !== 'dev')
        try {
          e.headersSent ||
            (e.headers.set('content-type', 'text/html; charset=utf-8'),
            e.cacheControl({ noCache: !0 }),
            e.status(500));
          const s = e.getWritableStream();
          if (!s.locked) {
            const o = s.getWriter();
            await o.write(kn.encode(rr(500, 'Internal Server Error'))),
              await o.close();
          }
        } catch {
          console.error('Unable to render error page');
        }
      return n;
    }
  } finally {
    e.isDirty() || t(null);
  }
}
function ti(e, t) {
  if (e.endsWith(ft)) {
    const n = e.length - hr + (t ? 1 : 0);
    (e = e.slice(0, n)), e === '' && (e = '/');
  }
  return e;
}
var Ft = '@isQData',
  ft = '/q-data.json',
  hr = ft.length;
function ni(e, t) {
  const n = To(e),
    s = Co(e),
    o = To(t),
    r = Co(t);
  return gr(e, n, s, t, o, r);
}
function gr(e, t, n, s, o, r) {
  let a = null;
  for (; t < n; ) {
    const i = e.charCodeAt(t++),
      c = s.charCodeAt(o++);
    if (i === 91) {
      const u = yr(e, t),
        p = t + (u ? 3 : 0),
        f = Kn(e, p, n, 93),
        m = e.substring(p, f),
        g = Kn(e, f + 1, n, 47),
        b = e.substring(f + 1, g);
      t = f + 1;
      const w = o - 1;
      if (u) {
        const k = oi(m, b, s, w, r, e, t + b.length + 1, n);
        if (k) return Object.assign(a || (a = {}), k);
      }
      const h = Kn(s, w, r, 47, b);
      if (h == -1) return null;
      const y = s.substring(w, h);
      if (!u && !b && !y) return null;
      (o = h), ((a || (a = {}))[m] = decodeURIComponent(y));
    } else if (i !== c && !(isNaN(c) && si(e, t))) return null;
  }
  return jo(e, t) && jo(s, o) ? a || {} : null;
}
function si(e, t) {
  return e.charCodeAt(t) === 91 && yr(e, t + 1);
}
function Co(e) {
  const t = e.length;
  return t > 1 && e.charCodeAt(t - 1) === 47 ? t - 1 : t;
}
function jo(e, t) {
  const n = e.length;
  return t >= n || (t == n - 1 && e.charCodeAt(t) === 47);
}
function To(e) {
  return e.charCodeAt(0) === 47 ? 1 : 0;
}
function yr(e, t) {
  return (
    e.charCodeAt(t) === 46 &&
    e.charCodeAt(t + 1) === 46 &&
    e.charCodeAt(t + 2) === 46
  );
}
function Kn(e, t, n, s, o = '') {
  for (; t < n && e.charCodeAt(t) !== s; ) t++;
  const r = o.length;
  for (let a = 0; a < r; a++)
    if (e.charCodeAt(t - r + a) !== o.charCodeAt(a)) return -1;
  return t - r;
}
function oi(e, t, n, s, o, r, a, i) {
  n.charCodeAt(s) === 47 && s++;
  let c = o;
  const u = t + '/';
  let p = 5;
  for (; c >= s && p--; ) {
    const f = gr(r, a, i, n, c, o);
    if (f) {
      let m = n.substring(s, Math.min(c, o));
      return (
        m.endsWith(u) && (m = m.substring(0, m.length - u.length)),
        (f[e] = decodeURIComponent(m)),
        f
      );
    }
    c = ri(n, s, u, c, s - 1) + u.length;
  }
  return null;
}
function ri(e, t, n, s, o) {
  let r = e.lastIndexOf(n, s);
  return (
    r == s - n.length && (r = e.lastIndexOf(n, s - n.length - 1)), r > t ? r : o
  );
}
var li = async (e, t, n, s) => {
    if (Array.isArray(e))
      for (const o of e) {
        const r = o[0],
          a = ni(r, s);
        if (a) {
          const i = o[1],
            c = o[3],
            u = new Array(i.length),
            p = [],
            f = ai(t, s);
          let m;
          return (
            i.forEach((g, b) => {
              Eo(g, p, (w) => (u[b] = w), n);
            }),
            Eo(f, p, (g) => (m = g == null ? void 0 : g.default), n),
            p.length > 0 && (await Promise.all(p)),
            [r, a, u, m, c]
          );
        }
      }
    return null;
  },
  Eo = (e, t, n, s) => {
    if (typeof e == 'function') {
      const o = wo.get(e);
      if (o) n(o);
      else {
        const r = e();
        typeof r.then == 'function'
          ? t.push(
              r.then((a) => {
                s !== !1 && wo.set(e, a), n(a);
              })
            )
          : r && n(r);
      }
    }
  },
  ai = (e, t) => {
    if (e) {
      t = t.endsWith('/') ? t : t + '/';
      const n = e.find(
        (s) => s[0] === t || t.startsWith(s[0] + (t.endsWith('/') ? '' : '/'))
      );
      if (n) return n[1];
    }
  };
async function ii(e, t, n) {
  const { render: s, qwikCityPlan: o, manifest: r, checkOrigin: a } = t,
    i = e.url.pathname,
    c = ti(i, o.trailingSlash),
    u = await ci(o, c, e.request.method, a ?? !0, s);
  return u ? Ja(e, u[0], u[1], r, o.trailingSlash, o.basePathname, n) : null;
}
async function ci(e, t, n, s, o) {
  const { routes: r, serverPlugins: a, menus: i, cacheModules: c } = e,
    u = await li(r, i, c, t),
    p = Aa(a, u, n, s, Oa(o));
  return p.length > 0 ? [u, p] : null;
}
const ui = !0,
  di = !1;
/**
 * @license
 * @builder.io/qwik 1.3.1
 * Copyright Builder.io, Inc. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/BuilderIO/qwik/blob/main/LICENSE
 */ const Ue = (e) => e && typeof e.nodeType == 'number',
  $r = (e) => e.nodeType === 9,
  Be = (e) => e.nodeType === 1,
  We = (e) => {
    const t = e.nodeType;
    return t === 1 || t === 111;
  },
  pi = (e) => {
    const t = e.nodeType;
    return t === 1 || t === 111 || t === 3;
  },
  Ce = (e) => e.nodeType === 111,
  Ss = (e) => e.nodeType === 3,
  Ot = (e) => e.nodeType === 8,
  et = (e, ...t) => Cs(!0, e, ...t),
  br = (e, ...t) => {
    throw Cs(!1, e, ...t);
  },
  qs = (e, ...t) => Cs(!0, e, ...t),
  Tt = () => {},
  mi = (e) => e,
  Cs = (e, t, ...n) => {
    const s = t instanceof Error ? t : new Error(t);
    return (
      console.error('%cQWIK ERROR', '', s.stack || s.message, ...mi(n)),
      e &&
        setTimeout(() => {
          throw s;
        }, 0),
      s
    );
  };
const Y = (e, ...t) => {
    const n = Tn(e);
    return qs(n, ...t);
  },
  Tn = (e) => `Code(${e})`,
  fi = () => ({
    isServer: ui,
    importSymbol(e, t, n) {
      var r;
      {
        const a = El(n),
          i = (r = globalThis.__qwik_reg_symbols) == null ? void 0 : r.get(a);
        if (i) return i;
      }
      if (!t) throw Y(31, n);
      if (!e) throw Y(30, t, n);
      const s = hi(e.ownerDocument, e, t).toString(),
        o = new URL(s);
      return (o.hash = ''), (o.search = ''), import(o.href).then((a) => a[n]);
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
  hi = (e, t, n) => {
    const s = e.baseURI,
      o = new URL(t.getAttribute('q:base') ?? s, s);
    return new URL(n, o);
  };
let js = fi();
const wr = (e) => (js = e),
  En = () => js,
  ze = () => js.isServer,
  Ht = (e) => {
    const t = Object.getPrototypeOf(e);
    return t === Object.prototype || t === null;
  },
  Te = (e) => e && typeof e == 'object',
  B = (e) => Array.isArray(e),
  Me = (e) => typeof e == 'string',
  fe = (e) => typeof e == 'function',
  X = (e) => e && typeof e.then == 'function',
  Ln = (e, t, n) => {
    try {
      const s = e();
      return X(s) ? s.then(t, n) : t(s);
    } catch (s) {
      return n(s);
    }
  },
  F = (e, t) => (X(e) ? e.then(t) : t(e)),
  Ts = (e) => (e.some(X) ? Promise.all(e) : e),
  cn = (e) => (e.length > 0 ? Promise.all(e) : e),
  vr = (e) => e != null,
  gi = (e) =>
    new Promise((t) => {
      setTimeout(t, e);
    }),
  Se = [],
  oe = {},
  Ut = (e) =>
    typeof document < 'u' ? document : e.nodeType === 9 ? e : e.ownerDocument,
  he = 'q:slot',
  Nn = 'q:style',
  rs = Symbol('proxy target'),
  it = Symbol('proxy flags'),
  qe = Symbol('proxy manager'),
  d = Symbol('IMMUTABLE'),
  An = '_qc_',
  me = (e, t, n) => e.setAttribute(t, n),
  ve = (e, t) => e.getAttribute(t),
  Es = (e) => e.replace(/([A-Z])/g, '-$1').toLowerCase(),
  yi = (e) => e.replace(/-./g, (t) => t[1].toUpperCase()),
  Lo = Symbol('ContainerState'),
  bt = (e) => {
    let t = e[Lo];
    return t || (e[Lo] = t = Ls(e, ve(e, 'q:base') ?? '/')), t;
  },
  Ls = (e, t) => {
    const n = {
      $containerEl$: e,
      $elementIndex$: 0,
      $styleMoved$: !1,
      $proxyMap$: new WeakMap(),
      $opsNext$: new Set(),
      $taskNext$: new Set(),
      $taskStaging$: new Set(),
      $hostsNext$: new Set(),
      $hostsStaging$: new Set(),
      $styleIds$: new Set(),
      $events$: new Set(),
      $serverData$: {},
      $base$: t,
      $renderPromise$: void 0,
      $hostsRendering$: void 0,
      $pauseCtx$: void 0,
      $subsManager$: null,
      $inlineFns$: new Map(),
    };
    return (n.$subsManager$ = hd(n)), n;
  },
  Ns = (e, t) => {
    if (fe(e)) return e(t);
    if (Te(e) && 'value' in e) return (e.value = t);
    throw Y(32, e);
  },
  $i = (e) => Be(e) && e.hasAttribute('q:container'),
  Pe = (e) => e.toString(36),
  ke = (e) => parseInt(e, 36),
  _r = (e) => {
    const t = e.indexOf(':');
    return e && yi(e.slice(t + 1));
  },
  bi = /^(on|window:|document:)/,
  ls = 'preventdefault:',
  un = (e) => e.endsWith('$') && bi.test(e),
  As = (e) => {
    if (e.length === 0) return Se;
    if (e.length === 1) {
      const n = e[0];
      return [[n[0], [n[1]]]];
    }
    const t = [];
    for (let n = 0; n < e.length; n++) {
      const s = e[n][0];
      t.includes(s) || t.push(s);
    }
    return t.map((n) => [n, e.filter((s) => s[0] === n).map((s) => s[1])]);
  },
  dn = (e, t, n, s) => {
    if ((t.endsWith('$'), (t = as(t.slice(0, -1))), n))
      if (B(n)) {
        const o = n
          .flat(1 / 0)
          .filter((r) => r != null)
          .map((r) => [t, Ao(r, s)]);
        e.push(...o);
      } else e.push([t, Ao(n, s)]);
    return t;
  },
  No = ['on', 'window:on', 'document:on'],
  wi = ['on', 'on-window', 'on-document'],
  as = (e) => {
    let t = 'on';
    for (let n = 0; n < No.length; n++) {
      const s = No[n];
      if (e.startsWith(s)) {
        (t = wi[n]), (e = e.slice(s.length));
        break;
      }
    }
    return t + ':' + (e = e.startsWith('-') ? Es(e.slice(1)) : e.toLowerCase());
  },
  Ao = (e, t) => (e.$setContainer$(t), e),
  vi = (e, t) => {
    const n = e.$element$.attributes,
      s = [];
    for (let o = 0; o < n.length; o++) {
      const { name: r, value: a } = n.item(o);
      if (
        r.startsWith('on:') ||
        r.startsWith('on-window:') ||
        r.startsWith('on-document:')
      ) {
        const i = a.split(`
`);
        for (const c of i) {
          const u = On(c, t);
          u.$capture$ && _l(u, e), s.push([r, u]);
        }
      }
    }
    return s;
  },
  _i = (e, t) => {
    kr(xr(e, void 0), t);
  },
  zo = (e, t) => {
    kr(xr(e, 'document'), t);
  },
  xr = (e, t) => {
    const n = t !== void 0 ? t + ':' : '';
    return Array.isArray(e) ? e.map((s) => `${n}on-${s}`) : `${n}on-${e}`;
  },
  kr = (e, t) => {
    if (t) {
      const n = Xr(),
        s = le(n.$hostElement$, n.$renderCtx$.$static$.$containerState$);
      typeof e == 'string'
        ? s.li.push([as(e), t])
        : s.li.push(...e.map((o) => [as(o), t])),
        (s.$flags$ |= Oe);
    }
  },
  xi = (e, t, n, s) => {
    typeof CustomEvent == 'function' &&
      e &&
      e.dispatchEvent(
        new CustomEvent(t, { detail: n, bubbles: s, composed: s })
      );
  },
  H = (e, t, n) => new is(e, t, n),
  ki = (e) => {
    const t = e.$funcStr$;
    let n = '';
    for (let s = 0; s < e.$args$.length; s++) n += `p${s},`;
    return `(${n})=>(${t})`;
  };
var Sr;
const Si = (e, t, n, s) => {
    const o = t.$subsManager$.$createManager$(s);
    return new Lt(e, o, n);
  },
  Et = Symbol('proxy manager'),
  qr = Symbol('unassigned signal');
class Bt {}
class Lt extends Bt {
  constructor(t, n, s) {
    super(),
      (this[Sr] = 0),
      (this.untrackedValue = t),
      (this[qe] = n),
      (this[Et] = s);
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
    if (2 & this[Et]) throw qr;
    const t = (n = be()) == null ? void 0 : n.$subscriber$;
    return t && this[qe].$addSub$(t), this.untrackedValue;
  }
  set value(t) {
    const n = this[qe];
    n &&
      this.untrackedValue !== t &&
      ((this.untrackedValue = t), n.$notifySubs$());
  }
}
Sr = Et;
class is extends Bt {
  constructor(t, n, s) {
    super(), (this.$func$ = t), (this.$args$ = n), (this.$funcStr$ = s);
  }
  get value() {
    return this.$func$.apply(void 0, this.$args$);
  }
}
class cs extends Bt {
  constructor(t, n) {
    super(), (this.ref = t), (this.prop = n);
  }
  get [qe]() {
    return re(this.ref);
  }
  get value() {
    return this.ref[this.prop];
  }
  set value(t) {
    this.ref[this.prop] = t;
  }
}
const ne = (e) => e instanceof Bt,
  V = (e, t) => {
    var o, r;
    if (!Te(e)) return e[t];
    if (e instanceof Bt) return e;
    const n = ot(e);
    if (n) {
      const a = n['$$' + t];
      if (a) return a;
      if (((o = n[d]) == null ? void 0 : o[t]) !== !0) return new cs(e, t);
    }
    const s = (r = e[d]) == null ? void 0 : r[t];
    return ne(s) ? s : d;
  },
  M = (e, t) => {
    const n = V(e, t);
    return n === d ? e[t] : n;
  },
  zs = (e, t, n = 0) =>
    t.$proxyMap$.get(e) || (n !== 0 && In(e, n), Wt(e, t, void 0)),
  Wt = (e, t, n) => {
    Yt(e), t.$proxyMap$.has(e);
    const s = t.$subsManager$.$createManager$(n),
      o = new Proxy(e, new Cr(t, s));
    return t.$proxyMap$.set(e, o), o;
  },
  zn = () => {
    const e = {};
    return In(e, 2), e;
  },
  In = (e, t) => {
    Object.defineProperty(e, it, { value: t, enumerable: !1 });
  };
class Cr {
  constructor(t, n) {
    (this.$containerState$ = t), (this.$manager$ = n);
  }
  deleteProperty(t, n) {
    if (2 & t[it]) throw Y(17);
    return (
      typeof n == 'string' &&
      delete t[n] &&
      (this.$manager$.$notifySubs$(B(t) ? void 0 : n), !0)
    );
  }
  get(t, n) {
    var u;
    if (typeof n == 'symbol')
      return n === rs ? t : n === qe ? this.$manager$ : t[n];
    const s = t[it] ?? 0,
      o = be(),
      r = (1 & s) != 0,
      a = t['$$' + n];
    let i, c;
    if (
      (o && (i = o.$subscriber$),
      !(2 & s) ||
        (n in t && !qi((u = t[d]) == null ? void 0 : u[n])) ||
        (i = null),
      a ? ((c = a.value), (i = null)) : (c = t[n]),
      i)
    ) {
      const p = B(t);
      this.$manager$.$addSub$(i, p ? void 0 : n);
    }
    return r ? Ci(c, this.$containerState$) : c;
  }
  set(t, n, s) {
    if (typeof n == 'symbol') return (t[n] = s), !0;
    const o = t[it] ?? 0;
    if (2 & o) throw Y(17);
    const r = 1 & o ? Yt(s) : s;
    if (B(t)) return (t[n] = r), this.$manager$.$notifySubs$(), !0;
    const a = t[n];
    return (t[n] = r), a !== r && this.$manager$.$notifySubs$(n), !0;
  }
  has(t, n) {
    if (n === rs) return !0;
    const s = Object.prototype.hasOwnProperty;
    return !!s.call(t, n) || !(typeof n != 'string' || !s.call(t, '$$' + n));
  }
  ownKeys(t) {
    if (!(2 & (t[it] ?? 0))) {
      let s = null;
      const o = be();
      o && (s = o.$subscriber$), s && this.$manager$.$addSub$(s);
    }
    return B(t)
      ? Reflect.ownKeys(t)
      : Reflect.ownKeys(t).map((s) =>
          typeof s == 'string' && s.startsWith('$$') ? s.slice(2) : s
        );
  }
  getOwnPropertyDescriptor(t, n) {
    return B(t) || typeof n == 'symbol'
      ? Object.getOwnPropertyDescriptor(t, n)
      : { enumerable: !0, configurable: !0 };
  }
}
const qi = (e) => e === d || ne(e),
  Ci = (e, t) => {
    if (Te(e)) {
      if (Object.isFrozen(e)) return e;
      const n = Yt(e);
      if (n !== e || ql(n)) return e;
      if (Ht(n) || B(n)) return t.$proxyMap$.get(n) || zs(n, t, 1);
    }
    return e;
  },
  ji = (e, t = 0) => {
    for (let n = 0; n < e.length; n++)
      (t = (t << 5) - t + e.charCodeAt(n)), (t |= 0);
    return Number(Math.abs(t)).toString(36);
  },
  Ti = (e, t) => `${ji(e.$hash$)}-${t}`,
  Ei = (e) => '⭐️' + e,
  jr = (e) => {
    const t = e.join('|');
    if (t.length > 0) return t;
  };
var Tr;
const nn = '<!--qkssr-f-->';
class Er {
  constructor(t) {
    (this.nodeType = t), (this[Tr] = null);
  }
}
Tr = An;
const Li = () => new Er(9),
  Ni = async (e, t) => {
    var m, g, b;
    const n = t.containerTagName,
      s = pn(1).$element$,
      o = Ls(s, t.base ?? '/');
    o.$serverData$.locale = (m = t.serverData) == null ? void 0 : m.locale;
    const r = Li(),
      a = tl(r, o),
      i = t.beforeContent ?? [],
      c = {
        $static$: {
          $contexts$: [],
          $headNodes$: n === 'html' ? i : [],
          $locale$: (g = t.serverData) == null ? void 0 : g.locale,
          $textNodes$: new Map(),
        },
        $projectedChildren$: void 0,
        $projectedCtxs$: void 0,
        $invocationContext$: void 0,
      };
    let u = 'ssr';
    t.containerAttributes['q:render'] &&
      (u = `${t.containerAttributes['q:render']}-${u}`);
    const p = {
        ...t.containerAttributes,
        'q:container': 'paused',
        'q:version': '1.3.1',
        'q:render': u,
        'q:base': t.base,
        'q:locale': (b = t.serverData) == null ? void 0 : b.locale,
        'q:manifest-hash': t.manifestHash,
      },
      f = n === 'html' ? [e] : [i, e];
    n !== 'html' && (p.class = 'qc📦' + (p.class ? ' ' + p.class : '')),
      t.serverData && (o.$serverData$ = t.serverData),
      (e = l(n, null, p, f, ht | Oe, null)),
      (o.$hostsRendering$ = new Set()),
      await Promise.resolve().then(() => Ai(e, a, c, t.stream, o, t));
  },
  Ai = async (e, t, n, s, o, r) => {
    const a = r.beforeClose;
    return (
      await Rs(
        e,
        t,
        n,
        s,
        0,
        a
          ? (i) => {
              const c = a(n.$static$.$contexts$, o, !1, n.$static$.$textNodes$);
              return ye(c, t, n, i, 0, void 0);
            }
          : void 0
      ),
      t
    );
  },
  zi = async (e, t, n, s, o) => {
    s.write(nn);
    const r = e.props.children;
    let a;
    if (fe(r)) {
      const i = r({
        write(c) {
          s.write(c), s.write(nn);
        },
      });
      if (X(i)) return i;
      a = i;
    } else a = r;
    for await (const i of a) await ye(i, t, n, s, o, void 0), s.write(nn);
  },
  Lr = (e, t, n, s, o, r, a, i) => {
    var w;
    const c = e.props,
      u = c['q:renderFn'];
    if (u) return (t.$componentQrl$ = u), Mi(s, o, r, t, e, a, i);
    let p = '<!--qv' + Ri(c);
    const f = 'q:s' in c,
      m = e.key != null ? String(e.key) : null;
    f &&
      ((w = s.$cmpCtx$) == null || w.$id$, (p += ' q:sref=' + s.$cmpCtx$.$id$)),
      m != null && (p += ' q:key=' + m),
      (p += '-->'),
      r.write(p);
    const g = e.props[te];
    if (g) return r.write(g), void r.write(Vn);
    if (n) for (const h of n) Is(h.type, h.props, r);
    const b = Nr(e.children, s, o, r, a);
    return F(b, () => {
      var y;
      if (!f && !i) return void r.write(Vn);
      let h;
      if (f) {
        const k = (y = o.$projectedChildren$) == null ? void 0 : y[m];
        if (k) {
          const [_, v] = o.$projectedCtxs$,
            q = Qt(_);
          (q.$slotCtx$ = t),
            (o.$projectedChildren$[m] = void 0),
            (h = ye(k, q, v, r, a));
        }
      }
      return (
        i && (h = F(h, () => i(r))),
        F(h, () => {
          r.write(Vn);
        })
      );
    });
  },
  Vn = '<!--/qv-->',
  Ii = (e) => {
    let t = '';
    for (const n in e) {
      if (n === te) continue;
      const s = e[n];
      s != null && (t += ' ' + (s === '' ? n : n + '="' + s + '"'));
    }
    return t;
  },
  Ri = (e) => {
    let t = '';
    for (const n in e) {
      if (n === 'children' || n === te) continue;
      const s = e[n];
      s != null && (t += ' ' + (s === '' ? n : n + '=' + s));
    }
    return t;
  },
  Is = (e, t, n) => {
    if ((n.write('<' + e + Ii(t) + '>'), Ir[e])) return;
    const s = t[te];
    s != null && n.write(s), n.write(`</${e}>`);
  },
  Mi = (e, t, n, s, o, r, a) => (
    Di(e, s, o.props.props),
    F(fn(e, s), (i) => {
      const c = s.$element$,
        u = i.rCtx,
        p = we(t.$static$.$locale$, c, void 0);
      (p.$subscriber$ = [0, c]), (p.$renderCtx$ = u);
      const f = {
          $static$: t.$static$,
          $projectedChildren$: Pi(o.children, t),
          $projectedCtxs$: [e, t],
          $invocationContext$: p,
        },
        m = [];
      if (s.$appendStyles$) {
        const h = 4 & r ? t.$static$.$headNodes$ : m;
        for (const y of s.$appendStyles$)
          h.push(
            l(
              'style',
              { [Nn]: y.styleId, [te]: y.content, hidden: '' },
              null,
              null,
              0,
              null
            )
          );
      }
      const g = At(e),
        b = s.$scopeIds$ ? jr(s.$scopeIds$) : void 0,
        w = $(o.type, { 'q:sstyle': b, 'q:id': g, children: i.node }, 0, o.key);
      return (
        (s.$id$ = g),
        t.$static$.$contexts$.push(s),
        Lr(w, s, m, u, f, n, r, (h) => {
          if (s.$flags$ & Oe) {
            const _ = pn(1),
              v = _.li;
            v.push(...s.li), (s.$flags$ &= ~Oe), (_.$id$ = At(e));
            const q = { type: 'placeholder', hidden: '', 'q:id': _.$id$ };
            t.$static$.$contexts$.push(_);
            const E = As(v);
            for (const S of E) {
              const T = Rr(S[0]);
              (q[T] = to(S[1], e.$static$.$containerState$, _)),
                sn(T, e.$static$.$containerState$);
            }
            Is('script', q, h);
          }
          const y = f.$projectedChildren$;
          let k;
          if (y) {
            const _ = Object.keys(y).map((S) => {
                const T = y[S];
                if (T)
                  return l(
                    'q:template',
                    { [he]: S, hidden: '', 'aria-hidden': 'true' },
                    null,
                    T,
                    0,
                    null
                  );
              }),
              [v, q] = f.$projectedCtxs$,
              E = Qt(v);
            (E.$slotCtx$ = s), (k = ye(_, E, q, h, 0, void 0));
          }
          return a ? F(k, () => a(h)) : k;
        })
      );
    })
  ),
  Pi = (e, t) => {
    const n = Ar(e, t);
    if (n === null) return;
    const s = {};
    for (const o of n) {
      let r = '';
      nt(o) && (r = o.props[he] || ''), (s[r] || (s[r] = [])).push(o);
    }
    return s;
  },
  pn = (e) => {
    const t = new Er(e);
    return Pn(t);
  },
  Rs = (e, t, n, s, o, r) => {
    var u;
    const a = e.type,
      i = t.$cmpCtx$;
    if (typeof a == 'string') {
      const p = e.key,
        f = e.props,
        m = e.immutableProps,
        g = pn(1),
        b = g.$element$,
        w = a === 'head';
      let h = '<' + a,
        y = !1,
        k = !1,
        _ = '',
        v = null;
      if (m)
        for (const S in m) {
          let T = m[S];
          if (un(S)) {
            dn(g.li, S, T, void 0);
            continue;
          }
          const A = Io(S);
          if (
            (ne(T) && ((T = je(T, [1, b, T, i.$element$, A])), (y = !0)),
            S === te)
          ) {
            v = T;
            continue;
          }
          S.startsWith(ls) && sn(S.slice(15), t.$static$.$containerState$);
          const C = Ro(A, T);
          C != null &&
            (A === 'class'
              ? (_ = C)
              : A === 'value' && a === 'textarea'
              ? (v = mn(C))
              : Mo(A) || (h += ' ' + (T === '' ? A : A + '="' + Jt(C) + '"')));
        }
      for (const S in f) {
        let T = f[S];
        if (S === 'ref') {
          T !== void 0 && (Ns(T, b), (k = !0));
          continue;
        }
        if (un(S)) {
          dn(g.li, S, T, void 0);
          continue;
        }
        const A = Io(S);
        if (
          (ne(T) && ((T = je(T, [2, i.$element$, T, b, A])), (y = !0)),
          S === te)
        ) {
          v = T;
          continue;
        }
        S.startsWith(ls) && sn(S.slice(15), t.$static$.$containerState$);
        const C = Ro(A, T);
        C != null &&
          (A === 'class'
            ? (_ = C)
            : A === 'value' && a === 'textarea'
            ? (v = mn(C))
            : Mo(A) || (h += ' ' + (T === '' ? A : A + '="' + Jt(C) + '"')));
      }
      const q = g.li;
      if (i) {
        if ((u = i.$scopeIds$) != null && u.length) {
          const S = i.$scopeIds$.join(' ');
          _ = _ ? `${S} ${_}` : S;
        }
        i.$flags$ & Oe && (q.push(...i.li), (i.$flags$ &= ~Oe));
      }
      if (
        (w && (o |= 1),
        a in Fi && (o |= 16),
        a in Oi && (o |= 8),
        _ && (h += ' class="' + Jt(_) + '"'),
        q.length > 0)
      ) {
        const S = As(q),
          T = (16 & o) != 0;
        for (const A of S) {
          const C = T ? Rr(A[0]) : A[0];
          (h +=
            ' ' + C + '="' + to(A[1], t.$static$.$containerState$, g) + '"'),
            sn(C, t.$static$.$containerState$);
        }
      }
      if (
        (p != null && (h += ' q:key="' + Jt(p) + '"'), k || y || q.length > 0)
      ) {
        if (k || y || Wi(q)) {
          const S = At(t);
          (h += ' q:id="' + S + '"'), (g.$id$ = S);
        }
        n.$static$.$contexts$.push(g);
      }
      if ((1 & o && (h += ' q:head'), (h += '>'), s.write(h), a in Ir)) return;
      if (v != null) return s.write(String(v)), void s.write(`</${a}>`);
      a === 'html' ? (o |= 4) : (o &= -5), e.flags & It && (o |= 1024);
      const E = ye(e.children, t, n, s, o);
      return F(E, () => {
        if (w) {
          for (const S of n.$static$.$headNodes$) Is(S.type, S.props, s);
          n.$static$.$headNodes$.length = 0;
        }
        if (r)
          return F(r(s), () => {
            s.write(`</${a}>`);
          });
        s.write(`</${a}>`);
      });
    }
    if (a === De) {
      const p = pn(111);
      return (
        (p.$parentCtx$ = t.$slotCtx$ || t.$cmpCtx$),
        i && i.$flags$ & Ws && Qi(i, p),
        Lr(e, p, void 0, t, n, s, o, r)
      );
    }
    if (a === Mr) return void s.write(e.props.data);
    if (a === Pr) return zi(e, t, n, s, o);
    const c = ae(n.$invocationContext$, a, e.props, e.key, e.flags, e.dev);
    return ol(c, e)
      ? Rs($(De, { children: c }, 0, e.key), t, n, s, o, r)
      : ye(c, t, n, s, o, r);
  },
  ye = (e, t, n, s, o, r) => {
    var a;
    if (e != null && typeof e != 'boolean') {
      if (!Me(e) && typeof e != 'number') {
        if (nt(e)) return Rs(e, t, n, s, o, r);
        if (B(e)) return Nr(e, t, n, s, o);
        if (ne(e)) {
          const i = 8 & o,
            c = (a = t.$cmpCtx$) == null ? void 0 : a.$element$;
          let u;
          if (c) {
            if (!i) {
              const p = At(t);
              if (
                ((u = je(
                  e,
                  1024 & o ? [3, '#' + p, e, '#' + p] : [4, c, e, '#' + p]
                )),
                Me(u))
              ) {
                const f = zt(u);
                n.$static$.$textNodes$.set(f, p);
              }
              return (
                s.write(`<!--t=${p}-->`),
                ye(u, t, n, s, o, r),
                void s.write('<!---->')
              );
            }
            u = ae(n.$invocationContext$, () => e.value);
          }
          return void s.write(mn(zt(u)));
        }
        return X(e)
          ? (s.write(nn), e.then((i) => ye(i, t, n, s, o, r)))
          : void Tt();
      }
      s.write(mn(String(e)));
    }
  },
  Nr = (e, t, n, s, o) => {
    if (e == null) return;
    if (!B(e)) return ye(e, t, n, s, o);
    const r = e.length;
    if (r === 1) return ye(e[0], t, n, s, o);
    if (r === 0) return;
    let a = 0;
    const i = [];
    return e.reduce((c, u, p) => {
      const f = [];
      i.push(f);
      const m = ye(
          u,
          t,
          n,
          c
            ? {
                write(b) {
                  a === p ? s.write(b) : f.push(b);
                },
              }
            : s,
          o
        ),
        g = () => {
          a++, i.length > a && i[a].forEach((b) => s.write(b));
        };
      return X(m) && c
        ? Promise.all([m, c]).then(g)
        : X(m)
        ? m.then(g)
        : c
        ? c.then(g)
        : void a++;
    }, void 0);
  },
  Ar = (e, t) => {
    if (e == null) return null;
    const n = zr(e, t),
      s = B(n) ? n : [n];
    return s.length === 0 ? null : s;
  },
  zr = (e, t) => {
    if (e == null) return null;
    if (B(e)) return e.flatMap((n) => zr(n, t));
    if (
      nt(e) &&
      fe(e.type) &&
      e.type !== Mr &&
      e.type !== Pr &&
      e.type !== De
    ) {
      const n = ae(t.$invocationContext$, e.type, e.props, e.key, e.flags);
      return Ar(n, t);
    }
    return e;
  },
  Di = (e, t, n) => {
    const s = Object.keys(n),
      o = zn();
    if (((t.$props$ = Wt(o, e.$static$.$containerState$)), s.length === 0))
      return;
    const r = (o[d] = n[d] ?? oe);
    for (const a of s)
      a !== 'children' &&
        a !== he &&
        (ne(r[a]) ? (o['$$' + a] = r[a]) : (o[a] = n[a]));
  },
  Io = (e) => (e === 'htmlFor' ? 'for' : e),
  Ro = (e, t) =>
    e === 'class'
      ? hn(t)
      : e === 'style'
      ? Dn(t)
      : sl(e) || e === 'draggable' || e === 'spellcheck'
      ? t != null
        ? String(t)
        : t
      : t === !1 || t == null
      ? null
      : t === !0
      ? ''
      : String(t),
  Fi = { head: !0, style: !0, script: !0, link: !0, meta: !0 },
  Oi = { title: !0, style: !0, script: !0, noframes: !0, textarea: !0 },
  Ir = {
    area: !0,
    base: !0,
    basefont: !0,
    bgsound: !0,
    br: !0,
    col: !0,
    embed: !0,
    frame: !0,
    hr: !0,
    img: !0,
    input: !0,
    keygen: !0,
    link: !0,
    meta: !0,
    param: !0,
    source: !0,
    track: !0,
    wbr: !0,
  },
  Hi = /[&<>]/g,
  Ui = /[&"]/g,
  sn = (e, t) => {
    t.$events$.add(_r(e));
  },
  mn = (e) =>
    e.replace(Hi, (t) => {
      switch (t) {
        case '&':
          return '&amp;';
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        default:
          return '';
      }
    }),
  Jt = (e) =>
    e.replace(Ui, (t) => {
      switch (t) {
        case '&':
          return '&amp;';
        case '"':
          return '&quot;';
        default:
          return '';
      }
    }),
  Bi = /[>/="'\u0009\u000a\u000c\u0020]/,
  Mo = (e) => Bi.test(e),
  Wi = (e) => e.some((t) => t[1].$captureRef$ && t[1].$captureRef$.length > 0),
  Qi = (e, t) => {
    const n = e.$dynamicSlots$ || (e.$dynamicSlots$ = []);
    n.includes(t) || n.push(t);
  },
  Rr = (e) => (e === 'on:qvisible' ? 'on-document:qinit' : e),
  l = (e, t, n, s, o, r) => {
    const a = r == null ? null : String(r);
    return new wt(e, t || oe, n, s, o, a);
  },
  Zn = (e, t, n, s, o, r) => {
    let a = null;
    return (
      t && 'children' in t && ((a = t.children), delete t.children),
      l(e, t, n, a, s, o)
    );
  },
  $ = (e, t, n, s, o) => {
    const r = s == null ? null : String(s),
      a = t ?? oe;
    if (typeof e == 'string' && d in a) {
      const c = {};
      for (const [u, p] of Object.entries(a[d])) c[u] = p === d ? a[u] : p;
      return l(e, null, c, a.children, n, s);
    }
    const i = new wt(e, a, null, a.children, n, r);
    return typeof e == 'string' && t && delete t.children, i;
  },
  ce = (e, t, n) => {
    const s = n == null ? null : String(n),
      o = el(() => {
        const a = t.children;
        return typeof e == 'string' && delete t.children, a;
      });
    return (
      Me(e) &&
        'className' in t &&
        ((t.class = t.className), delete t.className),
      new wt(e, t, null, o, 0, s)
    );
  };
class wt {
  constructor(t, n, s, o, r, a = null) {
    (this.type = t),
      (this.props = n),
      (this.immutableProps = s),
      (this.children = o),
      (this.flags = r),
      (this.key = a);
  }
}
const De = (e) => e.children,
  nt = (e) => e instanceof wt,
  $e = (e) => e.children,
  Ms = Symbol('skip render'),
  Mr = () => null,
  Pr = () => null,
  Ps = (e, t, n) => {
    const s = !(t.$flags$ & Bs),
      o = t.$element$,
      r = e.$static$.$containerState$;
    return (
      r.$hostsStaging$.delete(t),
      r.$subsManager$.$clearSub$(o),
      F(fn(e, t), (a) => {
        const i = e.$static$,
          c = a.rCtx,
          u = we(e.$static$.$locale$, o);
        if (
          (i.$hostElements$.add(o),
          (u.$subscriber$ = [0, o]),
          (u.$renderCtx$ = c),
          s && t.$appendStyles$)
        )
          for (const f of t.$appendStyles$) nu(i, f);
        const p = Fe(a.node, u);
        return F(p, (f) => {
          const m = Ki(o, f),
            g = Ds(t);
          return F($n(c, g, m, n), () => {
            t.$vdom$ = m;
          });
        });
      })
    );
  },
  Ds = (e) => (e.$vdom$ || (e.$vdom$ = bn(e.$element$)), e.$vdom$);
class Ae {
  constructor(t, n, s, o, r, a) {
    (this.$type$ = t),
      (this.$props$ = n),
      (this.$immutableProps$ = s),
      (this.$children$ = o),
      (this.$flags$ = r),
      (this.$key$ = a),
      (this.$elm$ = null),
      (this.$text$ = ''),
      (this.$signal$ = null),
      (this.$id$ = t + (a ? ':' + a : ''));
  }
}
const Dr = (e, t) => {
    const {
      key: n,
      type: s,
      props: o,
      children: r,
      flags: a,
      immutableProps: i,
    } = e;
    let c = '';
    if (Me(s)) c = s;
    else {
      if (s !== De) {
        if (fe(s)) {
          const p = ae(t, s, o, n, a, e.dev);
          return ol(p, e) ? Dr($(De, { children: p }, 0, n), t) : Fe(p, t);
        }
        throw Y(25, s);
      }
      c = gt;
    }
    let u = Se;
    return r != null
      ? F(
          Fe(r, t),
          (p) => (
            p !== void 0 && (u = B(p) ? p : [p]), new Ae(c, o, i, u, a, n)
          )
        )
      : new Ae(c, o, i, u, a, n);
  },
  Ki = (e, t) => {
    const n = t === void 0 ? Se : B(t) ? t : [t],
      s = new Ae(':virtual', {}, null, n, 0, null);
    return (s.$elm$ = e), s;
  },
  Fe = (e, t) => {
    if (e != null && typeof e != 'boolean') {
      if (Fr(e)) {
        const n = new Ae('#text', oe, null, Se, 0, null);
        return (n.$text$ = String(e)), n;
      }
      if (nt(e)) return Dr(e, t);
      if (ne(e)) {
        const n = new Ae('#signal', oe, null, Se, 0, null);
        return (n.$signal$ = e), n;
      }
      if (B(e)) {
        const n = Ts(e.flatMap((s) => Fe(s, t)));
        return F(n, (s) => s.flat(100).filter(vr));
      }
      return X(e)
        ? e.then((n) => Fe(n, t))
        : e === Ms
        ? new Ae(':skipRender', oe, null, Se, 0, null)
        : void Tt();
    }
  },
  Fr = (e) => Me(e) || typeof e == 'number',
  Or = (e) => {
    ve(e, 'q:container') === 'paused' && (Yi(e), nc(e));
  },
  Vi = (e) => {
    const t = Ut(e),
      n = ec(e === t.documentElement ? t.body : e, 'type');
    if (n) return JSON.parse(Xi(n.firstChild.data) || '{}');
  },
  Zi = (e, t) => {
    const n = JSON.parse(e);
    if (typeof n != 'object') return null;
    const { _objs: s, _entry: o } = n;
    if (s === void 0 || o === void 0) return null;
    let r = {},
      a = {};
    if (Ue(t) && We(t)) {
      const u = Qs(t);
      u && ((a = bt(u)), (r = u.ownerDocument));
    }
    const i = kl(a, r);
    for (let u = 0; u < s.length; u++) {
      const p = s[u];
      Me(p) && (s[u] = p === Hn ? void 0 : i.prepare(p));
    }
    const c = (u) => s[ke(u)];
    for (const u of s) Hr(u, c, i);
    return c(o);
  },
  Yi = (e) => {
    if (!$i(e)) return void Tt();
    const t = e._qwikjson_ ?? Vi(e);
    if (((e._qwikjson_ = null), !t)) return void Tt();
    const n = Ut(e),
      s = Ji(e),
      o = bt(e),
      r = new Map(),
      a = new Map();
    let i = null,
      c = 0;
    const u = n.createTreeWalker(e, 128);
    for (; (i = u.nextNode()); ) {
      const h = i.data;
      if (c === 0) {
        if (h.startsWith('qv ')) {
          const y = sc(h);
          y >= 0 && r.set(y, i);
        } else if (h.startsWith('t=')) {
          const y = h.slice(2),
            k = ke(y),
            _ = tc(i);
          r.set(k, _), a.set(k, _.data);
        }
      }
      h === 'cq' ? c++ : h === '/cq' && c--;
    }
    const p = e.getElementsByClassName('qc📦').length !== 0;
    e.querySelectorAll('[q\\:id]').forEach((h) => {
      if (p && h.closest('[q\\:container]') !== e) return;
      const y = ve(h, 'q:id'),
        k = ke(y);
      r.set(k, h);
    });
    const f = kl(o, n),
      m = new Map(),
      g = new Set(),
      b = (h) => (
        typeof h == 'string' && h.length > 0, m.has(h) ? m.get(h) : w(h)
      ),
      w = (h) => {
        if (h.startsWith('#')) {
          const q = h.slice(1),
            E = ke(q);
          r.has(E);
          const S = r.get(E);
          if (Ot(S)) {
            if (!S.isConnected) return void m.set(h, void 0);
            const T = Vt(S);
            return m.set(h, T), le(T, o), T;
          }
          return Be(S) ? (m.set(h, S), le(S, o), S) : (m.set(h, S), S);
        }
        if (h.startsWith('@')) {
          const q = h.slice(1),
            E = ke(q);
          return s[E];
        }
        if (h.startsWith('*')) {
          const q = h.slice(1),
            E = ke(q);
          r.has(E);
          const S = a.get(E);
          return m.set(h, S), S;
        }
        const y = ke(h),
          k = t.objs;
        k.length > y;
        let _ = k[y];
        Me(_) && (_ = _ === Hn ? void 0 : f.prepare(_));
        let v = _;
        for (let q = h.length - 1; q >= 0; q--) {
          const E = ad[h[q]];
          if (!E) break;
          v = E(v, o);
        }
        return (
          m.set(h, v),
          Fr(_) ||
            g.has(y) ||
            (g.add(y), Gi(_, y, t.subs, b, o, f), Hr(_, b, f)),
          v
        );
      };
    (o.$elementIndex$ = 1e5),
      (o.$pauseCtx$ = { getObject: b, meta: t.ctx, refs: t.refs }),
      me(e, 'q:container', 'resumed'),
      xi(e, 'qresume', void 0, !0);
  },
  Gi = (e, t, n, s, o, r) => {
    const a = n[t];
    if (a) {
      const i = [];
      let c = 0;
      for (const u of a)
        if (u.startsWith('_')) c = parseInt(u.slice(1), 10);
        else {
          const p = fd(u, s);
          p && i.push(p);
        }
      if ((c > 0 && In(e, c), !r.subs(e, i))) {
        const u = o.$proxyMap$.get(e);
        u ? re(u).$addSubs$(i) : Wt(e, o, i);
      }
    }
  },
  Hr = (e, t, n) => {
    if (!n.fill(e, t) && e && typeof e == 'object') {
      if (B(e)) for (let s = 0; s < e.length; s++) e[s] = t(e[s]);
      else if (Ht(e)) for (const s in e) e[s] = t(e[s]);
    }
  },
  Xi = (e) => e.replace(/\\x3C(\/?script)/g, '<$1'),
  Ji = (e) => e.qFuncs ?? Se,
  ec = (e, t) => {
    let n = e.lastElementChild;
    for (; n; ) {
      if (n.tagName === 'SCRIPT' && ve(n, t) === 'qwik/json') return n;
      n = n.previousElementSibling;
    }
  },
  tc = (e) => {
    const t = e.nextSibling;
    if (Ss(t)) return t;
    {
      const n = e.ownerDocument.createTextNode('');
      return e.parentElement.insertBefore(n, e), n;
    }
  },
  nc = (e) => {
    e.qwik = { pause: () => bu(e), state: bt(e) };
  },
  sc = (e) => {
    const t = e.indexOf('q:id=');
    return t > 0 ? ke(e.slice(t + 5)) : -1;
  },
  Ie = () => {
    const e = Tc();
    let t = e.$qrl$;
    if (t) t.$captureRef$;
    else {
      const n = e.$element$,
        s = Qs(n);
      (t = On(decodeURIComponent(String(e.$url$)), s)), Or(s);
      const o = le(n, bt(s));
      _l(t, o);
    }
    return t.$captureRef$;
  },
  oc = (e, t) => {
    try {
      const n = t[0],
        s = e.$static$;
      switch (n) {
        case 1:
        case 2: {
          let o, r;
          n === 1 ? ((o = t[1]), (r = t[3])) : ((o = t[3]), (r = t[1]));
          const a = ge(o);
          if (a == null) return;
          const i = t[4],
            c = o.namespaceURI === Kt;
          s.$containerState$.$subsManager$.$clearSignal$(t);
          let u = je(t[2], t.slice(0, -1));
          i === 'class' ? (u = Ks(u, ge(r))) : i === 'style' && (u = Dn(u));
          const p = Ds(a);
          return i in p.$props$ && p.$props$[i] === u
            ? void 0
            : ((p.$props$[i] = u), Zs(s, o, i, u, c));
        }
        case 3:
        case 4: {
          const o = t[3];
          if (!s.$visited$.includes(o)) {
            s.$containerState$.$subsManager$.$clearSignal$(t);
            const r = void 0;
            let a = je(t[2], t.slice(0, -1));
            const i = yd();
            Array.isArray(a) && (a = new wt(De, {}, null, a, 0, null));
            let c = Fe(a, r);
            if (X(c)) et('Rendering promises in JSX signals is not supported');
            else {
              c === void 0 && (c = Fe('', r));
              const u = ll(o),
                p = rc(t[1]);
              if (
                ((e.$cmpCtx$ = le(p, e.$static$.$containerState$)),
                u.$type$ == c.$type$ && u.$key$ == c.$key$ && u.$id$ == c.$id$)
              )
                lt(e, u, c, 0);
              else {
                const f = [],
                  m = u.$elm$,
                  g = Xe(e, c, 0, f);
                f.length &&
                  et('Rendering promises in JSX signals is not supported'),
                  (i[3] = g),
                  ut(e.$static$, o.parentElement, g, m),
                  m && Gs(s, m);
              }
            }
          }
        }
      }
    } catch {}
  };
function rc(e) {
  for (; e; ) {
    if (We(e)) return e;
    e = e.parentElement;
  }
  throw new Error('Not found');
}
const lc = (e, t) => {
    if (e[0] === 0) {
      const n = e[1];
      Us(n) ? Fs(n, t) : ac(n, t);
    } else ic(e, t);
  },
  ac = (e, t) => {
    const n = ze();
    n || Or(t.$containerEl$);
    const s = le(e, t);
    if ((s.$componentQrl$, !(s.$flags$ & ht)))
      if (((s.$flags$ |= ht), t.$hostsRendering$ !== void 0))
        t.$hostsStaging$.add(s);
      else {
        if (n) return void Tt();
        t.$hostsNext$.add(s), Os(t);
      }
  },
  ic = (e, t) => {
    const n = t.$hostsRendering$ !== void 0;
    t.$opsNext$.add(e), n || Os(t);
  },
  Fs = (e, t) => {
    e.$flags$ & tt ||
      ((e.$flags$ |= tt),
      t.$hostsRendering$ !== void 0
        ? t.$taskStaging$.add(e)
        : (t.$taskNext$.add(e), Os(t)));
  },
  Os = (e) => (
    e.$renderPromise$ === void 0 &&
      (e.$renderPromise$ = En().nextTick(() => Ur(e))),
    e.$renderPromise$
  ),
  cc = () => {
    const [e] = Ie();
    Fs(e, bt(Qs(e.$el$)));
  },
  Ur = async (e) => {
    const t = e.$containerEl$,
      n = Ut(t);
    try {
      const s = tl(n, e),
        o = s.$static$,
        r = (e.$hostsRendering$ = new Set(e.$hostsNext$));
      e.$hostsNext$.clear(),
        await dc(e, s),
        e.$hostsStaging$.forEach((c) => {
          r.add(c);
        }),
        e.$hostsStaging$.clear();
      const a = Array.from(e.$opsNext$);
      e.$opsNext$.clear();
      const i = Array.from(r);
      mc(i),
        !e.$styleMoved$ &&
          i.length > 0 &&
          ((e.$styleMoved$ = !0),
          (t === n.documentElement ? n.body : t)
            .querySelectorAll('style[q\\:style]')
            .forEach((c) => {
              e.$styleIds$.add(ve(c, Nn)), fl(o, n.head, c);
            }));
      for (const c of i) {
        const u = c.$element$;
        if (!o.$hostElements$.has(u) && c.$componentQrl$) {
          u.isConnected, o.$roots$.push(c);
          try {
            await Ps(s, c, uc(u.parentElement));
          } catch (p) {
            et(p);
          }
        }
      }
      return (
        a.forEach((c) => {
          oc(s, c);
        }),
        o.$operations$.push(...o.$postOperations$),
        o.$operations$.length === 0
          ? (Bo(o), void (await Po(e, s)))
          : (await Zc(o), Bo(o), Po(e, s))
      );
    } catch (s) {
      et(s);
    }
  },
  uc = (e) => {
    let t = 0;
    return (
      e &&
        (e.namespaceURI === Kt && (t |= ue), e.tagName === 'HEAD' && (t |= gn)),
      t
    );
  },
  Po = async (e, t) => {
    const n = t.$static$.$hostElements$;
    await pc(e, t, (s, o) => (s.$flags$ & Wr) != 0 && (!o || n.has(s.$el$))),
      e.$hostsStaging$.forEach((s) => {
        e.$hostsNext$.add(s);
      }),
      e.$hostsStaging$.clear(),
      (e.$hostsRendering$ = void 0),
      (e.$renderPromise$ = void 0),
      e.$hostsNext$.size + e.$taskNext$.size + e.$opsNext$.size > 0 &&
        (e.$renderPromise$ = Ur(e));
  },
  dc = async (e, t) => {
    const n = e.$containerEl$,
      s = [],
      o = [],
      r = (i) => (i.$flags$ & Qr) != 0,
      a = (i) => (i.$flags$ & Kr) != 0;
    e.$taskNext$.forEach((i) => {
      r(i) &&
        (o.push(F(i.$qrl$.$resolveLazy$(n), () => i)), e.$taskNext$.delete(i)),
        a(i) &&
          (s.push(F(i.$qrl$.$resolveLazy$(n), () => i)),
          e.$taskNext$.delete(i));
    });
    do
      if (
        (e.$taskStaging$.forEach((i) => {
          r(i)
            ? o.push(F(i.$qrl$.$resolveLazy$(n), () => i))
            : a(i)
            ? s.push(F(i.$qrl$.$resolveLazy$(n), () => i))
            : e.$taskNext$.add(i);
        }),
        e.$taskStaging$.clear(),
        o.length > 0)
      ) {
        const i = await Promise.all(o);
        us(i), await Promise.all(i.map((c) => ds(c, e, t))), (o.length = 0);
      }
    while (e.$taskStaging$.size > 0);
    if (s.length > 0) {
      const i = await Promise.all(s);
      us(i), i.forEach((c) => ds(c, e, t));
    }
  },
  pc = async (e, t, n) => {
    const s = [],
      o = e.$containerEl$;
    e.$taskNext$.forEach((r) => {
      n(r, !1) &&
        (r.$el$.isConnected && s.push(F(r.$qrl$.$resolveLazy$(o), () => r)),
        e.$taskNext$.delete(r));
    });
    do
      if (
        (e.$taskStaging$.forEach((r) => {
          r.$el$.isConnected &&
            (n(r, !0)
              ? s.push(F(r.$qrl$.$resolveLazy$(o), () => r))
              : e.$taskNext$.add(r));
        }),
        e.$taskStaging$.clear(),
        s.length > 0)
      ) {
        const r = await Promise.all(s);
        us(r);
        for (const a of r) ds(a, e, t);
        s.length = 0;
      }
    while (e.$taskStaging$.size > 0);
  },
  mc = (e) => {
    e.sort((t, n) =>
      2 & t.$element$.compareDocumentPosition(vn(n.$element$)) ? 1 : -1
    );
  },
  us = (e) => {
    e.sort((t, n) =>
      t.$el$ === n.$el$
        ? t.$index$ < n.$index$
          ? -1
          : 1
        : 2 & t.$el$.compareDocumentPosition(vn(n.$el$))
        ? 1
        : -1
    );
  },
  st = () => {
    const e = Xr(),
      t = le(e.$hostElement$, e.$renderCtx$.$static$.$containerState$),
      n = t.$seq$ || (t.$seq$ = []),
      s = e.$i$++;
    return { val: n[s], set: (o) => (n[s] = o), i: s, iCtx: e, elCtx: t };
  },
  Ee = (e) => Object.freeze({ id: Es(e) }),
  Le = (e, t) => {
    const { val: n, set: s, elCtx: o } = st();
    if (n !== void 0) return;
    (o.$contexts$ || (o.$contexts$ = new Map())).set(e.id, t), s(!0);
  },
  Rn = (e, t) => {
    const { val: n, set: s, iCtx: o, elCtx: r } = st();
    if (n !== void 0) return n;
    const a = Br(e, r, o.$renderCtx$.$static$.$containerState$);
    if (typeof t == 'function') return s(ae(void 0, t, a));
    if (a !== void 0) return s(a);
    if (t !== void 0) return s(t);
    throw Y(13, e.id);
  },
  fc = (e, t) => {
    var o;
    let n = e,
      s = 1;
    for (; n && !((o = n.hasAttribute) != null && o.call(n, 'q:container')); ) {
      for (; (n = n.previousSibling); )
        if (Ot(n)) {
          const r = n.__virtual;
          if (r) {
            const a = r[An];
            if (n === r.open) return a ?? le(r, t);
            if (a != null && a.$parentCtx$) return a.$parentCtx$;
            n = r;
            continue;
          }
          if (n.data === '/qv') s++;
          else if (n.data.startsWith('qv ') && (s--, s === 0))
            return le(Vt(n), t);
        }
      (n = e.parentElement), (e = n);
    }
    return null;
  },
  hc = (e, t) => (
    e.$parentCtx$ === void 0 && (e.$parentCtx$ = fc(e.$element$, t)),
    e.$parentCtx$
  ),
  Br = (e, t, n) => {
    var r;
    const s = e.id;
    if (!t) return;
    let o = t;
    for (; o; ) {
      const a = (r = o.$contexts$) == null ? void 0 : r.get(s);
      if (a) return a;
      o = hc(o, n);
    }
  },
  gc = Ee('qk-error'),
  Hs = (e, t, n) => {
    const s = ge(t);
    if (ze()) throw e;
    {
      const o = Br(gc, s, n.$static$.$containerState$);
      if (o === void 0) throw e;
      o.error = e;
    }
  },
  Wr = 1,
  Qr = 2,
  Kr = 4,
  tt = 16,
  Vr = (e, t) => {
    const { val: n, set: s, iCtx: o, i: r, elCtx: a } = st();
    if (n) return;
    const i = o.$renderCtx$.$static$.$containerState$,
      c = new Mn(tt | Qr, r, a.$element$, e, void 0);
    s(!0),
      e.$resolveLazy$(i.$containerEl$),
      a.$tasks$ || (a.$tasks$ = []),
      a.$tasks$.push(c),
      Lc(o, () => Yr(c, i, o.$renderCtx$)),
      ze() && ps(c, t == null ? void 0 : t.eagerness);
  },
  yc = (e, t) => {
    const { val: n, set: s, i: o, iCtx: r, elCtx: a } = st(),
      i = (t == null ? void 0 : t.strategy) ?? 'intersection-observer';
    if (n) return void (ze() && ps(n, i));
    const c = new Mn(Wr, o, a.$element$, e, void 0),
      u = r.$renderCtx$.$static$.$containerState$;
    a.$tasks$ || (a.$tasks$ = []),
      a.$tasks$.push(c),
      s(c),
      ps(c, i),
      ze() || (e.$resolveLazy$(u.$containerEl$), Fs(c, u));
  },
  Zr = (e) => (e.$flags$ & Kr) != 0,
  $c = (e) => (8 & e.$flags$) != 0,
  ds = async (e, t, n) => (
    e.$flags$ & tt, Zr(e) ? bc(e, t, n) : $c(e) ? wc(e, t, n) : Yr(e, t, n)
  ),
  bc = (e, t, n, s) => {
    (e.$flags$ &= ~tt), Nt(e);
    const o = we(n.$static$.$locale$, e.$el$, void 0, 'qTask'),
      { $subsManager$: r } = t;
    o.$renderCtx$ = n;
    const a = e.$qrl$.getFn(o, () => {
        r.$clearSub$(e);
      }),
      i = [],
      c = e.$state$,
      u = Yt(c),
      p = {
        track: (y, k) => {
          if (fe(y)) {
            const v = we();
            return (v.$renderCtx$ = n), (v.$subscriber$ = [0, e]), ae(v, y);
          }
          const _ = re(y);
          return (
            _ ? _.$addSub$([0, e], k) : qs(Tn(26), y),
            k ? y[k] : ne(y) ? y.value : y
          );
        },
        cleanup(y) {
          i.push(y);
        },
        cache(y) {
          let k = 0;
          (k = y === 'immutable' ? 1 / 0 : y), (c._cache = k);
        },
        previous: u._resolved,
      };
    let f,
      m,
      g = !1;
    const b = (y, k) =>
      !g &&
      ((g = !0),
      y
        ? ((g = !0),
          (c.loading = !1),
          (c._state = 'resolved'),
          (c._resolved = k),
          (c._error = void 0),
          f(k))
        : ((g = !0),
          (c.loading = !1),
          (c._state = 'rejected'),
          (c._error = k),
          m(k)),
      !0);
    ae(o, () => {
      (c._state = 'pending'),
        (c.loading = !ze()),
        (c.value = new Promise((y, k) => {
          (f = y), (m = k);
        }));
    }),
      (e.$destroy$ = Zt(() => {
        (g = !0), i.forEach((y) => y());
      }));
    const w = Ln(
        () => F(s, () => a(p)),
        (y) => {
          b(!0, y);
        },
        (y) => {
          b(!1, y);
        }
      ),
      h = u._timeout;
    return h > 0
      ? Promise.race([
          w,
          gi(h).then(() => {
            b(!1, new Error('timeout')) && Nt(e);
          }),
        ])
      : w;
  },
  Yr = (e, t, n) => {
    (e.$flags$ &= ~tt), Nt(e);
    const s = e.$el$,
      o = we(n.$static$.$locale$, s, void 0, 'qTask');
    o.$renderCtx$ = n;
    const { $subsManager$: r } = t,
      a = e.$qrl$.getFn(o, () => {
        r.$clearSub$(e);
      }),
      i = [];
    e.$destroy$ = Zt(() => {
      i.forEach((u) => u());
    });
    const c = {
      track: (u, p) => {
        if (fe(u)) {
          const m = we();
          return (m.$subscriber$ = [0, e]), ae(m, u);
        }
        const f = re(u);
        return (
          f ? f.$addSub$([0, e], p) : qs(Tn(26), u),
          p ? u[p] : ne(u) ? u.value : u
        );
      },
      cleanup(u) {
        i.push(u);
      },
    };
    return Ln(
      () => a(c),
      (u) => {
        fe(u) && i.push(u);
      },
      (u) => {
        Hs(u, s, n);
      }
    );
  },
  wc = (e, t, n) => {
    e.$state$, (e.$flags$ &= ~tt), Nt(e);
    const s = e.$el$,
      o = we(n.$static$.$locale$, s, void 0, 'qComputed');
    (o.$subscriber$ = [0, e]), (o.$renderCtx$ = n);
    const { $subsManager$: r } = t,
      a = e.$qrl$.getFn(o, () => {
        r.$clearSub$(e);
      });
    return Ln(
      a,
      (i) =>
        el(() => {
          const c = e.$state$;
          (c[Et] &= -3), (c.untrackedValue = i), c[qe].$notifySubs$();
        }),
      (i) => {
        Hs(i, s, n);
      }
    );
  },
  Nt = (e) => {
    const t = e.$destroy$;
    if (t) {
      e.$destroy$ = void 0;
      try {
        t();
      } catch (n) {
        et(n);
      }
    }
  },
  Gr = (e) => {
    32 & e.$flags$ ? ((e.$flags$ &= -33), (0, e.$qrl$)()) : Nt(e);
  },
  ps = (e, t) => {
    t === 'visible' || t === 'intersection-observer'
      ? _i('qvisible', Yn(e))
      : t === 'load' || t === 'document-ready'
      ? zo('qinit', Yn(e))
      : (t !== 'idle' && t !== 'document-idle') || zo('qidle', Yn(e));
  },
  Yn = (e) => {
    const t = e.$qrl$;
    return Bn(t.$chunk$, '_hW', cc, null, null, [e], t.$symbol$);
  },
  Us = (e) => Te(e) && e instanceof Mn,
  vc = (e, t) => {
    let n = `${Pe(e.$flags$)} ${Pe(e.$index$)} ${t(e.$qrl$)} ${t(e.$el$)}`;
    return e.$state$ && (n += ` ${t(e.$state$)}`), n;
  },
  _c = (e) => {
    const [t, n, s, o, r] = e.split(' ');
    return new Mn(ke(t), ke(n), o, s, r);
  };
class Mn {
  constructor(t, n, s, o, r) {
    (this.$flags$ = t),
      (this.$index$ = n),
      (this.$el$ = s),
      (this.$qrl$ = o),
      (this.$state$ = r);
  }
}
function xc(e) {
  return kc(e) && e.nodeType === 1;
}
function kc(e) {
  return e && typeof e.nodeType == 'number';
}
const ht = 1,
  Oe = 2,
  Bs = 4,
  Ws = 8,
  ge = (e) => e[An],
  le = (e, t) => {
    const n = ge(e);
    if (n) return n;
    const s = Pn(e),
      o = ve(e, 'q:id');
    if (o) {
      const r = t.$pauseCtx$;
      if (((s.$id$ = o), r)) {
        const { getObject: a, meta: i, refs: c } = r;
        if (xc(e)) {
          const u = c[o];
          u &&
            ((s.$refMap$ = u.split(' ').map(a)),
            (s.li = vi(s, t.$containerEl$)));
        } else {
          const u = e.getAttribute('q:sstyle');
          s.$scopeIds$ = u ? u.split('|') : null;
          const p = i[o];
          if (p) {
            const f = p.s,
              m = p.h,
              g = p.c,
              b = p.w;
            if (
              (f && (s.$seq$ = f.split(' ').map(a)),
              b && (s.$tasks$ = b.split(' ').map(a)),
              g)
            ) {
              s.$contexts$ = new Map();
              for (const w of g.split(' ')) {
                const [h, y] = w.split('=');
                s.$contexts$.set(h, a(y));
              }
            }
            if (m) {
              const [w, h] = m.split(' ');
              if (((s.$flags$ = Bs), w && (s.$componentQrl$ = a(w)), h)) {
                const y = a(h);
                (s.$props$ = y), In(y, 2), (y[d] = Sc(y));
              } else s.$props$ = Wt(zn(), t);
            }
          }
        }
      }
    }
    return s;
  },
  Sc = (e) => {
    const t = {},
      n = ot(e);
    for (const s in n) s.startsWith('$$') && (t[s.slice(2)] = n[s]);
    return t;
  },
  Pn = (e) => {
    const t = {
      $flags$: 0,
      $id$: '',
      $element$: e,
      $refMap$: [],
      li: [],
      $tasks$: null,
      $seq$: null,
      $slots$: null,
      $scopeIds$: null,
      $appendStyles$: null,
      $props$: null,
      $vdom$: null,
      $componentQrl$: null,
      $contexts$: null,
      $dynamicSlots$: null,
      $parentCtx$: void 0,
    };
    return (e[An] = t), t;
  },
  qc = (e, t) => {
    var n;
    (n = e.$tasks$) == null ||
      n.forEach((s) => {
        t.$clearSub$(s), Gr(s);
      }),
      (e.$componentQrl$ = null),
      (e.$seq$ = null),
      (e.$tasks$ = null);
  };
let dt;
function Cc(e) {
  if (dt === void 0) {
    const t = be();
    if (t && t.$locale$) return t.$locale$;
    if (e !== void 0) return e;
    throw new Error('Reading `locale` outside of context.');
  }
  return dt;
}
function Do(e, t) {
  const n = dt;
  try {
    return (dt = e), t();
  } finally {
    dt = n;
  }
}
function jc(e) {
  dt = e;
}
let Ct;
const be = () => {
    if (!Ct) {
      const e = typeof document < 'u' && document && document.__q_context__;
      return e ? (B(e) ? (document.__q_context__ = Jr(e)) : e) : void 0;
    }
    return Ct;
  },
  Tc = () => {
    const e = be();
    if (!e) throw Y(14);
    return e;
  },
  Xr = () => {
    const e = be();
    if (!e || e.$event$ !== 'qRender') throw Y(20);
    return e.$hostElement$, e.$waitOn$, e.$renderCtx$, e.$subscriber$, e;
  };
function ae(e, t, ...n) {
  return Ec.call(this, e, t, n);
}
function Ec(e, t, n) {
  const s = Ct;
  let o;
  try {
    (Ct = e), (o = t.apply(this, n));
  } finally {
    Ct = s;
  }
  return o;
}
const Lc = (e, t) => {
    const n = e.$waitOn$;
    if (n.length === 0) {
      const s = t();
      X(s) && n.push(s);
    } else n.push(Promise.all(n).then(t));
  },
  Jr = ([e, t, n]) => {
    const s = e.closest('[q\\:container]'),
      o = (s == null ? void 0 : s.getAttribute('q:locale')) || void 0;
    return o && jc(o), we(o, void 0, e, t, n);
  },
  we = (e, t, n, s, o) => ({
    $url$: o,
    $i$: 0,
    $hostElement$: t,
    $element$: n,
    $event$: s,
    $qrl$: void 0,
    $waitOn$: void 0,
    $subscriber$: void 0,
    $renderCtx$: void 0,
    $locale$: e,
  }),
  Qs = (e) => e.closest('[q\\:container]'),
  el = (e) => ae(void 0, e),
  Fo = we(void 0, void 0, void 0, 'qRender'),
  je = (e, t) => ((Fo.$subscriber$ = t), ae(Fo, () => e.value)),
  Nc = () => {
    var t;
    const e = be();
    if (e)
      return (
        e.$element$ ??
        e.$hostElement$ ??
        ((t = e.$qrl$) == null ? void 0 : t.$setContainer$(void 0))
      );
  },
  Ac = () => {
    const e = be();
    if (e) return e.$event$;
  },
  vt = (e) => {
    const t = be();
    return (
      t &&
        t.$hostElement$ &&
        t.$renderCtx$ &&
        (le(t.$hostElement$, t.$renderCtx$.$static$.$containerState$).$flags$ |=
          Ws),
      e
    );
  },
  zc = new Set([
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
  Ic = (e) => zc.has(e),
  fn = (e, t) => {
    (t.$flags$ &= ~ht), (t.$flags$ |= Bs), (t.$slots$ = []), (t.li.length = 0);
    const n = t.$element$,
      s = t.$componentQrl$,
      o = t.$props$,
      r = we(e.$static$.$locale$, n, void 0, 'qRender'),
      a = (r.$waitOn$ = []),
      i = Qt(e);
    (i.$cmpCtx$ = t),
      (i.$slotCtx$ = null),
      (r.$subscriber$ = [0, n]),
      (r.$renderCtx$ = e),
      s.$setContainer$(e.$static$.$containerState$.$containerEl$);
    const c = s.getFn(r);
    return Ln(
      () => c(o),
      (u) => F(cn(a), () => (t.$flags$ & ht ? fn(e, t) : { node: u, rCtx: i })),
      (u) =>
        u === qr
          ? F(cn(a), () => fn(e, t))
          : (Hs(u, n, e), { node: Ms, rCtx: i })
    );
  },
  tl = (e, t) => ({
    $static$: {
      $doc$: e,
      $locale$: t.$serverData$.locale,
      $containerState$: t,
      $hostElements$: new Set(),
      $operations$: [],
      $postOperations$: [],
      $roots$: [],
      $addSlots$: [],
      $rmSlots$: [],
      $visited$: [],
    },
    $cmpCtx$: null,
    $slotCtx$: null,
  }),
  Qt = (e) => ({
    $static$: e.$static$,
    $cmpCtx$: e.$cmpCtx$,
    $slotCtx$: e.$slotCtx$,
  }),
  Ks = (e, t) =>
    t && t.$scopeIds$ ? t.$scopeIds$.join(' ') + ' ' + hn(e) : hn(e),
  hn = (e) => {
    if (!e) return '';
    if (Me(e)) return e.trim();
    const t = [];
    if (B(e))
      for (const n of e) {
        const s = hn(n);
        s && t.push(s);
      }
    else for (const [n, s] of Object.entries(e)) s && t.push(n.trim());
    return t.join(' ');
  },
  Dn = (e) => {
    if (e == null) return '';
    if (typeof e == 'object') {
      if (B(e)) throw Y(0, e, 'style');
      {
        const t = [];
        for (const n in e)
          if (Object.prototype.hasOwnProperty.call(e, n)) {
            const s = e[n];
            s != null &&
              (n.startsWith('--')
                ? t.push(n + ':' + s)
                : t.push(Es(n) + ':' + Rc(n, s)));
          }
        return t.join(';');
      }
    }
    return String(e);
  },
  Rc = (e, t) => (typeof t != 'number' || t === 0 || Ic(e) ? t : t + 'px'),
  At = (e) => Pe(e.$static$.$containerState$.$elementIndex$++),
  nl = (e, t) => {
    const n = At(e);
    t.$id$ = n;
  },
  zt = (e) =>
    ne(e) ? zt(e.value) : e == null || typeof e == 'boolean' ? '' : String(e);
function sl(e) {
  return e.startsWith('aria-');
}
const ol = (e, t) => !!t.key && (!nt(e) || (!fe(e.type) && e.key != t.key)),
  It = 2,
  te = 'dangerouslySetInnerHTML',
  Kt = 'http://www.w3.org/2000/svg',
  ue = 1,
  gn = 2,
  yn = [],
  $n = (e, t, n, s) => {
    t.$elm$;
    const o = n.$children$;
    if (o.length === 1 && o[0].$type$ === ':skipRender')
      return void (n.$children$ = t.$children$);
    const r = t.$elm$;
    let a = wn;
    t.$children$ === yn && r.nodeName === 'HEAD' && ((a = Dc), (s |= gn));
    const i = Mc(t, a);
    return i.length > 0 && o.length > 0
      ? Pc(e, r, i, o, s)
      : i.length > 0 && o.length === 0
      ? Vs(e.$static$, i, 0, i.length - 1)
      : o.length > 0
      ? il(e, r, null, o, 0, o.length - 1, s)
      : void 0;
  },
  Mc = (e, t) => {
    const n = e.$children$;
    return n === yn ? (e.$children$ = rl(e.$elm$, t)) : n;
  },
  Pc = (e, t, n, s, o) => {
    let r = 0,
      a = 0,
      i = n.length - 1,
      c = n[0],
      u = n[i],
      p = s.length - 1,
      f = s[0],
      m = s[p],
      g,
      b,
      w;
    const h = [],
      y = e.$static$;
    for (; r <= i && a <= p; )
      if (c == null) c = n[++r];
      else if (u == null) u = n[--i];
      else if (f == null) f = s[++a];
      else if (m == null) m = s[--p];
      else if (c.$id$ === f.$id$)
        h.push(lt(e, c, f, o)), (c = n[++r]), (f = s[++a]);
      else if (u.$id$ === m.$id$)
        h.push(lt(e, u, m, o)), (u = n[--i]), (m = s[--p]);
      else if (c.$key$ && c.$id$ === m.$id$)
        c.$elm$,
          u.$elm$,
          h.push(lt(e, c, m, o)),
          tu(y, t, c.$elm$, u.$elm$),
          (c = n[++r]),
          (m = s[--p]);
      else if (u.$key$ && u.$id$ === f.$id$)
        c.$elm$,
          u.$elm$,
          h.push(lt(e, u, f, o)),
          ut(y, t, u.$elm$, c.$elm$),
          (u = n[--i]),
          (f = s[++a]);
      else {
        if (
          (g === void 0 && (g = Xc(n, r, i)), (b = g[f.$key$]), b === void 0)
        ) {
          const _ = Xe(e, f, o, h);
          ut(y, t, _, c == null ? void 0 : c.$elm$);
        } else if (((w = n[b]), w.$type$ !== f.$type$)) {
          const _ = Xe(e, f, o, h);
          F(_, (v) => {
            ut(y, t, v, c == null ? void 0 : c.$elm$);
          });
        } else
          h.push(lt(e, w, f, o)),
            (n[b] = void 0),
            w.$elm$,
            ut(y, t, w.$elm$, c.$elm$);
        f = s[++a];
      }
    a <= p &&
      h.push(il(e, t, s[p + 1] == null ? null : s[p + 1].$elm$, s, a, p, o));
    let k = Ts(h);
    return (
      r <= i &&
        (k = F(k, () => {
          Vs(y, n, r, i);
        })),
      k
    );
  },
  ct = (e, t) => {
    const n = Ce(e) ? e.close : null,
      s = [];
    let o = e.firstChild;
    for (; (o = Xs(o)) && (t(o) && s.push(o), (o = o.nextSibling), o !== n); );
    return s;
  },
  rl = (e, t) => ct(e, t).map(ll),
  ll = (e) => {
    var t;
    return Be(e) ? ((t = ge(e)) == null ? void 0 : t.$vdom$) ?? bn(e) : bn(e);
  },
  bn = (e) => {
    if (We(e)) {
      const t = new Ae(e.localName, {}, null, yn, 0, fs(e));
      return (t.$elm$ = e), t;
    }
    if (Ss(e)) {
      const t = new Ae(e.nodeName, oe, null, yn, 0, null);
      return (t.$text$ = e.data), (t.$elm$ = e), t;
    }
  },
  Dc = (e) => {
    const t = e.nodeType;
    return t === 1 ? e.hasAttribute('q:head') : t === 111;
  },
  ms = (e) => e.nodeName === 'Q:TEMPLATE',
  wn = (e) => {
    const t = e.nodeType;
    if (t === 3 || t === 111) return !0;
    if (t !== 1) return !1;
    const n = e.nodeName;
    return (
      n !== 'Q:TEMPLATE' &&
      (n === 'HEAD'
        ? e.hasAttribute('q:head')
        : n !== 'STYLE' || !e.hasAttribute(Nn))
    );
  },
  al = (e) => {
    const t = {};
    for (const n of e) {
      const s = Fc(n);
      (
        t[s] ?? (t[s] = new Ae(gt, { 'q:s': '' }, null, [], 0, s))
      ).$children$.push(n);
    }
    return t;
  },
  lt = (e, t, n, s) => {
    t.$type$, n.$type$, t.$key$, n.$key$, t.$id$, n.$id$;
    const o = t.$elm$,
      r = n.$type$,
      a = e.$static$,
      i = a.$containerState$,
      c = e.$cmpCtx$;
    if (((n.$elm$ = o), r === '#text')) {
      a.$visited$.push(o);
      const m = n.$signal$;
      return (
        m && (n.$text$ = zt(je(m, [4, c.$element$, m, o]))),
        void He(a, o, 'data', n.$text$)
      );
    }
    if (r === '#signal') return;
    const u = n.$props$,
      p = n.$flags$,
      f = le(o, i);
    if (r !== gt) {
      let m = (s & ue) != 0;
      if ((m || r !== 'svg' || ((s |= ue), (m = !0)), u !== oe)) {
        !(1 & p) && (f.li.length = 0);
        const g = t.$props$;
        n.$props$ = g;
        for (const b in u) {
          let w = u[b];
          if (b !== 'ref')
            if (un(b)) {
              const h = dn(f.li, b, w, i.$containerEl$);
              dl(a, o, h);
            } else
              ne(w) && (w = je(w, [1, c.$element$, w, o, b])),
                b === 'class' ? (w = Ks(w, c)) : b === 'style' && (w = Dn(w)),
                g[b] !== w && ((g[b] = w), Zs(a, o, b, w, m));
          else w !== void 0 && Ns(w, o);
        }
      }
      return p & It ||
        (m && r === 'foreignObject' && (s &= ~ue), u[te] !== void 0) ||
        r === 'textarea'
        ? void 0
        : $n(e, t, n, s);
    }
    if ('q:renderFn' in u) {
      const m = u.props;
      Vc(i, f, m);
      let g = !!(f.$flags$ & ht);
      return (
        g ||
          f.$componentQrl$ ||
          f.$element$.hasAttribute('q:id') ||
          (nl(e, f),
          (f.$componentQrl$ = m['q:renderFn']),
          f.$componentQrl$,
          (g = !0)),
        g ? F(Ps(e, f, s), () => Oo(e, f, n, s)) : Oo(e, f, n, s)
      );
    }
    if ('q:s' in u) return c.$slots$, void c.$slots$.push(n);
    if (te in u) He(a, o, 'innerHTML', u[te]);
    else if (!(p & It)) return $n(e, t, n, s);
  },
  Oo = (e, t, n, s) => {
    if (n.$flags$ & It) return;
    const o = e.$static$,
      r = al(n.$children$),
      a = ul(t);
    for (const i in a.slots)
      if (!r[i]) {
        const c = a.slots[i],
          u = rl(c, wn);
        if (u.length > 0) {
          const p = ge(c);
          p && p.$vdom$ && (p.$vdom$.$children$ = []),
            Vs(o, u, 0, u.length - 1);
        }
      }
    for (const i in a.templates) {
      const c = a.templates[i];
      c && !r[i] && ((a.templates[i] = void 0), Gs(o, c));
    }
    return Ts(
      Object.keys(r).map((i) => {
        const c = r[i],
          u = cl(o, a, t, i, e.$static$.$containerState$),
          p = Ds(u),
          f = Qt(e),
          m = u.$element$;
        (f.$slotCtx$ = u), (u.$vdom$ = c), (c.$elm$ = m);
        let g = s & ~ue;
        m.isSvg && (g |= ue);
        const b = o.$addSlots$.findIndex((w) => w[0] === m);
        return b >= 0 && o.$addSlots$.splice(b, 1), $n(f, p, c, g);
      })
    );
  },
  il = (e, t, n, s, o, r, a) => {
    const i = [];
    for (; o <= r; ++o) {
      const c = s[o],
        u = Xe(e, c, a, i);
      ut(e.$static$, t, u, n);
    }
    return cn(i);
  },
  Vs = (e, t, n, s) => {
    for (; n <= s; ++n) {
      const o = t[n];
      o && (o.$elm$, Gs(e, o.$elm$));
    }
  },
  cl = (e, t, n, s, o) => {
    const r = t.slots[s];
    if (r) return le(r, o);
    const a = t.templates[s];
    if (a) return le(a, o);
    const i = hl(e.$doc$, s),
      c = Pn(i);
    return (c.$parentCtx$ = n), ou(e, n.$element$, i), (t.templates[s] = i), c;
  },
  Fc = (e) => e.$props$[he] ?? '',
  Xe = (e, t, n, s) => {
    const o = t.$type$,
      r = e.$static$.$doc$,
      a = e.$cmpCtx$;
    if (o === '#text') return (t.$elm$ = r.createTextNode(t.$text$));
    if (o === '#signal') {
      const h = t.$signal$,
        y = h.value;
      if (nt(y)) {
        const k = Fe(y);
        if (ne(k)) throw new Error('NOT IMPLEMENTED: Promise');
        if (Array.isArray(k)) throw new Error('NOT IMPLEMENTED: Array');
        {
          const _ = Xe(e, k, n, s);
          return (
            je(h, 4 & n ? [3, _, h, _] : [4, a.$element$, h, _]), (t.$elm$ = _)
          );
        }
      }
      {
        const k = r.createTextNode(t.$text$);
        return (
          (k.data = t.$text$ = zt(y)),
          je(h, 4 & n ? [3, k, h, k] : [4, a.$element$, h, k]),
          (t.$elm$ = k)
        );
      }
    }
    let i,
      c = !!(n & ue);
    c || o !== 'svg' || ((n |= ue), (c = !0));
    const u = o === gt,
      p = t.$props$,
      f = e.$static$,
      m = f.$containerState$;
    u
      ? (i = uu(r, c))
      : o === 'head'
      ? ((i = r.head), (n |= gn))
      : ((i = Ys(r, o, c)), (n &= ~gn)),
      t.$flags$ & It && (n |= 4),
      (t.$elm$ = i);
    const g = Pn(i);
    if (((g.$parentCtx$ = e.$slotCtx$ ?? e.$cmpCtx$), u)) {
      if ('q:renderFn' in p) {
        const h = p['q:renderFn'],
          y = zn(),
          k = m.$subsManager$.$createManager$(),
          _ = new Proxy(y, new Cr(m, k)),
          v = p.props;
        if ((m.$proxyMap$.set(y, _), (g.$props$ = _), v !== oe)) {
          const E = (y[d] = v[d] ?? oe);
          for (const S in v)
            if (S !== 'children' && S !== he) {
              const T = E[S];
              ne(T) ? (y['$$' + S] = T) : (y[S] = v[S]);
            }
        }
        nl(e, g), (g.$componentQrl$ = h);
        const q = F(Ps(e, g, n), () => {
          let E = t.$children$;
          if (E.length === 0) return;
          E.length === 1 &&
            E[0].$type$ === ':skipRender' &&
            (E = E[0].$children$);
          const S = ul(g),
            T = [],
            A = al(E);
          for (const C in A) {
            const L = A[C],
              z = cl(f, S, g, C, f.$containerState$),
              G = Qt(e),
              _e = z.$element$;
            (G.$slotCtx$ = z), (z.$vdom$ = L), (L.$elm$ = _e);
            let K = n & ~ue;
            _e.isSvg && (K |= ue);
            for (const O of L.$children$) {
              const Qe = Xe(G, O, K, T);
              O.$elm$, O.$elm$, fl(f, _e, Qe);
            }
          }
          return cn(T);
        });
        return X(q) && s.push(q), i;
      }
      if ('q:s' in p)
        a.$slots$,
          iu(i, t.$key$),
          me(i, 'q:sref', a.$id$),
          me(i, 'q:s', ''),
          a.$slots$.push(t),
          f.$addSlots$.push([i, a.$element$]);
      else if (te in p) return He(f, i, 'innerHTML', p[te]), i;
    } else {
      if (
        (t.$immutableProps$ && Uo(f, g, a, t.$immutableProps$, c, !0),
        p !== oe && ((g.$vdom$ = t), (t.$props$ = Uo(f, g, a, p, c, !1))),
        c && o === 'foreignObject' && ((c = !1), (n &= ~ue)),
        a)
      ) {
        const h = a.$scopeIds$;
        h &&
          h.forEach((y) => {
            i.classList.add(y);
          }),
          a.$flags$ & Oe && (g.li.push(...a.li), (a.$flags$ &= ~Oe));
      }
      for (const h of g.li) dl(f, i, h[0]);
      if (p[te] !== void 0) return i;
      c && o === 'foreignObject' && ((c = !1), (n &= ~ue));
    }
    let b = t.$children$;
    if (b.length === 0) return i;
    b.length === 1 && b[0].$type$ === ':skipRender' && (b = b[0].$children$);
    const w = b.map((h) => Xe(e, h, n, s));
    for (const h of w) Rt(i, h);
    return i;
  },
  Oc = (e) => {
    const t = e.$slots$;
    return t || (e.$element$.parentElement, (e.$slots$ = Hc(e)));
  },
  ul = (e) => {
    const t = Oc(e),
      n = {},
      s = {},
      o = Array.from(e.$element$.childNodes).filter(ms);
    for (const r of t) r.$elm$, (n[r.$key$ ?? ''] = r.$elm$);
    for (const r of o) s[ve(r, he) ?? ''] = r;
    return { slots: n, templates: s };
  },
  Hc = (e) => {
    const t = e.$element$.parentElement;
    return fu(t, 'q:sref', e.$id$).map(bn);
  },
  Uc = (e, t, n) => (He(e, t.style, 'cssText', n), !0),
  Bc = (e, t, n) => (
    t.namespaceURI === Kt ? Mt(e, t, 'class', n) : He(e, t, 'className', n), !0
  ),
  Ho = (e, t, n, s) => (
    s in t &&
      t[s] !== n &&
      (t.tagName === 'SELECT' ? eu(e, t, s, n) : He(e, t, s, n)),
    !0
  ),
  qt = (e, t, n, s) => (Mt(e, t, s.toLowerCase(), n), !0),
  Wc = (e, t, n) => (He(e, t, 'innerHTML', n), !0),
  Qc = () => !0,
  Kc = {
    style: Uc,
    class: Bc,
    value: Ho,
    checked: Ho,
    href: qt,
    list: qt,
    form: qt,
    tabIndex: qt,
    download: qt,
    innerHTML: Qc,
    [te]: Wc,
  },
  Zs = (e, t, n, s, o) => {
    if (sl(n)) return void Mt(e, t, n, s != null ? String(s) : s);
    const r = Kc[n];
    (r && r(e, t, s, n)) ||
      (o || !(n in t)
        ? (n.startsWith(ls) && pl(n.slice(15)), Mt(e, t, n, s))
        : He(e, t, n, s));
  },
  Uo = (e, t, n, s, o, r) => {
    const a = {},
      i = t.$element$;
    for (const c in s) {
      let u = s[c];
      if (c !== 'ref')
        if (un(c)) dn(t.li, c, u, e.$containerState$.$containerEl$);
        else {
          if (
            (ne(u) &&
              (u = je(
                u,
                r ? [1, i, u, n.$element$, c] : [2, n.$element$, u, i, c]
              )),
            c === 'class')
          ) {
            if (((u = Ks(u, n)), !u)) continue;
          } else c === 'style' && (u = Dn(u));
          (a[c] = u), Zs(e, i, c, u, o);
        }
      else u !== void 0 && Ns(u, i);
    }
    return a;
  },
  Vc = (e, t, n) => {
    let s = t.$props$;
    if ((s || (t.$props$ = s = Wt(zn(), e)), n === oe)) return;
    const o = re(s),
      r = ot(s),
      a = (r[d] = n[d] ?? oe);
    for (const i in n)
      if (i !== 'children' && i !== he && !a[i]) {
        const c = n[i];
        r[i] !== c && ((r[i] = c), o.$notifySubs$(i));
      }
  },
  jt = (e, t, n, s) => {
    if ((n.$clearSub$(e), We(e))) {
      if (s && e.hasAttribute('q:s')) return void t.$rmSlots$.push(e);
      const o = ge(e);
      o && qc(o, n);
      const r = Ce(e) ? e.close : null;
      let a = e.firstChild;
      for (; (a = Xs(a)) && (jt(a, t, n, !0), (a = a.nextSibling), a !== r); );
    }
  },
  Zc = async (e) => {
    au(e);
  },
  Rt = (e, t) => {
    Ce(t) ? t.appendTo(e) : e.appendChild(t);
  },
  Yc = (e, t) => {
    Ce(t) ? t.remove() : e.removeChild(t);
  },
  Gc = (e, t, n) => {
    Ce(t)
      ? t.insertBeforeTo(e, (n == null ? void 0 : n.nextSibling) ?? null)
      : e.insertBefore(t, (n == null ? void 0 : n.nextSibling) ?? null);
  },
  Fn = (e, t, n) => {
    Ce(t) ? t.insertBeforeTo(e, vn(n)) : e.insertBefore(t, vn(n));
  },
  Xc = (e, t, n) => {
    const s = {};
    for (let o = t; o <= n; ++o) {
      const r = e[o].$key$;
      r != null && (s[r] = o);
    }
    return s;
  },
  dl = (e, t, n) => {
    n.startsWith('on:') || Mt(e, t, n, ''), pl(n);
  },
  pl = (e) => {
    var t;
    {
      const n = _r(e);
      try {
        ((t = globalThis).qwikevents || (t.qwikevents = [])).push(n);
      } catch {}
    }
  },
  Mt = (e, t, n, s) => {
    e.$operations$.push({ $operation$: Jc, $args$: [t, n, s] });
  },
  Jc = (e, t, n) => {
    if (n == null || n === !1) e.removeAttribute(t);
    else {
      const s = n === !0 ? '' : String(n);
      me(e, t, s);
    }
  },
  He = (e, t, n, s) => {
    e.$operations$.push({ $operation$: ml, $args$: [t, n, s] });
  },
  eu = (e, t, n, s) => {
    e.$postOperations$.push({ $operation$: ml, $args$: [t, n, s] });
  },
  ml = (e, t, n) => {
    try {
      (e[t] = n ?? ''), n == null && Ue(e) && Be(e) && e.removeAttribute(t);
    } catch (s) {
      et(Tn(6), { node: e, key: t, value: n }, s);
    }
  },
  Ys = (e, t, n) => (n ? e.createElementNS(Kt, t) : e.createElement(t)),
  ut = (e, t, n, s) => (
    e.$operations$.push({ $operation$: Fn, $args$: [t, n, s || null] }), n
  ),
  tu = (e, t, n, s) => (
    e.$operations$.push({ $operation$: Gc, $args$: [t, n, s || null] }), n
  ),
  fl = (e, t, n) => (
    e.$operations$.push({ $operation$: Rt, $args$: [t, n] }), n
  ),
  nu = (e, t) => {
    e.$containerState$.$styleIds$.add(t.styleId),
      e.$postOperations$.push({
        $operation$: su,
        $args$: [e.$containerState$, t],
      });
  },
  su = (e, t) => {
    const n = e.$containerEl$,
      s = Ut(n),
      o = s.documentElement === n,
      r = s.head,
      a = s.createElement('style');
    me(a, Nn, t.styleId),
      me(a, 'hidden', ''),
      (a.textContent = t.content),
      o && r ? Rt(r, a) : Fn(n, a, n.firstChild);
  },
  ou = (e, t, n) => {
    e.$operations$.push({ $operation$: ru, $args$: [t, n] });
  },
  ru = (e, t) => {
    Fn(e, t, e.firstChild);
  },
  Gs = (e, t) => {
    We(t) && jt(t, e, e.$containerState$.$subsManager$, !0),
      e.$operations$.push({ $operation$: lu, $args$: [t, e] });
  },
  lu = (e) => {
    const t = e.parentElement;
    t && Yc(t, e);
  },
  hl = (e, t) => {
    const n = Ys(e, 'q:template', !1);
    return me(n, he, t), me(n, 'hidden', ''), me(n, 'aria-hidden', 'true'), n;
  },
  au = (e) => {
    for (const t of e.$operations$) t.$operation$.apply(void 0, t.$args$);
    cu(e);
  },
  fs = (e) => ve(e, 'q:key'),
  iu = (e, t) => {
    t !== null && me(e, 'q:key', t);
  },
  cu = (e) => {
    const t = e.$containerState$.$subsManager$;
    for (const n of e.$rmSlots$) {
      const s = fs(n),
        o = ct(n, wn);
      if (o.length > 0) {
        const r = n.getAttribute('q:sref'),
          a = e.$roots$.find((i) => i.$id$ === r);
        if (a) {
          const i = a.$element$;
          if (i.isConnected)
            if (ct(i, ms).some((c) => ve(c, he) === s)) jt(n, e, t, !1);
            else {
              const c = hl(e.$doc$, s);
              for (const u of o) Rt(c, u);
              Fn(i, c, i.firstChild);
            }
          else jt(n, e, t, !1);
        } else jt(n, e, t, !1);
      }
    }
    for (const [n, s] of e.$addSlots$) {
      const o = fs(n),
        r = ct(s, ms).find((a) => a.getAttribute(he) === o);
      r &&
        (ct(r, wn).forEach((a) => {
          Rt(n, a);
        }),
        r.remove());
    }
  },
  Bo = () => {},
  uu = (e, t) => {
    const n = e.createComment('qv '),
      s = e.createComment('/qv');
    return new gl(n, s, t);
  },
  du = (e) => {
    if (!e) return {};
    const t = e.split(' ');
    return Object.fromEntries(
      t.map((n) => {
        const s = n.indexOf('=');
        return s >= 0 ? [n.slice(0, s), gu(n.slice(s + 1))] : [n, ''];
      })
    );
  },
  pu = (e) => {
    const t = [];
    return (
      Object.entries(e).forEach(([n, s]) => {
        t.push(s ? `${n}=${hu(s)}` : `${n}`);
      }),
      t.join(' ')
    );
  },
  mu = (e, t, n) =>
    e.ownerDocument.createTreeWalker(e, 128, {
      acceptNode(s) {
        const o = Vt(s);
        return o && ve(o, t) === n ? 1 : 2;
      },
    }),
  fu = (e, t, n) => {
    const s = mu(e, t, n),
      o = [];
    let r = null;
    for (; (r = s.nextNode()); ) o.push(Vt(r));
    return o;
  },
  hu = (e) => e.replace(/ /g, '+'),
  gu = (e) => e.replace(/\+/g, ' '),
  gt = ':virtual';
class gl {
  constructor(t, n, s) {
    (this.open = t),
      (this.close = n),
      (this.isSvg = s),
      (this._qc_ = null),
      (this.nodeType = 111),
      (this.localName = gt),
      (this.nodeName = gt);
    const o = (this.ownerDocument = t.ownerDocument);
    (this.$template$ = Ys(o, 'template', !1)),
      (this.$attributes$ = du(t.data.slice(3))),
      t.data.startsWith('qv '),
      (t.__virtual = this),
      (n.__virtual = this);
  }
  insertBefore(t, n) {
    const s = this.parentElement;
    return (
      s
        ? s.insertBefore(t, n || this.close)
        : this.$template$.insertBefore(t, n),
      t
    );
  }
  remove() {
    const t = this.parentElement;
    if (t) {
      const n = this.childNodes;
      this.$template$.childElementCount, t.removeChild(this.open);
      for (let s = 0; s < n.length; s++) this.$template$.appendChild(n[s]);
      t.removeChild(this.close);
    }
  }
  appendChild(t) {
    return this.insertBefore(t, null);
  }
  insertBeforeTo(t, n) {
    const s = this.childNodes;
    t.insertBefore(this.open, n);
    for (const o of s) t.insertBefore(o, n);
    t.insertBefore(this.close, n), this.$template$.childElementCount;
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
      : this.$template$.removeChild(t);
  }
  getAttribute(t) {
    return this.$attributes$[t] ?? null;
  }
  hasAttribute(t) {
    return t in this.$attributes$;
  }
  setAttribute(t, n) {
    (this.$attributes$[t] = n), (this.open.data = Wo(this.$attributes$));
  }
  removeAttribute(t) {
    delete this.$attributes$[t], (this.open.data = Wo(this.$attributes$));
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
      ct(this, pi).forEach((s) => {
        We(s) &&
          (s.matches(t) && n.push(s),
          n.concat(Array.from(s.querySelectorAll(t))));
      }),
      n
    );
  }
  querySelector(t) {
    for (const n of this.childNodes)
      if (Be(n)) {
        if (n.matches(t)) return n;
        const s = n.querySelector(t);
        if (s !== null) return s;
      }
    return null;
  }
  get innerHTML() {
    return '';
  }
  set innerHTML(t) {
    const n = this.parentElement;
    n
      ? (this.childNodes.forEach((s) => this.removeChild(s)),
        (this.$template$.innerHTML = t),
        n.insertBefore(this.$template$.content, this.close))
      : (this.$template$.innerHTML = t);
  }
  get firstChild() {
    if (this.parentElement) {
      const t = this.open.nextSibling;
      return t === this.close ? null : t;
    }
    return this.$template$.firstChild;
  }
  get nextSibling() {
    return this.close.nextSibling;
  }
  get previousSibling() {
    return this.open.previousSibling;
  }
  get childNodes() {
    if (!this.parentElement) return Array.from(this.$template$.childNodes);
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
const Wo = (e) => `qv ${pu(e)}`,
  Xs = (e) => {
    if (e == null) return null;
    if (Ot(e)) {
      const t = Vt(e);
      if (t) return t;
    }
    return e;
  },
  yu = (e) => {
    let t = e,
      n = 1;
    for (; (t = t.nextSibling); )
      if (Ot(t)) {
        const s = t.__virtual;
        if (s) t = s;
        else if (t.data.startsWith('qv ')) n++;
        else if (t.data === '/qv' && (n--, n === 0)) return t;
      }
  },
  Vt = (e) => {
    var n;
    const t = e.__virtual;
    if (t) return t;
    if (e.data.startsWith('qv ')) {
      const s = yu(e);
      return new gl(
        e,
        s,
        ((n = e.parentElement) == null ? void 0 : n.namespaceURI) === Kt
      );
    }
    return null;
  },
  vn = (e) => (e == null ? null : Ce(e) ? e.open : e),
  $u = async (e) => {
    const t = Ls(null, null),
      n = $l(t);
    let s;
    for (D(e, n, !1); (s = n.$promises$).length > 0; )
      (n.$promises$ = []), await Promise.all(s);
    const o = Array.from(n.$objSet$.keys());
    let r = 0;
    const a = new Map();
    for (const u of o) a.set(u, Pe(r)), r++;
    if (n.$noSerialize$.length > 0) {
      const u = a.get(void 0);
      for (const p of n.$noSerialize$) a.set(p, u);
    }
    const i = (u) => {
        let p = '';
        if (X(u)) {
          const m = bl(u);
          if (!m) throw Y(27, u);
          (u = m.value), (p += m.resolved ? '~' : '_');
        }
        if (Te(u)) {
          const m = ot(u);
          m && ((p += '!'), (u = m));
        }
        const f = a.get(u);
        if (f === void 0) throw Y(27, u);
        return f + p;
      },
      c = vl(o, i, null, n, t);
    return JSON.stringify({ _entry: i(e), _objs: c });
  },
  bu = async (e, t) => {
    const n = Ut(e),
      s = n.documentElement,
      o = $r(e) ? s : e;
    if (ve(o, 'q:container') === 'paused') throw Y(21);
    const r = t ?? (o === n.documentElement ? n.body : o),
      a = bt(o),
      i = wu(o, Cu);
    me(o, 'q:container', 'paused');
    for (const m of i) {
      const g = m.$element$,
        b = m.li;
      if (m.$scopeIds$) {
        const w = jr(m.$scopeIds$);
        w && g.setAttribute('q:sstyle', w);
      }
      if ((m.$id$ && g.setAttribute('q:id', m.$id$), Be(g) && b.length > 0)) {
        const w = As(b);
        for (const h of w) g.setAttribute(h[0], to(h[1], a, m));
      }
    }
    const c = await yl(i, a, (m) => (Ue(m) && Ss(m) ? Eu(m, a) : null)),
      u = n.createElement('script');
    me(u, 'type', 'qwik/json'),
      (u.textContent = ku(JSON.stringify(c.state, void 0, void 0))),
      r.appendChild(u);
    const p = Array.from(a.$events$, (m) => JSON.stringify(m)),
      f = n.createElement('script');
    return (
      (f.textContent = `window.qwikevents||=[];window.qwikevents.push(${p.join(
        ', '
      )})`),
      r.appendChild(f),
      c
    );
  },
  yl = async (e, t, n, s) => {
    var _;
    const o = $l(t);
    s == null ||
      s.forEach((v, q) => {
        o.$seen$.add(q);
      });
    let r = !1;
    for (const v of e)
      if (v.$tasks$)
        for (const q of v.$tasks$)
          Zr(q) && o.$resources$.push(q.$state$), Gr(q);
    for (const v of e) {
      const q = v.$element$,
        E = v.li;
      for (const S of E)
        if (Be(q)) {
          const T = S[1],
            A = T.$captureRef$;
          if (A) for (const C of A) D(C, o, !0);
          o.$qrls$.push(T), (r = !0);
        }
    }
    if (!r)
      return {
        state: { refs: {}, ctx: {}, objs: [], subs: [] },
        objs: [],
        funcs: [],
        qrls: [],
        resources: o.$resources$,
        mode: 'static',
      };
    let a;
    for (; (a = o.$promises$).length > 0; )
      (o.$promises$ = []), await Promise.all(a);
    const i = o.$elements$.length > 0;
    if (i) {
      for (const v of o.$deferElements$) Js(v, o, v.$element$);
      for (const v of e) vu(v, o);
    }
    for (; (a = o.$promises$).length > 0; )
      (o.$promises$ = []), await Promise.all(a);
    const c = new Map(),
      u = Array.from(o.$objSet$.keys()),
      p = new Map(),
      f = (v) => {
        let q = '';
        if (X(v)) {
          const T = bl(v);
          if (!T) return null;
          (v = T.value), (q += T.resolved ? '~' : '_');
        }
        if (Te(v)) {
          const T = ot(v);
          if (T) (q += '!'), (v = T);
          else if (We(v)) {
            const A = ((C) => {
              let L = c.get(C);
              return (
                L === void 0 &&
                  ((L = Tu(C)),
                  L || console.warn('Missing ID', C),
                  c.set(C, L)),
                L
              );
            })(v);
            return A ? '#' + A + q : null;
          }
        }
        const E = p.get(v);
        if (E) return E + q;
        const S = s == null ? void 0 : s.get(v);
        return S ? '*' + S : n ? n(v) : null;
      },
      m = (v) => {
        const q = f(v);
        if (q === null) {
          if (so(v)) {
            const E = Pe(p.size);
            return p.set(v, E), E;
          }
          throw Y(27, v);
        }
        return q;
      },
      g = new Map();
    for (const v of u) {
      const q = (_ = ju(v, t)) == null ? void 0 : _.$subs$;
      if (!q) continue;
      const E = jl(v) ?? 0,
        S = [];
      1 & E && S.push(E);
      for (const T of q) {
        const A = T[1];
        (T[0] === 0 && Ue(A) && Ce(A) && !o.$elements$.includes(ge(A))) ||
          S.push(T);
      }
      S.length > 0 && g.set(v, S);
    }
    u.sort((v, q) => (g.has(v) ? 0 : 1) - (g.has(q) ? 0 : 1));
    let b = 0;
    for (const v of u) p.set(v, Pe(b)), b++;
    if (o.$noSerialize$.length > 0) {
      const v = p.get(void 0);
      for (const q of o.$noSerialize$) p.set(q, v);
    }
    const w = [];
    for (const v of u) {
      const q = g.get(v);
      if (q == null) break;
      w.push(
        q.map((E) => (typeof E == 'number' ? `_${E}` : md(E, f))).filter(vr)
      );
    }
    w.length, g.size;
    const h = vl(u, m, f, o, t),
      y = {},
      k = {};
    for (const v of e) {
      const q = v.$element$,
        E = v.$id$,
        S = v.$refMap$,
        T = v.$props$,
        A = v.$contexts$,
        C = v.$tasks$,
        L = v.$componentQrl$,
        z = v.$seq$,
        G = {},
        _e = Ce(q) && o.$elements$.includes(v);
      if (S.length > 0) {
        const K = Je(S, m, ' ');
        K && (k[E] = K);
      } else if (i) {
        let K = !1;
        if (_e) {
          const O = f(T);
          (G.h = m(L) + (O ? ' ' + O : '')), (K = !0);
        } else {
          const O = f(T);
          O && ((G.h = ' ' + O), (K = !0));
        }
        if (C && C.length > 0) {
          const O = Je(C, f, ' ');
          O && ((G.w = O), (K = !0));
        }
        if (_e && z && z.length > 0) {
          const O = Je(z, m, ' ');
          (G.s = O), (K = !0);
        }
        if (A) {
          const O = [];
          A.forEach((Qn, Gt) => {
            const kt = f(Qn);
            kt && O.push(`${Gt}=${kt}`);
          });
          const Qe = O.join(' ');
          Qe && ((G.c = Qe), (K = !0));
        }
        K && (y[E] = G);
      }
    }
    return {
      state: { refs: k, ctx: y, objs: h, subs: w },
      objs: u,
      funcs: o.$inlinedFunctions$,
      resources: o.$resources$,
      qrls: o.$qrls$,
      mode: i ? 'render' : 'listeners',
    };
  },
  Je = (e, t, n) => {
    let s = '';
    for (const o of e) {
      const r = t(o);
      r !== null && (s !== '' && (s += n), (s += r));
    }
    return s;
  },
  wu = (e, t) => {
    const n = [],
      s = t(e);
    s !== void 0 && n.push(s);
    const o = e.ownerDocument.createTreeWalker(e, 129, {
      acceptNode(r) {
        if (qu(r)) return 2;
        const a = t(r);
        return a !== void 0 && n.push(a), 3;
      },
    });
    for (; o.nextNode(); );
    return n;
  },
  vu = (e, t) => {
    var o;
    const n = e.$parentCtx$,
      s = e.$props$;
    if (n && s && !wl(s) && t.$elements$.includes(n)) {
      const r = (o = re(s)) == null ? void 0 : o.$subs$,
        a = e.$element$;
      if (r)
        for (const [i, c] of r)
          i === 0
            ? (c !== a && yt(re(s), t, !1), Ue(c) ? xu(c, t) : D(c, t, !0))
            : (D(s, t, !1), yt(re(s), t, !1));
    }
  },
  $l = (e) => {
    const t = [];
    return (
      e.$inlineFns$.forEach((n, s) => {
        for (; t.length <= n; ) t.push('');
        t[n] = s;
      }),
      {
        $containerState$: e,
        $seen$: new Set(),
        $objSet$: new Set(),
        $prefetch$: 0,
        $noSerialize$: [],
        $inlinedFunctions$: t,
        $resources$: [],
        $elements$: [],
        $qrls$: [],
        $deferElements$: [],
        $promises$: [],
      }
    );
  },
  _u = (e, t) => {
    const n = ge(e);
    t.$elements$.includes(n) ||
      (t.$elements$.push(n),
      t.$prefetch$++,
      n.$flags$ & Ws ? Js(n, t, !0) : t.$deferElements$.push(n),
      t.$prefetch$--);
  },
  xu = (e, t) => {
    const n = ge(e);
    if (n) {
      if (t.$elements$.includes(n)) return;
      t.$elements$.push(n), Js(n, t, e);
    }
  },
  Js = (e, t, n) => {
    if (
      (e.$props$ &&
        !wl(e.$props$) &&
        (D(e.$props$, t, n), yt(re(e.$props$), t, n)),
      e.$componentQrl$ && D(e.$componentQrl$, t, n),
      e.$seq$)
    )
      for (const s of e.$seq$) D(s, t, n);
    if (e.$tasks$) {
      const s = t.$containerState$.$subsManager$.$groupToManagers$;
      for (const o of e.$tasks$) s.has(o) && D(o, t, n);
    }
    if (n === !0 && (Qo(e, t), e.$dynamicSlots$))
      for (const s of e.$dynamicSlots$) Qo(s, t);
  },
  Qo = (e, t) => {
    for (; e; ) {
      if (e.$contexts$) for (const n of e.$contexts$.values()) D(n, t, !0);
      e = e.$parentCtx$;
    }
  },
  ku = (e) => e.replace(/<(\/?script)/g, '\\x3C$1'),
  yt = (e, t, n) => {
    if (t.$seen$.has(e)) return;
    t.$seen$.add(e);
    const s = e.$subs$;
    for (const o of s) {
      const r = o[0];
      if ((r > 0 && D(o[2], t, n), n === !0)) {
        const a = o[1];
        Ue(a) && Ce(a) ? r === 0 && _u(a, t) : D(a, t, !0);
      }
    }
  },
  hs = Symbol(),
  Su = (e) =>
    e.then(
      (t) => ((e[hs] = { resolved: !0, value: t }), t),
      (t) => ((e[hs] = { resolved: !1, value: t }), t)
    ),
  bl = (e) => e[hs],
  D = (e, t, n) => {
    if (e !== null) {
      const s = typeof e;
      switch (s) {
        case 'function':
        case 'object': {
          const o = t.$seen$;
          if (o.has(e)) return;
          if ((o.add(e), ql(e)))
            return t.$objSet$.add(void 0), void t.$noSerialize$.push(e);
          const r = e,
            a = ot(e);
          if (a) {
            const i = (2 & jl((e = a))) == 0;
            if ((n && i && yt(re(r), t, n), Cl(r)))
              return void t.$objSet$.add(e);
          }
          if (rd(e, t, n)) return void t.$objSet$.add(e);
          if (X(e))
            return void t.$promises$.push(
              Su(e).then((i) => {
                D(i, t, n);
              })
            );
          if (s === 'object') {
            if (Ue(e)) return;
            if (B(e)) for (let i = 0; i < e.length; i++) D(r[i], t, n);
            else if (Ht(e)) for (const i in e) D(r[i], t, n);
          }
          break;
        }
        case 'string':
          if (t.$seen$.has(e)) return;
      }
    }
    t.$objSet$.add(e);
  },
  qu = (e) => Be(e) && e.hasAttribute('q:container'),
  Cu = (e) => {
    const t = Xs(e);
    if (We(t)) {
      const n = ge(t);
      if (n && n.$id$) return n;
    }
  },
  ju = (e, t) => {
    if (!Te(e)) return;
    if (e instanceof Lt) return re(e);
    const n = t.$proxyMap$.get(e);
    return n ? re(n) : void 0;
  },
  Tu = (e) => {
    const t = ge(e);
    return t ? t.$id$ : null;
  },
  Eu = (e, t) => {
    const n = e.previousSibling;
    if (n && Ot(n) && n.data.startsWith('t=')) return '#' + n.data.slice(2);
    const s = e.ownerDocument,
      o = Pe(t.$elementIndex$++),
      r = s.createComment(`t=${o}`),
      a = s.createComment(''),
      i = e.parentElement;
    return i.insertBefore(r, e), i.insertBefore(a, e.nextSibling), '#' + o;
  },
  wl = (e) => Object.keys(e).length === 0;
function vl(e, t, n, s, o) {
  return e.map((r) => {
    if (r === null) return null;
    const a = typeof r;
    switch (a) {
      case 'undefined':
        return Hn;
      case 'number':
        if (!Number.isFinite(r)) break;
        return r;
      case 'string':
        if (r.charCodeAt(0) < 32) break;
        return r;
      case 'boolean':
        return r;
    }
    const i = ld(r, t, s, o);
    if (i !== void 0) return i;
    if (a === 'object') {
      if (B(r)) return r.map(t);
      if (Ht(r)) {
        const c = {};
        for (const u in r)
          if (n) {
            const p = n(r[u]);
            p !== null && (c[u] = p);
          } else c[u] = t(r[u]);
        return c;
      }
    }
    throw Y(3, r);
  });
}
const j = (e, t, n = Se) => Bn(null, t, e, null, null, n, null),
  Re = (e, t = Se) => Bn(null, e, null, null, null, t, null),
  eo = (e, t = {}) => {
    let n = e.$symbol$,
      s = e.$chunk$;
    const o = e.$refSymbol$ ?? n,
      r = En();
    if (r) {
      const u = r.chunkForSymbol(o, s);
      u && ((s = u[1]), e.$refSymbol$ || (n = u[0]));
    }
    if (s == null) throw Y(31, e.$symbol$);
    if ((s.startsWith('./') && (s = s.slice(2)), $d(e)))
      if (t.$containerState$) {
        const u = t.$containerState$,
          p = e.resolved.toString();
        let f = u.$inlineFns$.get(p);
        f === void 0 && ((f = u.$inlineFns$.size), u.$inlineFns$.set(p, f)),
          (n = String(f));
      } else br('Sync QRL without containerState');
    let a = `${s}#${n}`;
    const i = e.$capture$,
      c = e.$captureRef$;
    return (
      c && c.length
        ? t.$getObjId$
          ? (a += `[${Je(c, t.$getObjId$, ' ')}]`)
          : t.$addRefMap$ && (a += `[${Je(c, t.$addRefMap$, ' ')}]`)
        : i && i.length > 0 && (a += `[${i.join(' ')}]`),
      a
    );
  },
  to = (e, t, n) => {
    n.$element$;
    const s = { $containerState$: t, $addRefMap$: (o) => Lu(n.$refMap$, o) };
    return Je(
      e,
      (o) => eo(o, s),
      `
`
    );
  },
  On = (e, t) => {
    const n = e.length,
      s = Ko(e, 0, '#'),
      o = Ko(e, s, '['),
      r = Math.min(s, o),
      a = e.substring(0, r),
      i = s == n ? s : s + 1,
      c = i == o ? 'default' : e.substring(i, o),
      u = o === n ? Se : e.substring(o + 1, n - 1).split(' '),
      p = Bn(a, c, null, null, u, null, null);
    return t && p.$setContainer$(t), p;
  },
  Ko = (e, t, n) => {
    const s = e.length,
      o = e.indexOf(n, t == s ? 0 : t);
    return o == -1 ? s : o;
  },
  Lu = (e, t) => {
    const n = e.indexOf(t);
    return n === -1 ? (e.push(t), String(e.length - 1)) : String(n);
  },
  _l = (e, t) => (
    e.$capture$,
    (e.$captureRef$ = e.$capture$.map((n) => {
      const s = parseInt(n, 10),
        o = t.$refMap$[s];
      return t.$refMap$.length > s, o;
    }))
  ),
  Nu = (e, t) => (
    globalThis.__qwik_reg_symbols === void 0 &&
      (globalThis.__qwik_reg_symbols = new Map()),
    globalThis.__qwik_reg_symbols.set(t, e),
    e
  ),
  Au = (e) => ({
    __brand: 'resource',
    value: void 0,
    loading: !ze(),
    _resolved: void 0,
    _error: void 0,
    _state: 'pending',
    _timeout: (e == null ? void 0 : e.timeout) ?? -1,
    _cache: 0,
  }),
  zu = (e) => Te(e) && e.__brand === 'resource',
  Iu = (e, t) => {
    const n = e._state;
    return n === 'resolved'
      ? `0 ${t(e._resolved)}`
      : n === 'pending'
      ? '1'
      : `2 ${t(e._error)}`;
  },
  Ru = (e) => {
    const [t, n] = e.split(' '),
      s = Au(void 0);
    return (
      (s.value = Promise.resolve()),
      t === '0'
        ? ((s._state = 'resolved'), (s._resolved = n), (s.loading = !1))
        : t === '1'
        ? ((s._state = 'pending'),
          (s.value = new Promise(() => {})),
          (s.loading = !0))
        : t === '2' &&
          ((s._state = 'rejected'), (s._error = n), (s.loading = !1)),
      s
    );
  },
  Z = (e) => $(De, { 'q:s': '' }, 0, e.name ?? ''),
  Hn = '';
function Q(e) {
  return {
    $prefixCode$: e.$prefix$.charCodeAt(0),
    $prefixChar$: e.$prefix$,
    $test$: e.$test$,
    $serialize$: e.$serialize$,
    $prepare$: e.$prepare$,
    $fill$: e.$fill$,
    $collect$: e.$collect$,
    $subs$: e.$subs$,
  };
}
const Mu = Q({
    $prefix$: '',
    $test$: (e) => so(e),
    $collect$: (e, t, n) => {
      if (e.$captureRef$) for (const s of e.$captureRef$) D(s, t, n);
      t.$prefetch$ === 0 && t.$qrls$.push(e);
    },
    $serialize$: (e, t) => eo(e, { $getObjId$: t }),
    $prepare$: (e, t) => On(e, t.$containerEl$),
    $fill$: (e, t) => {
      e.$capture$ &&
        e.$capture$.length > 0 &&
        ((e.$captureRef$ = e.$capture$.map(t)), (e.$capture$ = null));
    },
  }),
  Pu = Q({
    $prefix$: '',
    $test$: (e) => Us(e),
    $collect$: (e, t, n) => {
      D(e.$qrl$, t, n),
        e.$state$ &&
          (D(e.$state$, t, n),
          n === !0 && e.$state$ instanceof Lt && yt(e.$state$[qe], t, !0));
    },
    $serialize$: (e, t) => vc(e, t),
    $prepare$: (e) => _c(e),
    $fill$: (e, t) => {
      (e.$el$ = t(e.$el$)),
        (e.$qrl$ = t(e.$qrl$)),
        e.$state$ && (e.$state$ = t(e.$state$));
    },
  }),
  Du = Q({
    $prefix$: '',
    $test$: (e) => zu(e),
    $collect$: (e, t, n) => {
      D(e.value, t, n), D(e._resolved, t, n);
    },
    $serialize$: (e, t) => Iu(e, t),
    $prepare$: (e) => Ru(e),
    $fill$: (e, t) => {
      if (e._state === 'resolved')
        (e._resolved = t(e._resolved)),
          (e.value = Promise.resolve(e._resolved));
      else if (e._state === 'rejected') {
        const n = Promise.reject(e._error);
        n.catch(() => null), (e._error = t(e._error)), (e.value = n);
      }
    },
  }),
  Fu = Q({
    $prefix$: '',
    $test$: (e) => e instanceof URL,
    $serialize$: (e) => e.href,
    $prepare$: (e) => new URL(e),
    $fill$: void 0,
  }),
  Ou = Q({
    $prefix$: '',
    $test$: (e) => e instanceof Date,
    $serialize$: (e) => e.toISOString(),
    $prepare$: (e) => new Date(e),
    $fill$: void 0,
  }),
  Hu = Q({
    $prefix$: '\x07',
    $test$: (e) => e instanceof RegExp,
    $serialize$: (e) => `${e.flags} ${e.source}`,
    $prepare$: (e) => {
      const t = e.indexOf(' '),
        n = e.slice(t + 1),
        s = e.slice(0, t);
      return new RegExp(n, s);
    },
    $fill$: void 0,
  }),
  Uu = Q({
    $prefix$: '',
    $test$: (e) => e instanceof Error,
    $serialize$: (e) => e.message,
    $prepare$: (e) => {
      const t = new Error(e);
      return (t.stack = void 0), t;
    },
    $fill$: void 0,
  }),
  Bu = Q({
    $prefix$: '',
    $test$: (e) => $r(e),
    $serialize$: void 0,
    $prepare$: (e, t, n) => n,
    $fill$: void 0,
  }),
  _n = Symbol('serializable-data'),
  Wu = Q({
    $prefix$: '',
    $test$: (e) => Ll(e),
    $serialize$: (e, t) => {
      const [n] = e[_n];
      return eo(n, { $getObjId$: t });
    },
    $prepare$: (e, t) => {
      const n = On(e, t.$containerEl$);
      return R(n);
    },
    $fill$: (e, t) => {
      const [n] = e[_n];
      n.$capture$ &&
        n.$capture$.length > 0 &&
        ((n.$captureRef$ = n.$capture$.map(t)), (n.$capture$ = null));
    },
  }),
  Qu = Q({
    $prefix$: '',
    $test$: (e) => e instanceof is,
    $collect$: (e, t, n) => {
      if (e.$args$) for (const s of e.$args$) D(s, t, n);
    },
    $serialize$: (e, t, n) => {
      const s = ki(e);
      let o = n.$inlinedFunctions$.indexOf(s);
      return (
        o < 0 &&
          ((o = n.$inlinedFunctions$.length), n.$inlinedFunctions$.push(s)),
        Je(e.$args$, t, ' ') + ' @' + Pe(o)
      );
    },
    $prepare$: (e) => {
      const t = e.split(' '),
        n = t.slice(0, -1),
        s = t[t.length - 1];
      return new is(s, n, s);
    },
    $fill$: (e, t) => {
      e.$func$, (e.$func$ = t(e.$func$)), (e.$args$ = e.$args$.map(t));
    },
  }),
  Ku = Q({
    $prefix$: '',
    $test$: (e) => e instanceof Lt,
    $collect$: (e, t, n) => (
      D(e.untrackedValue, t, n), n === !0 && !(1 & e[Et]) && yt(e[qe], t, !0), e
    ),
    $serialize$: (e, t) => t(e.untrackedValue),
    $prepare$: (e, t) => {
      var n;
      return new Lt(
        e,
        (n = t == null ? void 0 : t.$subsManager$) == null
          ? void 0
          : n.$createManager$(),
        0
      );
    },
    $subs$: (e, t) => {
      e[qe].$addSubs$(t);
    },
    $fill$: (e, t) => {
      e.untrackedValue = t(e.untrackedValue);
    },
  }),
  Vu = Q({
    $prefix$: '',
    $test$: (e) => e instanceof cs,
    $collect$(e, t, n) {
      if ((D(e.ref, t, n), Cl(e.ref))) {
        const s = re(e.ref);
        id(t.$containerState$.$subsManager$, s, n) && D(e.ref[e.prop], t, n);
      }
      return e;
    },
    $serialize$: (e, t) => `${t(e.ref)} ${e.prop}`,
    $prepare$: (e) => {
      const [t, n] = e.split(' ');
      return new cs(t, n);
    },
    $fill$: (e, t) => {
      e.ref = t(e.ref);
    },
  }),
  Zu = Q({
    $prefix$: '',
    $test$: (e) => typeof e == 'number',
    $serialize$: (e) => String(e),
    $prepare$: (e) => Number(e),
    $fill$: void 0,
  }),
  Yu = Q({
    $prefix$: '',
    $test$: (e) => e instanceof URLSearchParams,
    $serialize$: (e) => e.toString(),
    $prepare$: (e) => new URLSearchParams(e),
    $fill$: void 0,
  }),
  Gu = Q({
    $prefix$: '',
    $test$: (e) => typeof FormData < 'u' && e instanceof globalThis.FormData,
    $serialize$: (e) => {
      const t = [];
      return (
        e.forEach((n, s) => {
          t.push(typeof n == 'string' ? [s, n] : [s, n.name]);
        }),
        JSON.stringify(t)
      );
    },
    $prepare$: (e) => {
      const t = JSON.parse(e),
        n = new FormData();
      for (const [s, o] of t) n.append(s, o);
      return n;
    },
    $fill$: void 0,
  }),
  Xu = Q({
    $prefix$: '',
    $test$: (e) => nt(e),
    $collect$: (e, t, n) => {
      D(e.children, t, n), D(e.props, t, n), D(e.immutableProps, t, n);
      let s = e.type;
      s === Z ? (s = ':slot') : s === $e && (s = ':fragment'), D(s, t, n);
    },
    $serialize$: (e, t) => {
      let n = e.type;
      return (
        n === Z ? (n = ':slot') : n === $e && (n = ':fragment'),
        `${t(n)} ${t(e.props)} ${t(e.immutableProps)} ${t(e.children)} ${
          e.flags
        }`
      );
    },
    $prepare$: (e) => {
      const [t, n, s, o, r] = e.split(' ');
      return new wt(t, n, s, o, parseInt(r, 10));
    },
    $fill$: (e, t) => {
      (e.type = cd(t(e.type))),
        (e.props = t(e.props)),
        (e.immutableProps = t(e.immutableProps)),
        (e.children = t(e.children));
    },
  }),
  Ju = Q({
    $prefix$: '',
    $test$: (e) => typeof e == 'bigint',
    $serialize$: (e) => e.toString(),
    $prepare$: (e) => BigInt(e),
    $fill$: void 0,
  }),
  pt = Symbol(),
  ed = Q({
    $prefix$: '',
    $test$: (e) => e instanceof Set,
    $collect$: (e, t, n) => {
      e.forEach((s) => D(s, t, n));
    },
    $serialize$: (e, t) => Array.from(e).map(t).join(' '),
    $prepare$: (e) => {
      const t = new Set();
      return (t[pt] = e), t;
    },
    $fill$: (e, t) => {
      const n = e[pt];
      e[pt] = void 0;
      const s = n.length === 0 ? [] : n.split(' ');
      for (const o of s) e.add(t(o));
    },
  }),
  td = Q({
    $prefix$: '',
    $test$: (e) => e instanceof Map,
    $collect$: (e, t, n) => {
      e.forEach((s, o) => {
        D(s, t, n), D(o, t, n);
      });
    },
    $serialize$: (e, t) => {
      const n = [];
      return (
        e.forEach((s, o) => {
          n.push(t(o) + ' ' + t(s));
        }),
        n.join(' ')
      );
    },
    $prepare$: (e) => {
      const t = new Map();
      return (t[pt] = e), t;
    },
    $fill$: (e, t) => {
      const n = e[pt];
      e[pt] = void 0;
      const s = n.length === 0 ? [] : n.split(' ');
      s.length % 2;
      for (let o = 0; o < s.length; o += 2) e.set(t(s[o]), t(s[o + 1]));
    },
  }),
  nd = Q({
    $prefix$: '\x1B',
    $test$: (e) => !!xl(e) || e === Hn,
    $serialize$: (e) => e,
    $prepare$: (e) => e,
    $fill$: void 0,
  }),
  Un = [
    Mu,
    Pu,
    Du,
    Fu,
    Ou,
    Hu,
    Uu,
    Bu,
    Wu,
    Qu,
    Ku,
    Vu,
    Zu,
    Yu,
    Gu,
    Xu,
    Ju,
    ed,
    td,
    nd,
  ],
  Vo = (() => {
    const e = [];
    return (
      Un.forEach((t) => {
        const n = t.$prefixCode$;
        for (; e.length < n; ) e.push(void 0);
        e.push(t);
      }),
      e
    );
  })();
function xl(e) {
  if (typeof e == 'string') {
    const t = e.charCodeAt(0);
    if (t < Vo.length) return Vo[t];
  }
}
const sd = Un.filter((e) => e.$collect$),
  od = (e) => {
    for (const t of Un) if (t.$test$(e)) return !0;
    return !1;
  },
  rd = (e, t, n) => {
    for (const s of sd) if (s.$test$(e)) return s.$collect$(e, t, n), !0;
    return !1;
  },
  ld = (e, t, n, s) => {
    for (const o of Un)
      if (o.$test$(e)) {
        let r = o.$prefixChar$;
        return o.$serialize$ && (r += o.$serialize$(e, t, n, s)), r;
      }
    if (typeof e == 'string') return e;
  },
  kl = (e, t) => {
    const n = new Map(),
      s = new Map();
    return {
      prepare(o) {
        const r = xl(o);
        if (r) {
          const a = r.$prepare$(o.slice(1), e, t);
          return r.$fill$ && n.set(a, r), r.$subs$ && s.set(a, r), a;
        }
        return o;
      },
      subs(o, r) {
        const a = s.get(o);
        return !!a && (a.$subs$(o, r, e), !0);
      },
      fill(o, r) {
        const a = n.get(o);
        return !!a && (a.$fill$(o, r, e), !0);
      },
    };
  },
  ad = {
    '!': (e, t) => t.$proxyMap$.get(e) ?? zs(e, t),
    '~': (e) => Promise.resolve(e),
    _: (e) => Promise.reject(e),
  },
  id = (e, t, n) => {
    if (typeof n == 'boolean') return n;
    const s = e.$groupToManagers$.get(n);
    return !!(s && s.length > 0) && (s.length !== 1 || s[0] !== t);
  },
  cd = (e) => (e === ':slot' ? Z : e === ':fragment' ? $e : e),
  ud = (e, t) => gs(e, new Set(), '_', t),
  gs = (e, t, n, s) => {
    const o = Yt(e);
    if (o == null) return e;
    if (dd(o)) {
      if (t.has(o) || (t.add(o), od(o))) return e;
      const r = typeof o;
      switch (r) {
        case 'object':
          if (X(o) || Ue(o)) return e;
          if (B(o)) {
            let i = 0;
            return (
              o.forEach((c, u) => {
                if (u !== i) throw Y(3, o);
                gs(c, t, n + '[' + u + ']'), (i = u + 1);
              }),
              e
            );
          }
          if (Ht(o)) {
            for (const [i, c] of Object.entries(o)) gs(c, t, n + '.' + i);
            return e;
          }
          break;
        case 'boolean':
        case 'string':
        case 'number':
          return e;
      }
      let a = '';
      if (
        ((a = s || 'Value cannot be serialized'),
        n !== '_' && (a += ` in ${n},`),
        r === 'object')
      )
        a += ` because it's an instance of "${
          e == null ? void 0 : e.constructor.name
        }". You might need to use 'noSerialize()' or use an object literal instead. Check out https://qwik.builder.io/docs/advanced/dollar/`;
      else if (r === 'function') {
        const i = e.name;
        a += ` because it's a function named "${i}". You might need to convert it to a QRL using $(fn):

const ${i} = $(${String(e)});

Please check out https://qwik.builder.io/docs/advanced/qrl/ for more information.`;
      }
      console.error('Trying to serialize', e), br(a);
    }
    return e;
  },
  no = new WeakSet(),
  Sl = new WeakSet(),
  dd = (e) => (!Te(e) && !fe(e)) || !no.has(e),
  ql = (e) => no.has(e),
  Cl = (e) => Sl.has(e),
  Zt = (e) => (e != null && no.add(e), e),
  pd = (e) => (Sl.add(e), e),
  Yt = (e) => (Te(e) ? ot(e) ?? e : e),
  ot = (e) => e[rs],
  re = (e) => e[qe],
  jl = (e) => e[it],
  md = (e, t) => {
    const n = e[0],
      s = typeof e[1] == 'string' ? e[1] : t(e[1]);
    if (!s) return;
    let o = n + ' ' + s,
      r;
    if (n === 0) r = e[2];
    else {
      const a = t(e[2]);
      if (!a) return;
      n <= 2
        ? ((r = e[5]), (o += ` ${a} ${Zo(t(e[3]))} ${e[4]}`))
        : n <= 4 &&
          ((r = e[4]),
          (o += ` ${a} ${typeof e[3] == 'string' ? e[3] : Zo(t(e[3]))}`));
    }
    return r && (o += ` ${encodeURI(r)}`), o;
  },
  fd = (e, t) => {
    const n = e.split(' '),
      s = parseInt(n[0], 10);
    n.length >= 2;
    const o = t(n[1]);
    if (!o || (Us(o) && !o.$el$)) return;
    const r = [s, o];
    return (
      s === 0
        ? (n.length <= 3, r.push(Gn(n[2])))
        : s <= 2
        ? (n.length === 5 || n.length, r.push(t(n[2]), t(n[3]), n[4], Gn(n[5])))
        : s <= 4 &&
          (n.length === 4 || n.length, r.push(t(n[2]), t(n[3]), Gn(n[4]))),
      r
    );
  },
  Gn = (e) => {
    if (e !== void 0) return decodeURI(e);
  },
  hd = (e) => {
    const t = new Map();
    return {
      $groupToManagers$: t,
      $createManager$: (s) => new gd(t, e, s),
      $clearSub$: (s) => {
        const o = t.get(s);
        if (o) {
          for (const r of o) r.$unsubGroup$(s);
          t.delete(s), (o.length = 0);
        }
      },
      $clearSignal$: (s) => {
        const o = t.get(s[1]);
        if (o) for (const r of o) r.$unsubEntry$(s);
      },
    };
  };
class gd {
  constructor(t, n, s) {
    (this.$groupToManagers$ = t),
      (this.$containerState$ = n),
      (this.$subs$ = []),
      s && this.$addSubs$(s);
  }
  $addSubs$(t) {
    this.$subs$.push(...t);
    for (const n of this.$subs$) this.$addToGroup$(n[1], this);
  }
  $addToGroup$(t, n) {
    let s = this.$groupToManagers$.get(t);
    s || this.$groupToManagers$.set(t, (s = [])), s.includes(n) || s.push(n);
  }
  $unsubGroup$(t) {
    const n = this.$subs$;
    for (let s = 0; s < n.length; s++) n[s][1] === t && (n.splice(s, 1), s--);
  }
  $unsubEntry$(t) {
    const [n, s, o, r] = t,
      a = this.$subs$;
    if (n === 1 || n === 2) {
      const i = t[4];
      for (let c = 0; c < a.length; c++) {
        const u = a[c];
        u[0] === n &&
          u[1] === s &&
          u[2] === o &&
          u[3] === r &&
          u[4] === i &&
          (a.splice(c, 1), c--);
      }
    } else if (n === 3 || n === 4)
      for (let i = 0; i < a.length; i++) {
        const c = a[i];
        c[0] === n &&
          c[1] === s &&
          c[2] === o &&
          c[3] === r &&
          (a.splice(i, 1), i--);
      }
  }
  $addSub$(t, n) {
    const s = this.$subs$,
      o = t[1];
    (t[0] === 0 && s.some(([r, a, i]) => r === 0 && a === o && i === n)) ||
      (s.push((Tl = [...t, n])), this.$addToGroup$(o, this));
  }
  $notifySubs$(t) {
    const n = this.$subs$;
    for (const s of n) {
      const o = s[s.length - 1];
      (t && o && o !== t) || lc(s, this.$containerState$);
    }
  }
}
let Tl;
function yd() {
  return Tl;
}
const Zo = (e) => {
    if (e == null) throw et('must be non null', e);
    return e;
  },
  so = (e) => typeof e == 'function' && typeof e.getSymbol == 'function',
  $d = (e) => so(e) && e.$symbol$ == '<sync>',
  Bn = (e, t, n, s, o, r, a) => {
    let i;
    const c = async function (...h) {
        return await m.call(this, be())(...h);
      },
      u = (h) => (i || (i = h), i),
      p = async (h) => {
        if (
          (h && u(h), e == '' && (n = (i.qFuncs || [])[Number(t)]), n !== null)
        )
          return n;
        if (s !== null) return (n = s().then((y) => (c.resolved = n = y[t])));
        {
          const y = En().importSymbol(i, e, t);
          return (n = F(y, (k) => (c.resolved = n = k)));
        }
      },
      f = (h) => (n !== null ? n : p(h));
    function m(h, y) {
      return (...k) => {
        const _ = vd(),
          v = f();
        return F(v, (q) => {
          if (fe(q)) {
            if (y && y() === !1) return;
            const E = { ...g(h), $qrl$: c };
            return (
              E.$event$ === void 0 && (E.$event$ = this),
              bd(t, E.$element$, _),
              ae.call(this, E, q, ...k)
            );
          }
          throw Y(10);
        });
      };
    }
    const g = (h) => (h == null ? we() : B(h) ? Jr(h) : h),
      b = a ?? t,
      w = El(b);
    return (
      Object.assign(c, {
        getSymbol: () => b,
        getHash: () => w,
        getCaptured: () => r,
        resolve: p,
        $resolveLazy$: f,
        $setContainer$: u,
        $chunk$: e,
        $symbol$: t,
        $refSymbol$: a,
        $hash$: w,
        getFn: m,
        $capture$: o,
        $captureRef$: r,
        dev: null,
        resolved: t == '<sync>' ? n : void 0,
      }),
      c
    );
  },
  El = (e) => {
    const t = e.lastIndexOf('_');
    return t > -1 ? e.slice(t + 1) : e;
  };
const Yo = new Set(),
  bd = (e, t, n) => {
    Yo.has(e) ||
      (Yo.add(e), wd('qsymbol', { symbol: e, element: t, reqTime: n }));
  },
  wd = (e, t) => {
    ze() ||
      typeof document != 'object' ||
      document.dispatchEvent(new CustomEvent(e, { bubbles: !1, detail: t }));
  },
  vd = () =>
    ze() ? 0 : typeof performance == 'object' ? performance.now() : 0,
  R = (e) => {
    function t(n, s, o) {
      const r = e.$hash$.slice(0, 4);
      return $(
        De,
        {
          'q:renderFn': e,
          [he]: n[he],
          [d]: n[d],
          children: n.children,
          props: n,
        },
        o,
        r + ':' + (s || '')
      );
    }
    return (t[_n] = [e]), t;
  },
  Ll = (e) => typeof e == 'function' && e[_n] !== void 0,
  en = (e, t) => {
    const { val: n, set: s, iCtx: o } = st();
    if (n != null) return n;
    const r = fe(e) ? ae(void 0, e) : e;
    if ((t == null ? void 0 : t.reactive) === !1) return s(r), r;
    {
      const a = zs(
        r,
        o.$renderCtx$.$static$.$containerState$,
        (t == null ? void 0 : t.deep) ?? !0 ? 1 : 0
      );
      return s(a), a;
    }
  };
function Pt(e, t) {
  var s;
  const n = be();
  return (
    ((s = n == null ? void 0 : n.$renderCtx$) == null
      ? void 0
      : s.$static$.$containerState$.$serverData$[e]) ?? t
  );
}
const Go = new Map(),
  _d = (e, t) => {
    let n = Go.get(t);
    return n || Go.set(t, (n = xd(e, t))), n;
  },
  xd = (e, t) => {
    const n = e.length,
      s = [],
      o = [];
    let r = 0,
      a = r,
      i = mt,
      c = 0;
    for (; r < n; ) {
      const g = r;
      let b = e.charCodeAt(r++);
      b === Nd && (r++, (b = Ml));
      const w = Md[i];
      for (let h = 0; h < w.length; h++) {
        const y = w[h],
          [k, _, v] = y;
        if (
          (k === c || k === N || (k === xn && on(c)) || (k === ys && Jo(c))) &&
          (_ === b ||
            _ === N ||
            (_ === xn && on(b)) ||
            (_ === Ne && !on(b) && b !== ro) ||
            (_ === ys && Jo(b))) &&
          (y.length == 3 || f(y))
        ) {
          if ((y.length > 3 && (b = e.charCodeAt(r - 1)), v === J || v == Ze)) {
            v === Ze &&
              (i !== Nl || m()
                ? Xo(b) || p(r - (_ == Ne ? 1 : _ == $s ? 2 : 0))
                : (Xo(b) ? u(r - 2) : p(r - 2), a++)),
              _ === Ne && (r--, (b = c));
            do (i = o.pop() || mt), i === Ye && (u(r - 1), a++);
            while (kd(i));
          } else
            o.push(i),
              i === Ye && v === mt ? (u(r - 8), (a = r)) : v === Al && p(g),
              (i = v);
          break;
        }
      }
      c = b;
    }
    return u(r), s.join('');
    function u(g) {
      s.push(e.substring(a, g)), (a = g);
    }
    function p(g) {
      i === Ye || m() || (u(g), s.push('.', '⭐️', t));
    }
    function f(g) {
      let b = 0;
      if (e.charCodeAt(r) === bs) {
        for (let w = 1; w < 10; w++)
          if (e.charCodeAt(r + w) === bs) {
            b = w + 1;
            break;
          }
      }
      e: for (let w = 3; w < g.length; w++) {
        const h = g[w];
        for (let y = 0; y < h.length; y++)
          if ((e.charCodeAt(r + y + b) | zd) !== h.charCodeAt(y)) continue e;
        return (r += h.length + b), !0;
      }
      return !1;
    }
    function m() {
      return o.indexOf(Ye) !== -1 || o.indexOf(oo) !== -1;
    }
  },
  on = (e) =>
    (e >= Td && e <= Ed) ||
    (e >= Ml && e <= Ld) ||
    (e >= Id && e <= Rd) ||
    e >= 128 ||
    e === Ad ||
    e === bs,
  Xo = (e) => e === at || e === ro || e === Pl || e === Rl || on(e),
  kd = (e) => e === zl || e === oo || e === Il || e === Ye,
  Jo = (e) => e === jd || e === Sd || e === qd || e === Cd,
  mt = 0,
  Nl = 2,
  Ye = 5,
  Al = 6,
  oo = 10,
  zl = 11,
  Il = 12,
  J = 17,
  Ze = 18,
  N = 0,
  xn = 1,
  Ne = 2,
  ys = 3,
  Sd = 9,
  qd = 10,
  Cd = 13,
  jd = 32,
  Rl = 35,
  $s = 41,
  bs = 45,
  ro = 46,
  Td = 48,
  Ed = 57,
  at = 58,
  Ml = 65,
  Ld = 90,
  Pl = 91,
  Nd = 92,
  Ad = 95,
  zd = 32,
  Id = 97,
  Rd = 122,
  Ke = [
    [N, 39, 14],
    [N, 34, 15],
    [N, 47, 16, '*'],
  ],
  Md = [
    [
      [N, 42, Nl],
      [N, Pl, 7],
      [N, at, Al, ':', 'before', 'after', 'first-letter', 'first-line'],
      [N, at, Ye, 'global'],
      [N, at, 3, 'has', 'host-context', 'not', 'where', 'is', 'matches', 'any'],
      [N, at, 4],
      [N, xn, 1],
      [N, ro, 1],
      [N, Rl, 1],
      [N, 64, oo, 'keyframe'],
      [N, 64, zl, 'media', 'supports'],
      [N, 64, Il],
      [N, 123, 13],
      [47, 42, 16],
      [N, 59, J],
      [N, 125, J],
      [N, $s, J],
      ...Ke,
    ],
    [[N, Ne, Ze]],
    [[N, Ne, Ze]],
    [
      [N, 40, mt],
      [N, Ne, Ze],
    ],
    [
      [N, 40, 8],
      [N, Ne, Ze],
    ],
    [
      [N, 40, mt],
      [N, Ne, J],
    ],
    [[N, Ne, J]],
    [
      [N, 93, Ze],
      [N, 39, 14],
      [N, 34, 15],
    ],
    [[N, $s, J], ...Ke],
    [[N, 125, J], ...Ke],
    [[N, 125, J], [ys, xn, 1], [N, at, Ye, 'global'], [N, 123, 13], ...Ke],
    [[N, 123, mt], [N, 59, J], ...Ke],
    [[N, 59, J], [N, 123, 9], ...Ke],
    [[N, 125, J], [N, 123, 13], [N, 40, 8], ...Ke],
    [[N, 39, J]],
    [[N, 34, J]],
    [[42, 47, J]],
  ],
  Dl = (e) => {
    Fl(e, (t) => t, !1);
  },
  W = (e) => ({ scopeId: '⭐️' + Fl(e, _d, !0) }),
  Fl = (e, t, n) => {
    const { val: s, set: o, iCtx: r, i: a, elCtx: i } = st();
    if (s) return s;
    const c = Ti(e, a),
      u = r.$renderCtx$.$static$.$containerState$;
    if (
      (o(c),
      i.$appendStyles$ || (i.$appendStyles$ = []),
      i.$scopeIds$ || (i.$scopeIds$ = []),
      n && i.$scopeIds$.push(Ei(c)),
      u.$styleIds$.has(c))
    )
      return c;
    u.$styleIds$.add(c);
    const p = e.$resolveLazy$(u.$containerEl$),
      f = (m) => {
        i.$appendStyles$,
          i.$appendStyles$.push({ styleId: c, content: t(m, c) });
      };
    return X(p) ? r.$waitOn$.push(p.then(f)) : f(p), c;
  },
  pe = (e) => {
    const { val: t, set: n, iCtx: s } = st();
    if (t != null) return t;
    const o = s.$renderCtx$.$static$.$containerState$,
      r = fe(e) && !Ll(e) ? ae(void 0, e) : e;
    return n(Si(r, o, 0, void 0));
  };
/**
 * @license
 * @builder.io/qwik/server 1.3.1
 * Copyright Builder.io, Inc. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/BuilderIO/qwik/blob/main/LICENSE
 */ var Pd = ((e) =>
    typeof require < 'u'
      ? require
      : typeof Proxy < 'u'
      ? new Proxy(e, { get: (t, n) => (typeof require < 'u' ? require : t)[n] })
      : e)(function (e) {
    if (typeof require < 'u') return require.apply(this, arguments);
    throw Error('Dynamic require of "' + e + '" is not supported');
  }),
  Dd = '<sync>';
function Ol(e, t) {
  const n = t == null ? void 0 : t.mapper,
    s = e.symbolMapper
      ? e.symbolMapper
      : (r) => {
          var a;
          if (n) {
            const i = ws(r),
              c = n[i];
            if (!c) {
              if (i === Dd) return [i, ''];
              if (
                (a = globalThis.__qwik_reg_symbols) == null ? void 0 : a.has(i)
              )
                return [r, '_'];
              console.error('Cannot resolve symbol', r, 'in', n);
            }
            return c;
          }
        };
  return {
    isServer: !0,
    async importSymbol(r, a, i) {
      var m;
      const c = ws(i),
        u = (m = globalThis.__qwik_reg_symbols) == null ? void 0 : m.get(c);
      if (u) return u;
      let p = String(a);
      p.endsWith('.js') || (p += '.js');
      const f = Pd(p);
      if (!(i in f))
        throw new Error(`Q-ERROR: missing symbol '${i}' in module '${p}'.`);
      return f[i];
    },
    raf: () => (console.error('server can not rerender'), Promise.resolve()),
    nextTick: (r) =>
      new Promise((a) => {
        setTimeout(() => {
          a(r());
        });
      }),
    chunkForSymbol(r) {
      return s(r, n);
    },
  };
}
async function Fd(e, t) {
  const n = Ol(e, t);
  wr(n);
}
var ws = (e) => {
  const t = e.lastIndexOf('_');
  return t > -1 ? e.slice(t + 1) : e;
};
function Xn() {
  if (typeof performance > 'u') return () => 0;
  const e = performance.now();
  return () => (performance.now() - e) / 1e6;
}
function Hl(e) {
  let t = e.base;
  return (
    typeof e.base == 'function' && (t = e.base(e)),
    typeof t == 'string' ? (t.endsWith('/') || (t += '/'), t) : '/build/'
  );
}
var Od = `((e,t)=>{const n="__q_context__",s=window,o=new Set,i=t=>e.querySelectorAll(t),a=(e,t,n=t.type)=>{i("[on"+e+"\\\\:"+n+"]").forEach((s=>f(s,e,t,n)))},r=(e,t)=>e.getAttribute(t),l=t=>{if(void 0===t._qwikjson_){let n=(t===e.documentElement?e.body:t).lastElementChild;for(;n;){if("SCRIPT"===n.tagName&&"qwik/json"===r(n,"type")){t._qwikjson_=JSON.parse(n.textContent.replace(/\\\\x3C(\\/?script)/g,"<$1"));break}n=n.previousElementSibling}}},c=(e,t)=>new CustomEvent(e,{detail:t}),f=async(t,s,o,i=o.type)=>{const a="on"+s+":"+i;t.hasAttribute("preventdefault:"+i)&&o.preventDefault();const c=t._qc_,f=null==c?void 0:c.li.filter((e=>e[0]===a));if(f&&f.length>0){for(const e of f)await e[1].getFn([t,o],(()=>t.isConnected))(o,t);return}const b=r(t,a);if(b){const s=t.closest("[q\\\\:container]"),i=new URL(r(s,"q:base"),e.baseURI);for(const a of b.split("\\n")){const r=new URL(a,i),c=r.hash.replace(/^#?([^?[|]*).*$/,"$1")||"default",f=performance.now();let b;const d=a.startsWith("#");if(d)b=(s.qFuncs||[])[Number.parseInt(c)];else{const e=import(
/* @vite-ignore */
r.href.split("#")[0]);l(s),b=(await e)[c]}const p=e[n];if(t.isConnected)try{e[n]=[t,o,r],d||u("qsymbol",{symbol:c,element:t,reqTime:f}),await b(o,t)}finally{e[n]=p}}}},u=(t,n)=>{e.dispatchEvent(c(t,n))},b=e=>e.replace(/([A-Z])/g,(e=>"-"+e.toLowerCase())),d=async e=>{let t=b(e.type),n=e.target;for(a("-document",e,t);n&&n.getAttribute;)await f(n,"",e,t),n=e.bubbles&&!0!==e.cancelBubble?n.parentElement:null},p=e=>{a("-window",e,b(e.type))},q=()=>{var n;const a=e.readyState;if(!t&&("interactive"==a||"complete"==a)&&(t=1,u("qinit"),(null!=(n=s.requestIdleCallback)?n:s.setTimeout).bind(s)((()=>u("qidle"))),o.has("qvisible"))){const e=i("[on\\\\:qvisible]"),t=new IntersectionObserver((e=>{for(const n of e)n.isIntersecting&&(t.unobserve(n.target),f(n.target,"",c("qvisible",n)))}));e.forEach((e=>t.observe(e)))}},w=(e,t,n,s=!1)=>e.addEventListener(t,n,{capture:s,passive:!1}),v=t=>{for(const n of t)o.has(n)||(w(e,n,d,!0),w(s,n,p),o.add(n))};if(!e.qR){const t=s.qwikevents;Array.isArray(t)&&v(t),s.qwikevents={push:(...e)=>v(e)},w(e,"readystatechange",q),q()}})(document);`,
  Hd = `(() => {
    ((doc, hasInitialized) => {
        const win = window;
        const events =  new Set;
        const querySelectorAll = query => doc.querySelectorAll(query);
        const broadcast = (infix, ev, type = ev.type) => {
            querySelectorAll("[on" + infix + "\\\\:" + type + "]").forEach((target => dispatch(target, infix, ev, type)));
        };
        const getAttribute = (el, name) => el.getAttribute(name);
        const resolveContainer = containerEl => {
            if (void 0 === containerEl._qwikjson_) {
                let script = (containerEl === doc.documentElement ? doc.body : containerEl).lastElementChild;
                while (script) {
                    if ("SCRIPT" === script.tagName && "qwik/json" === getAttribute(script, "type")) {
                        containerEl._qwikjson_ = JSON.parse(script.textContent.replace(/\\\\x3C(\\/?script)/g, "<$1"));
                        break;
                    }
                    script = script.previousElementSibling;
                }
            }
        };
        const createEvent = (eventName, detail) => new CustomEvent(eventName, {
            detail: detail
        });
        const dispatch = async (element, onPrefix, ev, eventName = ev.type) => {
            const attrName = "on" + onPrefix + ":" + eventName;
            element.hasAttribute("preventdefault:" + eventName) && ev.preventDefault();
            const ctx = element._qc_;
            const qrls = null == ctx ? void 0 : ctx.li.filter((li => li[0] === attrName));
            if (qrls && qrls.length > 0) {
                for (const q of qrls) {
                    await q[1].getFn([ element, ev ], (() => element.isConnected))(ev, element);
                }
                return;
            }
            const attrValue = getAttribute(element, attrName);
            if (attrValue) {
                const container = element.closest("[q\\\\:container]");
                const base = new URL(getAttribute(container, "q:base"), doc.baseURI);
                for (const qrl of attrValue.split("\\n")) {
                    const url = new URL(qrl, base);
                    const symbolName = url.hash.replace(/^#?([^?[|]*).*$/, "$1") || "default";
                    const reqTime = performance.now();
                    let handler;
                    const isSync = qrl.startsWith("#");
                    if (isSync) {
                        handler = (container.qFuncs || [])[Number.parseInt(symbolName)];
                    } else {
                        const module = import(
                        /* @vite-ignore */
                        url.href.split("#")[0]);
                        resolveContainer(container);
                        handler = (await module)[symbolName];
                    }
                    const previousCtx = doc.__q_context__;
                    if (element.isConnected) {
                        try {
                            doc.__q_context__ = [ element, ev, url ];
                            isSync || emitEvent("qsymbol", {
                                symbol: symbolName,
                                element: element,
                                reqTime: reqTime
                            });
                            await handler(ev, element);
                        } finally {
                            doc.__q_context__ = previousCtx;
                        }
                    }
                }
            }
        };
        const emitEvent = (eventName, detail) => {
            doc.dispatchEvent(createEvent(eventName, detail));
        };
        const camelToKebab = str => str.replace(/([A-Z])/g, (a => "-" + a.toLowerCase()));
        const processDocumentEvent = async ev => {
            let type = camelToKebab(ev.type);
            let element = ev.target;
            broadcast("-document", ev, type);
            while (element && element.getAttribute) {
                await dispatch(element, "", ev, type);
                element = ev.bubbles && !0 !== ev.cancelBubble ? element.parentElement : null;
            }
        };
        const processWindowEvent = ev => {
            broadcast("-window", ev, camelToKebab(ev.type));
        };
        const processReadyStateChange = () => {
            var _a;
            const readyState = doc.readyState;
            if (!hasInitialized && ("interactive" == readyState || "complete" == readyState)) {
                hasInitialized = 1;
                emitEvent("qinit");
                (null != (_a = win.requestIdleCallback) ? _a : win.setTimeout).bind(win)((() => emitEvent("qidle")));
                if (events.has("qvisible")) {
                    const results = querySelectorAll("[on\\\\:qvisible]");
                    const observer = new IntersectionObserver((entries => {
                        for (const entry of entries) {
                            if (entry.isIntersecting) {
                                observer.unobserve(entry.target);
                                dispatch(entry.target, "", createEvent("qvisible", entry));
                            }
                        }
                    }));
                    results.forEach((el => observer.observe(el)));
                }
            }
        };
        const addEventListener = (el, eventName, handler, capture = !1) => el.addEventListener(eventName, handler, {
            capture: capture,
            passive: !1
        });
        const push = eventNames => {
            for (const eventName of eventNames) {
                if (!events.has(eventName)) {
                    addEventListener(doc, eventName, processDocumentEvent, !0);
                    addEventListener(win, eventName, processWindowEvent);
                    events.add(eventName);
                }
            }
        };
        if (!doc.qR) {
            const qwikevents = win.qwikevents;
            Array.isArray(qwikevents) && push(qwikevents);
            win.qwikevents = {
                push: (...e) => push(e)
            };
            addEventListener(doc, "readystatechange", processReadyStateChange);
            processReadyStateChange();
        }
    })(document);
})();`,
  Ud = `((e,t)=>{const n="__q_context__",s=window,o=new Set,i=t=>e.querySelectorAll(t),a=(e,t,n=t.type)=>{i("[on"+e+"\\\\:"+n+"]").forEach((s=>f(s,e,t,n)))},r=(e,t)=>e.getAttribute(t),l=t=>{if(void 0===t._qwikjson_){let n=(t===e.documentElement?e.body:t).lastElementChild;for(;n;){if("SCRIPT"===n.tagName&&"qwik/json"===r(n,"type")){t._qwikjson_=JSON.parse(n.textContent.replace(/\\\\x3C(\\/?script)/g,"<$1"));break}n=n.previousElementSibling}}},c=(e,t)=>new CustomEvent(e,{detail:t}),f=async(t,s,o,i=o.type)=>{const a="on"+s+":"+i;t.hasAttribute("preventdefault:"+i)&&o.preventDefault();const c=t._qc_,f=null==c?void 0:c.li.filter((e=>e[0]===a));if(f&&f.length>0){for(const e of f)await e[1].getFn([t,o],(()=>t.isConnected))(o,t);return}const b=r(t,a);if(b){const s=t.closest("[q\\\\:container]"),i=new URL(r(s,"q:base"),e.baseURI);for(const a of b.split("\\n")){const r=new URL(a,i),c=r.hash.replace(/^#?([^?[|]*).*$/,"$1")||"default",f=performance.now();let b;const d=a.startsWith("#");if(d)b=(s.qFuncs||[])[Number.parseInt(c)];else{const e=import(
/* @vite-ignore */
r.href.split("#")[0]);l(s),b=(await e)[c]}const p=e[n];if(t.isConnected)try{e[n]=[t,o,r],d||u("qsymbol",{symbol:c,element:t,reqTime:f}),await b(o,t)}finally{e[n]=p}}}},u=(t,n)=>{e.dispatchEvent(c(t,n))},b=e=>e.replace(/([A-Z])/g,(e=>"-"+e.toLowerCase())),d=async e=>{let t=b(e.type),n=e.target;for(a("-document",e,t);n&&n.getAttribute;)await f(n,"",e,t),n=e.bubbles&&!0!==e.cancelBubble?n.parentElement:null},p=e=>{a("-window",e,b(e.type))},q=()=>{var n;const a=e.readyState;if(!t&&("interactive"==a||"complete"==a)&&(t=1,u("qinit"),(null!=(n=s.requestIdleCallback)?n:s.setTimeout).bind(s)((()=>u("qidle"))),o.has("qvisible"))){const e=i("[on\\\\:qvisible]"),t=new IntersectionObserver((e=>{for(const n of e)n.isIntersecting&&(t.unobserve(n.target),f(n.target,"",c("qvisible",n)))}));e.forEach((e=>t.observe(e)))}},w=(e,t,n,s=!1)=>e.addEventListener(t,n,{capture:s,passive:!1}),v=t=>{for(const n of t)o.has(n)||(w(e,n,d,!0),w(s,n,p),o.add(n))};if(!e.qR){const t=s.qwikevents;Array.isArray(t)&&v(t),s.qwikevents={push:(...e)=>v(e)},w(e,"readystatechange",q),q()}})(document);`,
  Bd = `(() => {
    ((doc, hasInitialized) => {
        const win = window;
        const events = new Set;
        const querySelectorAll = query => doc.querySelectorAll(query);
        const broadcast = (infix, ev, type = ev.type) => {
            querySelectorAll("[on" + infix + "\\\\:" + type + "]").forEach((target => dispatch(target, infix, ev, type)));
        };
        const getAttribute = (el, name) => el.getAttribute(name);
        const resolveContainer = containerEl => {
            if (void 0 === containerEl._qwikjson_) {
                let script = (containerEl === doc.documentElement ? doc.body : containerEl).lastElementChild;
                while (script) {
                    if ("SCRIPT" === script.tagName && "qwik/json" === getAttribute(script, "type")) {
                        containerEl._qwikjson_ = JSON.parse(script.textContent.replace(/\\\\x3C(\\/?script)/g, "<$1"));
                        break;
                    }
                    script = script.previousElementSibling;
                }
            }
        };
        const createEvent = (eventName, detail) => new CustomEvent(eventName, {
            detail: detail
        });
        const dispatch = async (element, onPrefix, ev, eventName = ev.type) => {
            const attrName = "on" + onPrefix + ":" + eventName;
            element.hasAttribute("preventdefault:" + eventName) && ev.preventDefault();
            const ctx = element._qc_;
            const qrls = null == ctx ? void 0 : ctx.li.filter((li => li[0] === attrName));
            if (qrls && qrls.length > 0) {
                for (const q of qrls) {
                    await q[1].getFn([ element, ev ], (() => element.isConnected))(ev, element);
                }
                return;
            }
            const attrValue = getAttribute(element, attrName);
            if (attrValue) {
                const container = element.closest("[q\\\\:container]");
                const base = new URL(getAttribute(container, "q:base"), doc.baseURI);
                for (const qrl of attrValue.split("\\n")) {
                    const url = new URL(qrl, base);
                    const symbolName = url.hash.replace(/^#?([^?[|]*).*$/, "$1") || "default";
                    const reqTime = performance.now();
                    let handler;
                    const isSync = qrl.startsWith("#");
                    if (isSync) {
                        handler = (container.qFuncs || [])[Number.parseInt(symbolName)];
                    } else {
                        const module = import(
                        /* @vite-ignore */
                        url.href.split("#")[0]);
                        resolveContainer(container);
                        handler = (await module)[symbolName];
                    }
                    const previousCtx = doc.__q_context__;
                    if (element.isConnected) {
                        try {
                            doc.__q_context__ = [ element, ev, url ];
                            isSync || emitEvent("qsymbol", {
                                symbol: symbolName,
                                element: element,
                                reqTime: reqTime
                            });
                            await handler(ev, element);
                        } finally {
                            doc.__q_context__ = previousCtx;
                        }
                    }
                }
            }
        };
        const emitEvent = (eventName, detail) => {
            doc.dispatchEvent(createEvent(eventName, detail));
        };
        const camelToKebab = str => str.replace(/([A-Z])/g, (a => "-" + a.toLowerCase()));
        const processDocumentEvent = async ev => {
            let type = camelToKebab(ev.type);
            let element = ev.target;
            broadcast("-document", ev, type);
            while (element && element.getAttribute) {
                await dispatch(element, "", ev, type);
                element = ev.bubbles && !0 !== ev.cancelBubble ? element.parentElement : null;
            }
        };
        const processWindowEvent = ev => {
            broadcast("-window", ev, camelToKebab(ev.type));
        };
        const processReadyStateChange = () => {
            var _a;
            const readyState = doc.readyState;
            if (!hasInitialized && ("interactive" == readyState || "complete" == readyState)) {
                hasInitialized = 1;
                emitEvent("qinit");
                (null != (_a = win.requestIdleCallback) ? _a : win.setTimeout).bind(win)((() => emitEvent("qidle")));
                if (events.has("qvisible")) {
                    const results = querySelectorAll("[on\\\\:qvisible]");
                    const observer = new IntersectionObserver((entries => {
                        for (const entry of entries) {
                            if (entry.isIntersecting) {
                                observer.unobserve(entry.target);
                                dispatch(entry.target, "", createEvent("qvisible", entry));
                            }
                        }
                    }));
                    results.forEach((el => observer.observe(el)));
                }
            }
        };
        const addEventListener = (el, eventName, handler, capture = !1) => el.addEventListener(eventName, handler, {
            capture: capture,
            passive: !1
        });
        const push = eventNames => {
            for (const eventName of eventNames) {
                if (!events.has(eventName)) {
                    addEventListener(doc, eventName, processDocumentEvent, !0);
                    addEventListener(win, eventName, processWindowEvent);
                    events.add(eventName);
                }
            }
        };
        if (!doc.qR) {
            const qwikevents = win.qwikevents;
            Array.isArray(qwikevents) && push(qwikevents);
            win.qwikevents = {
                push: (...e) => push(e)
            };
            addEventListener(doc, "readystatechange", processReadyStateChange);
            processReadyStateChange();
        }
    })(document);
})();`;
function Wd(e = {}) {
  return Array.isArray(e.events) && e.events.length > 0
    ? (e.debug ? Bd : Ud).replace('window.qEvents', JSON.stringify(e.events))
    : e.debug
    ? Hd
    : Od;
}
function Qd(e, t, n) {
  if (!n) return [];
  const s = t.prefetchStrategy,
    o = Hl(t);
  if (s !== null) {
    if (!s || !s.symbolsToPrefetch || s.symbolsToPrefetch === 'auto')
      return Kd(e, n, o);
    if (typeof s.symbolsToPrefetch == 'function')
      try {
        return s.symbolsToPrefetch({ manifest: n.manifest });
      } catch (r) {
        console.error('getPrefetchUrls, symbolsToPrefetch()', r);
      }
  }
  return [];
}
function Kd(e, t, n) {
  const s = [],
    o = e == null ? void 0 : e.qrls,
    { mapper: r, manifest: a } = t,
    i = new Map();
  if (Array.isArray(o))
    for (const c of o) {
      const u = c.getHash(),
        p = r[u];
      p && Ul(a, i, s, n, p[1]);
    }
  return s;
}
function Ul(e, t, n, s, o) {
  const r = s + o;
  let a = t.get(r);
  if (!a) {
    (a = { url: r, imports: [] }), t.set(r, a);
    const i = e.bundles[o];
    if (i && Array.isArray(i.imports))
      for (const c of i.imports) Ul(e, t, a.imports, s, c);
  }
  n.push(a);
}
function Vd(e) {
  if (
    e != null &&
    e.mapping != null &&
    typeof e.mapping == 'object' &&
    e.symbols != null &&
    typeof e.symbols == 'object' &&
    e.bundles != null &&
    typeof e.bundles == 'object'
  )
    return e;
}
function vs() {
  let o = `const w=new Worker(URL.createObjectURL(new Blob(['onmessage=(e)=>{Promise.all(e.data.map(u=>fetch(u))).finally(()=>{setTimeout(postMessage({}),9999)})}'],{type:"text/javascript"})));`;
  return (
    (o += "w.postMessage(u.map(u=>new URL(u,origin)+''));"),
    (o += 'w.onmessage=()=>{w.terminate()};'),
    o
  );
}
function lo(e) {
  const t = [],
    n = (s) => {
      if (Array.isArray(s))
        for (const o of s) t.includes(o.url) || (t.push(o.url), n(o.imports));
    };
  return n(e), t;
}
function Zd(e) {
  const t = new Map();
  let n = 0;
  const s = (i, c) => {
      if (Array.isArray(i))
        for (const u of i) {
          const p = t.get(u.url) || 0;
          t.set(u.url, p + 1),
            n++,
            c.has(u.url) || (c.add(u.url), s(u.imports, c));
        }
    },
    o = new Set();
  for (const i of e) o.clear(), s(i.imports, o);
  const r = (n / t.size) * 2,
    a = Array.from(t.entries());
  return (
    a.sort((i, c) => c[1] - i[1]),
    a
      .slice(0, 5)
      .filter((i) => i[1] > r)
      .map((i) => i[0])
  );
}
function Yd(e, t, n) {
  const s = tp(e == null ? void 0 : e.implementation),
    o = [];
  return (
    s.prefetchEvent === 'always' && Gd(o, t, n),
    s.linkInsert === 'html-append' && Xd(o, t, s),
    s.linkInsert === 'js-append'
      ? Jd(o, t, s, n)
      : s.workerFetchInsert === 'always' && ep(o, t, n),
    o.length > 0 ? ce($e, { children: o }) : null
  );
}
function Gd(e, t, n) {
  const s = Zd(t);
  for (const o of s)
    e.push(ce('link', { rel: 'modulepreload', href: o, nonce: n }));
  e.push(
    ce('script', {
      'q:type': 'prefetch-bundles',
      dangerouslySetInnerHTML:
        "document.dispatchEvent(new CustomEvent('qprefetch', {detail:{links: [location.pathname]}}))",
      nonce: n,
    })
  );
}
function Xd(e, t, n) {
  const s = lo(t),
    o = n.linkRel || 'prefetch';
  for (const r of s) {
    const a = {};
    (a.href = r),
      (a.rel = o),
      (o === 'prefetch' || o === 'preload') &&
        r.endsWith('.js') &&
        (a.as = 'script'),
      e.push(ce('link', a, void 0));
  }
}
function Jd(e, t, n, s) {
  const o = n.linkRel || 'prefetch';
  let r = '';
  n.workerFetchInsert === 'no-link-support' &&
    (r += 'let supportsLinkRel = true;'),
    (r += `const u=${JSON.stringify(lo(t))};`),
    (r += 'u.map((u,i)=>{'),
    (r += "const l=document.createElement('link');"),
    (r += 'l.setAttribute("href",u);'),
    (r += `l.setAttribute("rel","${o}");`),
    n.workerFetchInsert === 'no-link-support' &&
      ((r += 'if(i===0){'),
      (r += 'try{'),
      (r += `supportsLinkRel=l.relList.supports("${o}");`),
      (r += '}catch(e){}'),
      (r += '}')),
    (r += 'document.body.appendChild(l);'),
    (r += '});'),
    n.workerFetchInsert === 'no-link-support' &&
      ((r += 'if(!supportsLinkRel){'), (r += vs()), (r += '}')),
    n.workerFetchInsert === 'always' && (r += vs()),
    e.push(
      ce('script', {
        type: 'module',
        'q:type': 'link-js',
        dangerouslySetInnerHTML: r,
        nonce: s,
      })
    );
}
function ep(e, t, n) {
  let s = `const u=${JSON.stringify(lo(t))};`;
  (s += vs()),
    e.push(
      ce('script', {
        type: 'module',
        'q:type': 'prefetch-worker',
        dangerouslySetInnerHTML: s,
        nonce: n,
      })
    );
}
function tp(e) {
  return e && typeof e == 'object' ? e : np;
}
var np = {
    linkInsert: null,
    linkRel: null,
    workerFetchInsert: null,
    prefetchEvent: 'always',
  },
  sp = '<!DOCTYPE html>';
async function op(e, t) {
  var C;
  let n = t.stream,
    s = 0,
    o = 0,
    r = 0,
    a = 0,
    i = '',
    c;
  const u = ((C = t.streaming) == null ? void 0 : C.inOrder) ?? {
      strategy: 'auto',
      maximunInitialChunk: 5e4,
      maximunChunk: 3e4,
    },
    p = t.containerTagName ?? 'html',
    f = t.containerAttributes ?? {},
    m = n,
    g = Xn(),
    b = Hl(t),
    w = Bl(t.manifest);
  function h() {
    i && (m.write(i), (i = ''), (s = 0), r++, r === 1 && (a = g()));
  }
  function y(L) {
    const z = L.length;
    (s += z), (o += z), (i += L);
  }
  switch (u.strategy) {
    case 'disabled':
      n = { write: y };
      break;
    case 'direct':
      n = m;
      break;
    case 'auto':
      let L = 0,
        z = !1;
      const G = u.maximunChunk ?? 0,
        _e = u.maximunInitialChunk ?? 0;
      n = {
        write(K) {
          K === '<!--qkssr-f-->'
            ? z || (z = !0)
            : K === '<!--qkssr-pu-->'
            ? L++
            : K === '<!--qkssr-po-->'
            ? L--
            : y(K),
            L === 0 && (z || s >= (r === 0 ? _e : G)) && ((z = !1), h());
        },
      };
      break;
  }
  p === 'html'
    ? n.write(sp)
    : (n.write('<!--cq-->'),
      t.qwikLoader
        ? (t.qwikLoader.include === void 0 && (t.qwikLoader.include = 'never'),
          t.qwikLoader.position === void 0 &&
            (t.qwikLoader.position = 'bottom'))
        : (t.qwikLoader = { include: 'never' })),
    t.manifest ||
      console.warn(
        'Missing client manifest, loading symbols in the client might 404. Please ensure the client build has run and generated the manifest for the server build.'
      ),
    await Fd(t, w);
  const k = w == null ? void 0 : w.manifest.injections,
    _ = k ? k.map((L) => ce(L.tag, L.attributes ?? {})) : void 0,
    v = Xn(),
    q = [];
  let E = 0,
    S = 0;
  await Ni(e, {
    stream: n,
    containerTagName: p,
    containerAttributes: f,
    serverData: t.serverData,
    base: b,
    beforeContent: _,
    beforeClose: async (L, z, G, _e) => {
      var uo, po, mo, fo, ho, go, yo;
      E = v();
      const K = Xn();
      c = await yl(L, z, void 0, _e);
      const O = [];
      if (t.prefetchStrategy !== null) {
        const xe = Qd(c, t, w);
        if (xe.length > 0) {
          const $o = Yd(
            t.prefetchStrategy,
            xe,
            (uo = t.serverData) == null ? void 0 : uo.nonce
          );
          $o && O.push($o);
        }
      }
      const Qe = JSON.stringify(c.state, void 0, void 0);
      O.push(
        ce('script', {
          type: 'qwik/json',
          dangerouslySetInnerHTML: rp(Qe),
          nonce: (po = t.serverData) == null ? void 0 : po.nonce,
        })
      ),
        c.funcs.length > 0 &&
          O.push(
            ce('script', {
              'q:func': 'qwik/json',
              dangerouslySetInnerHTML: ip(c.funcs),
              nonce: (mo = t.serverData) == null ? void 0 : mo.nonce,
            })
          );
      const Qn = !c || c.mode !== 'static',
        Gt = ((fo = t.qwikLoader) == null ? void 0 : fo.include) ?? 'auto',
        kt = Gt === 'always' || (Gt === 'auto' && Qn);
      if (kt) {
        const xe = Wd({
          events: (ho = t.qwikLoader) == null ? void 0 : ho.events,
          debug: t.debug,
        });
        O.push(
          ce('script', {
            id: 'qwikloader',
            dangerouslySetInnerHTML: xe,
            nonce: (go = t.serverData) == null ? void 0 : go.nonce,
          })
        );
      }
      const co = Array.from(z.$events$, (xe) => JSON.stringify(xe));
      if (co.length > 0) {
        let xe = `window.qwikevents.push(${co.join(', ')})`;
        kt || (xe = `window.qwikevents||=[];${xe}`),
          O.push(
            ce('script', {
              dangerouslySetInnerHTML: xe,
              nonce: (yo = t.serverData) == null ? void 0 : yo.nonce,
            })
          );
      }
      return lp(q, L), (S = K()), ce($e, { children: O });
    },
    manifestHash: (w == null ? void 0 : w.manifest.manifestHash) || 'dev',
  }),
    p !== 'html' && n.write('<!--/cq-->'),
    h();
  const T = c.resources.some((L) => L._cache !== 1 / 0);
  return {
    prefetchResources: void 0,
    snapshotResult: c,
    flushes: r,
    manifest: w == null ? void 0 : w.manifest,
    size: o,
    isStatic: !T,
    timing: { render: E, snapshot: S, firstFlush: a },
    _symbols: q,
  };
}
function Bl(e) {
  if (e) {
    if ('mapper' in e) return e;
    if (((e = Vd(e)), e)) {
      const t = {};
      return (
        Object.entries(e.mapping).forEach(([n, s]) => {
          t[ws(n)] = [n, s];
        }),
        { mapper: t, manifest: e }
      );
    }
  }
}
var rp = (e) => e.replace(/<(\/?script)/g, '\\x3C$1');
function lp(e, t) {
  var n;
  for (const s of t) {
    const o = (n = s.$componentQrl$) == null ? void 0 : n.getSymbol();
    o && !e.includes(o) && e.push(o);
  }
}
var ap = 'document.currentScript.closest("[q\\\\:container]").qFuncs=';
function ip(e) {
  return (
    ap +
    `[${e.join(`,
`)}]`
  );
}
async function cp(e) {
  const t = Ol({ manifest: e }, Bl(e));
  wr(t);
}
function Jn(e, t) {
  var n;
  return (
    ((n = t == null ? void 0 : t.getOrigin) == null ? void 0 : n.call(t, e)) ??
    (t == null ? void 0 : t.origin) ??
    process.env.ORIGIN ??
    up(e)
  );
}
function up(e) {
  const { PROTOCOL_HEADER: t, HOST_HEADER: n } = process.env,
    s = e.headers,
    o =
      (t && s[t]) ||
      (e.socket.encrypted || e.connection.encrypted ? 'https' : 'http'),
    r = n ?? (e instanceof ca ? ':authority' : 'host'),
    a = s[r];
  return `${o}://${a}`;
}
function es(e, t) {
  return pp(e.originalUrl || e.url || '/', t);
}
var dp = /\/\/|\\\\/g;
function pp(e, t) {
  return new URL(e.replace(dp, '/'), t);
}
async function mp(e, t, n, s, o) {
  const r = new Headers(),
    a = t.headers;
  for (const m in a) {
    const g = a[m];
    if (typeof g == 'string') r.set(m, g);
    else if (Array.isArray(g)) for (const b of g) r.append(m, b);
  }
  const i = async function* () {
      for await (const m of t) yield m;
    },
    c = t.method === 'HEAD' || t.method === 'GET' ? void 0 : i(),
    u = new AbortController(),
    p = {
      method: t.method,
      headers: r,
      body: c,
      signal: u.signal,
      duplex: 'half',
    };
  return (
    n.on('close', () => {
      u.abort();
    }),
    {
      mode: s,
      url: e,
      request: new Request(e.href, p),
      env: {
        get(m) {
          return process.env[m];
        },
      },
      getWritableStream: (m, g, b) => {
        (n.statusCode = m), g.forEach((h, y) => n.setHeader(y, h));
        const w = b.headers();
        return (
          w.length > 0 && n.setHeader('Set-Cookie', w),
          new WritableStream({
            write(h) {
              n.closed ||
                n.destroyed ||
                n.write(h, (y) => {
                  y && console.error(y);
                });
            },
            close() {
              n.end();
            },
          })
        );
      },
      getClientConn: () => (o ? o(t) : { ip: t.socket.remoteAddress }),
      platform: { ssr: !0, incomingMessage: t, node: process.versions.node },
      locale: void 0,
    }
  );
}
var fp = {
  '3gp': 'video/3gpp',
  '3gpp': 'video/3gpp',
  asf: 'video/x-ms-asf',
  asx: 'video/x-ms-asf',
  avi: 'video/x-msvideo',
  avif: 'image/avif',
  bmp: 'image/x-ms-bmp',
  css: 'text/css',
  flv: 'video/x-flv',
  gif: 'image/gif',
  htm: 'text/html',
  html: 'text/html',
  ico: 'image/x-icon',
  jng: 'image/x-jng',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  js: 'application/javascript',
  json: 'application/json',
  kar: 'audio/midi',
  m4a: 'audio/x-m4a',
  m4v: 'video/x-m4v',
  mid: 'audio/midi',
  midi: 'audio/midi',
  mng: 'video/x-mng',
  mov: 'video/quicktime',
  mp3: 'audio/mpeg',
  mp4: 'video/mp4',
  mpeg: 'video/mpeg',
  mpg: 'video/mpeg',
  ogg: 'audio/ogg',
  pdf: 'application/pdf',
  png: 'image/png',
  rar: 'application/x-rar-compressed',
  shtml: 'text/html',
  svg: 'image/svg+xml',
  svgz: 'image/svg+xml',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  ts: 'video/mp2t',
  txt: 'text/plain',
  wbmp: 'image/vnd.wap.wbmp',
  webm: 'video/webm',
  webp: 'image/webp',
  wmv: 'video/x-ms-wmv',
  woff: 'font/woff',
  woff2: 'font/woff2',
  xml: 'text/xml',
  zip: 'application/zip',
};
function hp() {
  typeof global < 'u' &&
    typeof globalThis.fetch != 'function' &&
    typeof process < 'u' &&
    process.versions.node &&
    ((globalThis.fetch = fa),
    (globalThis.Headers = ha),
    (globalThis.Request = ga),
    (globalThis.Response = ya),
    (globalThis.FormData = $a)),
    typeof globalThis.TextEncoderStream > 'u' &&
      ((globalThis.TextEncoderStream = ua),
      (globalThis.TextDecoderStream = da)),
    typeof globalThis.WritableStream > 'u' &&
      ((globalThis.WritableStream = pa), (globalThis.ReadableStream = ma)),
    typeof globalThis.crypto > 'u' && (globalThis.crypto = ba.webcrypto);
}
function gp(e) {
  var t;
  hp();
  const n = {
    _deserializeData: Zi,
    _serializeData: $u,
    _verifySerializable: ud,
  };
  e.manifest && cp(e.manifest);
  const s =
    ((t = e.static) == null ? void 0 : t.root) ??
    Xt(ia(import.meta.url), '..', '..', 'dist');
  return {
    router: async (i, c, u) => {
      try {
        const p = Jn(i, e),
          f = await mp(es(i, p), i, c, 'server', e.getClientConn),
          m = await ii(f, e, n);
        if (m) {
          const g = await m.completion;
          if (g) throw g;
          if (m.requestEv.headersSent) return;
        }
        u();
      } catch (p) {
        console.error(p), u(p);
      }
    },
    notFound: async (i, c, u) => {
      try {
        if (!c.headersSent) {
          const p = Jn(i, e),
            f = es(i, p),
            m = sa(f.pathname);
          c.writeHead(404, {
            'Content-Type': 'text/html; charset=utf-8',
            'X-Not-Found': f.pathname,
          }),
            c.end(m);
        }
      } catch (p) {
        console.error(p), u(p);
      }
    },
    staticFile: async (i, c, u) => {
      var p;
      try {
        const f = Jn(i, e),
          m = es(i, f);
        if (oa(i.method || 'GET', m)) {
          const g = m.pathname;
          let b;
          la(g).includes('.')
            ? (b = Xt(s, g))
            : e.qwikCityPlan.trailingSlash
            ? (b = Xt(s, g + 'index.html'))
            : (b = Xt(s, g, 'index.html'));
          const w = ra(b),
            h = aa(b).replace(/^\./, ''),
            y = fp[h];
          y && c.setHeader('Content-Type', y),
            (p = e.static) != null &&
              p.cacheControl &&
              c.setHeader('Cache-Control', e.static.cacheControl),
            w.on('error', u),
            w.pipe(c);
          return;
        }
        return u();
      } catch (f) {
        console.error(f), u(f);
      }
    },
  };
}
const yp = {
    manifestHash: 'wmfzkc',
    symbols: {
      s_02wMImzEAbk: {
        origin:
          '../../../node_modules/.pnpm/@builder.io+qwik-city@1.3.2_@types+node@18.19.18_less@4.1.3_rollup@2.79.1_stylus@0.59.0/node_modules/@builder.io/qwik-city/index.qwik.mjs',
        displayName: 'QwikCityProvider_component_useTask',
        canonicalFilename: 's_02wmimzeabk',
        hash: '02wMImzEAbk',
        ctxKind: 'function',
        ctxName: 'useTask$',
        captures: !0,
        parent: 's_TxCFOy819ag',
        loc: [26349, 35368],
      },
      s_b8fpOLpx7NA: {
        origin:
          '../../../node_modules/.pnpm/qwik-speak@0.12.2_@builder.io+qwik@1.3.1/node_modules/qwik-speak/lib/index.qwik.mjs',
        displayName: 'Speak_component_useTask',
        canonicalFilename: 's_b8fpolpx7na',
        hash: 'b8fpOLpx7NA',
        ctxKind: 'function',
        ctxName: 'useTask$',
        captures: !0,
        parent: 's_AkJ7NeLjpWM',
        loc: [5773, 6053],
      },
      s_sfbNflx0Y2A: {
        origin:
          '../../../node_modules/.pnpm/qwik-speak@0.12.2_@builder.io+qwik@1.3.1/node_modules/qwik-speak/lib/index.qwik.mjs',
        displayName: 'QwikSpeakProvider_component_useTask',
        canonicalFilename: 's_sfbnflx0y2a',
        hash: 'sfbNflx0Y2A',
        ctxKind: 'function',
        ctxName: 'useTask$',
        captures: !0,
        parent: 's_yigdOibvcXE',
        loc: [4949, 5132],
      },
      s_dBzp75i0JUA: {
        origin: 'components/navbar/navbar.tsx',
        displayName: 'navbar_component_useVisibleTask',
        canonicalFilename: 's_dbzp75i0jua',
        hash: 'dBzp75i0JUA',
        ctxKind: 'function',
        ctxName: 'useVisibleTask$',
        captures: !0,
        parent: 's_e0RDNPJNIGY',
        loc: [1457, 2504],
      },
      s_07tGklv0JFU: {
        origin: 'components/container/container.tsx',
        displayName: 'container_component',
        canonicalFilename: 's_07tgklv0jfu',
        hash: '07tGklv0JFU',
        ctxKind: 'function',
        ctxName: 'component$',
        captures: !1,
        loc: [355, 2064],
      },
      s_2Fq8wIUpq5I: {
        origin: 'components/router-head/router-head.tsx',
        displayName: 'RouterHead_component',
        canonicalFilename: 's_2fq8wiupq5i',
        hash: '2Fq8wIUpq5I',
        ctxKind: 'function',
        ctxName: 'component$',
        captures: !1,
        loc: [289, 922],
      },
      s_2fkm5zc0rek: {
        origin: 'components/footer/footer.tsx',
        displayName: 'footer_component',
        canonicalFilename: 's_2fkm5zc0rek',
        hash: '2fkm5zc0rek',
        ctxKind: 'function',
        ctxName: 'component$',
        captures: !1,
        loc: [463, 2494],
      },
      s_5qyIIEjMPSA: {
        origin: 'components/sections/brands/brands.tsx',
        displayName: 'brands_component',
        canonicalFilename: 's_5qyiiejmpsa',
        hash: '5qyIIEjMPSA',
        ctxKind: 'function',
        ctxName: 'component$',
        captures: !1,
        loc: [1294, 2156],
      },
      s_8gdLBszqbaM: {
        origin:
          '../../../node_modules/.pnpm/@builder.io+qwik-city@1.3.2_@types+node@18.19.18_less@4.1.3_rollup@2.79.1_stylus@0.59.0/node_modules/@builder.io/qwik-city/index.qwik.mjs',
        displayName: 'Link_component',
        canonicalFilename: 's_8gdlbszqbam',
        hash: '8gdLBszqbaM',
        ctxKind: 'function',
        ctxName: 'component$',
        captures: !1,
        loc: [37321, 39351],
      },
      s_AkJ7NeLjpWM: {
        origin:
          '../../../node_modules/.pnpm/qwik-speak@0.12.2_@builder.io+qwik@1.3.1/node_modules/qwik-speak/lib/index.qwik.mjs',
        displayName: 'Speak_component',
        canonicalFilename: 's_akj7neljpwm',
        hash: 'AkJ7NeLjpWM',
        ctxKind: 'function',
        ctxName: 'component$',
        captures: !1,
        loc: [5589, 6187],
      },
      s_CQ1t0RXar34: {
        origin: 'routes/[...lang]/privacy-policy/index.tsx',
        displayName: 'privacy_policy_component',
        canonicalFilename: 's_cq1t0rxar34',
        hash: 'CQ1t0RXar34',
        ctxKind: 'function',
        ctxName: 'component$',
        captures: !1,
        loc: [2086, 24954],
      },
      s_D0iY34otgb0: {
        origin: 'components/sections/sponsor/sponsor.tsx',
        displayName: 'sponsor_component',
        canonicalFilename: 's_d0iy34otgb0',
        hash: 'D0iY34otgb0',
        ctxKind: 'function',
        ctxName: 'component$',
        captures: !1,
        loc: [395, 2181],
      },
      s_DRT9K1jPHw0: {
        origin: 'components/sections/hero/hero.tsx',
        displayName: 'hero_component',
        canonicalFilename: 's_drt9k1jphw0',
        hash: 'DRT9K1jPHw0',
        ctxKind: 'function',
        ctxName: 'component$',
        captures: !1,
        loc: [500, 3305],
      },
      s_E6HOLccZhOI: {
        origin: 'components/card/card.tsx',
        displayName: 'card_component',
        canonicalFilename: 's_e6holcczhoi',
        hash: 'E6HOLccZhOI',
        ctxKind: 'function',
        ctxName: 'component$',
        captures: !1,
        loc: [189, 448],
      },
      s_FQPutlW041U: {
        origin: 'routes/[...lang]/layout.tsx',
        displayName: 'layout_component',
        canonicalFilename: 's_fqputlw041u',
        hash: 'FQPutlW041U',
        ctxKind: 'function',
        ctxName: 'component$',
        captures: !1,
        loc: [188, 218],
      },
      s_HdsYayhDkLg: {
        origin: 'components/sections/banner/banner.tsx',
        displayName: 'banner_component',
        canonicalFilename: 's_hdsyayhdklg',
        hash: 'HdsYayhDkLg',
        ctxKind: 'function',
        ctxName: 'component$',
        captures: !1,
        loc: [311, 1706],
      },
      s_JGcGwM6uqSo: {
        origin: 'routes/[...lang]/showcase/index.tsx',
        displayName: 'showcase_component',
        canonicalFilename: 's_jgcgwm6uqso',
        hash: 'JGcGwM6uqSo',
        ctxKind: 'function',
        ctxName: 'component$',
        captures: !1,
        loc: [1787, 4562],
      },
      s_KHl60H7GIzk: {
        origin: 'components/sections/discord/discord.tsx',
        displayName: 'discord_component',
        canonicalFilename: 's_khl60h7gizk',
        hash: 'KHl60H7GIzk',
        ctxKind: 'function',
        ctxName: 'component$',
        captures: !1,
        loc: [327, 1964],
      },
      s_KnttE033sL4: {
        origin: 'components/sections/subscribe/subscribe.tsx',
        displayName: 'subscribe_component',
        canonicalFilename: 's_kntte033sl4',
        hash: 'KnttE033sL4',
        ctxKind: 'function',
        ctxName: 'component$',
        captures: !1,
        loc: [430, 3580],
      },
      s_M2E9iDaUBT4: {
        origin: 'components/loader/loader.tsx',
        displayName: 'loader_component',
        canonicalFilename: 's_m2e9idaubt4',
        hash: 'M2E9iDaUBT4',
        ctxKind: 'function',
        ctxName: 'component$',
        captures: !1,
        loc: [135, 633],
      },
      s_MBnCRhRrMNs: {
        origin: 'components/section/section.tsx',
        displayName: 'section_component',
        canonicalFilename: 's_mbncrhrrmns',
        hash: 'MBnCRhRrMNs',
        ctxKind: 'function',
        ctxName: 'component$',
        captures: !1,
        loc: [457, 1356],
      },
      s_Nk9PlpjQm9Y: {
        origin:
          '../../../node_modules/.pnpm/@builder.io+qwik-city@1.3.2_@types+node@18.19.18_less@4.1.3_rollup@2.79.1_stylus@0.59.0/node_modules/@builder.io/qwik-city/index.qwik.mjs',
        displayName: 'GetForm_component',
        canonicalFilename: 's_nk9plpjqm9y',
        hash: 'Nk9PlpjQm9Y',
        ctxKind: 'function',
        ctxName: 'component$',
        captures: !1,
        loc: [49834, 51185],
      },
      s_Pl7vAlduOuo: {
        origin: 'components/forms/select/select.tsx',
        displayName: 'select_component',
        canonicalFilename: 's_pl7valduouo',
        hash: 'Pl7vAlduOuo',
        ctxKind: 'function',
        ctxName: 'component$',
        captures: !1,
        loc: [444, 1922],
      },
      s_RZ4kRsPh3h0: {
        origin: 'components/sections/explore/explore.tsx',
        displayName: 'explore_component',
        canonicalFilename: 's_rz4krsph3h0',
        hash: 'RZ4kRsPh3h0',
        ctxKind: 'function',
        ctxName: 'component$',
        captures: !1,
        loc: [513, 7007],
      },
      s_TCwB4TUhbFA: {
        origin: 'components/sections/doc-summary/doc-summary.tsx',
        displayName: 'doc_summary_component',
        canonicalFilename: 's_tcwb4tuhbfa',
        hash: 'TCwB4TUhbFA',
        ctxKind: 'function',
        ctxName: 'component$',
        captures: !1,
        loc: [559, 5431],
      },
      s_TxCFOy819ag: {
        origin:
          '../../../node_modules/.pnpm/@builder.io+qwik-city@1.3.2_@types+node@18.19.18_less@4.1.3_rollup@2.79.1_stylus@0.59.0/node_modules/@builder.io/qwik-city/index.qwik.mjs',
        displayName: 'QwikCityProvider_component',
        canonicalFilename: 's_txcfoy819ag',
        hash: 'TxCFOy819ag',
        ctxKind: 'function',
        ctxName: 'component$',
        captures: !1,
        loc: [23079, 35655],
      },
      s_VoSI6o07IFI: {
        origin: 'components/sections/showcase/showcase.tsx',
        displayName: 'showcase_component',
        canonicalFilename: 's_vosi6o07ifi',
        hash: 'VoSI6o07IFI',
        ctxKind: 'function',
        ctxName: 'component$',
        captures: !1,
        loc: [1444, 3088],
      },
      s_WmYC5H00wtI: {
        origin:
          '../../../node_modules/.pnpm/@builder.io+qwik-city@1.3.2_@types+node@18.19.18_less@4.1.3_rollup@2.79.1_stylus@0.59.0/node_modules/@builder.io/qwik-city/index.qwik.mjs',
        displayName: 'QwikCityMockProvider_component',
        canonicalFilename: 's_wmyc5h00wti',
        hash: 'WmYC5H00wtI',
        ctxKind: 'function',
        ctxName: 'component$',
        captures: !1,
        loc: [35939, 37202],
      },
      s_bOB0JnUCSKY: {
        origin: 'routes/[...lang]/index.tsx',
        displayName: '____lang__component',
        canonicalFilename: 's_bob0jnucsky',
        hash: 'bOB0JnUCSKY',
        ctxKind: 'function',
        ctxName: 'component$',
        captures: !1,
        loc: [1110, 1485],
      },
      s_e0RDNPJNIGY: {
        origin: 'components/navbar/navbar.tsx',
        displayName: 'navbar_component',
        canonicalFilename: 's_e0rdnpjnigy',
        hash: 'e0RDNPJNIGY',
        ctxKind: 'function',
        ctxName: 'component$',
        captures: !1,
        loc: [970, 10252],
      },
      s_e0ssiDXoeAM: {
        origin:
          '../../../node_modules/.pnpm/@builder.io+qwik-city@1.3.2_@types+node@18.19.18_less@4.1.3_rollup@2.79.1_stylus@0.59.0/node_modules/@builder.io/qwik-city/index.qwik.mjs',
        displayName: 'RouterOutlet_component',
        canonicalFilename: 's_e0ssidxoeam',
        hash: 'e0ssiDXoeAM',
        ctxKind: 'function',
        ctxName: 'component$',
        captures: !1,
        loc: [7941, 8655],
      },
      s_eXD0K9bzzlo: {
        origin: 'root.tsx',
        displayName: 'root_component',
        canonicalFilename: 's_exd0k9bzzlo',
        hash: 'eXD0K9bzzlo',
        ctxKind: 'function',
        ctxName: 'component$',
        captures: !1,
        loc: [460, 1695],
      },
      s_eh3Zleb9svU: {
        origin: 'components/sections/medusa/medusa.tsx',
        displayName: 'medusa_component',
        canonicalFilename: 's_eh3zleb9svu',
        hash: 'eh3Zleb9svU',
        ctxKind: 'function',
        ctxName: 'component$',
        captures: !1,
        loc: [385, 16366],
      },
      s_gft6e4M8el4: {
        origin: 'components/line/line.tsx',
        displayName: 'line_component',
        canonicalFilename: 's_gft6e4m8el4',
        hash: 'gft6e4M8el4',
        ctxKind: 'function',
        ctxName: 'component$',
        captures: !1,
        loc: [234, 679],
      },
      s_lHJ6l0hcvRg: {
        origin: 'components/forms/select/select.tsx',
        displayName: 'SelectOption_component',
        canonicalFilename: 's_lhj6l0hcvrg',
        hash: 'lHJ6l0hcvRg',
        ctxKind: 'function',
        ctxName: 'component$',
        captures: !1,
        loc: [2058, 2326],
      },
      s_mekDswQeFyQ: {
        origin: 'components/section/section.tsx',
        displayName: 'SectionHeader_component',
        canonicalFilename: 's_mekdswqefyq',
        hash: 'mekDswQeFyQ',
        ctxKind: 'function',
        ctxName: 'component$',
        captures: !1,
        loc: [1479, 1879],
      },
      s_outyRSHf0Tw: {
        origin: 'components/icon/icon.tsx',
        displayName: 'icon_component',
        canonicalFilename: 's_outyrshf0tw',
        hash: 'outyRSHf0Tw',
        ctxKind: 'function',
        ctxName: 'component$',
        captures: !1,
        loc: [268, 499],
      },
      s_pbG9H8ze2g4: {
        origin: 'components/sections/evolving/evolving.tsx',
        displayName: 'evolving_component',
        canonicalFilename: 's_pbg9h8ze2g4',
        hash: 'pbG9H8ze2g4',
        ctxKind: 'function',
        ctxName: 'component$',
        captures: !1,
        loc: [1393, 5948],
      },
      s_rIehxbCtAqU: {
        origin: 'components/button/button.tsx',
        displayName: 'button_component',
        canonicalFilename: 's_riehxbctaqu',
        hash: 'rIehxbCtAqU',
        ctxKind: 'function',
        ctxName: 'component$',
        captures: !1,
        loc: [918, 5035],
      },
      s_tVi0Ug0Y1rA: {
        origin: 'components/sections/contact/contact.tsx',
        displayName: 'contact_component',
        canonicalFilename: 's_tvi0ug0y1ra',
        hash: 'tVi0Ug0Y1rA',
        ctxKind: 'function',
        ctxName: 'component$',
        captures: !1,
        loc: [502, 6889],
      },
      s_yigdOibvcXE: {
        origin:
          '../../../node_modules/.pnpm/qwik-speak@0.12.2_@builder.io+qwik@1.3.1/node_modules/qwik-speak/lib/index.qwik.mjs',
        displayName: 'QwikSpeakProvider_component',
        canonicalFilename: 's_yigdoibvcxe',
        hash: 'yigdOibvcXE',
        ctxKind: 'function',
        ctxName: 'component$',
        captures: !1,
        loc: [3549, 5292],
      },
      s_RPDJAz33WLA: {
        origin:
          '../../../node_modules/.pnpm/@builder.io+qwik-city@1.3.2_@types+node@18.19.18_less@4.1.3_rollup@2.79.1_stylus@0.59.0/node_modules/@builder.io/qwik-city/index.qwik.mjs',
        displayName: 'QwikCityProvider_component_useStyles',
        canonicalFilename: 's_rpdjaz33wla',
        hash: 'RPDJAz33WLA',
        ctxKind: 'function',
        ctxName: 'useStyles$',
        captures: !1,
        parent: 's_TxCFOy819ag',
        loc: [23134, 23168],
      },
      s_14NE37yaMfA: {
        origin: 'components/sections/doc-summary/doc-summary.tsx',
        displayName: 'doc_summary_component_useStylesScoped',
        canonicalFilename: 's_14ne37yamfa',
        hash: '14NE37yaMfA',
        ctxKind: 'function',
        ctxName: 'useStylesScoped$',
        captures: !1,
        parent: 's_TCwB4TUhbFA',
        loc: [587, 593],
      },
      s_2HCPp1ydyqs: {
        origin: 'components/forms/select/select.tsx',
        displayName: 'select_component__Fragment_div_onClick',
        canonicalFilename: 's_2hcpp1ydyqs',
        hash: '2HCPp1ydyqs',
        ctxKind: 'eventHandler',
        ctxName: 'onClick$',
        captures: !0,
        parent: 's_Pl7vAlduOuo',
        loc: [580, 606],
      },
      s_3SsPTS5utQk: {
        origin: 'components/line/line.tsx',
        displayName: 'line_component_useStylesScoped',
        canonicalFilename: 's_3sspts5utqk',
        hash: '3SsPTS5utQk',
        ctxKind: 'function',
        ctxName: 'useStylesScoped$',
        captures: !1,
        parent: 's_gft6e4M8el4',
        loc: [277, 283],
      },
      s_5Bmm03gq0i0: {
        origin: 'components/loader/loader.tsx',
        displayName: 'loader_component_useStylesScoped',
        canonicalFilename: 's_5bmm03gq0i0',
        hash: '5Bmm03gq0i0',
        ctxKind: 'function',
        ctxName: 'useStylesScoped$',
        captures: !1,
        parent: 's_M2E9iDaUBT4',
        loc: [162, 168],
      },
      s_6VMpNf7ZCJ0: {
        origin: 'components/sections/contact/contact.tsx',
        displayName: 'contact_component_Section_div_div_form_onSubmit',
        canonicalFilename: 's_6vmpnf7zcj0',
        hash: '6VMpNf7ZCJ0',
        ctxKind: 'eventHandler',
        ctxName: 'onSubmit$',
        captures: !0,
        parent: 's_tVi0Ug0Y1rA',
        loc: [1996, 2031],
      },
      s_LQcmHAxuFaU: {
        origin: 'components/navbar/navbar.tsx',
        displayName: 'navbar_component_div_div_div_onClick',
        canonicalFilename: 's_lqcmhaxufau',
        hash: 'LQcmHAxuFaU',
        ctxKind: 'eventHandler',
        ctxName: 'onClick$',
        captures: !0,
        parent: 's_e0RDNPJNIGY',
        loc: [7744, 7776],
      },
      s_kJTkeEh1U5c: {
        origin: 'root.tsx',
        displayName: 'root_component_useStyles',
        canonicalFilename: 's_kjtkeeh1u5c',
        hash: 'kJTkeEh1U5c',
        ctxKind: 'function',
        ctxName: 'useStyles$',
        captures: !1,
        parent: 's_eXD0K9bzzlo',
        loc: [707, 719],
      },
      s_00VE9E0kYIc: {
        origin: 'components/sections/evolving/evolving.tsx',
        displayName: 'evolving_component_useStylesScoped',
        canonicalFilename: 's_00ve9e0kyic',
        hash: '00VE9E0kYIc',
        ctxKind: 'function',
        ctxName: 'useStylesScoped$',
        captures: !1,
        parent: 's_pbG9H8ze2g4',
        loc: [1421, 1427],
      },
      s_0CLaYnIloJk: {
        origin: 'components/sections/hero/hero.tsx',
        displayName: 'hero_component_useStylesScoped',
        canonicalFilename: 's_0claynilojk',
        hash: '0CLaYnIloJk',
        ctxKind: 'function',
        ctxName: 'useStylesScoped$',
        captures: !1,
        parent: 's_DRT9K1jPHw0',
        loc: [528, 534],
      },
      s_0kXSZC4QkmM: {
        origin: 'components/sections/discord/discord.tsx',
        displayName: 'discord_component_useStylesScoped',
        canonicalFilename: 's_0kxszc4qkmm',
        hash: '0kXSZC4QkmM',
        ctxKind: 'function',
        ctxName: 'useStylesScoped$',
        captures: !1,
        parent: 's_KHl60H7GIzk',
        loc: [354, 360],
      },
      s_DkNHR022s5k: {
        origin: 'components/sections/explore/explore.tsx',
        displayName: 'explore_component_useStylesScoped',
        canonicalFilename: 's_dknhr022s5k',
        hash: 'DkNHR022s5k',
        ctxKind: 'function',
        ctxName: 'useStylesScoped$',
        captures: !1,
        parent: 's_RZ4kRsPh3h0',
        loc: [541, 547],
      },
      s_HSLHKDE0Tc8: {
        origin: 'components/navbar/navbar.tsx',
        displayName:
          'navbar_component_div_div_Container_nav_ul_li_Select_SelectOption_onClick',
        canonicalFilename: 's_hslhkde0tc8',
        hash: 'HSLHKDE0Tc8',
        ctxKind: 'jSXProp',
        ctxName: 'onClick$',
        captures: !0,
        parent: 's_e0RDNPJNIGY',
        loc: [6491, 6535],
      },
      s_IMLVEX3dgUw: {
        origin: 'components/sections/showcase/showcase.tsx',
        displayName: 'showcase_component_useStylesScoped',
        canonicalFilename: 's_imlvex3dguw',
        hash: 'IMLVEX3dgUw',
        ctxKind: 'function',
        ctxName: 'useStylesScoped$',
        captures: !1,
        parent: 's_VoSI6o07IFI',
        loc: [1471, 1477],
      },
      s_K8TT2dajw7I: {
        origin: 'components/navbar/navbar.tsx',
        displayName: 'navbar_component_useStylesScoped',
        canonicalFilename: 's_k8tt2dajw7i',
        hash: 'K8TT2dajw7I',
        ctxKind: 'function',
        ctxName: 'useStylesScoped$',
        captures: !1,
        parent: 's_e0RDNPJNIGY',
        loc: [1016, 1022],
      },
      s_MOjpn7epc74: {
        origin: 'components/forms/select/select.tsx',
        displayName: 'select_component__Fragment_button_onClick',
        canonicalFilename: 's_mojpn7epc74',
        hash: 'MOjpn7epc74',
        ctxKind: 'eventHandler',
        ctxName: 'onClick$',
        captures: !0,
        parent: 's_Pl7vAlduOuo',
        loc: [866, 898],
      },
      s_MR5rBPxRKDs: {
        origin: 'components/section/section.tsx',
        displayName: 'section_component_useStylesScoped',
        canonicalFilename: 's_mr5rbpxrkds',
        hash: 'MR5rBPxRKDs',
        ctxKind: 'function',
        ctxName: 'useStylesScoped$',
        captures: !1,
        parent: 's_MBnCRhRrMNs',
        loc: [503, 509],
      },
      s_Z790sFa7bTY: {
        origin: 'components/sections/contact/contact.tsx',
        displayName: 'contact_component_useStylesScoped',
        canonicalFilename: 's_z790sfa7bty',
        hash: 'Z790sFa7bTY',
        ctxKind: 'function',
        ctxName: 'useStylesScoped$',
        captures: !1,
        parent: 's_tVi0Ug0Y1rA',
        loc: [530, 536],
      },
      s_ZwZ0qjzCTZQ: {
        origin: 'components/sections/brands/brands.tsx',
        displayName: 'brands_component_useStylesScoped',
        canonicalFilename: 's_zwz0qjzctzq',
        hash: 'ZwZ0qjzCTZQ',
        ctxKind: 'function',
        ctxName: 'useStylesScoped$',
        captures: !1,
        parent: 's_5qyIIEjMPSA',
        loc: [1321, 1327],
      },
      s_dVIPHMdh004: {
        origin: 'components/sections/banner/banner.tsx',
        displayName: 'banner_component_useStylesScoped',
        canonicalFilename: 's_dviphmdh004',
        hash: 'dVIPHMdh004',
        ctxKind: 'function',
        ctxName: 'useStylesScoped$',
        captures: !1,
        parent: 's_HdsYayhDkLg',
        loc: [339, 345],
      },
      s_g0E4nZcqTc8: {
        origin: 'components/footer/footer.tsx',
        displayName: 'footer_component_useStylesScoped',
        canonicalFilename: 's_g0e4nzcqtc8',
        hash: 'g0E4nZcqTc8',
        ctxKind: 'function',
        ctxName: 'useStylesScoped$',
        captures: !1,
        parent: 's_2fkm5zc0rek',
        loc: [508, 514],
      },
      s_i9FQ1vZJ8l0: {
        origin: 'components/sections/subscribe/subscribe.tsx',
        displayName: 'subscribe_component_useStylesScoped',
        canonicalFilename: 's_i9fq1vzj8l0',
        hash: 'i9FQ1vZJ8l0',
        ctxKind: 'function',
        ctxName: 'useStylesScoped$',
        captures: !1,
        parent: 's_KnttE033sL4',
        loc: [457, 463],
      },
      s_oIzTMtTO2NI: {
        origin: 'components/sections/medusa/medusa.tsx',
        displayName: 'medusa_component_useStylesScoped',
        canonicalFilename: 's_oiztmtto2ni',
        hash: 'oIzTMtTO2NI',
        ctxKind: 'function',
        ctxName: 'useStylesScoped$',
        captures: !1,
        parent: 's_eh3Zleb9svU',
        loc: [412, 418],
      },
      s_onhenAasZyM: {
        origin: 'components/container/container.tsx',
        displayName: 'container_component_useStylesScoped',
        canonicalFilename: 's_onhenaaszym',
        hash: 'onhenAasZyM',
        ctxKind: 'function',
        ctxName: 'useStylesScoped$',
        captures: !1,
        parent: 's_07tGklv0JFU',
        loc: [403, 409],
      },
      s_prGAgB6H1F4: {
        origin: 'components/sections/sponsor/sponsor.tsx',
        displayName: 'sponsor_component_useStylesScoped',
        canonicalFilename: 's_prgagb6h1f4',
        hash: 'prGAgB6H1F4',
        ctxKind: 'function',
        ctxName: 'useStylesScoped$',
        captures: !1,
        parent: 's_D0iY34otgb0',
        loc: [423, 429],
      },
      s_rk5oELlKahs: {
        origin: 'components/button/button.tsx',
        displayName: 'button_component_useStylesScoped',
        canonicalFilename: 's_rk5oellkahs',
        hash: 'rk5oELlKahs',
        ctxKind: 'function',
        ctxName: 'useStylesScoped$',
        captures: !1,
        parent: 's_rIehxbCtAqU',
        loc: [963, 969],
      },
      s_sOgQv7sgR00: {
        origin: 'components/icon/icon.tsx',
        displayName: 'icon_component_useStylesScoped',
        canonicalFilename: 's_sogqv7sgr00',
        hash: 'sOgQv7sgR00',
        ctxKind: 'function',
        ctxName: 'useStylesScoped$',
        captures: !1,
        parent: 's_outyRSHf0Tw',
        loc: [311, 317],
      },
      s_tNYOaCIm0Qc: {
        origin: 'components/forms/select/select.tsx',
        displayName: 'select_component_useStylesScoped',
        canonicalFilename: 's_tnyoacim0qc',
        hash: 'tNYOaCIm0Qc',
        ctxKind: 'function',
        ctxName: 'useStylesScoped$',
        captures: !1,
        parent: 's_Pl7vAlduOuo',
        loc: [489, 495],
      },
      s_wM7DasAxykk: {
        origin: 'components/card/card.tsx',
        displayName: 'card_component_useStylesScoped',
        canonicalFilename: 's_wm7dasaxykk',
        hash: 'wM7DasAxykk',
        ctxKind: 'function',
        ctxName: 'useStylesScoped$',
        captures: !1,
        parent: 's_E6HOLccZhOI',
        loc: [232, 238],
      },
      s_A5bZC7WO00A: {
        origin:
          '../../../node_modules/.pnpm/@builder.io+qwik-city@1.3.2_@types+node@18.19.18_less@4.1.3_rollup@2.79.1_stylus@0.59.0/node_modules/@builder.io/qwik-city/index.qwik.mjs',
        displayName: 'routeActionQrl_action_submit',
        canonicalFilename: 's_a5bzc7wo00a',
        hash: 'A5bZC7WO00A',
        ctxKind: 'function',
        ctxName: 'submit',
        captures: !0,
        loc: [40719, 42353],
      },
      s_DyVc0YBIqQU: {
        origin:
          '../../../node_modules/.pnpm/@builder.io+qwik-city@1.3.2_@types+node@18.19.18_less@4.1.3_rollup@2.79.1_stylus@0.59.0/node_modules/@builder.io/qwik-city/index.qwik.mjs',
        displayName: 'spa_init',
        canonicalFilename: 's_dyvc0ybiqqu',
        hash: 'DyVc0YBIqQU',
        ctxKind: 'function',
        ctxName: 'spaInit',
        captures: !1,
        loc: [1401, 6882],
      },
      s_t8pAmchwKZE: {
        origin:
          '../../../node_modules/.pnpm/qwik-speak@0.12.2_@builder.io+qwik@1.3.1/node_modules/qwik-speak/lib/index.qwik.mjs',
        displayName: 'useTranslateQrl_translate',
        canonicalFilename: 's_t8pamchwkze',
        hash: 't8pAmchwKZE',
        ctxKind: 'function',
        ctxName: 'translate$',
        captures: !0,
        loc: [6644, 6877],
      },
      s_wOIPfiQ04l4: {
        origin:
          '../../../node_modules/.pnpm/@builder.io+qwik-city@1.3.2_@types+node@18.19.18_less@4.1.3_rollup@2.79.1_stylus@0.59.0/node_modules/@builder.io/qwik-city/index.qwik.mjs',
        displayName: 'serverQrl_stuff',
        canonicalFilename: 's_woipfiq04l4',
        hash: 'wOIPfiQ04l4',
        ctxKind: 'function',
        ctxName: 'stuff',
        captures: !0,
        loc: [45675, 47720],
      },
      s_BUbtvTyvVRE: {
        origin:
          '../../../node_modules/.pnpm/@builder.io+qwik-city@1.3.2_@types+node@18.19.18_less@4.1.3_rollup@2.79.1_stylus@0.59.0/node_modules/@builder.io/qwik-city/index.qwik.mjs',
        displayName: 'QwikCityMockProvider_component_goto',
        canonicalFilename: 's_bubtvtyvvre',
        hash: 'BUbtvTyvVRE',
        ctxKind: 'function',
        ctxName: 'goto',
        captures: !1,
        parent: 's_WmYC5H00wtI',
        loc: [36340, 36401],
      },
      s_EQll1XU2k6A: {
        origin: 'components/navbar/navbar.tsx',
        displayName: 'navbar_component_changeLocale',
        canonicalFilename: 's_eqll1xu2k6a',
        hash: 'EQll1XU2k6A',
        ctxKind: 'function',
        ctxName: '$',
        captures: !0,
        parent: 's_e0RDNPJNIGY',
        loc: [2578, 3191],
      },
      s_KPHXz30Lh3M: {
        origin: 'components/sections/subscribe/subscribe.tsx',
        displayName: 'subscribe_component_handleSubmit',
        canonicalFilename: 's_kphxz30lh3m',
        hash: 'KPHXz30Lh3M',
        ctxKind: 'function',
        ctxName: '$',
        captures: !0,
        parent: 's_KnttE033sL4',
        loc: [565, 1161],
      },
      s_MIDC22ueZrk: {
        origin:
          '../../../node_modules/.pnpm/qwik-speak@0.12.2_@builder.io+qwik@1.3.1/node_modules/qwik-speak/lib/index.qwik.mjs',
        displayName: 'QwikSpeakProvider_component_resolvedTranslationFn',
        canonicalFilename: 's_midc22uezrk',
        hash: 'MIDC22ueZrk',
        ctxKind: 'function',
        ctxName: 'resolvedTranslationFn',
        captures: !1,
        parent: 's_yigdOibvcXE',
        loc: [3824, 3834],
      },
      s_Qj09dIbebQs: {
        origin: 'components/navbar/navbar.tsx',
        displayName:
          'navbar_component_div_div_Container_nav_div_button_onClick',
        canonicalFilename: 's_qj09dibebqs',
        hash: 'Qj09dIbebQs',
        ctxKind: 'eventHandler',
        ctxName: 'onClick$',
        captures: !0,
        parent: 's_e0RDNPJNIGY',
        loc: [6840, 6884],
      },
      s_YWAZ5f0lJEw: {
        origin: 'components/navbar/navbar.tsx',
        displayName: 'navbar_component_div_div_div_ul_li_select_onChange',
        canonicalFilename: 's_ywaz5f0ljew',
        hash: 'YWAZ5f0lJEw',
        ctxKind: 'eventHandler',
        ctxName: 'onChange$',
        captures: !0,
        parent: 's_e0RDNPJNIGY',
        loc: [9616, 9730],
      },
      s_eBQ0vFsFKsk: {
        origin:
          '../../../node_modules/.pnpm/@builder.io+qwik-city@1.3.2_@types+node@18.19.18_less@4.1.3_rollup@2.79.1_stylus@0.59.0/node_modules/@builder.io/qwik-city/index.qwik.mjs',
        displayName: 'Link_component_onPrefetch_event',
        canonicalFilename: 's_ebq0vfsfksk',
        hash: 'eBQ0vFsFKsk',
        ctxKind: 'function',
        ctxName: 'event$',
        captures: !1,
        parent: 's_8gdLBszqbaM',
        loc: [37852, 37915],
      },
      s_fX0bDjeJa0E: {
        origin:
          '../../../node_modules/.pnpm/@builder.io+qwik-city@1.3.2_@types+node@18.19.18_less@4.1.3_rollup@2.79.1_stylus@0.59.0/node_modules/@builder.io/qwik-city/index.qwik.mjs',
        displayName: 'QwikCityProvider_component_goto',
        canonicalFilename: 's_fx0bdjeja0e',
        hash: 'fX0bDjeJa0E',
        ctxKind: 'function',
        ctxName: 'goto',
        captures: !0,
        parent: 's_TxCFOy819ag',
        loc: [24418, 25737],
      },
      s_i1Cv0pYJNR0: {
        origin:
          '../../../node_modules/.pnpm/@builder.io+qwik-city@1.3.2_@types+node@18.19.18_less@4.1.3_rollup@2.79.1_stylus@0.59.0/node_modules/@builder.io/qwik-city/index.qwik.mjs',
        displayName: 'Link_component_handleClick_event',
        canonicalFilename: 's_i1cv0pyjnr0',
        hash: 'i1Cv0pYJNR0',
        ctxKind: 'function',
        ctxName: 'event$',
        captures: !0,
        parent: 's_8gdLBszqbaM',
        loc: [38381, 38901],
      },
      s_kK15dHxr40k: {
        origin: 'components/sections/contact/contact.tsx',
        displayName: 'contact_component_handleSubmit',
        canonicalFilename: 's_kk15dhxr40k',
        hash: 'kK15dHxr40k',
        ctxKind: 'function',
        ctxName: '$',
        captures: !0,
        parent: 's_tVi0Ug0Y1rA',
        loc: [772, 1521],
      },
      s_n1zdSBKIeTw: {
        origin: 'components/sections/subscribe/subscribe.tsx',
        displayName: 'subscribe_component_Section_div_div_form_onSubmit',
        canonicalFilename: 's_n1zdsbkietw',
        hash: 'n1zdSBKIeTw',
        ctxKind: 'eventHandler',
        ctxName: 'onSubmit$',
        captures: !0,
        parent: 's_KnttE033sL4',
        loc: [1748, 1783],
      },
      s_p9MSze0ojs4: {
        origin:
          '../../../node_modules/.pnpm/@builder.io+qwik-city@1.3.2_@types+node@18.19.18_less@4.1.3_rollup@2.79.1_stylus@0.59.0/node_modules/@builder.io/qwik-city/index.qwik.mjs',
        displayName: 'GetForm_component_form_onSubmit',
        canonicalFilename: 's_p9msze0ojs4',
        hash: 'p9MSze0ojs4',
        ctxKind: 'function',
        ctxName: '_jsxS',
        captures: !0,
        parent: 's_Nk9PlpjQm9Y',
        loc: [50141, 50838],
      },
    },
    mapping: {
      s_02wMImzEAbk: 'q-WAQTkgVr.js',
      s_b8fpOLpx7NA: 'q-bc5tXQza.js',
      s_sfbNflx0Y2A: 'q-NXuWezL-.js',
      s_dBzp75i0JUA: 'q-P9PodR0k.js',
      s_07tGklv0JFU: 'q-vd-w_KXm.js',
      s_2Fq8wIUpq5I: 'q-k592WfaK.js',
      s_2fkm5zc0rek: 'q-Blmdvjby.js',
      s_5qyIIEjMPSA: 'q-AE2PjDo2.js',
      s_8gdLBszqbaM: 'q-TgftcdoX.js',
      s_AkJ7NeLjpWM: 'q-bc5tXQza.js',
      s_CQ1t0RXar34: 'q-JmyJ0qA7.js',
      s_D0iY34otgb0: 'q-4WI62hmk.js',
      s_DRT9K1jPHw0: 'q-AbDvPjbv.js',
      s_E6HOLccZhOI: 'q-IUF-AQHZ.js',
      s_FQPutlW041U: 'q-izOB4Fo9.js',
      s_HdsYayhDkLg: 'q-jX1EXmT-.js',
      s_JGcGwM6uqSo: 'q-1PJUqM-6.js',
      s_KHl60H7GIzk: 'q-pb_RrnRq.js',
      s_KnttE033sL4: 'q-EfRLsstC.js',
      s_M2E9iDaUBT4: 'q-U-FLH8EN.js',
      s_MBnCRhRrMNs: 'q-D-Wr-qe8.js',
      s_Nk9PlpjQm9Y: 'q-_WeoXnTm.js',
      s_Pl7vAlduOuo: 'q-1XWnfME1.js',
      s_RZ4kRsPh3h0: 'q-egSWN4bi.js',
      s_TCwB4TUhbFA: 'q-C_G-7RYd.js',
      s_TxCFOy819ag: 'q-WAQTkgVr.js',
      s_VoSI6o07IFI: 'q-1PJUqM-6.js',
      s_WmYC5H00wtI: 'q-bGXkwLI2.js',
      s_bOB0JnUCSKY: 'q-oKS61hcj.js',
      s_e0RDNPJNIGY: 'q-P9PodR0k.js',
      s_e0ssiDXoeAM: 'q-VOwOkMaG.js',
      s_eXD0K9bzzlo: 'q-TM-xkJLr.js',
      s_eh3Zleb9svU: 'q-dN21Z2-Z.js',
      s_gft6e4M8el4: 'q-2o2AZ-2V.js',
      s_lHJ6l0hcvRg: 'q-6X-UaKF_.js',
      s_mekDswQeFyQ: 'q-hJ_tRRnN.js',
      s_outyRSHf0Tw: 'q-Zg0D1cBu.js',
      s_pbG9H8ze2g4: 'q-zumL0WX_.js',
      s_rIehxbCtAqU: 'q-mQilmcTJ.js',
      s_tVi0Ug0Y1rA: 'q-PvTUl8sS.js',
      s_yigdOibvcXE: 'q-NXuWezL-.js',
      s_RPDJAz33WLA: 'q-WAQTkgVr.js',
      s_14NE37yaMfA: 'q-C_G-7RYd.js',
      s_2HCPp1ydyqs: 'q-1XWnfME1.js',
      s_3SsPTS5utQk: 'q-2o2AZ-2V.js',
      s_5Bmm03gq0i0: 'q-U-FLH8EN.js',
      s_6VMpNf7ZCJ0: 'q-PvTUl8sS.js',
      s_LQcmHAxuFaU: 'q-P9PodR0k.js',
      s_kJTkeEh1U5c: 'q-TM-xkJLr.js',
      s_00VE9E0kYIc: 'q-zumL0WX_.js',
      s_0CLaYnIloJk: 'q-AbDvPjbv.js',
      s_0kXSZC4QkmM: 'q-pb_RrnRq.js',
      s_DkNHR022s5k: 'q-egSWN4bi.js',
      s_HSLHKDE0Tc8: 'q-P9PodR0k.js',
      s_IMLVEX3dgUw: 'q-1PJUqM-6.js',
      s_K8TT2dajw7I: 'q-P9PodR0k.js',
      s_MOjpn7epc74: 'q-1XWnfME1.js',
      s_MR5rBPxRKDs: 'q-D-Wr-qe8.js',
      s_Z790sFa7bTY: 'q-PvTUl8sS.js',
      s_ZwZ0qjzCTZQ: 'q-AE2PjDo2.js',
      s_dVIPHMdh004: 'q-jX1EXmT-.js',
      s_g0E4nZcqTc8: 'q-Blmdvjby.js',
      s_i9FQ1vZJ8l0: 'q-EfRLsstC.js',
      s_oIzTMtTO2NI: 'q-dN21Z2-Z.js',
      s_onhenAasZyM: 'q-vd-w_KXm.js',
      s_prGAgB6H1F4: 'q-4WI62hmk.js',
      s_rk5oELlKahs: 'q-mQilmcTJ.js',
      s_sOgQv7sgR00: 'q-Zg0D1cBu.js',
      s_tNYOaCIm0Qc: 'q-1XWnfME1.js',
      s_wM7DasAxykk: 'q-IUF-AQHZ.js',
      s_A5bZC7WO00A: 'q-UnfajP0r.js',
      s_DyVc0YBIqQU: 'q-EoLAf2n0.js',
      s_t8pAmchwKZE: 'q-iYSRzWsC.js',
      s_wOIPfiQ04l4: 'q-i0s5P0zz.js',
      s_BUbtvTyvVRE: 'q-bGXkwLI2.js',
      s_EQll1XU2k6A: 'q-P9PodR0k.js',
      s_KPHXz30Lh3M: 'q-EfRLsstC.js',
      s_MIDC22ueZrk: 'q-NXuWezL-.js',
      s_Qj09dIbebQs: 'q-P9PodR0k.js',
      s_YWAZ5f0lJEw: 'q-P9PodR0k.js',
      s_eBQ0vFsFKsk: 'q-yNMDHcTE.js',
      s_fX0bDjeJa0E: 'q-WAQTkgVr.js',
      s_i1Cv0pYJNR0: 'q-TgftcdoX.js',
      s_kK15dHxr40k: 'q-PvTUl8sS.js',
      s_n1zdSBKIeTw: 'q-EfRLsstC.js',
      s_p9MSze0ojs4: 'q-_WeoXnTm.js',
    },
    bundles: {
      'q-0yXnO8UR.js': {
        size: 847,
        imports: ['q-9ngTyHsh.js'],
        dynamicImports: ['q-zumL0WX_.js'],
        origins: ['src/components/sections/evolving/evolving.tsx'],
      },
      'q-1PJUqM-6.js': {
        size: 3827,
        imports: [
          'q-5QrMjcEM.js',
          'q-9ngTyHsh.js',
          'q-JZLb1D8d.js',
          'q-pgd5M9oM.js',
          'q-Scd2ZB6o.js',
          'q-T3cxTwNd.js',
          'q-UhehzwuD.js',
          'q-uSJWasxr.js',
          'q-XhXTUHYG.js',
          'q-ydNx7cQB.js',
        ],
        origins: [
          'src/components/sections/showcase/showcase.css?inline',
          'src/entry_showcase.js',
          'src/s_imlvex3dguw.js',
          'src/s_jgcgwm6uqso.js',
          'src/s_vosi6o07ifi.js',
        ],
        symbols: ['s_IMLVEX3dgUw', 's_JGcGwM6uqSo', 's_VoSI6o07IFI'],
      },
      'q-1XWnfME1.js': {
        size: 1975,
        imports: ['q-9ngTyHsh.js', 'q-Jbye9dve.js'],
        origins: [
          'src/components/forms/select/select.css?inline',
          'src/entry_select.js',
          'src/s_2hcpp1ydyqs.js',
          'src/s_mojpn7epc74.js',
          'src/s_pl7valduouo.js',
          'src/s_tnyoacim0qc.js',
        ],
        symbols: [
          's_2HCPp1ydyqs',
          's_MOjpn7epc74',
          's_Pl7vAlduOuo',
          's_tNYOaCIm0Qc',
        ],
      },
      'q-2o2AZ-2V.js': {
        size: 857,
        imports: ['q-9ngTyHsh.js'],
        origins: [
          'src/components/line/line.css?inline',
          'src/entry_line.js',
          'src/s_3sspts5utqk.js',
          'src/s_gft6e4m8el4.js',
        ],
        symbols: ['s_3SsPTS5utQk', 's_gft6e4M8el4'],
      },
      'q-4WI62hmk.js': {
        size: 4150,
        imports: [
          'q-51TGVSGw.js',
          'q-9ngTyHsh.js',
          'q-Scd2ZB6o.js',
          'q-T3cxTwNd.js',
          'q-UhehzwuD.js',
        ],
        origins: [
          'src/components/sections/sponsor/shapes.tsx',
          'src/components/sections/sponsor/sponsor.css?inline',
          'src/entry_sponsor.js',
          'src/s_d0iy34otgb0.js',
          'src/s_prgagb6h1f4.js',
        ],
        symbols: ['s_D0iY34otgb0', 's_prGAgB6H1F4'],
      },
      'q-51TGVSGw.js': {
        size: 332,
        imports: ['q-9ngTyHsh.js'],
        dynamicImports: ['q-2o2AZ-2V.js'],
        origins: ['src/components/line/line.tsx'],
      },
      'q-5QrMjcEM.js': {
        size: 332,
        imports: ['q-9ngTyHsh.js'],
        dynamicImports: ['q-Blmdvjby.js'],
        origins: ['src/components/footer/footer.tsx'],
      },
      'q-6X-UaKF_.js': {
        size: 293,
        imports: ['q-9ngTyHsh.js', 'q-Jbye9dve.js'],
        origins: ['src/entry_SelectOption.js', 'src/s_lhj6l0hcvrg.js'],
        symbols: ['s_lHJ6l0hcvRg'],
      },
      'q-9ngTyHsh.js': {
        size: 52046,
        origins: [
          '../../node_modules/.pnpm/@builder.io+qwik@1.3.1_@types+node@18.19.18_less@4.1.3_stylus@0.59.0_undici@5.28.3/node_modules/@builder.io/qwik/core.min.mjs',
        ],
      },
      'q-9THZec9p.js': {
        size: 445,
        imports: ['q-9ngTyHsh.js'],
        dynamicImports: ['q-izOB4Fo9.js'],
        origins: ['src/routes/[...lang]/layout.tsx'],
      },
      'q-_WeoXnTm.js': {
        size: 1216,
        imports: ['q-9ngTyHsh.js', 'q-v9P9ygUp.js'],
        origins: [
          'src/entry_GetForm.js',
          'src/s_nk9plpjqm9y.js',
          'src/s_p9msze0ojs4.js',
        ],
        symbols: ['s_Nk9PlpjQm9Y', 's_p9MSze0ojs4'],
      },
      'q-AbDvPjbv.js': {
        size: 4856,
        imports: [
          'q-51TGVSGw.js',
          'q-9ngTyHsh.js',
          'q-JZLb1D8d.js',
          'q-Scd2ZB6o.js',
          'q-UhehzwuD.js',
          'q-XhXTUHYG.js',
        ],
        origins: [
          'src/components/sections/hero/hero.css?inline',
          'src/components/sections/hero/shapes.tsx',
          'src/entry_hero.js',
          'src/s_0claynilojk.js',
          'src/s_drt9k1jphw0.js',
        ],
        symbols: ['s_0CLaYnIloJk', 's_DRT9K1jPHw0'],
      },
      'q-AE2PjDo2.js': {
        size: 1431,
        imports: [
          'q-9ngTyHsh.js',
          'q-qP2n7w9d.js',
          'q-T3cxTwNd.js',
          'q-XhXTUHYG.js',
        ],
        origins: [
          'src/components/sections/brands/brands.css?inline',
          'src/entry_brands.js',
          'src/s_5qyiiejmpsa.js',
          'src/s_zwz0qjzctzq.js',
        ],
        symbols: ['s_5qyIIEjMPSA', 's_ZwZ0qjzCTZQ'],
      },
      'q-bc5tXQza.js': {
        size: 728,
        imports: ['q-9ngTyHsh.js', 'q-Scd2ZB6o.js'],
        origins: [
          'src/entry_Speak.js',
          'src/s_akj7neljpwm.js',
          'src/s_b8fpolpx7na.js',
        ],
        symbols: ['s_AkJ7NeLjpWM', 's_b8fpOLpx7NA'],
      },
      'q-bGXkwLI2.js': {
        size: 966,
        imports: ['q-9ngTyHsh.js', 'q-v9P9ygUp.js'],
        origins: [
          'src/entry_QwikCityMockProvider.js',
          'src/s_bubtvtyvvre.js',
          'src/s_wmyc5h00wti.js',
        ],
        symbols: ['s_BUbtvTyvVRE', 's_WmYC5H00wtI'],
      },
      'q-Blmdvjby.js': {
        size: 2031,
        imports: [
          'q-9ngTyHsh.js',
          'q-JZLb1D8d.js',
          'q-Scd2ZB6o.js',
          'q-UhehzwuD.js',
          'q-XhXTUHYG.js',
        ],
        origins: [
          'src/components/footer/footer.css?inline',
          'src/entry_footer.js',
          'src/s_2fkm5zc0rek.js',
          'src/s_g0e4nzcqtc8.js',
        ],
        symbols: ['s_2fkm5zc0rek', 's_g0E4nZcqTc8'],
      },
      'q-c2pXVZkc.js': {
        size: 477,
        imports: ['q-9ngTyHsh.js'],
        dynamicImports: ['q-oKS61hcj.js'],
        origins: ['src/routes/[...lang]/index.tsx'],
      },
      'q-C_G-7RYd.js': {
        size: 5031,
        imports: [
          'q-9ngTyHsh.js',
          'q-gLuYvr2d.js',
          'q-GyeNLo0W.js',
          'q-ps5hdwuV.js',
          'q-Scd2ZB6o.js',
          'q-T3cxTwNd.js',
          'q-UhehzwuD.js',
          'q-XhXTUHYG.js',
        ],
        origins: [
          'src/components/sections/doc-summary/doc-summary.css?inline',
          'src/components/sections/doc-summary/shapes.tsx',
          'src/entry_doc_summary.js',
          'src/s_14ne37yamfa.js',
          'src/s_tcwb4tuhbfa.js',
        ],
        symbols: ['s_14NE37yaMfA', 's_TCwB4TUhbFA'],
      },
      'q-D-Wr-qe8.js': {
        size: 1338,
        imports: ['q-9ngTyHsh.js', 'q-T3cxTwNd.js', 'q-XhXTUHYG.js'],
        origins: [
          'src/components/section/section.css?inline',
          'src/entry_section.js',
          'src/s_mbncrhrrmns.js',
          'src/s_mr5rbpxrkds.js',
        ],
        symbols: ['s_MBnCRhRrMNs', 's_MR5rBPxRKDs'],
      },
      'q-dN21Z2-Z.js': {
        size: 17977,
        imports: [
          'q-51TGVSGw.js',
          'q-9ngTyHsh.js',
          'q-Scd2ZB6o.js',
          'q-T3cxTwNd.js',
          'q-UhehzwuD.js',
        ],
        origins: [
          'src/components/sections/medusa/medusa.css?inline',
          'src/components/sections/medusa/shapes.tsx',
          'src/entry_medusa.js',
          'src/s_eh3zleb9svu.js',
          'src/s_oiztmtto2ni.js',
        ],
        symbols: ['s_eh3Zleb9svU', 's_oIzTMtTO2NI'],
      },
      'q-EfRLsstC.js': {
        size: 5023,
        imports: [
          'q-51TGVSGw.js',
          'q-9ngTyHsh.js',
          'q-Scd2ZB6o.js',
          'q-T3cxTwNd.js',
          'q-UhehzwuD.js',
        ],
        origins: [
          'src/components/sections/subscribe/shapes.tsx',
          'src/components/sections/subscribe/subscribe.css?inline',
          'src/entry_subscribe.js',
          'src/s_i9fq1vzj8l0.js',
          'src/s_kntte033sl4.js',
          'src/s_kphxz30lh3m.js',
          'src/s_n1zdsbkietw.js',
        ],
        symbols: [
          's_i9FQ1vZJ8l0',
          's_KnttE033sL4',
          's_KPHXz30Lh3M',
          's_n1zdSBKIeTw',
        ],
      },
      'q-egSWN4bi.js': {
        size: 4923,
        imports: [
          'q-9ngTyHsh.js',
          'q-gLuYvr2d.js',
          'q-GyeNLo0W.js',
          'q-ps5hdwuV.js',
          'q-Scd2ZB6o.js',
          'q-T3cxTwNd.js',
          'q-UhehzwuD.js',
          'q-XhXTUHYG.js',
        ],
        origins: [
          'src/components/sections/explore/explore.css?inline',
          'src/entry_explore.js',
          'src/s_dknhr022s5k.js',
          'src/s_rz4krsph3h0.js',
        ],
        symbols: ['s_DkNHR022s5k', 's_RZ4kRsPh3h0'],
      },
      'q-EoLAf2n0.js': {
        size: 2286,
        origins: ['src/entry_spaInit.js', 'src/s_dyvc0ybiqqu.js'],
        symbols: ['s_DyVc0YBIqQU'],
      },
      'q-gLuYvr2d.js': {
        size: 6888,
        imports: ['q-9ngTyHsh.js'],
        origins: ['src/components/icon/data.tsx'],
      },
      'q-GyeNLo0W.js': {
        size: 332,
        imports: ['q-9ngTyHsh.js'],
        dynamicImports: ['q-IUF-AQHZ.js'],
        origins: ['src/components/card/card.tsx'],
      },
      'q-hJ_tRRnN.js': {
        size: 401,
        imports: ['q-9ngTyHsh.js'],
        origins: ['src/entry_SectionHeader.js', 'src/s_mekdswqefyq.js'],
        symbols: ['s_mekDswQeFyQ'],
      },
      'q-i0s5P0zz.js': {
        size: 890,
        imports: ['q-9ngTyHsh.js', 'q-v9P9ygUp.js'],
        origins: ['src/entry_serverQrl.js', 'src/s_woipfiq04l4.js'],
        symbols: ['s_wOIPfiQ04l4'],
      },
      'q-IUF-AQHZ.js': {
        size: 688,
        imports: ['q-9ngTyHsh.js'],
        origins: [
          'src/components/card/card.css?inline',
          'src/entry_card.js',
          'src/s_e6holcczhoi.js',
          'src/s_wm7dasaxykk.js',
        ],
        symbols: ['s_E6HOLccZhOI', 's_wM7DasAxykk'],
      },
      'q-iYSRzWsC.js': {
        size: 204,
        imports: ['q-9ngTyHsh.js', 'q-Scd2ZB6o.js'],
        origins: ['src/entry_useTranslateQrl.js', 'src/s_t8pamchwkze.js'],
        symbols: ['s_t8pAmchwKZE'],
      },
      'q-izOB4Fo9.js': {
        size: 102,
        imports: ['q-9ngTyHsh.js'],
        origins: ['src/entry_layout.js', 'src/s_fqputlw041u.js'],
        symbols: ['s_FQPutlW041U'],
      },
      'q-Jbye9dve.js': {
        size: 534,
        imports: ['q-9ngTyHsh.js'],
        dynamicImports: ['q-1XWnfME1.js', 'q-6X-UaKF_.js'],
        origins: ['src/components/forms/select/select.tsx'],
      },
      'q-JmyJ0qA7.js': {
        size: 18715,
        imports: [
          'q-5QrMjcEM.js',
          'q-9ngTyHsh.js',
          'q-oetCl3_F.js',
          'q-T3cxTwNd.js',
          'q-UhehzwuD.js',
          'q-XhXTUHYG.js',
          'q-ydNx7cQB.js',
        ],
        origins: ['src/entry_privacy_policy.js', 'src/s_cq1t0rxar34.js'],
        symbols: ['s_CQ1t0RXar34'],
      },
      'q-jX1EXmT-.js': {
        size: 1785,
        imports: [
          'q-9ngTyHsh.js',
          'q-Scd2ZB6o.js',
          'q-T3cxTwNd.js',
          'q-XhXTUHYG.js',
        ],
        origins: [
          'src/components/sections/banner/banner.css?inline',
          'src/entry_banner.js',
          'src/s_dviphmdh004.js',
          'src/s_hdsyayhdklg.js',
        ],
        symbols: ['s_dVIPHMdh004', 's_HdsYayhDkLg'],
      },
      'q-JZLb1D8d.js': { size: 650, origins: ['src/speak-config.ts'] },
      'q-k592WfaK.js': {
        size: 751,
        imports: ['q-9ngTyHsh.js', 'q-Scd2ZB6o.js', 'q-v9P9ygUp.js'],
        origins: ['src/entry_RouterHead.js', 'src/s_2fq8wiupq5i.js'],
        symbols: ['s_2Fq8wIUpq5I'],
      },
      'q-mQilmcTJ.js': {
        size: 3665,
        imports: ['q-9ngTyHsh.js', 'q-UhehzwuD.js'],
        dynamicImports: ['q-U-FLH8EN.js'],
        origins: [
          'src/components/button/button.css?inline',
          'src/components/loader/loader.tsx',
          'src/entry_button.js',
          'src/s_riehxbctaqu.js',
          'src/s_rk5oellkahs.js',
        ],
        symbols: ['s_rIehxbCtAqU', 's_rk5oELlKahs'],
      },
      'q-NXuWezL-.js': {
        size: 1434,
        imports: ['q-9ngTyHsh.js', 'q-Scd2ZB6o.js'],
        origins: [
          'src/entry_QwikSpeakProvider.js',
          'src/s_midc22uezrk.js',
          'src/s_sfbnflx0y2a.js',
          'src/s_yigdoibvcxe.js',
        ],
        symbols: ['s_MIDC22ueZrk', 's_sfbNflx0Y2A', 's_yigdOibvcXE'],
      },
      'q-O_psKbTY.js': {
        size: 321,
        imports: ['q-9ngTyHsh.js'],
        dynamicImports: ['q-vTq5evZ5.js'],
        origins: ['@qwik-city-entries'],
      },
      'q-oetCl3_F.js': {
        size: 1664,
        imports: ['q-9ngTyHsh.js'],
        dynamicImports: ['q-JmyJ0qA7.js'],
        origins: ['src/routes/[...lang]/privacy-policy/index.tsx'],
      },
      'q-oKS61hcj.js': {
        size: 1490,
        imports: [
          'q-0yXnO8UR.js',
          'q-5QrMjcEM.js',
          'q-9ngTyHsh.js',
          'q-qP2n7w9d.js',
          'q-uSJWasxr.js',
          'q-ydNx7cQB.js',
        ],
        dynamicImports: [
          'q-4WI62hmk.js',
          'q-AbDvPjbv.js',
          'q-C_G-7RYd.js',
          'q-dN21Z2-Z.js',
          'q-EfRLsstC.js',
          'q-egSWN4bi.js',
          'q-jX1EXmT-.js',
          'q-pb_RrnRq.js',
          'q-PvTUl8sS.js',
        ],
        origins: [
          'src/components/sections/banner/banner.tsx',
          'src/components/sections/contact/contact.tsx',
          'src/components/sections/discord/discord.tsx',
          'src/components/sections/doc-summary/doc-summary.tsx',
          'src/components/sections/explore/explore.tsx',
          'src/components/sections/hero/hero.tsx',
          'src/components/sections/medusa/medusa.tsx',
          'src/components/sections/sponsor/sponsor.tsx',
          'src/components/sections/subscribe/subscribe.tsx',
          'src/entry_____lang_.js',
          'src/s_bob0jnucsky.js',
        ],
        symbols: ['s_bOB0JnUCSKY'],
      },
      'q-P9PodR0k.js': {
        size: 6934,
        imports: [
          'q-9ngTyHsh.js',
          'q-gLuYvr2d.js',
          'q-Jbye9dve.js',
          'q-JZLb1D8d.js',
          'q-ps5hdwuV.js',
          'q-Scd2ZB6o.js',
          'q-UhehzwuD.js',
          'q-v9P9ygUp.js',
          'q-XhXTUHYG.js',
          'q-ydNx7cQB.js',
        ],
        origins: [
          'src/components/navbar/navbar.css?inline',
          'src/entry_navbar.js',
          'src/s_dbzp75i0jua.js',
          'src/s_e0rdnpjnigy.js',
          'src/s_eqll1xu2k6a.js',
          'src/s_hslhkde0tc8.js',
          'src/s_k8tt2dajw7i.js',
          'src/s_lqcmhaxufau.js',
          'src/s_qj09dibebqs.js',
          'src/s_ywaz5f0ljew.js',
        ],
        symbols: [
          's_dBzp75i0JUA',
          's_e0RDNPJNIGY',
          's_EQll1XU2k6A',
          's_HSLHKDE0Tc8',
          's_K8TT2dajw7I',
          's_LQcmHAxuFaU',
          's_Qj09dIbebQs',
          's_YWAZ5f0lJEw',
        ],
      },
      'q-pb_RrnRq.js': {
        size: 3810,
        imports: [
          'q-51TGVSGw.js',
          'q-9ngTyHsh.js',
          'q-Scd2ZB6o.js',
          'q-T3cxTwNd.js',
        ],
        origins: [
          'src/components/sections/discord/discord.css?inline',
          'src/components/sections/discord/shapes.tsx',
          'src/entry_discord.js',
          'src/s_0kxszc4qkmm.js',
          'src/s_khl60h7gizk.js',
        ],
        symbols: ['s_0kXSZC4QkmM', 's_KHl60H7GIzk'],
      },
      'q-pgd5M9oM.js': {
        size: 1230,
        imports: ['q-9ngTyHsh.js'],
        dynamicImports: ['q-1PJUqM-6.js'],
        origins: ['src/routes/[...lang]/showcase/index.tsx'],
      },
      'q-ps5hdwuV.js': {
        size: 332,
        imports: ['q-9ngTyHsh.js'],
        dynamicImports: ['q-Zg0D1cBu.js'],
        origins: ['src/components/icon/icon.tsx'],
      },
      'q-PvTUl8sS.js': {
        size: 5395,
        imports: [
          'q-9ngTyHsh.js',
          'q-JZLb1D8d.js',
          'q-Scd2ZB6o.js',
          'q-T3cxTwNd.js',
          'q-UhehzwuD.js',
          'q-XhXTUHYG.js',
        ],
        origins: [
          'src/components/sections/contact/contact.css?inline',
          'src/entry_contact.js',
          'src/s_6vmpnf7zcj0.js',
          'src/s_kk15dhxr40k.js',
          'src/s_tvi0ug0y1ra.js',
          'src/s_z790sfa7bty.js',
        ],
        symbols: [
          's_6VMpNf7ZCJ0',
          's_kK15dHxr40k',
          's_tVi0Ug0Y1rA',
          's_Z790sFa7bTY',
        ],
      },
      'q-qP2n7w9d.js': {
        size: 995,
        imports: ['q-9ngTyHsh.js'],
        dynamicImports: ['q-AE2PjDo2.js'],
        origins: ['src/components/sections/brands/brands.tsx'],
      },
      'q-Scd2ZB6o.js': {
        size: 1432,
        imports: ['q-9ngTyHsh.js'],
        dynamicImports: ['q-NXuWezL-.js'],
        origins: [
          '../../node_modules/.pnpm/qwik-speak@0.12.2_@builder.io+qwik@1.3.1/node_modules/qwik-speak/lib/index.qwik.mjs',
        ],
      },
      'q-T3cxTwNd.js': {
        size: 512,
        imports: ['q-9ngTyHsh.js'],
        dynamicImports: ['q-D-Wr-qe8.js', 'q-hJ_tRRnN.js'],
        origins: ['src/components/section/section.tsx'],
      },
      'q-TgftcdoX.js': {
        size: 1501,
        imports: ['q-9ngTyHsh.js', 'q-v9P9ygUp.js'],
        dynamicImports: ['q-yNMDHcTE.js'],
        origins: [
          'src/entry_Link.js',
          'src/s_8gdlbszqbam.js',
          'src/s_i1cv0pyjnr0.js',
        ],
        symbols: ['s_8gdLBszqbaM', 's_i1Cv0pYJNR0'],
      },
      'q-TM-xkJLr.js': {
        size: 32906,
        imports: [
          'q-9ngTyHsh.js',
          'q-JZLb1D8d.js',
          'q-Scd2ZB6o.js',
          'q-v9P9ygUp.js',
        ],
        dynamicImports: ['q-k592WfaK.js'],
        origins: [
          'src/components/router-head/router-head.tsx',
          'src/entry_root.js',
          'src/global.css?inline',
          'src/s_exd0k9bzzlo.js',
          'src/s_kjtkeeh1u5c.js',
          'src/speak-functions.ts',
        ],
        symbols: ['s_eXD0K9bzzlo', 's_kJTkeEh1U5c'],
      },
      'q-U-FLH8EN.js': {
        size: 1515,
        imports: ['q-9ngTyHsh.js'],
        origins: [
          'src/components/loader/loader.css?inline',
          'src/entry_loader.js',
          'src/s_5bmm03gq0i0.js',
          'src/s_m2e9idaubt4.js',
        ],
        symbols: ['s_5Bmm03gq0i0', 's_M2E9iDaUBT4'],
      },
      'q-UhehzwuD.js': {
        size: 479,
        imports: ['q-9ngTyHsh.js'],
        dynamicImports: ['q-mQilmcTJ.js'],
        origins: ['src/components/button/button.tsx'],
      },
      'q-UnfajP0r.js': {
        size: 751,
        imports: ['q-9ngTyHsh.js'],
        origins: ['src/entry_routeActionQrl.js', 'src/s_a5bzc7wo00a.js'],
        symbols: ['s_A5bZC7WO00A'],
      },
      'q-uSJWasxr.js': {
        size: 1072,
        imports: ['q-9ngTyHsh.js'],
        dynamicImports: ['q-1PJUqM-6.js'],
        origins: ['src/components/sections/showcase/showcase.tsx'],
      },
      'q-v9P9ygUp.js': {
        size: 7792,
        imports: ['q-9ngTyHsh.js'],
        dynamicImports: [
          'q-EoLAf2n0.js',
          'q-i0s5P0zz.js',
          'q-VOwOkMaG.js',
          'q-WAQTkgVr.js',
        ],
        origins: [
          '../../node_modules/.pnpm/@builder.io+qwik-city@1.3.2_@types+node@18.19.18_less@4.1.3_rollup@2.79.1_stylus@0.59.0/node_modules/@builder.io/qwik-city/index.qwik.mjs',
          '@qwik-city-sw-register',
        ],
      },
      'q-vd-w_KXm.js': {
        size: 1621,
        imports: ['q-9ngTyHsh.js', 'q-XhXTUHYG.js'],
        origins: [
          'src/components/container/container.css?inline',
          'src/entry_container.js',
          'src/s_07tgklv0jfu.js',
          'src/s_onhenaaszym.js',
        ],
        symbols: ['s_07tGklv0JFU', 's_onhenAasZyM'],
      },
      'q-VOwOkMaG.js': {
        size: 457,
        imports: ['q-9ngTyHsh.js', 'q-v9P9ygUp.js'],
        origins: ['src/entry_RouterOutlet.js', 'src/s_e0ssidxoeam.js'],
        symbols: ['s_e0ssiDXoeAM'],
      },
      'q-vTq5evZ5.js': {
        size: 2539,
        origins: [
          '../../node_modules/.pnpm/@builder.io+qwik-city@1.3.2_@types+node@18.19.18_less@4.1.3_rollup@2.79.1_stylus@0.59.0/node_modules/@builder.io/qwik-city/service-worker.mjs',
          'src/routes/service-worker.ts',
        ],
      },
      'q-WAQTkgVr.js': {
        size: 5922,
        imports: ['q-9ngTyHsh.js', 'q-v9P9ygUp.js'],
        dynamicImports: [
          'q-9THZec9p.js',
          'q-c2pXVZkc.js',
          'q-O_psKbTY.js',
          'q-oetCl3_F.js',
          'q-pgd5M9oM.js',
        ],
        origins: [
          '@qwik-city-plan',
          'src/entry_QwikCityProvider.js',
          'src/s_02wmimzeabk.js',
          'src/s_fx0bdjeja0e.js',
          'src/s_rpdjaz33wla.js',
          'src/s_txcfoy819ag.js',
        ],
        symbols: [
          's_02wMImzEAbk',
          's_fX0bDjeJa0E',
          's_RPDJAz33WLA',
          's_TxCFOy819ag',
        ],
      },
      'q-XhXTUHYG.js': {
        size: 431,
        imports: ['q-9ngTyHsh.js'],
        dynamicImports: ['q-vd-w_KXm.js'],
        origins: ['src/components/container/container.tsx'],
      },
      'q-xQtrsSrw.js': {
        size: 338,
        imports: ['q-9ngTyHsh.js'],
        dynamicImports: ['q-TM-xkJLr.js'],
        origins: ['src/root.tsx'],
      },
      'q-ydNx7cQB.js': {
        size: 421,
        imports: ['q-9ngTyHsh.js'],
        dynamicImports: ['q-P9PodR0k.js'],
        origins: ['src/components/navbar/navbar.tsx'],
      },
      'q-yNMDHcTE.js': {
        size: 128,
        imports: ['q-9ngTyHsh.js', 'q-v9P9ygUp.js'],
        origins: ['src/s_ebq0vfsfksk.js'],
        symbols: ['s_eBQ0vFsFKsk'],
      },
      'q-Zg0D1cBu.js': {
        size: 666,
        imports: ['q-9ngTyHsh.js', 'q-gLuYvr2d.js'],
        origins: [
          'src/components/icon/icon.css?inline',
          'src/entry_icon.js',
          'src/s_outyrshf0tw.js',
          'src/s_sogqv7sgr00.js',
        ],
        symbols: ['s_outyRSHf0Tw', 's_sOgQv7sgR00'],
      },
      'q-zumL0WX_.js': {
        size: 4052,
        imports: [
          'q-0yXnO8UR.js',
          'q-51TGVSGw.js',
          'q-9ngTyHsh.js',
          'q-gLuYvr2d.js',
          'q-GyeNLo0W.js',
          'q-ps5hdwuV.js',
          'q-Scd2ZB6o.js',
          'q-T3cxTwNd.js',
          'q-UhehzwuD.js',
          'q-XhXTUHYG.js',
        ],
        origins: [
          'src/components/sections/evolving/evolving.css?inline',
          'src/entry_evolving.js',
          'src/s_00ve9e0kyic.js',
          'src/s_pbg9h8ze2g4.js',
        ],
        symbols: ['s_00VE9E0kYIc', 's_pbG9H8ze2g4'],
      },
    },
    injections: [],
    version: '1',
    options: {
      target: 'client',
      buildMode: 'production',
      entryStrategy: { type: 'smart' },
    },
    platform: {
      qwik: '1.3.1',
      vite: '',
      rollup: '4.9.1',
      env: 'node',
      os: 'linux',
      node: '20.9.0',
    },
  },
  _s = {
    'en-US': {
      lang: 'en-US',
      currency: 'USD',
      timeZone: 'America/Los_Angeles',
    },
    'pt-BR': { lang: 'pt-BR', currency: 'BRL', timeZone: 'America/Sao_Paulo' },
    'zh-CN': { lang: 'zh-CN', currency: 'CNY', timeZone: 'Asia/Shanghai' },
  },
  $t = {
    defaultLocale: _s['en-US'],
    supportedLocales: Object.values(_s),
    assets: [
      'app',
      'contact',
      'banner',
      'discord',
      'doc-summary',
      'evolving',
      'explore',
      'footer',
      'hero',
      'medusa',
      'navbar',
      'showcase',
      'sponsor',
      'subscribe',
      'showcase-page',
    ],
  },
  _t = (e, t) => {
    const n = e.startsWith('/') ? e : `/${e}`,
      s = n.endsWith('/') ? n : `${n}/`,
      r = `${
        $t.defaultLocale.lang === t.locale.lang ? '' : `/${t.locale.lang}`
      }${s}`;
    return r.includes('/#') ? r.slice(0, -1) : r;
  },
  $p = () => $(Z, null, 3, 'w8_0'),
  bp = R(j($p, 's_FQPutlW041U')),
  wp = ({ params: e, locale: t }) => {
    const { lang: n } = e;
    t(n || $t.defaultLocale.lang);
  },
  vp = Object.freeze(
    Object.defineProperty(
      { __proto__: null, default: bp, onRequest: wp },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  ),
  _p = '';
let I;
(function (e) {
  (e.PINK = 'pink'),
    (e.OPAQUE = 'opaque'),
    (e.GRAY = 'GRAY'),
    (e.NONE = 'none');
})(I || (I = {}));
const xp = (e) => {
    W(j(_p, 's_onhenAasZyM'));
    const t = {
        [I.PINK]: 'bg-[#EFEFFF]',
        [I.OPAQUE]: 'bg-mf-gray',
        [I.GRAY]: 'bg-mf-gray',
        [I.NONE]: 'bg-transparent',
      }[e.theme || I.PINK],
      n = {
        [I.PINK]: 'backdrop-blur-md bg-transparent',
        [I.OPAQUE]: 'backdrop-blur-xl bg-white/10',
        [I.GRAY]: 'bg-transparent',
        [I.NONE]: 'bg-transparent',
      }[e.theme || I.PINK];
    return (
      {
        [I.PINK]:
          e.pattern === !1 ? 'opacity-0' : 'bg-pattern bg-repeat opacity-40',
        [I.OPAQUE]:
          e.pattern === !1 ? 'opacity-0' : 'bg-pattern bg-repeat opacity-40',
        [I.GRAY]:
          e.pattern === !1 ? 'opacity-0' : 'bg-pattern bg-repeat opacity-40',
        [I.NONE]: '',
      }[e.theme || I.PINK],
      l(
        'div',
        { class: `w-full relative ${t}` },
        null,
        [
          l(
            'div',
            null,
            { class: 'block absolute h-full w-full top-0 left-0 z-10' },
            $(Z, { name: 'background', [d]: { name: d } }, 3, 'Wz_0'),
            1,
            null
          ),
          l(
            'div',
            { class: `absolute h-full w-full top-0 left-0 z-20 ${n} ` },
            null,
            null,
            3,
            null
          ),
          l(
            'div',
            null,
            { class: 'block absolute h-full w-full top-0 left-0 z-20' },
            $(
              Z,
              { name: 'background-no-overlay', [d]: { name: d } },
              3,
              'Wz_1'
            ),
            1,
            null
          ),
          l(
            'div',
            null,
            {
              class: H(
                (s) =>
                  `relative mx-auto z-20 ${
                    s.fullWidth ? 'w-full' : 'w-11/12 max-w-1225'
                  }`,
                [e],
                '`relative mx-auto z-20 ${p0.fullWidth?"w-full":"w-11/12 max-w-1225"}`'
              ),
            },
            $(Z, null, 3, 'Wz_2'),
            1,
            null
          ),
        ],
        1,
        'Wz_3'
      )
    );
  },
  Wn = R(j(xp, 's_07tGklv0JFU')),
  kp = '';
let de;
(function (e) {
  (e.TOP = 'top'), (e.BOTTOM = 'bottom'), (e.BOTH = 'both'), (e.NONE = 'none');
})(de || (de = {}));
const Sp = (e) => {
    W(j(kp, 's_MR5rBPxRKDs'));
    const t = {
      [de.TOP]: 'pt-14 md:pt-28',
      [de.BOTTOM]: 'pb-14 md:pb-28',
      [de.BOTH]: 'py-14 md:py-28',
      [de.NONE]: '',
    }[e.padding || de.BOTH];
    return $(
      Wn,
      {
        get fullWidth() {
          return e.fullWidth;
        },
        get theme() {
          return e.theme;
        },
        children: [
          l(
            'section',
            {
              class: `flex flex-col items-center gap-10 ${t} ${e.class || ''}`,
            },
            { id: H((n) => n.id, [e], 'p0.id') },
            [
              l(
                'div',
                null,
                { class: 'empty:hidden' },
                $(Z, { name: 'header', [d]: { name: d } }, 3, 'fW_0'),
                1,
                null
              ),
              l(
                'div',
                null,
                { class: 'w-full' },
                $(Z, null, 3, 'fW_1'),
                1,
                null
              ),
            ],
            1,
            null
          ),
          l(
            'span',
            { 'q:slot': 'background' },
            null,
            $(Z, { name: 'background', [d]: { name: d } }, 3, 'fW_2'),
            1,
            null
          ),
          l(
            'span',
            { 'q:slot': 'background-no-overlay' },
            null,
            $(
              Z,
              { name: 'background-no-overlay', [d]: { name: d } },
              3,
              'fW_3'
            ),
            1,
            null
          ),
        ],
        [d]: {
          fullWidth: H((n) => n.fullWidth, [e], 'p0.fullWidth'),
          theme: H((n) => n.theme, [e], 'p0.theme'),
        },
      },
      1,
      'fW_4'
    );
  },
  ie = R(j(Sp, 's_MBnCRhRrMNs')),
  qp = (e) =>
    l(
      'div',
      null,
      { class: 'flex flex-col items-center gap-4 md:gap-10 text-center' },
      [
        l(
          'h2',
          null,
          {
            class:
              'text-blue-grey-900 font-bold text-4xl leading-tight md:leading-none',
          },
          H((t) => t.title, [e], 'p0.title'),
          3,
          null
        ),
        e.subtitle &&
          l(
            'p',
            null,
            { class: 'text-blue-grey-900 text-lg font-medium max-w-4xl' },
            H((t) => t.subtitle, [e], 'p0.subtitle'),
            3,
            'fW_5'
          ),
      ],
      1,
      'fW_6'
    ),
  xt = R(j(qp, 's_mekDswQeFyQ')),
  Cp =
    '.animation{animation-duration:.8s;animation-iteration-count:infinite}@keyframes first{0%{background-color:#cad1ea}33%{background-color:#1c2135}66%{background-color:#6c79a4}to{background-color:#cad1ea}}@keyframes second{0%{background-color:#6c79a4}33%{background-color:#cad1ea}66%{background-color:#1c2135}to{background-color:#6c79a4}}@keyframes third{0%{background-color:#1c2135}33%{background-color:#6c79a4}66%{background-color:#cad1ea}to{background-color:#1c2135}}.animation--first{animation-name:first}.animation--second{animation-name:second}.animation--third{animation-name:third}',
  jp = () => (
    W(j(Cp, 's_5Bmm03gq0i0')),
    l(
      'div',
      null,
      { class: 'inline-flex flex justify-center items-center gap-1' },
      [
        l(
          'div',
          null,
          {
            class:
              'inline-block bg-blue-gray-300 h-2 w-2 rounded-full animation animation--first',
          },
          null,
          3,
          null
        ),
        l(
          'div',
          null,
          {
            class:
              'inline-block bg-blue-gray-500 h-2 w-2 rounded-full animation animation--second',
          },
          null,
          3,
          null
        ),
        l(
          'div',
          null,
          {
            class:
              'inline-block bg-blue-gray-900 h-2 w-2 rounded-full animation animation--third',
          },
          null,
          3,
          null
        ),
      ],
      3,
      'AC_0'
    )
  ),
  Tp = R(j(jp, 's_M2E9iDaUBT4')),
  Ep = '';
let P;
(function (e) {
  (e.SOLID = 'solid'),
    (e.OUTLINE = 'outline'),
    (e.NAKED = 'naked'),
    (e.NAKED_ALT = 'naked-alt'),
    (e.NAV = 'nav'),
    (e.SUB_NAV = 'sub-nav');
})(P || (P = {}));
const Lp = (e) => {
    vt(), W(j(Ep, 's_rk5oELlKahs'));
    const t = e.small ? 'py-3 px-4' : 'py-6 px-8',
      n = {
        [P.SOLID]: [
          t,
          'relative bg-blue-gray-900 text-white border-blue-gray-900 border outline-none font-medium leading-snug text-lg',
          'hover:bg-blue-gray-600 hover:border-blue-gray-600',
          'focus-visible:shadow-outline',
          'active:bg-blue-gray-700 active:border-blue-gray-700',
          e.disabled
            ? '!bg-blue-gray-400 !border-blue-gray-400 !pointer-events-none'
            : '',
          e.loading
            ? '!bg-blue-gray-900 !text-white !border-blue-gray-900 !pointer-events-none'
            : '',
        ].join(' '),
        [P.OUTLINE]: [
          t,
          'relative bg-transparent text-blue-gray-900 border-blue-gray-900 border outline-none font-medium leading-snug text-lg',
          'hover:bg-blue-gray-700 hover:text-white hover:border-blue-gray-700',
          'focus-visible:shadow-outline focus-visible:border-transparent',
          'active:bg-blue-gray-900 active:border-blue-gray-900 active:text-white',
          e.disabled
            ? '!bg-transparent !border-blue-gray-400 !text-blue-gray-400 !pointer-events-none'
            : '',
          e.loading
            ? '!relative !bg-transparent !text-blue-gray-900 !border-blue-gray-900 !pointer-events-none'
            : '',
        ].join(' '),
        [P.NAKED]: [
          'p-0',
          'relative bg-transparent text-ui-blue !border-transparent outline-none font-medium leading-snug text-lg',
          'focus-visible:shadow-outline',
          e.disabled ? 'text-deep-purple-700 !pointer-events-none' : '',
          '',
        ].join(' '),
        [P.NAKED_ALT]: [
          'relative text-blue-gray-900 border-transparent active:font-semibold text-lg outline-ui-blue font-medium leading-snug',
          'hover:text-blue-gray-600',
          'active:text-blue-gray-700',
          e.active ? '!text-blue-gray-700' : '',
          (e.disabled, ''),
          (e.loading, ''),
        ].join(' '),
        [P.NAV]: [
          'relative text-blue-gray-900 border-transparent text-lg outline-ui-blue font-medium leading-snug',
          'active:font-semibold',
          'hover:text-deep-purple-700',
          'active:text-deep-purple-300',
          e.active ? '!text-deep-purple-300' : '',
          (e.disabled, ''),
          (e.loading, ''),
        ].join(' '),
        [P.SUB_NAV]: [
          'relative text-blue-gray-900 border-transparent text-base outline-ui-blue font-medium leading-snug',
          'active:font-semibold',
          'hover:text-deep-purple-700',
          'active:text-deep-purple-300',
          e.active ? '!text-deep-purple-300' : '',
          (e.disabled, ''),
          (e.loading, ''),
          e.bold ? 'font-semibold' : '',
        ].join(' '),
      },
      s = { center: 'text-center', left: 'text-left', right: 'text-right' }[
        e.align || 'center'
      ],
      o = l(
        'div',
        null,
        { class: 'flex justify-center items-center gap-3' },
        [
          l(
            'div',
            null,
            { class: 'flex empty:hidden' },
            $(Z, { name: 'prefix', [d]: { name: d } }, 3, 'Nm_0'),
            1,
            null
          ),
          l(
            'div',
            { class: `flex ${s}` },
            null,
            [
              l(
                'div',
                null,
                {
                  class: H(
                    (r) => `flex ${r.loading ? 'invisible' : ''}`,
                    [e],
                    '`flex ${p0.loading?"invisible":""}`'
                  ),
                },
                $(Z, null, 3, 'Nm_1'),
                1,
                null
              ),
              e.loading &&
                l(
                  'div',
                  null,
                  {
                    class:
                      'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
                  },
                  $(Tp, null, 3, 'Nm_2'),
                  1,
                  'Nm_3'
                ),
            ],
            1,
            null
          ),
          l(
            'div',
            null,
            { class: 'flex empty:hidden' },
            $(Z, { name: 'suffix', [d]: { name: d } }, 3, 'Nm_4'),
            1,
            null
          ),
        ],
        1,
        'Nm_5'
      );
    return e.type === 'link'
      ? l(
          'a',
          { class: `inline-block border-solid ${n[e.theme]} ${e.class || ''}` },
          {
            href: H((r) => r.href, [e], 'p0.href'),
            rel: H((r) => r.rel, [e], 'p0.rel'),
            target: H((r) => r.target, [e], 'p0.target'),
          },
          o,
          1,
          'Nm_6'
        )
      : l(
          'button',
          {
            class: `inline-block border-solid ${n[e.theme]} ${e.class || ''}`,
            onClick$: e.onClick,
          },
          { type: H((r) => r.type, [e], 'p0.type') },
          o,
          0,
          null
        );
  },
  U = R(j(Lp, 's_rIehxbCtAqU')),
  Wl = Ee('qwikspeak'),
  ts = {},
  Np =
    (e) =>
    (...t) => {
      const n = JSON.stringify(t);
      return n in ts ? ts[n] : (ts[n] = e(...t));
    },
  Ap = async (e, t, n, s, o) => {
    {
      const { locale: r, translation: a, translationFn: i } = e;
      let c;
      if (((c = [...(t ?? []), ...(n ?? [])]), c.length === 0)) return;
      const u = new Set(s || []);
      u.add(r.lang);
      for (const p of u) {
        const f = Np(i.loadTranslation$),
          m = c.map((w) => f(p, w, o)),
          b = (await Promise.all(m)).map((w, h) => ({
            asset: c[h],
            source: w,
          }));
        for (const w of b)
          if (w != null && w.source)
            if (t != null && t.includes(w.asset))
              for (let [h, y] of Object.entries(w.source))
                typeof y == 'string' && (y = new String(y)), (a[p][h] = Zt(y));
            else Object.assign(a[p], w.source);
      }
    }
  },
  Ql = (e, t, n, s = '.', o = '@@') => {
    if (Array.isArray(e)) return e.map((i) => Ql(i, t, n, s, o));
    let r;
    [e, r] = zp(e, o);
    const a = e
      .split(s)
      .reduce((i, c) => (i && i[c] !== void 0 ? i[c] : void 0), t);
    if (a) {
      if (typeof a == 'string' || a instanceof String)
        return n ? er(a.toString(), n) : a.toString();
      if (typeof a == 'object') return a;
    }
    return r
      ? !/^[[{].*[\]}]$/.test(r) || /^{{/.test(r)
        ? n
          ? er(r, n)
          : r
        : JSON.parse(r)
      : e;
  },
  zp = (e, t) => e.split(t),
  er = (e, t) =>
    e.replace(/{{\s?([^{}\s]*)\s?}}/g, (s, o) => {
      const r = t[o];
      return r !== void 0 ? r : s;
    }),
  Ip = () => null,
  Rp = async () => {
    const [e, t, n, s] = Ie();
    await Ap(
      n,
      e.assets,
      e.runtimeAssets,
      t.langs,
      s == null ? void 0 : s.origin
    );
  },
  Mp = (e) => {
    var c;
    const t = Pt('url'),
      n = t ? new URL(t) : null,
      s = Pt('locale'),
      o = {
        loadTranslation$:
          ((c = e.translationFn) == null ? void 0 : c.loadTranslation$) ??
          j(Ip, 's_MIDC22ueZrk'),
      };
    let r = e.locale ?? e.config.supportedLocales.find((u) => u.lang === s);
    r || (r = e.config.defaultLocale);
    const a = {
        locale: Object.assign({}, r),
        translation: Object.fromEntries(
          e.config.supportedLocales.map((u) => [u.lang, {}])
        ),
        config: {
          defaultLocale: e.config.defaultLocale,
          supportedLocales: e.config.supportedLocales,
          assets: e.config.assets,
          runtimeAssets: e.config.runtimeAssets,
          keySeparator: e.config.keySeparator || '.',
          keyValueSeparator: e.config.keyValueSeparator || '@@',
        },
        translationFn: o,
      },
      { config: i } = a;
    return (
      Le(Wl, a), Vr(j(Rp, 's_sfbNflx0Y2A', [i, e, a, n])), $(Z, null, 3, 'gB_0')
    );
  },
  Pp = R(j(Mp, 's_yigdOibvcXE')),
  rt = () => Rn(Wl),
  x = (e, t, n) => {
    const s = rt(),
      { locale: o, translation: r, config: a } = s;
    return (
      n ?? (n = o.lang), Ql(e, r[n], t, a.keySeparator, a.keyValueSeparator)
    );
  };
let se;
(function (e) {
  (e.HEART = 'heart'),
    (e.ARROW_NARROW_RIGHT = 'arrow-narrow-right'),
    (e.DISCORD = 'discord'),
    (e.GITHUB = 'github');
})(se || (se = {}));
const Dp = {
    [se.HEART]: l(
      'svg',
      null,
      {
        height: '100%',
        viewBox: '0 0 24 24',
        width: '100%',
        xmlns: 'http://www.w3.org/2000/svg',
      },
      l(
        'path',
        null,
        {
          'clip-rule': 'evenodd',
          d: 'M11.9929 3.71691C9.65298 1.67202 6.19252 1.25356 3.50521 3.54965C0.598423 6.03328 0.176093 10.2161 2.47471 13.1739C3.34724 14.2967 5.05023 15.9835 6.68684 17.5282C8.34261 19.0911 9.99457 20.5679 10.8092 21.2894C10.9102 21.3788 11.0458 21.4967 11.1539 21.5903L11.2915 21.7093L11.3475 21.7576C11.3475 21.7576 11.3478 21.7578 12.0001 20.9999L11.3475 21.7576L12.0138 22.331L12.6678 21.7443L12.0001 20.9999C12.6678 21.7443 12.6678 21.7443 12.6678 21.7443L12.8559 21.5759C12.9617 21.4813 13.0886 21.3679 13.1773 21.2894C13.992 20.5679 15.6439 19.0911 17.2997 17.5282C18.9363 15.9835 20.6393 14.2967 21.5118 13.1739C23.8016 10.2275 23.4445 6.01238 20.4709 3.54088C17.7537 1.28246 14.3301 1.67124 11.9929 3.71691ZM11.9933 19.6663C11.1462 18.9145 9.6027 17.5303 8.05966 16.0738C6.40681 14.5137 4.81701 12.9286 4.05392 11.9467C2.41807 9.84171 2.7011 6.86733 4.80441 5.07021C6.818 3.34975 9.52828 3.79238 11.2333 5.78575L11.9933 6.67416L12.7532 5.78575C14.4507 3.80119 17.1256 3.36105 19.1925 5.07898C21.3152 6.84319 21.5773 9.83034 19.9326 11.9467C19.1695 12.9286 17.5797 14.5137 15.9269 16.0738C14.3838 17.5303 12.8403 18.9145 11.9933 19.6663Z',
          fill: 'currentColor',
          'fill-rule': 'evenodd',
        },
        null,
        3,
        null
      ),
      3,
      'u8_0'
    ),
    [se.ARROW_NARROW_RIGHT]: l(
      'svg',
      null,
      {
        fill: 'none',
        height: '100%',
        viewBox: '0 0 24 24',
        width: '100%',
        xmlns: 'http://www.w3.org/2000/svg',
      },
      l(
        'path',
        null,
        {
          'clip-rule': 'evenodd',
          d: 'M14 4.58594L21.4142 12.0002L14 19.4144L12.5858 18.0002L17.5858 13.0002H3V11.0002H17.5858L12.5858 6.00015L14 4.58594Z',
          fill: 'currentColor',
          'fill-rule': 'evenodd',
        },
        null,
        3,
        null
      ),
      3,
      null
    ),
    [se.DISCORD]: l(
      'svg',
      null,
      {
        fill: 'none',
        height: '100%',
        viewBox: '0 0 37 36',
        width: '100%',
        xmlns: 'http://www.w3.org/2000/svg',
      },
      l(
        'path',
        null,
        {
          d: 'M28.9242 8.02698C32.3123 13.2572 33.9856 19.1568 33.3601 25.9485C33.3575 25.9773 33.3432 26.0036 33.3207 26.021C30.755 27.999 28.2691 29.1995 25.8181 29.9956C25.799 30.0017 25.7786 30.0014 25.7597 29.9947C25.7408 29.988 25.7244 29.9752 25.7127 29.9582C25.1465 29.131 24.632 28.2589 24.1812 27.3431C24.1554 27.2892 24.179 27.2242 24.2322 27.2029C25.0494 26.8797 25.8264 26.4923 26.5737 26.0336C26.6326 25.9973 26.6364 25.9088 26.582 25.8662C26.4234 25.7426 26.2662 25.6127 26.1159 25.4827C26.0877 25.4587 26.0499 25.454 26.018 25.4701C21.1659 27.8227 15.8506 27.8227 10.9411 25.4701C10.9093 25.4552 10.8714 25.4603 10.844 25.4839C10.694 25.6139 10.5365 25.7426 10.3794 25.8662C10.325 25.9088 10.3295 25.9973 10.3888 26.0336C11.1361 26.4836 11.9131 26.8797 12.7291 27.2045C12.782 27.2258 12.8071 27.2892 12.7809 27.3431C12.3399 28.2601 11.8254 29.1322 11.2486 29.9594C11.2235 29.9929 11.1823 30.0082 11.1433 29.9956C8.70389 29.1995 6.21802 27.999 3.65227 26.021C3.6309 26.0036 3.61552 25.9761 3.61327 25.9473C3.09052 20.0726 4.1559 14.1242 8.04501 8.0258C8.05439 8.00965 8.06864 7.99705 8.08514 7.98957C9.99876 7.06747 12.0489 6.38908 14.1916 6.00166C14.2306 5.99536 14.2696 6.01426 14.2899 6.05048C14.5546 6.54264 14.8573 7.17378 15.062 7.68956C17.3206 7.32733 19.6145 7.32733 21.9204 7.68956C22.1251 7.1848 22.4172 6.54264 22.6809 6.05048C22.6903 6.03251 22.7048 6.01812 22.7225 6.00935C22.7401 6.00058 22.7599 5.99789 22.7791 6.00166C24.923 6.39027 26.9731 7.06865 28.8852 7.98957C28.9021 7.99705 28.916 8.00965 28.9242 8.02698ZM16.2103 19.1969C16.2339 17.4602 15.0279 16.0231 13.514 16.0231C12.0125 16.0231 10.8181 17.4476 10.8181 19.1969C10.8181 20.9459 12.0361 22.3704 13.514 22.3704C15.0159 22.3704 16.2103 20.9459 16.2103 19.1969ZM26.1785 19.1969C26.2021 17.4602 24.9961 16.0231 23.4826 16.0231C21.9807 16.0231 20.7864 17.4476 20.7864 19.1969C20.7864 20.9459 22.0044 22.3704 23.4826 22.3704C24.9961 22.3704 26.1785 20.9459 26.1785 19.1969Z',
          fill: 'currentColor',
        },
        null,
        3,
        null
      ),
      3,
      null
    ),
    [se.GITHUB]: l(
      'svg',
      null,
      {
        fill: 'none',
        height: '100%',
        viewBox: '0 0 37 36',
        width: '100%',
        xmlns: 'http://www.w3.org/2000/svg',
      },
      [
        l(
          'path',
          null,
          {
            d: 'M18.4893 3C10.2061 3 3.48926 9.54134 3.48926 17.6107C3.48926 24.0662 7.78722 29.5429 13.7472 31.4749C14.4969 31.6101 14.7722 31.1579 14.7722 30.772C14.7722 30.4237 14.7582 29.2726 14.7518 28.0518C10.5787 28.9356 9.6981 26.3279 9.6981 26.3279C9.01577 24.6391 8.03263 24.1901 8.03263 24.1901C6.67173 23.2832 8.13521 23.3018 8.13521 23.3018C9.64151 23.4049 10.4347 24.8075 10.4347 24.8075C11.7725 27.0412 13.9437 26.3954 14.7997 26.0222C14.9343 25.0777 15.3231 24.4333 15.752 24.0684C12.4204 23.6989 8.91789 22.4461 8.91789 16.8477C8.91789 15.2526 9.50387 13.9491 10.4635 12.926C10.3077 12.5579 9.79433 11.0719 10.6088 9.05938C10.6088 9.05938 11.8684 8.66668 14.7349 10.5571C15.9313 10.2332 17.2145 10.071 18.4893 10.0655C19.7641 10.071 21.0483 10.2332 22.2471 10.5571C25.1101 8.66668 26.368 9.05938 26.368 9.05938C27.1844 11.0719 26.6708 12.5579 26.515 12.926C27.4768 13.9491 28.0587 15.2525 28.0587 16.8477C28.0587 22.4594 24.5497 23.6951 21.2096 24.0567C21.7476 24.5102 22.2269 25.3994 22.2269 26.7624C22.2269 28.7173 22.2095 30.2907 22.2095 30.772C22.2095 31.1608 22.4795 31.6164 23.24 31.473C29.1967 29.5388 33.4893 24.0641 33.4893 17.6107C33.4893 9.54134 26.7734 3 18.4893 3Z',
            fill: 'currentColor',
          },
          null,
          3,
          null
        ),
        l(
          'path',
          null,
          {
            d: 'M9.10719 23.8134C9.07425 23.8859 8.95684 23.9077 8.85014 23.8579C8.74132 23.8103 8.68014 23.7113 8.71544 23.6384C8.74779 23.5637 8.8652 23.5428 8.97378 23.593C9.08284 23.6406 9.14495 23.7405 9.10719 23.8134ZM9.84504 24.4546C9.77352 24.5192 9.63364 24.4892 9.5387 24.3871C9.44059 24.2852 9.42224 24.1491 9.49482 24.0835C9.56858 24.0189 9.70423 24.0491 9.80258 24.1511C9.90069 24.2541 9.91987 24.3893 9.84504 24.4546ZM10.3513 25.2751C10.2593 25.3373 10.1089 25.279 10.0161 25.149C9.92422 25.0192 9.92422 24.8633 10.0181 24.8009C10.1113 24.7384 10.2593 24.7946 10.3534 24.9235C10.4451 25.0556 10.4453 25.2114 10.3513 25.2751ZM11.2072 26.2254C11.125 26.3136 10.9499 26.29 10.8217 26.1694C10.6907 26.0516 10.6541 25.8845 10.7365 25.7961C10.8197 25.7076 10.9958 25.7325 11.125 25.852C11.2552 25.9696 11.2949 26.138 11.2072 26.2254ZM12.3135 26.5462C12.2774 26.6606 12.1087 26.7126 11.9389 26.664C11.7692 26.6139 11.6582 26.4799 11.6924 26.3642C11.7277 26.2491 11.8971 26.1949 12.0683 26.2469C12.2377 26.2967 12.3488 26.4298 12.3135 26.5462ZM13.5728 26.6822C13.577 26.8028 13.4329 26.9027 13.2546 26.9049C13.0752 26.9087 12.9301 26.8111 12.9282 26.6927C12.9282 26.571 13.069 26.472 13.2483 26.4691C13.4267 26.4657 13.5728 26.5625 13.5728 26.6822ZM14.8097 26.636C14.8311 26.7536 14.7071 26.8744 14.5301 26.9065C14.3559 26.9374 14.1948 26.8649 14.1725 26.7483C14.1509 26.6278 14.2772 26.5071 14.451 26.4758C14.6284 26.4458 14.7871 26.5165 14.8097 26.636Z',
            fill: 'currentColor',
          },
          null,
          3,
          null
        ),
      ],
      3,
      null
    ),
  },
  Fp = '',
  Op = (e) => (
    W(j(Fp, 's_sOgQv7sgR00')),
    l(
      'div',
      null,
      {
        class: H(
          (t) => `inline-block ${t.class || ''}`,
          [e],
          '`inline-block ${p0.class||""}`'
        ),
        style: H(
          (t) => ({ width: t.size, height: t.size }),
          [e],
          '{width:p0.size,height:p0.size}'
        ),
      },
      Dp[e.name],
      1,
      'RY_0'
    )
  ),
  Ge = R(j(Op, 's_outyRSHf0Tw')),
  Hp = '',
  Up = '.dropdown{min-width:calc(100% + 2px)}',
  tr = 'border-blue-gray-900 border',
  Kl = 'px-4 py-1.5 bg-mf-gray hover:bg-white focus:bg-mf-gray text-lg ',
  Bp = (e) => {
    vt(), W(j(Up, 's_tNYOaCIm0Qc'));
    const t = pe(!1);
    return $(
      $e,
      {
        children: [
          l(
            'div',
            null,
            {
              class: H(
                (n) =>
                  `absolute w-screen h-screen top-0 right-0 bg-transparent ${
                    n.value ? 'visible' : 'invisible'
                  }`,
                [t],
                '`absolute w-screen h-screen top-0 right-0 bg-transparent ${p0.value?"visible":"invisible"}`'
              ),
              onClick$: Re('s_2HCPp1ydyqs', [t]),
            },
            null,
            3,
            null
          ),
          l(
            'button',
            { class: `relative ${tr} ${Kl} ${e.class || ''}` },
            { onClick$: Re('s_MOjpn7epc74', [t]) },
            [
              l(
                'div',
                null,
                { class: 'flex gap-2 items-center ' },
                [
                  l(
                    'div',
                    null,
                    null,
                    H((n) => n.value, [e], 'p0.value'),
                    3,
                    null
                  ),
                  l(
                    'svg',
                    null,
                    {
                      fill: 'none',
                      height: '8',
                      viewBox: '0 0 12 8',
                      width: '12',
                      xmlns: 'http://www.w3.org/2000/svg',
                    },
                    l(
                      'path',
                      null,
                      {
                        'clip-rule': 'evenodd',
                        d: 'M0.410826 0.910826C0.736263 0.585389 1.2639 0.585389 1.58934 0.910826L6.00008 5.32157L10.4108 0.910826C10.7363 0.585389 11.2639 0.585389 11.5893 0.910826C11.9148 1.23626 11.9148 1.7639 11.5893 2.08934L6.58934 7.08934C6.2639 7.41477 5.73626 7.41477 5.41083 7.08934L0.410826 2.08934C0.0853888 1.7639 0.0853888 1.23626 0.410826 0.910826Z',
                        fill: '#1C2135',
                        'fill-rule': 'evenodd',
                      },
                      null,
                      3,
                      null
                    ),
                    3,
                    null
                  ),
                ],
                3,
                null
              ),
              t.value &&
                l(
                  'div',
                  null,
                  {
                    class: `dropdown absolute bottom-[-6px] left-[-1px] translate-y-full p-0 ${tr} z-[60]`,
                  },
                  $(Z, null, 3, 'Vv_0'),
                  1,
                  'Vv_1'
                ),
            ],
            1,
            null
          ),
        ],
      },
      1,
      'Vv_2'
    );
  },
  Wp = R(j(Bp, 's_Pl7vAlduOuo')),
  Qp = (e) =>
    l(
      'button',
      {
        class: `flex w-full ${Kl} border-0 text-left hover:bg-blue-gray-300 ${
          e.selected && 'bg-blue-gray-300'
        }`,
        onClick$: e.onClick$,
      },
      null,
      $(Z, null, 3, 'Vv_3'),
      0,
      'Vv_4'
    ),
  Kp = R(j(Qp, 's_lHJ6l0hcvRg')),
  ns = [
    { name: 'Eng', lang: 'en-US' },
    { name: 'Port', lang: 'pt-BR' },
    { name: '中文', lang: 'zh-CN' },
  ],
  Vp = (e) => {
    const [t] = Ie(),
      n = _s[e],
      s = new URL(location.href);
    t.params.lang
      ? n.lang !== $t.defaultLocale.lang
        ? (s.pathname = s.pathname.replace(t.params.lang, n.lang))
        : (s.pathname = s.pathname.replace(
            new RegExp(`(/${t.params.lang}/)|(/${t.params.lang}$)`),
            '/'
          ))
      : n.lang !== $t.defaultLocale.lang &&
        (s.pathname = `/${n.lang}${s.pathname}`),
      (location.href = s.toString());
  },
  Zp = async () => {
    const [e, t] = Ie();
    return await e(t.lang);
  },
  Yp = (e) => {
    W(j(Hp, 's_K8TT2dajw7I'));
    const t = pe(!1),
      n = pe(!1),
      s = pe(!1),
      o = pe(1),
      r = ta(),
      a = rt(),
      i = ns.find((m) => m.lang === a.locale.lang),
      c = (m) => _t(m, a);
    yc(Re('s_dBzp75i0JUA', [n, s, o]), { strategy: 'document-ready' });
    const u = j(Vp, 's_EQll1XU2k6A', [r]),
      p = [
        {
          label: x('navbar.menu.documentation@@Documentation'),
          href: '/docs/en/mf-docs/0.2/getting-started/',
        },
        {
          label: x('navbar.menu.discover@@Discover'),
          href: c('/#discover'),
          active: n.value,
        },
        { label: x('navbar.menu.showcase@@Showcase'), href: c('showcase') },
        {
          label: x('navbar.menu.enterprise@@Enterprise'),
          href: c('/#contact'),
          active: s.value,
        },
        {
          label: x('navbar.menu.medusa@@Medusa'),
          href: 'https://app.medusa.codes/',
          target: '_blank',
        },
      ],
      f = o.value === 0 ? e.theme || I.NONE : I.GRAY;
    return l(
      'div',
      null,
      null,
      l(
        'div',
        null,
        { class: 'fixed w-full top-0 z-[999]' },
        [
          $(
            Wn,
            {
              get pattern() {
                return o.value === 0;
              },
              children: l(
                'nav',
                null,
                {
                  class:
                    'max-w-7xl mx-auto flex flex-row-reverse xl:flex-row  items-center justify-between px-4 py-6',
                },
                [
                  l(
                    'a',
                    { href: c('/') },
                    {
                      class:
                        'flex w-full items-center justify-end xl:justify-start',
                    },
                    l(
                      'img',
                      null,
                      {
                        alt: 'Module Federation Logo',
                        class: 'h-10',
                        src: '/module-federation-logo.svg',
                      },
                      null,
                      3,
                      null
                    ),
                    3,
                    null
                  ),
                  l(
                    'ul',
                    null,
                    { class: 'hidden xl:flex w-full justify-center gap-8' },
                    p.map((m) =>
                      l(
                        'li',
                        null,
                        null,
                        $(
                          U,
                          {
                            get href() {
                              return m.href;
                            },
                            get target() {
                              return m.target;
                            },
                            type: 'link',
                            get theme() {
                              return P.NAV;
                            },
                            active: m.active || e.activeHref === m.href || !1,
                            children: M(m, 'label'),
                            [d]: {
                              href: V(m, 'href'),
                              target: V(m, 'target'),
                              theme: d,
                              type: d,
                            },
                          },
                          1,
                          'Xn_0'
                        ),
                        1,
                        m.label
                      )
                    ),
                    1,
                    null
                  ),
                  l(
                    'ul',
                    null,
                    {
                      class:
                        'hidden xl:flex w-full justify-end items-center gap-5',
                    },
                    [
                      l(
                        'li',
                        null,
                        { class: 'flex' },
                        $(
                          U,
                          {
                            href: 'https://github.com/module-federation',
                            target: '_blank',
                            type: 'link',
                            get theme() {
                              return P.NAKED_ALT;
                            },
                            children: $(
                              Ge,
                              {
                                get name() {
                                  return se.GITHUB;
                                },
                                size: '36px',
                                [d]: { name: d, size: d },
                              },
                              3,
                              'Xn_1'
                            ),
                            [d]: { href: d, target: d, theme: d, type: d },
                          },
                          1,
                          'Xn_2'
                        ),
                        1,
                        null
                      ),
                      l(
                        'li',
                        null,
                        { class: 'flex' },
                        $(
                          U,
                          {
                            href: 'https://discord.gg/T8c6yAxkbv',
                            target: '_blank',
                            type: 'link',
                            get theme() {
                              return P.NAKED_ALT;
                            },
                            children: $(
                              Ge,
                              {
                                get name() {
                                  return se.DISCORD;
                                },
                                size: '36px',
                                [d]: { name: d, size: d },
                              },
                              3,
                              'Xn_3'
                            ),
                            [d]: { href: d, target: d, theme: d, type: d },
                          },
                          1,
                          'Xn_4'
                        ),
                        1,
                        null
                      ),
                      l(
                        'li',
                        null,
                        null,
                        $(
                          Wp,
                          {
                            children: ns.map((m) =>
                              $(
                                Kp,
                                {
                                  children: M(m, 'name'),
                                  onClick$: j(Zp, 's_HSLHKDE0Tc8', [u, m]),
                                  selected: a.locale.lang === m.lang,
                                },
                                1,
                                m.lang
                              )
                            ),
                            name: 'language',
                            value: i == null ? void 0 : i.name,
                            [d]: { name: d },
                          },
                          1,
                          'Xn_5'
                        ),
                        1,
                        null
                      ),
                    ],
                    1,
                    null
                  ),
                  l(
                    'div',
                    null,
                    { class: 'flex xl:hidden relative' },
                    l(
                      'button',
                      null,
                      { onClick$: Re('s_Qj09dIbebQs', [t]) },
                      [
                        l(
                          'span',
                          null,
                          {
                            class: H(
                              (m) =>
                                `relative my-1.5 block h-0.5 w-[30px] bg-blue-gray-900 transition-all duration-300  ${
                                  m.value ? ' top-[7px] rotate-45' : ' '
                                }`,
                              [t],
                              '`relative my-1.5 block h-0.5 w-[30px] bg-blue-gray-900 transition-all duration-300  ${p0.value?" top-[7px] rotate-45":" "}`'
                            ),
                          },
                          null,
                          3,
                          null
                        ),
                        l(
                          'span',
                          null,
                          {
                            class: H(
                              (m) =>
                                `relative my-1.5 block h-0.5 w-[30px] bg-blue-gray-900 transition-all duration-300  ${
                                  m.value ? 'opacity-0 ' : ' '
                                }`,
                              [t],
                              '`relative my-1.5 block h-0.5 w-[30px] bg-blue-gray-900 transition-all duration-300  ${p0.value?"opacity-0 ":" "}`'
                            ),
                          },
                          null,
                          3,
                          null
                        ),
                        l(
                          'span',
                          null,
                          {
                            class: H(
                              (m) =>
                                `relative my-1.5 block h-0.5 w-[30px] bg-blue-gray-900 transition-all duration-300 ${
                                  m.value ? ' top-[-8px] -rotate-45' : ' '
                                }`,
                              [t],
                              '`relative my-1.5 block h-0.5 w-[30px] bg-blue-gray-900 transition-all duration-300 ${p0.value?" top-[-8px] -rotate-45":" "}`'
                            ),
                          },
                          null,
                          3,
                          null
                        ),
                      ],
                      3,
                      null
                    ),
                    3,
                    null
                  ),
                ],
                1,
                null
              ),
              fullWidth: !0,
              theme: f,
              [d]: {
                fullWidth: d,
                pattern: H((m) => m.value === 0, [o], 'p0.value===0'),
              },
            },
            1,
            'Xn_6'
          ),
          l(
            'div',
            null,
            {
              class: H(
                (m) =>
                  `absolute w-screen z-50 h-screen top-0 right-0 bg-transparent ${
                    m.value ? 'visible' : 'invisible'
                  }`,
                [t],
                '`absolute w-screen z-50 h-screen top-0 right-0 bg-transparent ${p0.value?"visible":"invisible"}`'
              ),
              onClick$: Re('s_LQcmHAxuFaU', [t]),
            },
            null,
            3,
            null
          ),
          l(
            'div',
            {
              class: `navbar bg-mf-gray inline-block xl:hidden absolute left-0 px-4 top-[88px] w-full h-screen z-[60] transition-opacity duration-300 ${
                t.value ? 'visible opacity-100' : 'invisible opacity-0'
              }`,
            },
            null,
            l(
              'ul',
              null,
              { class: 'flex flex-col gap-8' },
              [
                p.map((m) =>
                  l(
                    'li',
                    null,
                    null,
                    $(
                      U,
                      {
                        get href() {
                          return m.href;
                        },
                        type: 'link',
                        get theme() {
                          return P.NAKED_ALT;
                        },
                        get active() {
                          return m.active;
                        },
                        children: M(m, 'label'),
                        [d]: {
                          active: V(m, 'active'),
                          href: V(m, 'href'),
                          theme: d,
                          type: d,
                        },
                      },
                      1,
                      'Xn_7'
                    ),
                    1,
                    m.label
                  )
                ),
                l(
                  'li',
                  null,
                  { class: 'flex gap-8' },
                  [
                    $(
                      U,
                      {
                        href: 'https://github.com/module-federation',
                        target: '_blank',
                        type: 'link',
                        get theme() {
                          return P.NAKED_ALT;
                        },
                        children: $(
                          Ge,
                          {
                            get name() {
                              return se.GITHUB;
                            },
                            size: '36px',
                            [d]: { name: d, size: d },
                          },
                          3,
                          'Xn_8'
                        ),
                        [d]: { href: d, target: d, theme: d, type: d },
                      },
                      1,
                      'Xn_9'
                    ),
                    $(
                      U,
                      {
                        href: 'https://discord.gg/T8c6yAxkbv',
                        target: '_blank',
                        type: 'link',
                        get theme() {
                          return P.NAKED_ALT;
                        },
                        children: $(
                          Ge,
                          {
                            get name() {
                              return se.DISCORD;
                            },
                            size: '36px',
                            [d]: { name: d, size: d },
                          },
                          3,
                          'Xn_10'
                        ),
                        [d]: { href: d, target: d, theme: d, type: d },
                      },
                      1,
                      'Xn_11'
                    ),
                  ],
                  1,
                  null
                ),
                l(
                  'li',
                  null,
                  null,
                  l(
                    'select',
                    null,
                    {
                      class:
                        'border-blue-gray-900 w-1/2 px-4 py-1.5 pr-8 bg-mf-gray hover:bg-white focus:bg-mf-gray text-lg focus:border-ui-blue',
                      id: 'language',
                      name: 'language',
                      onChange$: Re('s_YWAZ5f0lJEw', [u]),
                    },
                    ns.map((m) =>
                      l(
                        'option',
                        {
                          selected: a.locale.lang === m.lang,
                          value: M(m, 'lang'),
                        },
                        null,
                        m.name,
                        1,
                        m.lang
                      )
                    ),
                    1,
                    null
                  ),
                  1,
                  null
                ),
              ],
              1,
              null
            ),
            1,
            null
          ),
        ],
        1,
        null
      ),
      1,
      'Xn_12'
    );
  },
  ao = R(j(Yp, 's_e0RDNPJNIGY')),
  Gp = '',
  Xp = (e) => {
    W(j(Gp, 's_g0E4nZcqTc8'));
    const t = rt(),
      n = (o) => _t(o, t),
      s = [
        {
          label: x('footer.menu.examples@@Examples'),
          href: 'https://github.com/module-federation/module-federation-examples',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
        {
          label: x('footer.menu.practical-guide@@Practical guide'),
          href: 'https://module-federation.myshopify.com/products/practical-module-federation',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
        {
          label: x('footer.menu.medusa@@Try Medusa'),
          href: 'https://app.medusa.codes/',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
        {
          label: x('footer.menu.documentation@@Documentation'),
          href: '/docs/en/mf-docs/0.2/getting-started/',
        },
        {
          label: x('footer.menu.sponsor@@Become a sponsor'),
          href: 'https://opencollective.com/module-federation-universe',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
        {
          label: x('footer.menu.privacy-policy@@Privacy Policy'),
          href: n('/privacy-policy'),
        },
      ];
    return $(
      Wn,
      {
        children: l(
          'footer',
          null,
          { class: 'flex flex-col items-center py-28 gap-10' },
          [
            l(
              'img',
              null,
              {
                alt: 'Module Federation Logo',
                class: 'h-10',
                src: '/module-federation-logo.svg',
              },
              null,
              3,
              null
            ),
            l(
              'div',
              null,
              {
                class:
                  'flex items-center justify-center flex-wrap gap-y-4 gap-x-10',
              },
              s.map((o) =>
                $(
                  U,
                  {
                    get href() {
                      return o.href;
                    },
                    type: 'link',
                    get theme() {
                      return P.NAKED_ALT;
                    },
                    get rel() {
                      return o.rel;
                    },
                    children: M(o, 'label'),
                    [d]: {
                      href: V(o, 'href'),
                      rel: V(o, 'rel'),
                      theme: d,
                      type: d,
                    },
                  },
                  1,
                  'yk_0'
                )
              ),
              1,
              null
            ),
          ],
          1,
          null
        ),
        theme: e.theme || I.PINK,
      },
      1,
      'yk_1'
    );
  },
  io = R(j(Xp, 's_2fkm5zc0rek')),
  Vl = [
    { label: 'Privacy policy', href: '#privacy-policy', bold: !0 },
    { label: 'Definitions', href: '#definitions' },
    {
      label: 'Information collection and use',
      href: '#information-collection-and-use',
    },
    { label: 'Types of data collected', href: '#types-of-data-collected' },
    { label: 'Use of data', href: '#use-of-data' },
    {
      label:
        'Legal Basis for Processing Personal Data under the General Data Protection Regulation (GDPR)',
      href: '#legal-bassis-GDPR',
    },
    { label: 'Retention of data', href: '#retention-of-data' },
    { label: 'Transfer of data', href: '#transfer-of-data' },
    { label: 'Disclosure of data', href: '#disclosure-of-data' },
    { label: 'Security of data', href: '#disclosure-of-data' },
    {
      label:
        'Our Policy on "Do Not Track" Signals under the California Online Protection Act (CalOPPA)',
      href: '#do-not-track-CalOPPA',
    },
    {
      label:
        'Your Data Protection Rights under the General Data Protection Regulation (GDPR)',
      href: '#data-protection-regulation-GDPR',
    },
    { label: 'Service providers', href: '#service-providers' },
    { label: 'Links to other sites', href: '#links-to-other-sites' },
    { label: "Children's privacy", href: '#childrens-privacy' },
    {
      label: 'Changes to this privacy policy',
      href: '#changes-to-privacy-policy',
    },
    { label: 'Contact us', href: '#contact-us' },
  ],
  Jp = () =>
    $(
      $e,
      {
        children: [
          $(
            ao,
            {
              get theme() {
                return I.NONE;
              },
              [d]: { theme: d },
            },
            3,
            'mb_0'
          ),
          l(
            'div',
            null,
            { class: 'block  h-[80px] md:h-[20px] z-[999]' },
            null,
            3,
            null
          ),
          $(
            ie,
            {
              get padding() {
                return de.TOP;
              },
              get theme() {
                return I.NONE;
              },
              children: l(
                'div',
                null,
                { class: 'flex gap-12' },
                [
                  l(
                    'ul',
                    null,
                    { class: 'hidden md:flex flex-col w-1/3 gap-6' },
                    Vl.map((e) =>
                      l(
                        'li',
                        null,
                        null,
                        $(
                          U,
                          {
                            get href() {
                              return e.href;
                            },
                            align: 'left',
                            type: 'link',
                            get theme() {
                              return P.SUB_NAV;
                            },
                            get bold() {
                              return e.bold;
                            },
                            children: M(e, 'label'),
                            [d]: {
                              align: d,
                              bold: V(e, 'bold'),
                              href: V(e, 'href'),
                              theme: d,
                              type: d,
                            },
                          },
                          1,
                          'mb_1'
                        ),
                        1,
                        'mb_2'
                      )
                    ),
                    1,
                    null
                  ),
                  l(
                    'div',
                    null,
                    { class: 'w-full article' },
                    [
                      l(
                        'h2',
                        null,
                        { id: 'privacy-policy' },
                        'Privacy policy',
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        [
                          l('strong', null, null, 'Valor Labs Inc.', 3, null),
                          ' ("us", "we", or "our") operates the',
                          ' ',
                          l(
                            'a',
                            null,
                            { href: 'https://modulefederation.com' },
                            'www.modulefederation.com',
                            3,
                            null
                          ),
                          ' ',
                          'website (here referred to as the "Site").',
                        ],
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        [
                          'This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data. We use your data to provide and improve the Site. By using the Site, you agree to the collection and use of information in accordance with this policy. Unless otherwise defined in this Privacy policy, the terms used in this Privacy policy have the same meanings as in our Terms and Conditions, accessible from',
                          ' ',
                          l(
                            'a',
                            null,
                            { href: 'https://modulefederation.com' },
                            'www.modulefederation.com',
                            3,
                            null
                          ),
                          '.',
                        ],
                        3,
                        null
                      ),
                      l(
                        'h2',
                        null,
                        { id: 'definitions' },
                        'Definitions',
                        3,
                        null
                      ),
                      l(
                        'ul',
                        null,
                        null,
                        [
                          l(
                            'li',
                            null,
                            null,
                            [
                              'Site: is the',
                              ' ',
                              l(
                                'a',
                                null,
                                { href: 'https://modulefederation.com' },
                                'www.modulefederation.com',
                                3,
                                null
                              ),
                              ' ',
                              'website operated by',
                              l('strong', null, null, ' ', 3, null),
                              'Valor Labs Inc.',
                            ],
                            3,
                            null
                          ),
                          l(
                            'li',
                            null,
                            null,
                            'Personal Data: means data about a living individual who can be identified from that data (or from those and other information either in our possession or likely to come into our possession).',
                            3,
                            null
                          ),
                          l(
                            'li',
                            null,
                            null,
                            'Usage Data: is data collected automatically either generated by the Use of the Site.',
                            3,
                            null
                          ),
                          l(
                            'li',
                            null,
                            null,
                            'Cookies: are small files stored on your device (computer or mobile device).',
                            3,
                            null
                          ),
                          l(
                            'li',
                            null,
                            null,
                            'Data Controller: means the natural or legal person who (either alone or jointly, or commonly with other persons) determines the purposes for which and the manner in which any personal information is, or is to be, processed.',
                            3,
                            null
                          ),
                          l(
                            'ul',
                            null,
                            null,
                            l(
                              'li',
                              null,
                              null,
                              'For the purpose of this Privacy policy, we are a Data Controller of your Personal Data.',
                              3,
                              null
                            ),
                            3,
                            null
                          ),
                          l(
                            'li',
                            null,
                            null,
                            'Data Processor (or Service Provider) means any natural or legal person who processes the data on behalf of the Data Controller.',
                            3,
                            null
                          ),
                          l(
                            'ul',
                            null,
                            null,
                            l(
                              'li',
                              null,
                              null,
                              'We may use the services of various Service Providers in order to process your data more effectively.',
                              3,
                              null
                            ),
                            3,
                            null
                          ),
                          l(
                            'li',
                            null,
                            null,
                            'Data Subject: is any living individual using our Site and is the subject of Personal Data.',
                            3,
                            null
                          ),
                        ],
                        3,
                        null
                      ),
                      l(
                        'h2',
                        null,
                        { id: 'information-collection-and-use' },
                        'Information collection and use',
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        'We collect several different types of information for various purposes to provide and improve our Site for you.',
                        3,
                        null
                      ),
                      l(
                        'h2',
                        null,
                        { id: 'types-of-data-collected' },
                        'Types of data collected',
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        l('strong', null, null, 'Personal Data', 3, null),
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        'While using the Site, we may ask you to provide us with certain personally identifiable information used to contact or identify you ("Personal Data"). Personally identifiable information may include, but is not limited to:',
                        3,
                        null
                      ),
                      l(
                        'ul',
                        null,
                        null,
                        [
                          l('li', null, null, 'Email address', 3, null),
                          l(
                            'li',
                            null,
                            null,
                            'First name and last name',
                            3,
                            null
                          ),
                          l(
                            'li',
                            null,
                            null,
                            'Cookies and Usage Data',
                            3,
                            null
                          ),
                        ],
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        'We may use your Personal Data to contact you with newsletters, marketing or promotional materials, and other information that may serve you. You may opt out of receiving any or all of these communications by following the unsubscribe link or instructions in any email we send.',
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        l('strong', null, null, 'Usage Data', 3, null),
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        `We may also collect information on how the Site is accessed and used ("Usage Data"). This Usage Data may include information such as your computer's Internet Protocol address (e.g., IP address), browser type, browser version, the pages of our Site that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.`,
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        l(
                          'strong',
                          null,
                          null,
                          'Tracking & Cookies Data',
                          3,
                          null
                        ),
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        'We use cookies and similar tracking technologies to track the activity on our Site and hold certain information.Cookies are files with a small amount of data which may include a unique anonymous identifier. Cookies are sent to your browser from a website and stored on your device. Other tracking technologies are also used, such as beacons, tags, and scripts for collecting and tracking information and to improve and analyze our Site.',
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        'You can instruct your browser to refuse all cookies or to indicate when a cookie is sent. However, if you do not accept cookies, you may not be able to use some portions of our Site. Examples of Cookies we use:',
                        3,
                        null
                      ),
                      l(
                        'ul',
                        null,
                        null,
                        [
                          l(
                            'li',
                            null,
                            null,
                            'Session Cookies. We use Session Cookies to operate our Site.',
                            3,
                            null
                          ),
                          l(
                            'li',
                            null,
                            null,
                            'Preference Cookies. We use Preference Cookies to remember your preferences and various settings.',
                            3,
                            null
                          ),
                          l(
                            'li',
                            null,
                            null,
                            'Security Cookies. We use Security Cookies for security purposes.',
                            3,
                            null
                          ),
                        ],
                        3,
                        null
                      ),
                      l(
                        'h2',
                        null,
                        { id: 'use-of-data' },
                        'Use of data',
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        'Valor Labs Inc. uses the collected data for various purposes:',
                        3,
                        null
                      ),
                      l(
                        'ul',
                        null,
                        null,
                        [
                          l(
                            'li',
                            null,
                            null,
                            'To provide and maintain our Site',
                            3,
                            null
                          ),
                          l(
                            'li',
                            null,
                            null,
                            'To allow you to participate in interactive features of our Site when you choose to do so',
                            3,
                            null
                          ),
                          l(
                            'li',
                            null,
                            null,
                            'To provide customer support',
                            3,
                            null
                          ),
                          l(
                            'li',
                            null,
                            null,
                            'To gather analysis or valuable information so that we can improve our Site',
                            3,
                            null
                          ),
                          l(
                            'li',
                            null,
                            null,
                            'To monitor the usage of our Site',
                            3,
                            null
                          ),
                          l(
                            'li',
                            null,
                            null,
                            'To detect, prevent and address technical issues',
                            3,
                            null
                          ),
                          l(
                            'li',
                            null,
                            null,
                            'To provide invoices or receipts of approved transactions',
                            3,
                            null
                          ),
                          l(
                            'li',
                            null,
                            null,
                            'To provide you with news, special offers, and general information about other goods, services, and events which we offer that are similar to those that you have already purchased or enquired about unless you have opted not to receive such information',
                            3,
                            null
                          ),
                        ],
                        3,
                        null
                      ),
                      l(
                        'h2',
                        null,
                        { id: 'legal-bassis-GDPR' },
                        'Legal basis for processing personal data under the General Data Protection Regulation (GDPR)',
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        "If you are from the European Economic Area (EEA), Valor Labs Inc.'s legal basis for collecting and using the personal information described in this Privacy policy depends on the Personal Data we collect and the specific context in which we collect it. Valor Labs Inc. may process your Personal Data because:",
                        3,
                        null
                      ),
                      l(
                        'ul',
                        null,
                        null,
                        [
                          l(
                            'li',
                            null,
                            null,
                            'We need to perform a contract with you',
                            3,
                            null
                          ),
                          l(
                            'li',
                            null,
                            null,
                            'You have permitted us to do so',
                            3,
                            null
                          ),
                          l(
                            'li',
                            null,
                            null,
                            'The processing is in our legitimate interests and is not overridden by your rights',
                            3,
                            null
                          ),
                          l(
                            'li',
                            null,
                            null,
                            'For payment processing purposes',
                            3,
                            null
                          ),
                          l(
                            'li',
                            null,
                            null,
                            'To comply with the law',
                            3,
                            null
                          ),
                        ],
                        3,
                        null
                      ),
                      l(
                        'h2',
                        null,
                        { id: 'retention-of-data' },
                        'Retention of data',
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        [
                          'Valor Labs Inc.',
                          l('strong', null, null, ' ', 3, null),
                          'will retain your Personal Data only for as long as is necessary for the purposes set out in this Privacy policy. We will retain and use your Personal Data to the extent necessary to comply with our legal obligations (for example, if we are required to retain your data to comply with applicable laws), resolve disputes, and enforce our legal agreements and policies.',
                        ],
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        'Valor Labs Inc. will also retain Usage Data for internal analysis purposes. Usage Data remains for a shorter period of time except when this data is used for strengthening the security or improving the functionality of our Site, or we are legally obligated to retain this data for longer.',
                        3,
                        null
                      ),
                      l(
                        'h2',
                        null,
                        { id: 'transfer-of-data' },
                        'Transfer of data',
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        'Your information, including Personal Data, may be transferred to — and maintained on — computers located outside your state, province, country, or other governmental jurisdiction where the data protection laws may differ from those of your jurisdiction.',
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        'If you are located outside the United States and choose to provide information to us, please note that we transfer the data, including Personal Data, to the United States and process it there. Your consent to this Privacy policy, followed by your submission of such information, represents your agreement to that transfer.',
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        [
                          'Valor Labs Inc.',
                          l('strong', null, null, ' ', 3, null),
                          'will take all the steps reasonably necessary to ensure that your data is treated securely and in accordance with this Privacy policy, and no transfer of your Personal Data will take place to an organization or a country unless there are adequate controls in place including the security of your data and other personal information.',
                        ],
                        3,
                        null
                      ),
                      l(
                        'h2',
                        null,
                        { id: 'disclosure-of-data' },
                        'Disclosure of data',
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        l(
                          'strong',
                          null,
                          null,
                          'Business Transaction',
                          3,
                          null
                        ),
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        'If Valor Labs Inc. is involved in a merger, acquisition, or asset sale, your Personal Data may be transferred. We will provide notice before your Personal Data is transferred and becomes subject to a different Privacy Policy.',
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        l(
                          'strong',
                          null,
                          null,
                          'Disclosure for Law Enforcement',
                          3,
                          null
                        ),
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        'Under certain circumstances, Valor Labs Inc. may be required to disclose your Personal Data. In cases when required to do so by law or in response to valid requests by public authorities (e.g., a court or a government agency).',
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        l('strong', null, null, 'Legal Requirements', 3, null),
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        'Valor Labs Inc. may disclose your Personal Data in the good faith belief that such action is necessary to:',
                        3,
                        null
                      ),
                      l(
                        'ul',
                        null,
                        null,
                        [
                          l(
                            'li',
                            null,
                            null,
                            'To comply with a legal obligation',
                            3,
                            null
                          ),
                          l(
                            'li',
                            null,
                            null,
                            'To protect and defend the rights or property of Valor Labs Inc.',
                            3,
                            null
                          ),
                          l(
                            'li',
                            null,
                            null,
                            'To prevent or investigate possible wrongdoing in connection with the Site',
                            3,
                            null
                          ),
                          l(
                            'li',
                            null,
                            null,
                            'To protect the personal safety of users of the Site or the public',
                            3,
                            null
                          ),
                          l(
                            'li',
                            null,
                            null,
                            'To protect against legal liability',
                            3,
                            null
                          ),
                        ],
                        3,
                        null
                      ),
                      l(
                        'h2',
                        null,
                        { id: 'disclosure-of-data' },
                        'Security of data',
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        'The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.',
                        3,
                        null
                      ),
                      l(
                        'h2',
                        null,
                        { id: 'do-not-track-CalOPPA' },
                        'Our policy on "Do Not Track" signals under the California Online Protection Act (CalOPPA)',
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        'We do not support Do Not Track ("DNT"). Do Not Track is a preference you can set in your web browser to inform websites that you do not want to be tracked. You can enable or disable Do Not Track by visiting the Preferences or Settings page of your web browser.',
                        3,
                        null
                      ),
                      l(
                        'h2',
                        null,
                        { id: 'data-protection-regulation-GDPR' },
                        'Your data protection rights under the General Data Protection Regulation (GDPR)',
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        'If you are a resident of the European Economic Area (EEA), you have certain data protection rights. Valor Labs Inc. aims to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data.If you wish to be informed about what Personal Data we hold about you and if you want it to be removed from our systems, please contact us.In certain circumstances, you have the following data protection rights:',
                        3,
                        null
                      ),
                      l(
                        'ul',
                        null,
                        null,
                        [
                          l(
                            'li',
                            null,
                            null,
                            'The right to access, update or delete the information we have on you. Whenever made possible, you can access, update, or request the deletion of your Personal Data directly within your account settings section. If you are unable to perform these actions yourself, please contact us to assist you.',
                            3,
                            null
                          ),
                          l(
                            'li',
                            null,
                            null,
                            'The right of rectification. You have the right to have your information rectified if that information needs to be more accurate or complete.',
                            3,
                            null
                          ),
                          l(
                            'li',
                            null,
                            null,
                            'The right to object. You have the right to object to our processing of your Personal Data.',
                            3,
                            null
                          ),
                          l(
                            'li',
                            null,
                            null,
                            'The right of restriction. You have the right to request that we restrict the processing of your personal information.',
                            3,
                            null
                          ),
                          l(
                            'li',
                            null,
                            null,
                            'The right to data portability. You have the right to be provided with a copy of the information we have on you in a structured, machine-readable, and commonly used format.',
                            3,
                            null
                          ),
                          l(
                            'li',
                            null,
                            null,
                            'The right to withdraw consent. You also have the right to withdraw your consent at any time, when Valor Labs Inc. relies on your consent to process your personal information.',
                            3,
                            null
                          ),
                        ],
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        'Please note that we may ask you to verify your identity before responding to such requests.You have the right to complain to a Data Protection Authority about our collection and use of your Personal Data. For more information, please contact your local data protection authority in the European Economic Area (EEA).',
                        3,
                        null
                      ),
                      l(
                        'h2',
                        null,
                        { id: 'service-providers' },
                        'Service providers',
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        l(
                          'strong',
                          null,
                          null,
                          'Business Transaction',
                          3,
                          null
                        ),
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        'We may employ third-party companies and individuals to facilitate our Service ("Service Providers"), provide the Service on our behalf, perform Service-related services, or assist us in analyzing how our Service is used.These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.',
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        l('strong', null, null, 'Analytics', 3, null),
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        'We may use third-party Service Providers to monitor and analyze the use of our Service:',
                        3,
                        null
                      ),
                      l(
                        'ul',
                        null,
                        null,
                        [
                          l('li', null, null, 'Google Analytics', 3, null),
                          l(
                            'li',
                            null,
                            null,
                            'Google Analytics is a web analytics service offered by Google that tracks and reports website traffic. Google uses the data collected to track and monitor the use of our Service. This data is shared with other Google services. Google may use the collected data to contextualize and personalize the ads of its advertising network.',
                            3,
                            null
                          ),
                          l(
                            'li',
                            null,
                            null,
                            'You can opt out of having made your activity on the Service available to Google Analytics by installing the Google Analytics opt-out browser add-on. The add-on prevents the Google Analytics JavaScript (ga.js, analytics.js, and dc.js) from sharing information with Google Analytics about visits activity.',
                            3,
                            null
                          ),
                          l(
                            'li',
                            null,
                            null,
                            [
                              'For more information on the privacy practices of Google, please visit the Google Privacy & Terms web',
                              ' ',
                              l(
                                'a',
                                null,
                                {
                                  href: 'https://policies.google.com/privacy?hl=en',
                                  rel: 'noopener',
                                  target: '_blank',
                                },
                                'page:https://policies.google.com/privacy?hl=en',
                                3,
                                null
                              ),
                            ],
                            3,
                            null
                          ),
                        ],
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        l('strong', null, null, 'Payments', 3, null),
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        'We may provide paid products and/or services within the Service. We use third-party services for payment processing (e.g. payment processors).We will not store or collect your payment card details. That information is provided directly to our third-party payment processors whose use of your personal information is governed by their Privacy policy. These payment processors adhere to the standards set by PCI-DSS as managed by the PCI Security Standards Council, which is a joint effort of brands like Visa, MasterCard, American Express, and Discover. PCI-DSS requirements help ensure the secure handling of payment information.The payment processors we work with are:',
                        3,
                        null
                      ),
                      l(
                        'ul',
                        null,
                        null,
                        [
                          l('li', null, null, 'Stripe', 3, null),
                          l(
                            'li',
                            null,
                            null,
                            [
                              'Their Privacy policy can be viewed at',
                              ' ',
                              l(
                                'a',
                                null,
                                {
                                  href: 'https://stripe.com/us/privacy',
                                  rel: 'noopener',
                                  target: '_blank',
                                },
                                'https://stripe.com/us/privacy',
                                3,
                                null
                              ),
                            ],
                            3,
                            null
                          ),
                        ],
                        3,
                        null
                      ),
                      l(
                        'h2',
                        null,
                        { id: 'links-to-other-sites' },
                        'Links to other sites',
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        "Our Service may contain links to other sites that we do not operate. If you click a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy policy of every site you visit.We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.",
                        3,
                        null
                      ),
                      l(
                        'h2',
                        null,
                        { id: 'childrens-privacy' },
                        "Children's privacy",
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        'Our Site does not address anyone under the age of 18 ("Children").We do not knowingly collect personally identifiable information from anyone under the age of 18. If you are a parent or guardian and you are aware that your Child has provided us with Personal Data, please contact us. If we become aware that we have collected Personal Data from children without verification of parental consent, we take steps to remove that information from our servers.',
                        3,
                        null
                      ),
                      l(
                        'h2',
                        null,
                        { id: 'changes-to-privacy-policy' },
                        'Changes to this privacy policy',
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        'We may update our Privacy policy from time to time. You are advised to review this Privacy policy periodically for any changes. Changes to this Privacy policy are effective when they are posted on this page.',
                        3,
                        null
                      ),
                      l(
                        'h2',
                        null,
                        { id: 'contact-us' },
                        'Contact us',
                        3,
                        null
                      ),
                      l(
                        'p',
                        null,
                        null,
                        'If you have any questions about this Privacy policy, please contact us:',
                        3,
                        null
                      ),
                      l(
                        'ul',
                        null,
                        null,
                        l(
                          'li',
                          null,
                          null,
                          [
                            'By email:',
                            ' ',
                            l(
                              'a',
                              null,
                              {
                                href: 'mailto:module-federation@valor-software.com',
                              },
                              'module-federation@valor-software.com',
                              3,
                              null
                            ),
                          ],
                          3,
                          null
                        ),
                        3,
                        null
                      ),
                    ],
                    3,
                    null
                  ),
                ],
                1,
                null
              ),
              [d]: { padding: d, theme: d },
            },
            1,
            'mb_3'
          ),
          $(
            io,
            {
              get theme() {
                return I.NONE;
              },
              [d]: { theme: d },
            },
            3,
            'mb_4'
          ),
        ],
      },
      1,
      'mb_5'
    ),
  em = R(j(Jp, 's_CQ1t0RXar34')),
  tm = {
    title: 'app.title',
    meta: [
      { name: 'description', content: 'app.meta.description' },
      { property: 'og:image', content: '/default-og.png' },
    ],
  },
  nm = Object.freeze(
    Object.defineProperty(
      { __proto__: null, default: em, head: tm, nav: Vl },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  ),
  Zl = [
    [
      {
        name: 'Lululemon Athletica',
        previewSrc: '/showcase/lululemon.png',
        url: 'shop.lululemon.com',
      },
    ],
    [
      {
        name: 'Business Insider',
        previewSrc: '/showcase/business_insider.png',
        url: 'businessinsider.com',
      },
      { name: 'TikTok', previewSrc: '/showcase/tiktok.png', url: 'tiktok.com' },
    ],
    [
      {
        name: 'BestBuy',
        previewSrc: '/showcase/bestbuy.png',
        url: 'bestbuy.com',
      },
      { name: 'Adidas', previewSrc: '/showcase/adidas.png', url: 'adidas.com' },
      {
        name: 'Shopify Partners',
        previewSrc: '/showcase/shopify_partners.png',
        url: 'shopify.com/partners',
      },
      {
        name: 'Epic Games',
        previewSrc: '/showcase/epic_games.png',
        url: 'store.epicgames.com',
      },
      {
        name: 'PandaDoc',
        previewSrc: '/showcase/panda_doc.png',
        url: 'app.pandadoc.com/login',
      },
      {
        name: 'ZoomInfo',
        previewSrc: '/showcase/zoominfo.png',
        url: 'zoominfo.com',
      },
    ],
  ],
  sm = () => {
    const e = rt(),
      t = (o) => _t(o, e),
      n = x('showcase-page.title@@Showcase'),
      s = x(
        'showcase-page.subtitle@@Meet leading companies embracing Module Federation for their web development needs.'
      );
    return $(
      $e,
      {
        children: [
          $(
            ao,
            {
              get theme() {
                return I.NONE;
              },
              activeHref: t('showcase'),
              [d]: { theme: d },
            },
            3,
            'iG_0'
          ),
          l(
            'div',
            null,
            { class: 'block  h-[80px] md:h-[20px] z-[999]' },
            null,
            3,
            null
          ),
          $(
            ie,
            {
              get padding() {
                return de.TOP;
              },
              get theme() {
                return I.NONE;
              },
              children: [
                $(
                  xt,
                  {
                    'q:slot': 'header',
                    subtitle: s,
                    title: n,
                    [d]: { 'q:slot': d },
                  },
                  3,
                  'iG_1'
                ),
                l(
                  'div',
                  null,
                  { class: 'flex flex-col items-center gap-y-10' },
                  [
                    l(
                      'div',
                      null,
                      { class: 'flex flex-col items-center gap-y-8' },
                      Zl.map((o, r) =>
                        l(
                          'div',
                          {
                            class: `w-full grid gap-x-2 gap-y-4 grid-cols-1 ${
                              r > 1 && 'md:grid-cols-3'
                            }  ${r === 1 && 'md:grid-cols-2'} `,
                          },
                          null,
                          o.map((a) =>
                            l(
                              'div',
                              null,
                              { class: 'relative' },
                              [
                                l(
                                  'img',
                                  {
                                    alt: M(a, 'name'),
                                    src: M(a, 'previewSrc'),
                                  },
                                  {
                                    class:
                                      'border border-blue-gray-400 border bg-white w-full aspect-[97/66] transition-shadow hover:shadow-card',
                                  },
                                  null,
                                  3,
                                  null
                                ),
                                l(
                                  'div',
                                  null,
                                  {
                                    class:
                                      'absolute block w-full bottom-0 left-0',
                                  },
                                  [
                                    l(
                                      'div',
                                      null,
                                      {
                                        class:
                                          'block absolute top-0 left-0 w-full h-full bg-blue-gray-900 opacity-70 z-10',
                                      },
                                      null,
                                      3,
                                      null
                                    ),
                                    l(
                                      'div',
                                      null,
                                      {
                                        class:
                                          'flex relative flex-col p-4 z-20',
                                      },
                                      [
                                        l(
                                          'h2',
                                          null,
                                          {
                                            class:
                                              'text-2xl font-semibold text-white',
                                          },
                                          M(a, 'name'),
                                          1,
                                          null
                                        ),
                                        l(
                                          'a',
                                          { href: `https://${a.url}` },
                                          {
                                            class:
                                              'text-xl text-ui-blue font-semibold',
                                          },
                                          M(a, 'url'),
                                          1,
                                          null
                                        ),
                                      ],
                                      1,
                                      null
                                    ),
                                  ],
                                  1,
                                  null
                                ),
                              ],
                              1,
                              'iG_2'
                            )
                          ),
                          1,
                          'iG_3'
                        )
                      ),
                      1,
                      null
                    ),
                    $(
                      U,
                      {
                        class: 'w-full md:w-auto',
                        get theme() {
                          return P.SOLID;
                        },
                        children: x('showcase-page.action@@Become a showcase'),
                        href: 'https://opencollective.com/module-federation-universe',
                        type: 'link',
                        [d]: { class: d, href: d, theme: d, type: d },
                      },
                      1,
                      'iG_4'
                    ),
                  ],
                  1,
                  null
                ),
              ],
              [d]: { padding: d, theme: d },
            },
            1,
            'iG_5'
          ),
          $(
            io,
            {
              get theme() {
                return I.NONE;
              },
              [d]: { theme: d },
            },
            3,
            'iG_6'
          ),
        ],
      },
      1,
      'iG_7'
    );
  },
  om = R(j(sm, 's_JGcGwM6uqSo')),
  rm = {
    title: 'app.title',
    meta: [
      { name: 'description', content: 'app.meta.description' },
      { property: 'og:image', content: '/default-og.png' },
    ],
  },
  lm = Object.freeze(
    Object.defineProperty(
      { __proto__: null, cardRows: Zl, default: om, head: rm },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  ),
  am = '',
  im = l(
    'svg',
    null,
    {
      fill: 'none',
      viewBox: '0 0 582 667',
      xmlns: 'http://www.w3.org/2000/svg',
    },
    [
      l(
        'path',
        null,
        {
          d: 'M291.285 0L0.900391 164.099V499.366L292.054 667H292.112L581.611 499.366V164.099L291.285 0Z',
          fill: 'url(#paint0_linear_934_3155)',
        },
        null,
        3,
        null
      ),
      l(
        'defs',
        null,
        null,
        l(
          'linearGradient',
          null,
          {
            gradientUnits: 'userSpaceOnUse',
            id: 'paint0_linear_934_3155',
            x1: '290.988',
            x2: '290.988',
            y1: '129.454',
            y2: '411.69',
          },
          [
            l('stop', null, { 'stop-color': '#9DE4FF' }, null, 3, null),
            l(
              'stop',
              null,
              { offset: '1', 'stop-color': '#9589EA' },
              null,
              3,
              null
            ),
          ],
          3,
          null
        ),
        3,
        null
      ),
    ],
    3,
    'jw_0'
  ),
  cm = l(
    'svg',
    null,
    {
      fill: 'none',
      viewBox: '0 0 273 316',
      xmlns: 'http://www.w3.org/2000/svg',
    },
    [
      l(
        'path',
        null,
        {
          d: 'M273.001 235.832L272.783 78.7356L136.845 0L0 78.2259L0.189217 236.568L136.833 315.228L273.001 235.832Z',
          fill: 'url(#paint0_angular_934_3153)',
        },
        null,
        3,
        null
      ),
      l(
        'defs',
        null,
        null,
        l(
          'radialGradient',
          null,
          {
            cx: '0',
            cy: '0',
            gradientTransform:
              'translate(122.869 107.3) rotate(79.398) scale(174.74 151.365)',
            gradientUnits: 'userSpaceOnUse',
            id: 'paint0_angular_934_3153',
            r: '1',
          },
          [
            l(
              'stop',
              null,
              { offset: '0.1', 'stop-color': '#004FC7' },
              null,
              3,
              null
            ),
            l(
              'stop',
              null,
              { offset: '1', 'stop-color': '#00F3B4' },
              null,
              3,
              null
            ),
          ],
          3,
          null
        ),
        3,
        null
      ),
    ],
    3,
    null
  ),
  um = l(
    'svg',
    null,
    {
      fill: 'none',
      viewBox: '0 0 357 411',
      xmlns: 'http://www.w3.org/2000/svg',
    },
    [
      l(
        'path',
        null,
        {
          d: 'M178.5 0L0 101.709V307.84L179.009 410.906L357 307.84V101.709L178.5 0Z',
          fill: 'url(#paint0_angular_934_3154)',
        },
        null,
        3,
        null
      ),
      l(
        'defs',
        null,
        null,
        l(
          'radialGradient',
          null,
          {
            cx: '0',
            cy: '0',
            gradientTransform:
              'translate(-298.5 536) rotate(90.1962) scale(536.248 1035.8)',
            gradientUnits: 'userSpaceOnUse',
            id: 'paint0_angular_934_3154',
            r: '1',
          },
          [
            l(
              'stop',
              null,
              { offset: '0.00523167', 'stop-color': '#6CF8D3' },
              null,
              3,
              null
            ),
            l(
              'stop',
              null,
              { offset: '0.75', 'stop-color': '#9589EA' },
              null,
              3,
              null
            ),
          ],
          3,
          null
        ),
        3,
        null
      ),
    ],
    3,
    null
  ),
  dm = '',
  pm = (e) => (
    W(j(dm, 's_3SsPTS5utQk')),
    l(
      'div',
      null,
      {
        class: H(
          (t) => `flex items-center ${t.class || ''}`,
          [e],
          '`flex items-center ${p0.class||""}`'
        ),
      },
      [
        e.showStart !== !1 &&
          l(
            'div',
            null,
            { class: 'w-[3px] h-[3px] rounded-full bg-blue-gray-400' },
            null,
            3,
            'oX_0'
          ),
        l(
          'div',
          null,
          { class: 'flex-1 w-full h-[1px] bg-blue-gray-400' },
          null,
          3,
          null
        ),
        e.showEnd !== !1 &&
          l(
            'div',
            null,
            { class: 'w-[3px] h-[3px] rounded-full bg-blue-gray-400' },
            null,
            3,
            'oX_1'
          ),
      ],
      1,
      'oX_2'
    )
  ),
  ee = R(j(pm, 's_gft6e4M8el4')),
  mm = () => {
    W(j(am, 's_0CLaYnIloJk'));
    const e = rt(),
      t = (n) => _t(n, e);
    return $(
      Wn,
      {
        get theme() {
          return I.OPAQUE;
        },
        children: [
          l('div', null, { class: 'block h-[88px] z-[999]' }, null, 3, null),
          l(
            'header',
            null,
            {
              class:
                'flex flex-col items-center text-center gap-4 pt-10 pb-24 md:gap-8 md:py-32 w-full overflow-x-hidden',
            },
            [
              l(
                'h1',
                null,
                {
                  class:
                    'text-4xl leading-tight md:text-6xl md:leading-none font-bold text-blue-gray-900',
                },
                x(
                  'hero.title@@Module Federation: streamline your microfrontends'
                ),
                1,
                null
              ),
              l(
                'p',
                null,
                {
                  class:
                    'font-medium text-lg  text-blue-gray-900 break-words max-w-4xl',
                },
                x(
                  'hero.subtitle@@Module Federation aims to solve the sharing of modules in a distributed system. It allows you to ship those critical shared pieces as macro or as micro as you would like. It does this by pulling them out of the build pipeline and out of your apps'
                ),
                1,
                null
              ),
              l(
                'div',
                null,
                {
                  class:
                    'flex flex-col md:flex-row gap-4 w-full md:justify-center',
                },
                [
                  $(
                    U,
                    {
                      class: 'w-full md:w-[196px]',
                      get theme() {
                        return P.SOLID;
                      },
                      children: x('hero.actions.documentation@@Documentation'),
                      href: '/docs/en/mf-docs/0.2/setup',
                      type: 'link',
                      [d]: { class: d, href: d, theme: d, type: d },
                    },
                    1,
                    'jo_0'
                  ),
                  $(
                    U,
                    {
                      class: 'w-full md:w-[196px]',
                      get theme() {
                        return P.OUTLINE;
                      },
                      children: x('hero.actions.learn@@Learn'),
                      href: t('/#learn'),
                      type: 'link',
                      [d]: { class: d, theme: d, type: d },
                    },
                    1,
                    'jo_1'
                  ),
                ],
                1,
                null
              ),
            ],
            1,
            null
          ),
          l(
            'div',
            { 'q:slot': 'background' },
            null,
            [
              l(
                'div',
                null,
                {
                  class:
                    'inline-block absolute w-40 top-1/3 left-0 -translate-x-1/2 -translate-y-1/2 md:w-72 md:top-1/2',
                },
                cm,
                3,
                null
              ),
              l(
                'div',
                null,
                {
                  class:
                    'inline-block absolute bottom-0 w-[90%] left-1/2 translate-y-1/2 -translate-x-1/2 md:w-5/12 md:top-[60%] md:translate-y-0',
                },
                im,
                3,
                null
              ),
              l(
                'div',
                null,
                {
                  class:
                    'inline-block absolute w-40 top-1/3 right-0 translate-x-1/3 -translate-y-1/2 md:w-72 md:top-1/2',
                },
                um,
                3,
                null
              ),
            ],
            3,
            null
          ),
          l(
            'div',
            { 'q:slot': 'background-no-overlay' },
            null,
            [
              $(
                ee,
                {
                  class:
                    'absolute w-20 md:w-40 top-1/3 md:top-1/2 left-0 rotate-[30deg] origin-left',
                  showStart: !1,
                  [d]: { class: d, showStart: d },
                },
                3,
                'jo_2'
              ),
              $(
                ee,
                {
                  class:
                    'absolute bottom-[12%] left-[-2px] md:left-1/2 w-3/12 md:w-5/12 md:-translate-x-1/2 rotate-[30deg] origin-left',
                  [d]: { class: d },
                },
                3,
                'jo_3'
              ),
              $(
                ee,
                {
                  class:
                    'absolute bottom-[12%] right-[-2px] md:left-1/2 w-3/12 md:w-5/12 md:-translate-x-1/2 -rotate-[30deg] origin-right',
                  [d]: { class: d },
                },
                3,
                'jo_4'
              ),
              $(
                ee,
                {
                  class:
                    'absolute w-32 md:w-64 top-[25%] md:top-1/3 right-[5%] translate-x-1/2 rotate-90 ',
                  [d]: { class: d },
                },
                3,
                'jo_5'
              ),
            ],
            1,
            null
          ),
        ],
        [d]: { theme: d },
      },
      1,
      'jo_6'
    );
  },
  fm = R(j(mm, 's_DRT9K1jPHw0')),
  hm = '',
  gm = (e) => (
    W(j(hm, 's_wM7DasAxykk')),
    l(
      'div',
      null,
      {
        class: H(
          (t) =>
            `relative border border-blue-gray-400 bg-white h-full w-full ${
              t.hover && 'transition-shadow hover:shadow-card'
            }`,
          [e],
          '`relative border border-blue-gray-400 bg-white h-full w-full ${p0.hover&&"transition-shadow hover:shadow-card"}`'
        ),
      },
      $(Z, null, 3, '0S_0'),
      1,
      '0S_1'
    )
  ),
  Dt = R(j(gm, 's_E6HOLccZhOI')),
  ym =
    '.explore-grid{grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}',
  $m = () => {
    W(j(ym, 's_DkNHR022s5k'));
    const e = [
      {
        iconSrc: '/illustrations/pratical-module-federation.svg',
        title: x(
          'explore.cards.practical-module-federation.title@@Practical Module Federation'
        ),
        actionText: x(
          'explore.cards.practical-module-federation.action@@Get the book'
        ),
        actionHref:
          'https://module-federation.myshopify.com/products/practical-module-federation',
        target: '_blank',
      },
      {
        iconSrc: '/illustrations/implementing-module-federation.svg',
        title: x(
          'explore.cards.implementing-module-federation.title@@Implementing Module Federation'
        ),
        actionText: x(
          'explore.cards.implementing-module-federation.action@@Learn more'
        ),
        actionHref: 'https://module-federation.io/en/mf-docs/0.2/setup',
        target: '_blank',
      },
      {
        iconSrc: '/illustrations/conference-talks.svg',
        title: x('explore.cards.conference-talks.title@@Conference talks'),
        actionText: x('explore.cards.conference-talks.action@@Watch now'),
        actionHref: '#',
        actionDisabled: !0,
        target: '_blank',
      },
      {
        iconSrc: '/illustrations/community-content.svg',
        title: x('explore.cards.community-content.title@@Community content'),
        actionText: x('explore.cards.community-content.action@@Find out more'),
        actionHref: '#',
        actionDisabled: !0,
        target: '_blank',
      },
    ];
    return $(
      ie,
      {
        get padding() {
          return de.BOTTOM;
        },
        class: 'scroll-mt-32',
        id: 'discover',
        get theme() {
          return I.OPAQUE;
        },
        children: l(
          'div',
          null,
          { class: 'flex flex-col gap-3' },
          [
            l(
              'div',
              null,
              { class: 'grid grid-cols-1 md:grid-cols-2 gap-3' },
              e.map(
                (t) => (
                  vt(),
                  $(
                    Dt,
                    {
                      children: l(
                        'div',
                        null,
                        { class: 'flex items-center px-6 py-8 md:p-12 gap-6' },
                        [
                          l(
                            'img',
                            { alt: M(t, 'title'), src: M(t, 'iconSrc') },
                            { class: 'h-16 w-16' },
                            null,
                            3,
                            null
                          ),
                          l(
                            'div',
                            null,
                            {
                              class: 'flex flex-col items-start gap-2 md:gap-1',
                            },
                            [
                              l(
                                'h3',
                                null,
                                {
                                  class:
                                    'text-blue-gray-900 font-semibold text-xl',
                                },
                                M(t, 'title'),
                                1,
                                null
                              ),
                              $(
                                U,
                                {
                                  get theme() {
                                    return P.NAKED;
                                  },
                                  get href() {
                                    return t.actionHref;
                                  },
                                  get target() {
                                    return t.target;
                                  },
                                  get disabled() {
                                    return t.actionDisabled;
                                  },
                                  children: [
                                    t.actionDisabled
                                      ? x('explore.disabled')
                                      : t.actionText,
                                    !t.actionDisabled &&
                                      $(
                                        Ge,
                                        {
                                          'q:slot': 'suffix',
                                          get name() {
                                            return se.ARROW_NARROW_RIGHT;
                                          },
                                          size: '24px',
                                          [d]: {
                                            name: d,
                                            'q:slot': d,
                                            size: d,
                                          },
                                        },
                                        3,
                                        'du_0'
                                      ),
                                  ],
                                  type: 'link',
                                  [d]: {
                                    disabled: V(t, 'actionDisabled'),
                                    href: V(t, 'actionHref'),
                                    target: V(t, 'target'),
                                    theme: d,
                                    type: d,
                                  },
                                },
                                1,
                                'du_1'
                              ),
                            ],
                            1,
                            null
                          ),
                        ],
                        1,
                        null
                      ),
                      hover: !0,
                      [d]: { hover: d },
                    },
                    1,
                    t.title
                  )
                )
              ),
              1,
              null
            ),
            l(
              'div',
              null,
              { class: 'flex' },
              $(
                Dt,
                {
                  children: [
                    l(
                      'div',
                      null,
                      {
                        class:
                          'items-start p-12 gap-6 max-w-2xl mx-auto hidden md:flex',
                      },
                      [
                        l(
                          'img',
                          null,
                          {
                            alt: 'Module Federation courses',
                            class: 'h-14 w-14 md:h-24 md:w-24',
                            src: '/illustrations/module-federation-courses.svg',
                          },
                          null,
                          3,
                          null
                        ),
                        l(
                          'div',
                          null,
                          { class: 'flex flex-col items-start gap-6' },
                          [
                            l(
                              'div',
                              null,
                              { class: 'flex flex-col items-start gap-1' },
                              [
                                l(
                                  'h3',
                                  null,
                                  {
                                    class:
                                      'text-blue-gray-900 font-semibold text-xl',
                                  },
                                  x(
                                    'explore.cards.module-federation-courses.title@@Module Federation courses'
                                  ),
                                  1,
                                  null
                                ),
                                l(
                                  'p',
                                  null,
                                  {
                                    class:
                                      'font-medium text-blue-gray-900 text-lg',
                                  },
                                  x(
                                    'explore.cards.module-federation-courses.subtitle@@Gain expertise in Module Federation and enhance your skills now'
                                  ),
                                  1,
                                  null
                                ),
                              ],
                              1,
                              null
                            ),
                            $(
                              U,
                              {
                                class: 'mt-2',
                                get theme() {
                                  return P.NAKED;
                                },
                                children: x('explore.disabled'),
                                disabled: !0,
                                href: '#',
                                target: '_blank',
                                type: 'link',
                                [d]: {
                                  class: d,
                                  disabled: d,
                                  href: d,
                                  target: d,
                                  theme: d,
                                  type: d,
                                },
                              },
                              1,
                              'du_2'
                            ),
                          ],
                          1,
                          null
                        ),
                      ],
                      1,
                      null
                    ),
                    l(
                      'div',
                      null,
                      { class: 'flex flex-col md:hidden px-6 py-8 gap-6' },
                      [
                        l(
                          'div',
                          null,
                          { class: 'flex items-start gap-6' },
                          [
                            l(
                              'img',
                              null,
                              {
                                alt: 'Module Federation courses',
                                class: 'h-16 w-16',
                                src: '/illustrations/module-federation-courses.svg',
                              },
                              null,
                              3,
                              null
                            ),
                            l(
                              'div',
                              null,
                              {
                                class:
                                  'flex flex-col items-start gap-2 md:gap-1',
                              },
                              [
                                l(
                                  'h3',
                                  null,
                                  {
                                    class:
                                      'text-blue-gray-900 font-semibold text-xl',
                                  },
                                  x(
                                    'explore.cards.module-federation-courses.title@@Module Federation courses'
                                  ),
                                  1,
                                  null
                                ),
                                l(
                                  'p',
                                  null,
                                  {
                                    class:
                                      'font-medium text-blue-gray-900 text-lg',
                                  },
                                  x(
                                    'explore.cards.module-federation-courses.subtitle@@Gain expertise in Module Federation and enhance your skills now'
                                  ),
                                  1,
                                  null
                                ),
                              ],
                              1,
                              null
                            ),
                          ],
                          1,
                          null
                        ),
                        $(
                          U,
                          {
                            get theme() {
                              return P.NAKED;
                            },
                            children: x('explore.disabled'),
                            disabled: !0,
                            href: '#',
                            target: '_blank',
                            type: 'link',
                            [d]: {
                              disabled: d,
                              href: d,
                              target: d,
                              theme: d,
                              type: d,
                            },
                          },
                          1,
                          'du_3'
                        ),
                      ],
                      1,
                      null
                    ),
                  ],
                  hover: !0,
                  [d]: { hover: d },
                },
                1,
                'du_4'
              ),
              1,
              null
            ),
          ],
          1,
          null
        ),
        [d]: { class: d, id: d, padding: d, theme: d },
      },
      1,
      'du_5'
    );
  },
  bm = R(j($m, 's_RZ4kRsPh3h0')),
  wm = '',
  vm = l(
    'svg',
    null,
    {
      fill: 'none',
      viewBox: '0 0 315 383',
      xmlns: 'http://www.w3.org/2000/svg',
    },
    [
      l(
        'path',
        null,
        {
          d: 'M157.481 0L0.128906 95.5867L0.128907 286.448L157.928 382.35V382.353L157.931 382.351L314.834 286.449V94.6425L157.481 0Z',
          fill: 'url(#paint0_linear_934_4047)',
          'fill-opacity': '0.8',
        },
        null,
        3,
        null
      ),
      l(
        'defs',
        null,
        null,
        l(
          'linearGradient',
          null,
          {
            gradientUnits: 'userSpaceOnUse',
            id: 'paint0_linear_934_4047',
            x1: '134.217',
            x2: '-30.0804',
            y1: '372.893',
            y2: '223.77',
          },
          [
            l('stop', null, { 'stop-color': '#7B6EDF' }, null, 3, null),
            l(
              'stop',
              null,
              { offset: '1', 'stop-color': '#D6D3EE' },
              null,
              3,
              null
            ),
          ],
          3,
          null
        ),
        3,
        null
      ),
    ],
    3,
    'sB_0'
  ),
  _m = l(
    'svg',
    null,
    {
      fill: 'none',
      viewBox: '0 0 216 262',
      xmlns: 'http://www.w3.org/2000/svg',
    },
    [
      l(
        'path',
        null,
        {
          d: 'M108.18 262L215.999 196.504L215.999 65.7246L107.873 0.0116882V0.0102539L107.872 0.0110779L0.360363 65.7237L0.360352 197.15L108.18 262Z',
          fill: 'url(#paint0_angular_934_4048)',
        },
        null,
        3,
        null
      ),
      l(
        'defs',
        null,
        null,
        l(
          'radialGradient',
          null,
          {
            cx: '0',
            cy: '0',
            gradientTransform:
              'translate(107.721 101.958) scale(161.704 111.194)',
            gradientUnits: 'userSpaceOnUse',
            id: 'paint0_angular_934_4048',
            r: '1',
          },
          [
            l(
              'stop',
              null,
              { offset: '0.500114', 'stop-color': '#CFC9FB' },
              null,
              3,
              null
            ),
            l(
              'stop',
              null,
              { offset: '0.99989', 'stop-color': '#A8F9E4' },
              null,
              3,
              null
            ),
          ],
          3,
          null
        ),
        3,
        null
      ),
    ],
    3,
    null
  ),
  xm = l(
    'svg',
    null,
    {
      fill: 'none',
      viewBox: '0 0 177 214',
      xmlns: 'http://www.w3.org/2000/svg',
    },
    [
      l(
        'path',
        null,
        {
          d: 'M88.3747 214L176.388 161.063V53.779L88.124 0.137177V0.135986L88.123 0.136566L0.360849 53.7784L0.36084 161.063L88.3747 214Z',
          fill: 'url(#paint0_linear_934_4049)',
        },
        null,
        3,
        null
      ),
      l(
        'defs',
        null,
        null,
        l(
          'linearGradient',
          null,
          {
            gradientUnits: 'userSpaceOnUse',
            id: 'paint0_linear_934_4049',
            x1: '117.894',
            x2: '63.5262',
            y1: '257.73',
            y2: '76.2588',
          },
          [
            l('stop', null, { 'stop-color': '#83B4FF' }, null, 3, null),
            l(
              'stop',
              null,
              { offset: '1', 'stop-color': '#ABF0DE' },
              null,
              3,
              null
            ),
          ],
          3,
          null
        ),
        3,
        null
      ),
    ],
    3,
    null
  ),
  km = () => (
    W(j(wm, 's_0kXSZC4QkmM')),
    $(
      ie,
      {
        children: [
          l(
            'div',
            null,
            { class: 'flex flex-col items-center' },
            l(
              'p',
              null,
              {
                class:
                  'text-4xl leading-normal md:text-3xl text-blue-gray-900 font-bold max-w-lg mx-auto text-center leading-tight',
              },
              [
                x('discord.title@@Join to Module Federation community in'),
                ' ',
                l(
                  'a',
                  null,
                  {
                    class:
                      'text-ui-blue underline decoration-solid decoration-1 underline-offset-2',
                    href: 'https://discord.gg/T8c6yAxkbv',
                    target: '_blank',
                  },
                  x('discord.action@@Discord'),
                  1,
                  null
                ),
              ],
              1,
              null
            ),
            1,
            null
          ),
          l(
            'div',
            { 'q:slot': 'background' },
            { class: 'relative w-11/12 h-full max-w-1225 mx-auto block' },
            [
              l(
                'div',
                null,
                { class: 'absolute w-48 md:w-64 top-1/2 md:top-1/4 left-0 ' },
                vm,
                3,
                null
              ),
              l(
                'div',
                null,
                {
                  class:
                    'absolute w-36 md:w-52 bottom-0 right-[12%] md:right-1/4 translate-x-1/2 translate-y-1/2 ',
                },
                _m,
                3,
                null
              ),
              l(
                'div',
                null,
                {
                  class:
                    'absolute w-36 md:w-48 md:w-48 top-6 right-0 -translate-y-1/2 ',
                },
                xm,
                3,
                null
              ),
            ],
            3,
            null
          ),
          l(
            'div',
            { 'q:slot': 'background-no-overlay' },
            null,
            [
              $(
                ee,
                {
                  class:
                    'absolute w-12 md:w-20 bottom-0 left-1/2 rotate-90 -translate-x-full origin-right translate-y-1/2',
                  showEnd: !1,
                  [d]: { class: d, showEnd: d },
                },
                3,
                '0P_0'
              ),
              $(
                ee,
                {
                  class:
                    'absolute w-24 md:w-36 top-0 right-0 md:right-[5%] -rotate-[30deg]  origin-right',
                  showEnd: !1,
                  [d]: { class: d, showEnd: d },
                },
                3,
                '0P_1'
              ),
              $(
                ee,
                {
                  class:
                    'absolute w-24 md:w-36 top-0 left-0 md:left-[5%] rotate-[30deg]  origin-left',
                  showStart: !1,
                  [d]: { class: d, showStart: d },
                },
                3,
                '0P_2'
              ),
            ],
            1,
            null
          ),
        ],
      },
      1,
      '0P_3'
    )
  ),
  Sm = R(j(km, 's_KHl60H7GIzk')),
  qm = '',
  Cm = l(
    'svg',
    null,
    {
      fill: 'none',
      viewBox: '0 0 582 667',
      xmlns: 'http://www.w3.org/2000/svg',
    },
    [
      l(
        'path',
        null,
        {
          d: 'M291.285 0L0.901367 164.099V499.366L292.113 667L581.612 499.366V164.099L291.285 0Z',
          fill: 'url(#paint0_linear_934_3156)',
        },
        null,
        3,
        null
      ),
      l(
        'defs',
        null,
        null,
        l(
          'linearGradient',
          null,
          {
            gradientUnits: 'userSpaceOnUse',
            id: 'paint0_linear_934_3156',
            x1: '290.989',
            x2: '290.989',
            y1: '129.454',
            y2: '411.69',
          },
          [
            l('stop', null, { 'stop-color': '#C2EEFF' }, null, 3, null),
            l(
              'stop',
              null,
              { offset: '1', 'stop-color': '#CCC5FD' },
              null,
              3,
              null
            ),
          ],
          3,
          null
        ),
        3,
        null
      ),
    ],
    3,
    'Uk_0'
  ),
  jm = () => {
    W(j(qm, 's_14NE37yaMfA'));
    const e = [
        {
          title: x(
            'doc-summary.cards.decentralized.title@@Decentralized code sharing'
          ),
          desc: x(
            'doc-summary.cards.decentralized.desc@@Module Federation allows developers to share code between multiple projects in a decentralized manner, making it easier to manage complex applications.'
          ),
          actionHref: '/docs/en/mf-docs/0.2/getting-started/',
          actionTitle: x(
            'doc-summary.cards.decentralized.action@@Documentation'
          ),
          target: '_blank',
        },
        {
          title: x(
            'doc-summary.cards.modular-architecture.title@@Modular architecture'
          ),
          desc: x(
            'doc-summary.cards.modular-architecture.desc@@Applications can be split into smaller, self-contained modules that can be developed, tested, and deployed independently.'
          ),
          actionHref: '/docs/en/mf-docs/0.2/getting-started/',
          actionTitle: x(
            'doc-summary.cards.modular-architecture.action@@Documentation'
          ),
          target: '_blank',
        },
        {
          title: x(
            'doc-summary.cards.federated-runtime.title@@Federated runtime'
          ),
          desc: x(
            'doc-summary.cards.federated-runtime.desc@@The modules can be combined and federated at runtime, allowing for greater collaboration and faster development times.'
          ),
          actionHref: '/docs/en/mf-docs/0.2/getting-started/',
          actionTitle: x(
            'doc-summary.cards.federated-runtime.action@@Documentation'
          ),
          target: '_blank',
        },
        {
          title: x('doc-summary.cards.flexibility.title@@Flexibility'),
          desc: x(
            'doc-summary.cards.flexibility.desc@@Module Federation gives developers the freedom to choose and implement the architecture that best suits their needs, promoting a modular and scalable approach to application development.'
          ),
          actionHref: '/docs/en/mf-docs/0.2/getting-started/',
          actionTitle: x('doc-summary.cards.flexibility.action@@Documentation'),
          target: '_blank',
        },
        {
          title: x(
            'doc-summary.cards.team-colaboration.title@@Team collaboration'
          ),
          desc: x(
            'doc-summary.cards.team-colaboration.desc@@Independent teams can be assigned responsibility for specific microfrontends, making it easier to manage the development process and promote collaboration between team members.'
          ),
          actionHref: '/docs/en/mf-docs/0.2/getting-started/',
          actionTitle: x(
            'doc-summary.cards.team-colaboration.action@@Documentation'
          ),
          target: '_blank',
        },
      ],
      t = x('doc-summary.title@@Scalability with Module Federation'),
      n = x(
        'doc-summary.subtitle@@Module Federation brings scalability to not only code but also individual and organizational productivity'
      );
    return $(
      ie,
      {
        id: 'learn',
        get theme() {
          return I.OPAQUE;
        },
        children: [
          $(
            xt,
            { 'q:slot': 'header', subtitle: n, title: t, [d]: { 'q:slot': d } },
            3,
            'ma_0'
          ),
          l(
            'div',
            null,
            { class: 'flex flex-col items-center gap-3 md:gap-10' },
            [
              e.map((s) =>
                l(
                  'div',
                  null,
                  { class: 'w-full' },
                  $(
                    Dt,
                    {
                      children: l(
                        'div',
                        null,
                        {
                          class:
                            'flex flex-col gap-6 items-start md:flex-row md:items-center p-10',
                        },
                        [
                          l(
                            'div',
                            null,
                            { class: 'flex flex-col gap-4 w-full pr-4' },
                            [
                              l(
                                'h3',
                                null,
                                {
                                  class: 'text-blue-gray-900 font-bold text-xl',
                                },
                                M(s, 'title'),
                                1,
                                null
                              ),
                              l(
                                'p',
                                null,
                                {
                                  class:
                                    'font-medium text-blue-gray-900 text-lg',
                                },
                                M(s, 'desc'),
                                1,
                                null
                              ),
                            ],
                            1,
                            null
                          ),
                          $(
                            U,
                            {
                              get theme() {
                                return P.NAKED;
                              },
                              get href() {
                                return s.actionHref;
                              },
                              get target() {
                                return s.target;
                              },
                              children: [
                                M(s, 'actionTitle'),
                                $(
                                  Ge,
                                  {
                                    'q:slot': 'suffix',
                                    get name() {
                                      return se.ARROW_NARROW_RIGHT;
                                    },
                                    size: '24px',
                                    [d]: { name: d, 'q:slot': d, size: d },
                                  },
                                  3,
                                  'ma_1'
                                ),
                              ],
                              type: 'link',
                              [d]: {
                                href: V(s, 'actionHref'),
                                target: V(s, 'target'),
                                theme: d,
                                type: d,
                              },
                            },
                            1,
                            'ma_2'
                          ),
                        ],
                        1,
                        null
                      ),
                      hover: !0,
                      [d]: { hover: d },
                    },
                    1,
                    'ma_3'
                  ),
                  1,
                  s.title
                )
              ),
              $(
                U,
                {
                  class: 'w-full md:w-auto',
                  get theme() {
                    return P.SOLID;
                  },
                  children: x(
                    'doc-summary.action@@Start using module federation'
                  ),
                  href: 'https://module-federation.io/en/mf-docs/0.2/setup',
                  target: '_blank',
                  type: 'link',
                  [d]: { class: d, href: d, target: d, theme: d, type: d },
                },
                1,
                'ma_4'
              ),
            ],
            1,
            null
          ),
          l(
            'div',
            { 'q:slot': 'background' },
            null,
            l(
              'div',
              null,
              {
                class:
                  'absolute bottom-6 left-1/2 -translate-x-1/2 translate-y-1/3 w-[80%] md:w-2/6',
              },
              Cm,
              3,
              null
            ),
            3,
            null
          ),
        ],
        [d]: { id: d, theme: d },
      },
      1,
      'ma_5'
    );
  },
  Tm = R(j(jm, 's_TCwB4TUhbFA')),
  Em = '',
  Lm = [
    {
      logo: '/bundlers/webpack.svg',
      name: 'Webpack',
      actionHref: 'https://webpack.js.org/concepts/module-federation',
      target: '_blank',
    },
    {
      logo: '/bundlers/rspack.svg',
      name: 'Rspack',
      actionHref: 'https://www.rspack.dev',
      target: '_blank',
    },
    {
      logo: '/bundlers/vite.svg',
      name: 'Vite',
      actionHref: 'https://vitejs.dev',
      target: '_blank',
    },
    {
      logo: '/bundlers/rollup.svg',
      name: 'Rollup',
      actionHref: 'https://rollupjs.org',
      target: '_blank',
    },
    {
      logo: '/bundlers/esbuild.svg',
      name: 'esBuild',
      actionHref: 'https://esbuild.github.io',
      target: '_blank',
    },
  ],
  Nm = () => {
    W(j(Em, 's_00VE9E0kYIc'));
    const e = [
        {
          title: x('evolving.rfcs.title@@RFCs'),
          subtitle: x(
            'evolving.rfcs.subtitle@@Participate in the community discussions to decide on what features are coming next'
          ),
          actionText: x('evolving.rfcs.action@@Take part now!'),
          actionHref:
            'https://github.com/module-federation/universe/discussions/categories/rfc',
          target: '_blank',
          lineClass:
            'absolute w-24 bottom-[5%] md:bottom-[20%] left-full -translate-x-full',
          lineShowStart: !0,
          lineShowEnd: !1,
        },
        {
          title: x('evolving.roadmap.title@@Module Federation Roadmap'),
          subtitle: x(
            'evolving.roadmap.subtitle@@Discover the future of Module Federation'
          ),
          actionText: x('evolving.roadmap.action@@Explore it!'),
          actionHref:
            'https://miro.com/app/board/uXjVPvdfG2I=/?share_link_id=45887343083',
          target: '_blank',
          lineClass:
            'absolute w-24 top-0 rotate-90 right-[10%] origin-left translate-x-full -translate-y-1/2',
          lineShowStart: !1,
          lineShowEnd: !0,
        },
      ],
      t = x('evolving.title@@Evolving Module Federation'),
      n = x(
        'evolving.subtitle@@The world of Module Federation is constantly evolving and growing based on the feedback from the community. The RFCs are open for all to participate in the discussion and the roadmap is published.'
      );
    return $(
      ie,
      {
        get padding() {
          return de.BOTTOM;
        },
        get theme() {
          return I.OPAQUE;
        },
        children: [
          $(
            xt,
            { 'q:slot': 'header', subtitle: n, title: t, [d]: { 'q:slot': d } },
            3,
            'EQ_0'
          ),
          l(
            'div',
            null,
            { class: 'flex flex-col gap-3' },
            [
              l(
                'div',
                null,
                { class: 'grid grid grid-cols-1 md:grid-cols-2 gap-3' },
                e.map(
                  (s) => (
                    vt(),
                    $(
                      Dt,
                      {
                        children: [
                          l(
                            'div',
                            null,
                            { class: 'flex flex-col h-full p-10 gap-6' },
                            [
                              l(
                                'h3',
                                null,
                                {
                                  class:
                                    'text-blue-gray-900 font-semibold text-3xl',
                                },
                                M(s, 'title'),
                                1,
                                null
                              ),
                              l(
                                'p',
                                null,
                                {
                                  class:
                                    'font-medium text-blue-gray-900 text-lg',
                                },
                                M(s, 'subtitle'),
                                1,
                                null
                              ),
                              l(
                                'div',
                                null,
                                { class: 'mt-auto' },
                                $(
                                  U,
                                  {
                                    class: 'w-full md:w-auto',
                                    get theme() {
                                      return P.SOLID;
                                    },
                                    get href() {
                                      return s.actionHref;
                                    },
                                    get target() {
                                      return s.target;
                                    },
                                    children: [
                                      M(s, 'actionText'),
                                      $(
                                        Ge,
                                        {
                                          'q:slot': 'suffix',
                                          get name() {
                                            return se.ARROW_NARROW_RIGHT;
                                          },
                                          size: '24px',
                                          [d]: {
                                            name: d,
                                            'q:slot': d,
                                            size: d,
                                          },
                                        },
                                        3,
                                        'EQ_1'
                                      ),
                                    ],
                                    small: !0,
                                    type: 'link',
                                    [d]: {
                                      class: d,
                                      href: V(s, 'actionHref'),
                                      small: d,
                                      target: V(s, 'target'),
                                      theme: d,
                                      type: d,
                                    },
                                  },
                                  1,
                                  'EQ_2'
                                ),
                                1,
                                null
                              ),
                            ],
                            1,
                            null
                          ),
                          s.lineClass &&
                            $(
                              ee,
                              {
                                get class() {
                                  return s.lineClass;
                                },
                                get showEnd() {
                                  return s.lineShowEnd;
                                },
                                get showStart() {
                                  return s.lineShowStart;
                                },
                                [d]: {
                                  class: V(s, 'lineClass'),
                                  showEnd: V(s, 'lineShowEnd'),
                                  showStart: V(s, 'lineShowStart'),
                                },
                              },
                              3,
                              'EQ_3'
                            ),
                        ],
                      },
                      1,
                      s.title
                    )
                  )
                ),
                1,
                null
              ),
              $(
                Dt,
                {
                  children: [
                    l(
                      'div',
                      null,
                      {
                        class:
                          'flex flex-col justify-center items-center p-10 gap-6',
                      },
                      [
                        l(
                          'h3',
                          null,
                          {
                            class: 'text-blue-gray-900 font-semibold text-3xl',
                          },
                          x(
                            'evolving.supported-bundlers.title@@Supported bundlers'
                          ),
                          1,
                          null
                        ),
                        l(
                          'div',
                          null,
                          {
                            class:
                              'flex justify-center flex-wrap w-full gap-y-12 gap-x-24',
                          },
                          Lm.map((s) =>
                            l(
                              'a',
                              {
                                href: M(s, 'actionHref'),
                                target: M(s, 'target'),
                              },
                              { class: 'flex flex-col items-center ' },
                              [
                                l(
                                  'img',
                                  { alt: M(s, 'name'), src: M(s, 'logo') },
                                  { class: 'w-24 h-24' },
                                  null,
                                  3,
                                  null
                                ),
                                l(
                                  'div',
                                  null,
                                  {
                                    class:
                                      'text-2xl font-semibold text-ui-blue underline decoration-solid decoration-1 underline-offset-2',
                                  },
                                  M(s, 'name'),
                                  1,
                                  null
                                ),
                              ],
                              1,
                              s.name
                            )
                          ),
                          1,
                          null
                        ),
                      ],
                      1,
                      null
                    ),
                    $(
                      ee,
                      {
                        class:
                          'absolute w-6 bottom-0 rotate-90 left-1/2 origin-right translate-y-1/2 -translate-x-full',
                        showEnd: !1,
                        [d]: { class: d, showEnd: d },
                      },
                      3,
                      'EQ_4'
                    ),
                  ],
                },
                1,
                'EQ_5'
              ),
            ],
            1,
            null
          ),
        ],
        [d]: { padding: d, theme: d },
      },
      1,
      'EQ_6'
    );
  },
  Am = R(j(Nm, 's_pbG9H8ze2g4')),
  zm = l(
    'svg',
    null,
    {
      fill: 'none',
      viewBox: '0 0 177 214',
      xmlns: 'http://www.w3.org/2000/svg',
    },
    [
      l(
        'path',
        null,
        {
          d: 'M88.0139 214L176.027 160.534V53.7792L87.7632 0.137421V0.13623L87.7621 0.13681L0 53.7786V160.534L88.0139 214Z',
          fill: 'url(#paint0_linear_934_4046)',
        },
        null,
        3,
        null
      ),
      l(
        'defs',
        null,
        null,
        l(
          'linearGradient',
          null,
          {
            gradientUnits: 'userSpaceOnUse',
            id: 'paint0_linear_934_4046',
            x1: '175.628',
            x2: '-2.46215',
            y1: '155.359',
            y2: '48.8543',
          },
          [
            l('stop', null, { 'stop-color': '#9589EC' }, null, 3, null),
            l(
              'stop',
              null,
              { offset: '1', 'stop-color': '#ABF0DE' },
              null,
              3,
              null
            ),
          ],
          3,
          null
        ),
        3,
        null
      ),
    ],
    3,
    'IH_0'
  ),
  Im = l(
    'svg',
    null,
    {
      fill: 'none',
      viewBox: '0 0 302 367',
      xmlns: 'http://www.w3.org/2000/svg',
    },
    [
      l(
        'path',
        null,
        {
          d: 'M150.925 367L301.847 275.319L301.847 92.2567L150.494 0.272766V0.270508L1.56599e-05 92.2553L0 276.225L150.925 367Z',
          fill: 'url(#paint0_angular_934_4045)',
        },
        null,
        3,
        null
      ),
      l(
        'defs',
        null,
        null,
        l(
          'radialGradient',
          null,
          {
            cx: '0',
            cy: '0',
            gradientTransform:
              'translate(150.282 142.975) rotate(0.425566) scale(207.986 219.54)',
            gradientUnits: 'userSpaceOnUse',
            id: 'paint0_angular_934_4045',
            r: '1',
          },
          [
            l(
              'stop',
              null,
              { offset: '0.244792', 'stop-color': '#63C4E7' },
              null,
              3,
              null
            ),
            l(
              'stop',
              null,
              { offset: '0.924021', 'stop-color': '#A8F9E4' },
              null,
              3,
              null
            ),
          ],
          3,
          null
        ),
        3,
        null
      ),
    ],
    3,
    null
  ),
  Rm = l(
    'svg',
    null,
    {
      fill: 'none',
      viewBox: '0 0 205 249',
      xmlns: 'http://www.w3.org/2000/svg',
    },
    [
      l(
        'path',
        null,
        {
          d: 'M102.203 0L0.000976562 62.0861L0.000977149 186.051L102.493 248.34V248.342L102.495 248.341L204.405 186.052V61.4713L102.203 0Z',
          fill: 'url(#paint0_linear_934_4044)',
          'fill-opacity': '0.8',
        },
        null,
        3,
        null
      ),
      l(
        'defs',
        null,
        null,
        l(
          'linearGradient',
          null,
          {
            gradientUnits: 'userSpaceOnUse',
            id: 'paint0_linear_934_4044',
            x1: '87.0925',
            x2: '-19.6201',
            y1: '242.198',
            y2: '145.341',
          },
          [
            l('stop', null, { 'stop-color': '#7B6EDF' }, null, 3, null),
            l(
              'stop',
              null,
              { offset: '1', 'stop-color': '#D6D3EE' },
              null,
              3,
              null
            ),
          ],
          3,
          null
        ),
        3,
        null
      ),
    ],
    3,
    null
  ),
  Mm = '',
  Pm = (e) => {
    const [t, n] = Ie(),
      s = e.target,
      o = new FormData(s);
    o.get('email') &&
      ((t.value = !0),
      (n.value = !1),
      fetch('/docs/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(o).toString(),
      })
        .then(() => {
          (n.value = !0), (t.value = !1), s.reset();
        })
        .catch((r) => (t.value = !1)));
  },
  Dm = () => {
    vt(), W(j(Mm, 's_i9FQ1vZJ8l0'));
    const e = pe(!1),
      t = pe(!1),
      n = j(Pm, 's_KPHXz30Lh3M', [e, t]);
    return $(
      ie,
      {
        children: [
          l(
            'div',
            null,
            { class: 'flex flex-col items-center' },
            l(
              'div',
              null,
              { class: 'flex flex-col items-center gap-8' },
              [
                l(
                  'h2',
                  null,
                  {
                    class:
                      'text-4xl leading-normal md:text-3xl text-blue-gray-900 font-bold max-w-lg mx-auto text-center leading-tight',
                  },
                  x('subscribe.title@@Subscribe to our email newsletter!'),
                  1,
                  null
                ),
                t.value &&
                  l(
                    'div',
                    null,
                    { class: 'text-sm text-green-700 text-center' },
                    'Subscribed successfully!',
                    3,
                    'xO_0'
                  ),
                !t.value &&
                  l(
                    'form',
                    null,
                    {
                      class:
                        'flex flex-col md:grid md:grid-cols-[1fr_auto] items-center w-full gap-4',
                      onSubmit$: Re('s_n1zdSBKIeTw', [n]),
                      'preventdefault:submit': !0,
                    },
                    [
                      l(
                        'input',
                        null,
                        {
                          name: 'form-name',
                          type: 'hidden',
                          value: 'subscribe',
                        },
                        null,
                        3,
                        null
                      ),
                      l(
                        'input',
                        null,
                        {
                          class:
                            'min-h-[44px] h-full w-full border-blue-gray-900 px-4 py-1.5 pr-8 bg-white  focus:border-ui-blue',
                          id: 'email',
                          name: 'email',
                          placeholder: x(
                            'subscribe.input.placeholder@@Enter your email'
                          ),
                          type: 'email',
                        },
                        null,
                        3,
                        null
                      ),
                      $(
                        U,
                        {
                          class: 'whitespace-nowrap w-full md:w-auto',
                          get theme() {
                            return P.SOLID;
                          },
                          small: !0,
                          type: 'submit',
                          get loading() {
                            return e.value;
                          },
                          children: x('subscribe.action@@Subscribe'),
                          [d]: {
                            class: d,
                            loading: H((s) => s.value, [e], 'p0.value'),
                            small: d,
                            theme: d,
                            type: d,
                          },
                        },
                        1,
                        'xO_1'
                      ),
                    ],
                    1,
                    'xO_2'
                  ),
              ],
              1,
              null
            ),
            1,
            null
          ),
          l(
            'div',
            { 'q:slot': 'background' },
            { class: 'relative w-11/12 h-full max-w-1225 mx-auto' },
            [
              l(
                'div',
                null,
                {
                  class:
                    'absolute w-36 md:w-48 bottom-0 left-0 translate-y-1/2 ',
                },
                zm,
                3,
                null
              ),
              l(
                'div',
                null,
                {
                  class:
                    'absolute w-56 md:w-72 top-0 left-[5%] md:left-[20%] -translate-y-1/2  md:-translate-y-1/3 ',
                },
                Im,
                3,
                null
              ),
              l(
                'div',
                null,
                {
                  class:
                    'absolute w-36 md:w-56 top-1/2 right-0 -translate-x-1/3 md:-translate-y-1/2 ',
                },
                Rm,
                3,
                null
              ),
            ],
            3,
            null
          ),
          l(
            'div',
            { 'q:slot': 'background-no-overlay' },
            null,
            [
              $(
                ee,
                {
                  class:
                    'absolute w-12 md:w-1/4 top-[25%] md:top-[60%] right-0',
                  showEnd: !1,
                  [d]: { class: d, showEnd: d },
                },
                3,
                'xO_3'
              ),
              $(
                ee,
                {
                  class:
                    'absolute w-24 md:w-52 top-0 left-[12%] md:left-[14%] rotate-90 origin-left -translate-y-1/2',
                  showStart: !1,
                  [d]: { class: d, showStart: d },
                },
                3,
                'xO_4'
              ),
            ],
            1,
            null
          ),
        ],
      },
      1,
      'xO_5'
    );
  },
  Fm = R(j(Dm, 's_KnttE033sL4')),
  Om =
    '.showcase-grid{grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}',
  Hm = [
    {
      name: 'Lululemon Athletica',
      previewSrc: '/showcase/lululemon.png',
      url: 'shop.lululemon.com',
    },
    {
      name: 'Business Insider',
      previewSrc: '/showcase/business_insider.png',
      url: 'businessinsider.com',
    },
    { name: 'TikTok', previewSrc: '/showcase/tiktok.png', url: 'tiktok.com' },
    {
      name: 'BestBuy',
      previewSrc: '/showcase/bestbuy.png',
      url: 'bestbuy.com',
    },
    { name: 'Adidas', previewSrc: '/showcase/adidas.png', url: 'adidas.com' },
    {
      name: 'Shopify Partners',
      previewSrc: '/showcase/shopify_partners.png',
      url: 'shopify.com/partners',
    },
    {
      name: 'Epic Games',
      previewSrc: '/showcase/epic_games.png',
      url: 'store.epicgames.com',
    },
    {
      name: 'PandaDoc',
      previewSrc: '/showcase/panda_doc.png',
      url: 'app.pandadoc.com/login',
    },
    {
      name: 'ZoomInfo',
      previewSrc: '/showcase/zoominfo.png',
      url: 'zoominfo.com',
    },
  ],
  Um = () => {
    W(j(Om, 's_IMLVEX3dgUw'));
    const e = rt(),
      t = (s) => _t(s, e),
      n = x('showcase.title@@Showcase');
    return $(
      ie,
      {
        get padding() {
          return de.BOTTOM;
        },
        get theme() {
          return I.OPAQUE;
        },
        children: [
          $(
            xt,
            { 'q:slot': 'header', title: n, [d]: { 'q:slot': d } },
            3,
            'LU_0'
          ),
          l(
            'div',
            null,
            { class: 'flex flex-col gap-10 items-center' },
            [
              l(
                'div',
                null,
                { class: 'grid gap-x-3 gap-y-10 showcase-grid w-full' },
                Hm.map((s) =>
                  l(
                    'div',
                    null,
                    { class: 'flex flex-col gap-4' },
                    [
                      l(
                        'img',
                        { alt: M(s, 'name'), src: M(s, 'previewSrc') },
                        {
                          class:
                            'border border-blue-gray-400 border bg-white w-full aspect-[97/66] transition-shadow hover:shadow-card',
                        },
                        null,
                        3,
                        null
                      ),
                      l(
                        'div',
                        null,
                        { class: 'flex flex-col gap-2' },
                        [
                          l(
                            'div',
                            null,
                            { class: 'text-blue-gray-900 text-2xl font-bold' },
                            M(s, 'name'),
                            1,
                            null
                          ),
                          l(
                            'div',
                            null,
                            { class: 'max-w-full truncate' },
                            l(
                              'a',
                              { href: `https://${s.url}` },
                              { class: 'text-xl font-semibold text-ui-blue' },
                              M(s, 'url'),
                              1,
                              null
                            ),
                            1,
                            null
                          ),
                        ],
                        1,
                        null
                      ),
                    ],
                    1,
                    'LU_1'
                  )
                ),
                1,
                null
              ),
              $(
                U,
                {
                  class: 'w-full md:w-auto',
                  get theme() {
                    return P.SOLID;
                  },
                  children: x('showcase.action@@See more showcases'),
                  href: t('/showcase'),
                  type: 'link',
                  [d]: { class: d, theme: d, type: d },
                },
                1,
                'LU_2'
              ),
            ],
            1,
            null
          ),
        ],
        [d]: { padding: d, theme: d },
      },
      1,
      'LU_3'
    );
  },
  Bm = R(j(Um, 's_VoSI6o07IFI')),
  Wm = '',
  Qm = l(
    'svg',
    null,
    {
      fill: 'none',
      viewBox: '0 0 177 214',
      xmlns: 'http://www.w3.org/2000/svg',
    },
    [
      l(
        'path',
        null,
        {
          d: 'M88.014 214L176.027 160.535V53.7791L87.7632 0.137299V0.135742L9.1323e-06 53.7781L0 161.063L88.014 214Z',
          fill: 'url(#paint0_linear_934_4043)',
        },
        null,
        3,
        null
      ),
      l(
        'defs',
        null,
        null,
        l(
          'linearGradient',
          null,
          {
            gradientUnits: 'userSpaceOnUse',
            id: 'paint0_linear_934_4043',
            x1: '117.532',
            x2: '63.1646',
            y1: '257.73',
            y2: '76.2585',
          },
          [
            l('stop', null, { 'stop-color': '#CEC7FF' }, null, 3, null),
            l(
              'stop',
              null,
              { offset: '1', 'stop-color': '#B8AEFB' },
              null,
              3,
              null
            ),
          ],
          3,
          null
        ),
        3,
        null
      ),
    ],
    3,
    'Gd_0'
  ),
  Km = l(
    'svg',
    null,
    {
      fill: 'none',
      viewBox: '0 0 315 383',
      xmlns: 'http://www.w3.org/2000/svg',
    },
    [
      l(
        'path',
        null,
        {
          d: 'M157.354 0L0.00195268 95.5868L0 95.588L0.00195268 95.5892L0.00195358 286.447L157.802 382.349V382.353L157.804 382.351L314.707 286.449V94.6425L157.354 0Z',
          fill: 'url(#paint0_linear_934_4042)',
        },
        null,
        3,
        null
      ),
      l(
        'defs',
        null,
        null,
        l(
          'linearGradient',
          null,
          {
            gradientUnits: 'userSpaceOnUse',
            id: 'paint0_linear_934_4042',
            x1: '134.09',
            x2: '-30.2074',
            y1: '372.893',
            y2: '223.77',
          },
          [
            l('stop', null, { 'stop-color': '#71BEDB' }, null, 3, null),
            l(
              'stop',
              null,
              { offset: '1', 'stop-color': '#BDB5F3' },
              null,
              3,
              null
            ),
          ],
          3,
          null
        ),
        3,
        null
      ),
    ],
    3,
    null
  ),
  Vm = l(
    'svg',
    null,
    {
      fill: 'none',
      viewBox: '0 0 216 262',
      xmlns: 'http://www.w3.org/2000/svg',
    },
    [
      l(
        'path',
        null,
        {
          d: 'M108.18 262.001L215.999 196.503L215.999 65.725L107.873 0.0121765V0.0107422L107.872 0.0115662L0.360363 65.7242L0.360352 197.151L108.18 262.001Z',
          fill: 'url(#paint0_linear_934_4041)',
        },
        null,
        3,
        null
      ),
      l(
        'defs',
        null,
        null,
        l(
          'linearGradient',
          null,
          {
            gradientUnits: 'userSpaceOnUse',
            id: 'paint0_linear_934_4041',
            x1: '-53.9828',
            x2: '269.425',
            y1: '101.958',
            y2: '101.958',
          },
          [
            l('stop', null, { 'stop-color': '#7FC7B4' }, null, 3, null),
            l(
              'stop',
              null,
              { offset: '0.99989', 'stop-color': '#C0FFEF' },
              null,
              3,
              null
            ),
          ],
          3,
          null
        ),
        3,
        null
      ),
    ],
    3,
    null
  ),
  Zm = () => (
    W(j(Wm, 's_oIzTMtTO2NI')),
    $(
      ie,
      {
        children: [
          l(
            'div',
            null,
            { class: 'flex flex-col items-center gap-8' },
            [
              l(
                'h2',
                null,
                {
                  class:
                    'text-4xl leading-normal md:text-3xl text-blue-gray-900 font-bold mx-auto text-center leading-tight',
                },
                x('medusa.title@@Start using Module Federation with'),
                1,
                null
              ),
              $(
                U,
                {
                  class: 'w-full md:w-auto',
                  get theme() {
                    return P.SOLID;
                  },
                  children: l(
                    'div',
                    null,
                    { class: 'flex items-center gap-3 h-[18px]' },
                    l(
                      'svg',
                      null,
                      {
                        class: 'h-[32px]',
                        fill: 'none',
                        viewBox: '0 0 126 34',
                        xmlns: 'http://www.w3.org/2000/svg',
                      },
                      [
                        l(
                          'path',
                          null,
                          {
                            'clip-rule': 'evenodd',
                            d: 'M17.3857 3.08587C17.3857 3.66237 16.9267 4.12971 16.3603 4.12971C15.794 4.12971 15.3349 3.66237 15.3349 3.08587C15.3349 2.50938 15.794 2.04203 16.3603 2.04203C16.9267 2.04203 17.3857 2.50938 17.3857 3.08587ZM17.2696 5.50118C18.2234 5.12886 18.9006 4.18787 18.9006 3.08587C18.9006 1.65774 17.7633 0.5 16.3603 0.5C14.9574 0.5 13.8201 1.65773 13.8201 3.08587C13.8201 4.18813 14.4976 5.1293 15.4518 5.50144V7.191L9.95493 10.4216C9.42856 10.731 9.1043 11.3027 9.1043 11.9214V18.2811L7.85583 19.0754C7.45449 18.8051 6.97335 18.6477 6.4561 18.6477C5.05317 18.6477 3.91586 19.8055 3.91586 21.2336C3.91586 22.6618 5.05317 23.8195 6.4561 23.8195C7.85904 23.8195 8.99634 22.6618 8.99634 21.2336C8.99634 21.009 8.96822 20.7912 8.91537 20.5834L9.93152 19.9369C9.93928 19.9416 9.94708 19.9463 9.95493 19.9509L15.51 23.2158C16.0364 23.5251 16.6849 23.5251 17.2113 23.2158L22.7664 19.9509C22.824 19.917 22.8792 19.88 22.9319 19.8401L24.199 20.4581C24.1921 20.5355 24.1887 20.6138 24.1887 20.693C24.1887 22.1211 25.326 23.2789 26.7289 23.2789C28.1318 23.2789 29.2691 22.1211 29.2691 20.693C29.2691 19.2649 28.1318 18.1071 26.7289 18.1071C26.0616 18.1071 25.4544 18.3691 25.001 18.7974L23.617 18.1224L23.617 11.9214C23.617 11.3027 23.2927 10.731 22.7664 10.4216L17.2696 7.19103V5.50118ZM16.1215 8.93409H16.5998L20.8005 11.4029L16.3407 13.7509L11.6943 11.536L16.1215 8.93409ZM10.9221 13.2112V18.3826L15.4518 21.0448V15.3705L10.9221 13.2112ZM17.2696 21.0448L21.7992 18.3826V12.9604L17.2696 15.3452V21.0448ZM15.6033 28.445L15.6033 27.1224C15.5953 27.1179 15.5874 27.1133 15.5795 27.1086L11.1254 24.4648C10.7641 24.2503 10.6419 23.7782 10.8526 23.4104C11.0633 23.0425 11.5271 22.9182 11.8885 23.1327L16.3426 25.7765C16.3535 25.783 16.3669 25.783 16.3778 25.7765L20.8319 23.1327C21.1933 22.9182 21.657 23.0425 21.8678 23.4104C22.0785 23.7782 21.9563 24.2503 21.595 24.4648L17.1408 27.1086L17.1307 27.1146C17.1265 27.117 17.1223 27.1195 17.1181 27.1219V28.4453C18.1509 28.7734 18.9006 29.7546 18.9006 30.9141C18.9006 32.3423 17.7633 33.5 16.3603 33.5C14.9574 33.5 13.8201 32.3423 13.8201 30.9141C13.8201 29.7544 14.5701 28.773 15.6033 28.445ZM5.89628 9.8585C5.89628 9.84701 5.8964 9.83554 5.89664 9.82409L4.77261 9.16347C3.97702 9.90969 2.76758 10.0798 1.78129 9.50018C0.566308 8.78611 0.150026 7.20461 0.851494 5.96781C1.55296 4.731 3.10655 4.30724 4.32152 5.02131C5.30828 5.60125 5.76821 6.75334 5.53041 7.82825L6.66568 8.49548L11.1254 5.84833C11.4868 5.63383 11.9505 5.75816 12.1612 6.12601C12.372 6.49387 12.2498 6.96595 11.8885 7.18044L7.42845 9.82775C7.4177 9.83413 7.4111 9.84584 7.4111 9.8585L7.4111 15.1566C7.4111 15.5824 7.07199 15.9276 6.65369 15.9276C6.23538 15.9276 5.89628 15.5824 5.89628 15.1566L5.89628 9.8585ZM28.2482 9.16364L26.8241 10.0006L26.8241 15.1566C26.8241 15.5824 26.485 15.9276 26.0667 15.9276C25.6484 15.9276 25.3093 15.5824 25.3093 15.1566V9.8585C25.3093 9.84584 25.3027 9.83413 25.2919 9.82776L20.8319 7.18044C20.4706 6.96595 20.3484 6.49387 20.5591 6.12601C20.7699 5.75816 21.2336 5.63384 21.595 5.84833L26.055 8.49564C26.1037 8.52456 26.1505 8.55595 26.1953 8.5896L27.4909 7.82815C27.2535 6.75349 27.7135 5.60189 28.7 5.02212C29.9149 4.30805 31.4685 4.73181 32.17 5.96861C32.8715 7.20542 32.4552 8.78691 31.2402 9.50098C30.2536 10.0808 29.0438 9.9104 28.2482 9.16364ZM6.4561 22.2775C7.02242 22.2775 7.48152 21.8101 7.48152 21.2336C7.48152 20.6571 7.02242 20.1898 6.4561 20.1898C5.88978 20.1898 5.43068 20.6571 5.43068 21.2336C5.43068 21.8101 5.88978 22.2775 6.4561 22.2775ZM2.16337 6.73882C1.88021 7.23808 2.04825 7.87649 2.5387 8.16474C3.02915 8.45298 3.65628 8.28192 3.93944 7.78266C4.2226 7.2834 4.05456 6.645 3.56411 6.35675C3.07366 6.0685 2.44653 6.23956 2.16337 6.73882ZM17.3857 30.9141C17.3857 31.4906 16.9267 31.958 16.3603 31.958C15.794 31.958 15.3349 31.4906 15.3349 30.9141C15.3349 30.3376 15.794 29.8703 16.3603 29.8703C16.9267 29.8703 17.3857 30.3376 17.3857 30.9141ZM26.7289 21.7368C27.2952 21.7368 27.7543 21.2695 27.7543 20.693C27.7543 20.1165 27.2952 19.6492 26.7289 19.6492C26.1626 19.6492 25.7035 20.1165 25.7035 20.693C25.7035 21.2695 26.1626 21.7368 26.7289 21.7368ZM29.4574 6.35756C29.9478 6.06931 30.575 6.24037 30.8581 6.73963C31.1413 7.23889 30.9732 7.87729 30.4828 8.16554C29.9923 8.45379 29.3652 8.28273 29.082 7.78347C28.7989 7.28421 28.9669 6.6458 29.4574 6.35756Z',
                            fill: '#A873FF',
                            'fill-rule': 'evenodd',
                          },
                          null,
                          3,
                          null
                        ),
                        l(
                          'path',
                          null,
                          {
                            'clip-rule': 'evenodd',
                            d: 'M51.4873 28.5V8.96395C51.5491 9.01304 51.6121 9.06497 51.6763 9.11981L51.6799 9.12293L51.6836 9.12601C52.117 9.48601 52.5228 9.95938 52.8948 10.5588L52.8964 10.5613L52.898 10.5638C53.2635 11.1408 53.5749 11.8382 53.8255 12.6641L53.8268 12.6684L53.8282 12.6728C54.0829 13.4702 54.2718 14.2854 54.2718 15.3094V16.0917C54.2601 16.1033 54.2484 16.115 54.2367 16.1268C53.7674 16.6005 53.1634 17.3793 53.164 18.3317C53.1645 19.284 53.7693 20.0624 54.239 20.5358C54.4874 20.7861 54.7332 20.9863 54.9162 21.1238C55.0084 21.1931 55.0862 21.2477 55.1427 21.286C55.171 21.3052 55.194 21.3203 55.211 21.3313C55.2194 21.3368 55.2264 21.3413 55.2317 21.3447L55.2385 21.3489L55.2409 21.3505L55.2423 21.3514C55.2423 21.3514 55.2424 21.3514 55.2602 21.3265L55.2603 21.3269L55.2427 21.3516L55.2693 21.3682C55.2999 21.5218 55.3011 21.678 55.2715 21.8322C55.2022 22.1937 54.9552 22.5893 54.4254 22.9364L54.9477 23.6325C55.3187 23.3894 55.6081 23.1105 55.815 22.809C56.094 23.1368 56.4834 23.416 56.9775 23.6245L57.3519 22.8498C56.7622 22.6009 56.4407 22.2553 56.3006 21.9121C56.2204 21.7156 56.1937 21.5059 56.2202 21.2945L56.2334 21.2856C56.2898 21.2473 56.3676 21.1926 56.4597 21.1233C56.6426 20.9857 56.8882 20.7853 57.1362 20.5349C57.6055 20.0611 58.2095 19.2823 58.209 18.33C58.2085 17.3777 57.6037 16.5993 57.1339 16.1259C57.1025 16.0943 57.0713 16.0635 57.0401 16.0335V15.3094C57.0401 14.2854 57.1154 13.4702 57.3702 12.6728C57.6341 11.8467 57.9592 11.1406 58.3398 10.5478C58.7287 9.94209 59.1385 9.46364 59.5637 9.10035C59.6209 9.05149 59.677 9.00512 59.7319 8.96115V28.5H62.7084V5.5H60.5431L60.3937 5.5698C59.112 6.16866 58.0238 6.8915 57.1412 7.74417C56.5519 8.31351 56.0458 8.98522 55.6188 9.75318C55.1881 8.98426 54.6752 8.31189 54.0759 7.74219C53.1964 6.89298 52.1254 6.17135 50.873 5.57257L50.7212 5.5H48.5107V28.5H51.4873ZM74.2893 18.1591V15.5333H68.2103V11.1803C68.2103 10.4956 68.2895 9.96703 68.4256 9.57505C68.5591 9.19026 68.7505 8.92757 68.9779 8.74903L68.9789 8.74827L68.9799 8.7475C69.2408 8.54115 69.5844 8.38113 70.0351 8.28394C70.5105 8.18142 71.0931 8.12579 71.7913 8.12579H74.2685V5.5H71.3541C70.4127 5.5 69.5841 5.58077 68.8818 5.75577L68.8798 5.75625L68.8779 5.75674C68.2018 5.92904 67.6082 6.1812 67.1181 6.52827C66.6563 6.85229 66.284 7.24474 66.0114 7.70498C65.7545 8.12607 65.5701 8.57681 65.4583 9.05469C65.3526 9.50609 65.2855 9.97532 65.2557 10.4617L65.2551 10.4711L65.2548 10.4805C65.2408 10.9403 65.2337 11.3876 65.2337 11.8223V28.5H74.7889V25.8742H68.2103V18.1591H74.2893ZM87.6035 23.52L87.6035 23.5195C87.6176 23.0597 87.6246 22.6124 87.6246 22.1777V11.8223C87.6246 11.3876 87.6176 10.9403 87.6035 10.4805C87.5884 9.98515 87.5204 9.50624 87.3978 9.04506C87.2864 8.57359 87.1044 8.1286 86.8516 7.71251C86.5901 7.24513 86.2139 6.85083 85.7401 6.52808C85.2591 6.1777 84.6625 5.92688 83.9785 5.75624C83.2887 5.58068 82.473 5.5 81.5459 5.5H76.9869V28.5H81.5459C82.4739 28.5 83.2902 28.4192 83.9805 28.2433L83.9856 28.242L83.9907 28.2406C84.6691 28.0574 85.2587 27.8081 85.7339 27.4761C86.2085 27.1541 86.5877 26.7655 86.8515 26.3068C87.1039 25.8787 87.2866 25.4268 87.3984 24.9527C87.5199 24.4822 87.5883 24.0044 87.6035 23.52ZM84.4328 24.4444C84.2999 24.8272 84.108 25.1006 83.8742 25.2948C83.6317 25.4833 83.3 25.6364 82.8507 25.7341C82.3868 25.8247 81.8024 25.8742 81.0879 25.8742H79.9634V8.12579H81.0879C81.8017 8.12579 82.3821 8.18171 82.8401 8.28308L82.8421 8.28352L82.8441 8.28394C83.294 8.38097 83.6254 8.53949 83.8681 8.73912L83.8742 8.74414L83.8805 8.74903C84.1079 8.92757 84.2992 9.19026 84.4328 9.57505C84.5688 9.96702 84.6481 10.4956 84.6481 11.1803V22.8392C84.6481 23.5239 84.5688 24.0524 84.4328 24.4444ZM97.7282 27.9744L97.7308 27.9731L97.7333 27.9718C98.4377 27.6128 99.0072 27.1322 99.4232 26.5276C99.8393 25.9429 100.12 25.2778 100.275 24.5422C100.423 23.8365 100.496 23.1064 100.496 22.3528V5.5H97.5197V22.9948C97.5197 23.4268 97.4697 23.8281 97.3731 24.2008C97.2796 24.561 97.1378 24.8621 96.9551 25.1131C96.7875 25.3434 96.5648 25.5315 96.2738 25.678C96.0266 25.7968 95.6823 25.8742 95.2086 25.8742C94.706 25.8742 94.3435 25.79 94.0854 25.6608C93.7937 25.5147 93.5605 25.3254 93.377 25.0909C93.1934 24.8253 93.0544 24.5259 92.9627 24.1881C92.8782 23.8116 92.835 23.4143 92.835 22.9948V5.5H89.8585V22.3528C89.8585 23.1469 89.9391 23.9063 90.1028 24.6296L90.1031 24.6309L90.1034 24.6322C90.2718 25.3618 90.5519 26.0172 90.9534 26.5875L90.9569 26.5926L90.9606 26.5975C91.3868 27.1797 91.9438 27.6446 92.6203 27.9908L92.6261 27.9937L92.6319 27.9965C93.3424 28.3443 94.1844 28.5 95.1253 28.5C96.1184 28.5 96.999 28.3389 97.7282 27.9744ZM107.83 28.5C108.551 28.5 109.237 28.3826 109.88 28.1426C110.531 27.905 111.104 27.5673 111.591 27.1275C112.076 26.6888 112.454 26.1689 112.726 25.5747C113.018 24.9646 113.16 24.3025 113.16 23.5979V21.0385C113.16 20.3583 113.025 19.7121 112.749 19.1068C112.489 18.5346 112.146 17.9941 111.724 17.4856C111.322 16.9858 110.863 16.5161 110.348 16.0761C109.855 15.6549 109.355 15.2467 108.847 14.8515C108.406 14.5039 107.973 14.1564 107.546 13.8089C107.142 13.4808 106.781 13.1429 106.459 12.7956C106.163 12.4479 105.926 12.0943 105.746 11.7349C105.532 11.2941 105.498 10.9083 105.498 10.4216C105.498 10.0788 105.555 9.77684 105.66 9.50937C105.782 9.22116 105.943 8.98627 106.137 8.79542L106.142 8.78959L106.148 8.78362C106.342 8.58368 106.578 8.42369 106.864 8.30407C107.154 8.18868 107.487 8.12579 107.872 8.12579C108.208 8.12579 108.512 8.18603 108.792 8.30225L108.802 8.30646L108.812 8.31037C109.092 8.41672 109.322 8.56763 109.512 8.76417L109.518 8.77013L109.524 8.77596C109.72 8.96819 109.881 9.20508 110.003 9.49612L110.005 9.49997L110.006 9.50382C110.12 9.765 110.183 10.0679 110.183 10.4216V12.926H113.16V10.4021C113.16 9.72562 113.026 9.08674 112.751 8.49363C112.494 7.89678 112.122 7.37474 111.637 6.93476C111.153 6.48409 110.584 6.13359 109.936 5.88226C109.286 5.62432 108.581 5.5 107.83 5.5C107.12 5.5 106.436 5.61842 105.783 5.8565L105.78 5.85752L105.777 5.85855C105.142 6.09613 104.579 6.43276 104.095 6.86848C103.605 7.29755 103.22 7.81983 102.935 8.4244L102.934 8.42797L102.932 8.43157C102.655 9.04029 102.522 9.70005 102.522 10.4021C102.522 11.1687 102.602 11.9766 102.935 12.6862C103.209 13.2689 103.559 13.8152 103.982 14.3243L103.986 14.3288L103.99 14.3332C104.418 14.8298 104.896 15.2971 105.424 15.7354L105.428 15.7384L105.431 15.7414C105.948 16.1586 106.464 16.5694 106.98 16.9737C107.404 17.3059 107.821 17.6444 108.231 17.9893C108.621 18.317 108.961 18.6534 109.254 18.9982L109.258 19.0035L109.263 19.0089C109.56 19.3443 109.789 19.6837 109.954 20.0267C110.106 20.3407 110.183 20.6756 110.183 21.0385V23.5784C110.183 23.916 110.121 24.2226 110.003 24.5039L110.001 24.5099L109.998 24.516C109.893 24.7813 109.736 25.0157 109.525 25.2234L109.524 25.224C109.329 25.4161 109.088 25.5749 108.792 25.6978C108.52 25.8106 108.197 25.8742 107.81 25.8742C107.454 25.8742 107.141 25.8185 106.863 25.7147C106.59 25.5948 106.358 25.4396 106.163 25.2492C105.96 25.038 105.798 24.7961 105.677 24.5194C105.561 24.2414 105.498 23.93 105.498 23.5784V23.6539C105.949 23.1742 106.471 22.4389 106.47 21.5536C106.47 20.6013 105.865 19.8229 105.395 19.3495C105.147 19.0992 104.901 18.899 104.718 18.7614C104.626 18.6922 104.548 18.6376 104.491 18.5993C104.463 18.5801 104.44 18.5649 104.423 18.554C104.415 18.5485 104.408 18.544 104.402 18.5406L104.396 18.5363L104.393 18.5348L104.392 18.5339C104.392 18.5339 104.392 18.5339 104.389 18.5376C104.387 18.5409 104.382 18.5471 104.374 18.5588L104.374 18.5584L104.391 18.5337L104.365 18.5171C104.334 18.3635 104.333 18.2073 104.363 18.0531C104.432 17.6916 104.679 17.296 105.209 16.9489L104.687 16.2528C104.315 16.4959 104.026 16.7748 103.819 17.0763C103.54 16.7484 103.151 16.4692 102.657 16.2607L102.282 17.0355C102.872 17.2843 103.193 17.63 103.334 17.9732C103.414 18.1696 103.44 18.3794 103.414 18.5908L103.401 18.5997C103.344 18.638 103.267 18.6926 103.175 18.7619C102.992 18.8996 102.746 19.1 102.498 19.3504C102.029 19.8242 101.425 20.6029 101.425 21.5553C101.426 22.5076 102.031 23.286 102.5 23.7594C102.507 23.7667 102.515 23.7739 102.522 23.7811V23.5979C102.522 24.2728 102.648 24.9144 102.906 25.5165L102.908 25.523L102.911 25.5295C103.181 26.1216 103.549 26.6412 104.02 27.0807L104.024 27.0847L104.028 27.0886C104.51 27.5234 105.069 27.8658 105.701 28.1166L105.704 28.1177L105.706 28.1189C106.368 28.3753 107.079 28.5 107.83 28.5ZM122.534 28.5H125.511V5.5H121.285C119.891 5.5 118.722 5.67863 117.843 6.09618C117.025 6.479 116.379 6.99918 115.951 7.67112L115.948 7.67616L115.945 7.68126C115.556 8.31747 115.334 9.023 115.271 9.78725C115.214 10.4778 115.185 11.1562 115.185 11.8223V28.5H118.162V18.1591H122.534V28.5ZM122.534 15.5333H118.162V11.1803C118.162 10.4956 118.241 9.96703 118.377 9.57505C118.511 9.19026 118.702 8.92757 118.929 8.74903L118.93 8.74827L118.931 8.7475C119.192 8.54115 119.536 8.38113 119.987 8.28394C120.461 8.1816 121.05 8.12579 121.764 8.12579H122.534V15.5333ZM103.948 22.9918C104.036 22.9174 104.128 22.8329 104.22 22.7401C104.611 22.3459 104.866 21.9258 104.866 21.5542C104.866 21.1825 104.61 20.7625 104.219 20.3686C104.127 20.2758 104.034 20.1914 103.947 20.1171C103.86 20.1915 103.767 20.276 103.675 20.3688C103.285 20.763 103.029 21.1831 103.029 21.5548C103.03 21.9264 103.286 22.3464 103.677 22.7403C103.769 22.8331 103.861 22.9175 103.948 22.9918ZM55.414 17.1452C55.506 17.0523 55.5986 16.9679 55.6857 16.8935C55.7729 16.9678 55.8656 17.0522 55.9577 17.145C56.3486 17.5389 56.6046 17.9589 56.6048 18.3305C56.605 18.7022 56.3494 19.1223 55.9589 19.5165C55.867 19.6093 55.7744 19.6938 55.6872 19.7682C55.6 19.6939 55.5073 19.6094 55.4153 19.5167C55.0244 19.1227 54.7683 18.7028 54.7681 18.3311C54.7679 17.9595 55.0235 17.5394 55.414 17.1452Z',
                            fill: 'white',
                            'fill-rule': 'evenodd',
                          },
                          null,
                          3,
                          null
                        ),
                      ],
                      3,
                      null
                    ),
                    3,
                    null
                  ),
                  href: 'https://www.medusa.codes',
                  type: 'link',
                  [d]: { class: d, href: d, theme: d, type: d },
                },
                3,
                'Zt_0'
              ),
            ],
            1,
            null
          ),
          l(
            'div',
            { 'q:slot': 'background' },
            { class: 'relative w-11/12 h-full max-w-1225 mx-auto' },
            [
              l(
                'div',
                null,
                {
                  class: 'absolute w-32 md:w-44 top-0 left-0 -translate-y-2/3 ',
                },
                Qm,
                3,
                null
              ),
              l(
                'div',
                null,
                {
                  class:
                    'absolute w-48 md:w-80 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ',
                },
                Km,
                3,
                null
              ),
              l(
                'div',
                null,
                {
                  class:
                    'absolute w-32 md:w-44 bottom-0 right-0 translate-y-2/3 ',
                },
                Vm,
                3,
                null
              ),
            ],
            3,
            null
          ),
          l(
            'div',
            { 'q:slot': 'background-no-overlay' },
            null,
            [
              $(
                ee,
                {
                  class: 'absolute w-1/4 top-[55%] md:top-[60%] left-0',
                  showStart: !1,
                  [d]: { class: d, showStart: d },
                },
                3,
                'Zt_1'
              ),
              $(
                ee,
                {
                  class:
                    'absolute w-24 md:w-64 top-0 right-[26px] md:right-[14%] rotate-90 origin-left translate-x-full  md:translate-x-1/2 -translate-y-1/2',
                  showStart: !1,
                  [d]: { class: d, showStart: d },
                },
                3,
                'Zt_2'
              ),
            ],
            1,
            null
          ),
        ],
        id: 'medusa',
        [d]: { id: d },
      },
      1,
      'Zt_3'
    )
  ),
  Ym = R(j(Zm, 's_eh3Zleb9svU')),
  Gm = '',
  Xm = (e) => {
    const [t, n] = Ie(),
      s = e.target,
      o = new FormData(s);
    o.get('companyEmail') &&
      o.get('name') &&
      o.get('howCanWeHelp') &&
      ((t.value = !0),
      (n.value = !1),
      fetch('/docs/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(o).toString(),
      })
        .then(() => {
          (n.value = !0), (t.value = !1), s.reset();
        })
        .catch((r) => (t.value = !1)));
  },
  Jm = () => {
    W(j(Gm, 's_Z790sFa7bTY'));
    const e = pe(!1),
      t = pe(!1),
      n = rt(),
      s = (a) => _t(a, n),
      o = j(Xm, 's_kK15dHxr40k', [e, t]),
      r = x('contact.title@@Talk to our experts');
    return $(
      ie,
      {
        class: 'scroll-mt-32',
        id: 'contact',
        get theme() {
          return I.OPAQUE;
        },
        children: [
          $(
            xt,
            { 'q:slot': 'header', title: r, [d]: { 'q:slot': d } },
            3,
            'Ia_0'
          ),
          l(
            'div',
            null,
            { class: 'flex flex-col lg:flex-row gap-10 ' },
            [
              l(
                'div',
                null,
                { class: 'flex flex-col items-center gap-4 flex-1 w-50' },
                [
                  l(
                    'form',
                    null,
                    {
                      class:
                        'flex-1 w-50 bg-[#EFEFFF] w-full flex flex-col md:grid md:grid-cols-2 gap-4 p-6',
                      onSubmit$: Re('s_6VMpNf7ZCJ0', [o]),
                      'preventdefault:submit': !0,
                    },
                    [
                      l(
                        'input',
                        null,
                        { name: 'form-name', type: 'hidden', value: 'contact' },
                        null,
                        3,
                        null
                      ),
                      l(
                        'div',
                        null,
                        { class: 'flex flex-col gap-1' },
                        [
                          l(
                            'label',
                            null,
                            {
                              class: 'text-blue-gray-500',
                              for: 'companyEmail',
                            },
                            x(
                              'contact.form.company-email.label@@Company email'
                            ),
                            1,
                            null
                          ),
                          l(
                            'input',
                            null,
                            {
                              class:
                                'min-h-[44px] w-full border-blue-gray-500 px-4 py-1.5 pr-8 bg-white  focus:border-ui-blue',
                              id: 'companyEmail',
                              name: 'companyEmail',
                              type: 'email',
                            },
                            null,
                            3,
                            null
                          ),
                        ],
                        1,
                        null
                      ),
                      l(
                        'div',
                        null,
                        { class: 'flex flex-col gap-1' },
                        [
                          l(
                            'label',
                            null,
                            {
                              class: 'text-blue-gray-500',
                              for: 'companyEmail',
                            },
                            x('contact.form.name.label@@Your name'),
                            1,
                            null
                          ),
                          l(
                            'input',
                            null,
                            {
                              class:
                                'min-h-[44px] w-full border-blue-gray-500 px-4 py-1.5 pr-8 bg-white  focus:border-ui-blue',
                              id: 'name',
                              name: 'name',
                              type: 'text',
                            },
                            null,
                            3,
                            null
                          ),
                        ],
                        1,
                        null
                      ),
                      l(
                        'div',
                        null,
                        { class: 'flex flex-col gap-1' },
                        [
                          l(
                            'label',
                            null,
                            { class: 'text-blue-gray-500', for: 'companySize' },
                            x('contact.form.company-size.label@@Company size'),
                            1,
                            null
                          ),
                          l(
                            'input',
                            null,
                            {
                              class:
                                'min-h-[44px] w-full border-blue-gray-500 px-4 py-1.5 pr-8 bg-white  focus:border-ui-blue',
                              id: 'companySize',
                              name: 'companySize',
                              type: 'text',
                            },
                            null,
                            3,
                            null
                          ),
                        ],
                        1,
                        null
                      ),
                      l(
                        'div',
                        null,
                        { class: 'flex flex-col gap-1 text-blue-gray-500' },
                        [
                          l(
                            'label',
                            null,
                            {
                              class: 'text-blue-gray-500',
                              for: 'companyWebsite',
                            },
                            x(
                              'contact.form.company-website.label@@Company website'
                            ),
                            1,
                            null
                          ),
                          l(
                            'input',
                            null,
                            {
                              class:
                                'min-h-[44px] w-full border-blue-gray-500 px-4 py-1.5 pr-8 bg-white  focus:border-ui-blue',
                              id: 'companyWebsite',
                              name: 'companyWebsite',
                              type: 'text',
                            },
                            null,
                            3,
                            null
                          ),
                        ],
                        1,
                        null
                      ),
                      l(
                        'div',
                        null,
                        { class: 'flex flex-col gap-1 col-span-2' },
                        [
                          l(
                            'label',
                            null,
                            {
                              class: 'text-blue-gray-500',
                              for: 'howCanWeHelp',
                            },
                            x(
                              'contact.form.how-can-we-help-you.label@@How can we help you?'
                            ),
                            1,
                            null
                          ),
                          l(
                            'textarea',
                            null,
                            {
                              class:
                                'min-h-[44px] w-full border-blue-gray-500 px-4 py-1.5 pr-8 bg-white  focus:border-ui-blue',
                              id: 'howCanWeHelp',
                              name: 'howCanWeHelp',
                              rows: 4,
                            },
                            null,
                            3,
                            null
                          ),
                        ],
                        1,
                        null
                      ),
                      l(
                        'div',
                        null,
                        { class: 'flex justify-end items-center col-span-2' },
                        [
                          t.value &&
                            l(
                              'div',
                              null,
                              { class: 'text-sm pr-6 text-green-700' },
                              'Form submitted successfully!',
                              3,
                              'Ia_1'
                            ),
                          $(
                            U,
                            {
                              class: 'w-full md:w-auto md:min-w-[200px]',
                              get theme() {
                                return P.SOLID;
                              },
                              type: 'submit',
                              get loading() {
                                return e.value;
                              },
                              children: x('contact.form.action@@Submit'),
                              small: !0,
                              [d]: {
                                class: d,
                                loading: H((a) => a.value, [e], 'p0.value'),
                                small: d,
                                theme: d,
                                type: d,
                              },
                            },
                            1,
                            'Ia_2'
                          ),
                        ],
                        1,
                        null
                      ),
                    ],
                    1,
                    null
                  ),
                  l(
                    'div',
                    null,
                    {
                      class:
                        'text-blue-gray-900 font-normal max-w-sm text-center text-lg leading-tight',
                    },
                    [
                      x(
                        'contact.disclaimer.text@@By submitting this form, I confirm that I have read and understood the'
                      ),
                      ' ',
                      l(
                        'a',
                        { href: s('/privacy-policy') },
                        { class: 'text-ui-blue' },
                        x('contact.disclaimer.action@@Privacy & Policy'),
                        1,
                        null
                      ),
                      '.',
                    ],
                    1,
                    null
                  ),
                ],
                1,
                null
              ),
              l(
                'div',
                null,
                { class: 'flex flex-col gap-10 flex-1 w-50' },
                [
                  l(
                    'div',
                    null,
                    {
                      class:
                        'text-blue-gray-900 text-3xl font-medium text-center md:text-left leading-normal',
                    },
                    x(
                      'contact.quote.text@@There are now 4000 companies using Module Federation in a detectable way. Likely many more who we cannot trace, but 4000 is still an impressive number of known entities.'
                    ),
                    1,
                    null
                  ),
                  l(
                    'div',
                    null,
                    {
                      class:
                        'flex items-center justify-center md:justify-start gap-4',
                    },
                    [
                      l(
                        'img',
                        null,
                        {
                          alt: x('contact.quote.author.name@@Zack Jackson'),
                          class: 'w-12 h-12',
                          src: '/photos/zack_jackson.png',
                        },
                        null,
                        3,
                        null
                      ),
                      l(
                        'div',
                        null,
                        null,
                        [
                          l(
                            'div',
                            null,
                            { class: 'text-blue-gray-900 font-bold text-lg' },
                            x('contact.quote.author.name@@Zack Jackson'),
                            1,
                            null
                          ),
                          l(
                            'div',
                            null,
                            { class: 'text-blue-gray-900 font-normal text-lg' },
                            x(
                              'contact.quote.author.title@@the сreator of Module Federation'
                            ),
                            1,
                            null
                          ),
                        ],
                        1,
                        null
                      ),
                    ],
                    1,
                    null
                  ),
                ],
                1,
                null
              ),
            ],
            1,
            null
          ),
        ],
        [d]: { class: d, id: d, theme: d },
      },
      1,
      'Ia_3'
    );
  },
  e1 = R(j(Jm, 's_tVi0Ug0Y1rA')),
  t1 = '',
  n1 = () => {
    W(j(t1, 's_dVIPHMdh004'));
    const e = x('banner.title@@Enterprise Support & Training');
    return $(
      ie,
      {
        class: 'scroll-mt-32 pb-1',
        id: 'banner',
        get theme() {
          return I.OPAQUE;
        },
        children: [
          $(
            xt,
            { 'q:slot': 'header', title: e, [d]: { 'q:slot': d } },
            3,
            '2i_0'
          ),
          l(
            'div',
            null,
            { class: 'flex flex-col lg:flex-row gap-12' },
            [
              l(
                'div',
                null,
                { class: 'flex flex-col items-start justify-center' },
                l(
                  'img',
                  null,
                  {
                    alt: x('ValorSoftware'),
                    class: 'w-195.8 h-113.8 mr-6',
                    src: '/valor.svg',
                  },
                  null,
                  3,
                  null
                ),
                3,
                null
              ),
              l(
                'div',
                null,
                { class: 'flex flex-col gap-4 flex-1 w-50' },
                [
                  l(
                    'div',
                    null,
                    {
                      class:
                        'text-blue-gray-900 text-2xl font-medium text-center md:text-left leading-normal',
                    },
                    x(
                      'banner.text.firstLine@@At Valor, we are delighted to be the exclusive support partners for Module Federation - a technology created by Zack Jackson that has revolutionized modern development.'
                    ),
                    1,
                    null
                  ),
                  l(
                    'div',
                    null,
                    {
                      class:
                        'text-blue-gray-900 text-2xl font-medium text-center md:text-left leading-normal',
                    },
                    x(
                      "banner.text.secondLine@@Our collaboration and status as core team members has enabled us to reduce the community's reliance on a single individual, as well as bring greater value to OSS."
                    ),
                    1,
                    null
                  ),
                ],
                1,
                null
              ),
            ],
            1,
            null
          ),
        ],
        [d]: { class: d, id: d, theme: d },
      },
      1,
      '2i_1'
    );
  },
  s1 = R(j(n1, 's_HdsYayhDkLg')),
  o1 =
    '@keyframes slide{0%{transform:translateZ(0)}to{transform:translate3d(-50%,0,0)}}.animation-container{position:relative}.animated{position:absolute;top:0;left:0;width:100%;animation-direction:normal;animation-fill-mode:none;animation-play-state:running}.animated--0{animation:slide 30s linear infinite}.animated--1{animation:slide 40s linear infinite}',
  r1 = [
    [
      { name: 'Shopify Partners', src: '/companies/shopify.svg' },
      { name: 'Cloudflare', src: '/companies/cloudflare.svg' },
      { name: 'Lululemon', src: '/companies/lululemon.svg' },
      { name: 'Adidas', src: '/companies/adidas.svg' },
      { name: 'Zoominfo', src: '/companies/zoominfo.svg' },
      { name: 'Business Insider', src: '/companies/business_insider.svg' },
    ],
    [
      { name: 'Box', src: '/companies/box.svg' },
      { name: 'Best Buy', src: '/companies/bestbuy.svg' },
      { name: 'Panda Doc', src: '/companies/pandadoc.svg' },
      { name: 'TikTok', src: '/companies/tiktok.svg' },
      { name: 'Epic Games', src: '/companies/epic_games.svg' },
      { name: 'Seemrush', src: '/companies/katman.svg' },
      { name: 'Openclassroom', src: '/companies/openclassrooms.svg' },
    ],
  ],
  l1 = () => (
    W(j(o1, 's_ZwZ0qjzCTZQ')),
    $(
      ie,
      {
        fullWidth: !0,
        get theme() {
          return I.OPAQUE;
        },
        children: l(
          'div',
          null,
          { class: 'flex flex-col gap-8' },
          [
            r1.map((e, t) =>
              l(
                'div',
                null,
                { class: 'overflow-hidden w-full animation-container h-12' },
                l(
                  'div',
                  { class: `flex justify-between animated animated--${t}` },
                  null,
                  [...e, ...e, ...e].map((n) =>
                    l(
                      'img',
                      { alt: M(n, 'name'), src: M(n, 'src') },
                      { class: 'h-12 px-16' },
                      null,
                      3,
                      n.name + '0'
                    )
                  ),
                  1,
                  t
                ),
                1,
                'xz_0'
              )
            ),
            l('div', null, null, null, 3, null),
          ],
          1,
          null
        ),
        [d]: { fullWidth: d, theme: d },
      },
      1,
      'xz_1'
    )
  ),
  a1 = R(j(l1, 's_5qyIIEjMPSA')),
  i1 = l(
    'svg',
    null,
    {
      fill: 'none',
      viewBox: '0 0 205 249',
      xmlns: 'http://www.w3.org/2000/svg',
    },
    [
      l(
        'path',
        null,
        {
          d: 'M203.902 61.7793L102.203 0L0.506512 61.7776L0.00146455 61.4707L0.00146455 62.0844L0 62.0853L0.00146455 62.0862L0.00146514 186.051L102.494 248.34V248.342L102.496 248.341L204.405 186.052V61.4717L203.902 61.7793Z',
          fill: 'url(#paint0_linear_934_4040)',
          'fill-opacity': '0.8',
        },
        null,
        3,
        null
      ),
      l(
        'defs',
        null,
        null,
        l(
          'linearGradient',
          null,
          {
            gradientUnits: 'userSpaceOnUse',
            id: 'paint0_linear_934_4040',
            x1: '87.0925',
            x2: '-19.6202',
            y1: '242.198',
            y2: '145.341',
          },
          [
            l('stop', null, { 'stop-color': '#7B6EDF' }, null, 3, null),
            l(
              'stop',
              null,
              { offset: '1', 'stop-color': '#D6D3EE' },
              null,
              3,
              null
            ),
          ],
          3,
          null
        ),
        3,
        null
      ),
    ],
    3,
    '7N_0'
  ),
  c1 = l(
    'svg',
    null,
    {
      fill: 'none',
      viewBox: '0 0 232 281',
      xmlns: 'http://www.w3.org/2000/svg',
    },
    [
      l(
        'path',
        null,
        {
          d: 'M0.569489 210.893L115.532 280.73L230.491 210.895L231.062 211.242V210.548L231.064 210.547L231.062 210.547L231.062 70.4147L115.203 0.0015564V0L115.201 0.000823974L1.19875e-05 70.4139L0 211.241L0.569489 210.893Z',
          fill: 'url(#paint0_angular_934_4039)',
        },
        null,
        3,
        null
      ),
      l(
        'defs',
        null,
        null,
        l(
          'radialGradient',
          null,
          {
            cx: '0',
            cy: '0',
            gradientTransform:
              'translate(115.04 109.24) rotate(0.425566) scale(159.212 168.057)',
            gradientUnits: 'userSpaceOnUse',
            id: 'paint0_angular_934_4039',
            r: '1',
          },
          [
            l(
              'stop',
              null,
              { offset: '0.244792', 'stop-color': '#63C4E7' },
              null,
              3,
              null
            ),
            l(
              'stop',
              null,
              { offset: '0.924021', 'stop-color': '#A8F9E4' },
              null,
              3,
              null
            ),
          ],
          3,
          null
        ),
        3,
        null
      ),
    ],
    3,
    null
  ),
  u1 = l(
    'svg',
    null,
    {
      fill: 'none',
      viewBox: '0 0 177 214',
      xmlns: 'http://www.w3.org/2000/svg',
    },
    [
      l(
        'path',
        null,
        {
          d: 'M88.014 214L176.027 160.534V53.7791L87.7632 0.137299V0.135742L9.1323e-06 53.7781L0 161.063L88.014 214Z',
          fill: 'url(#paint0_linear_934_4038)',
        },
        null,
        3,
        null
      ),
      l(
        'defs',
        null,
        null,
        l(
          'linearGradient',
          null,
          {
            gradientUnits: 'userSpaceOnUse',
            id: 'paint0_linear_934_4038',
            x1: '175.628',
            x2: '-2.46189',
            y1: '155.359',
            y2: '48.8542',
          },
          [
            l('stop', null, { 'stop-color': '#9589EC' }, null, 3, null),
            l(
              'stop',
              null,
              { offset: '1', 'stop-color': '#ABF0DE' },
              null,
              3,
              null
            ),
          ],
          3,
          null
        ),
        3,
        null
      ),
    ],
    3,
    null
  ),
  d1 = '',
  p1 = () => (
    W(j(d1, 's_prGAgB6H1F4')),
    $(
      ie,
      {
        children: [
          l(
            'div',
            null,
            { class: 'flex flex-col items-center gap-8' },
            [
              l(
                'h2',
                null,
                {
                  class:
                    'text-4xl leading-normal md:text-3xl text-blue-gray-900 font-bold max-w-lg mx-auto text-center leading-tight',
                },
                x('sponsor.title@@Sponsor Module Federation!'),
                1,
                null
              ),
              l(
                'p',
                null,
                {
                  class: 'text-blue-gray-900 font-medium text-lg text-center',
                  dangerouslySetInnerHTML: x(
                    'sponsor.subtitle@@Module Federation offers the chance to be part of a technology community making a positive impact<br> and receive benefits and recognition opportunities in return.'
                  ),
                },
                null,
                3,
                null
              ),
              $(
                U,
                {
                  class: 'w-full md:w-auto',
                  get theme() {
                    return P.SOLID;
                  },
                  children: x('sponsor.action@@Become a sponsor'),
                  href: 'https://opencollective.com/module-federation-universe',
                  type: 'link',
                  [d]: { class: d, href: d, theme: d, type: d },
                },
                1,
                'TC_0'
              ),
            ],
            1,
            null
          ),
          l(
            'div',
            { 'q:slot': 'background' },
            { class: 'relative w-11/12 h-full max-w-1225 mx-auto' },
            [
              l(
                'div',
                null,
                {
                  class:
                    'absolute w-40 top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 ',
                },
                i1,
                3,
                null
              ),
              l(
                'div',
                null,
                { class: 'absolute w-56 bottom-0 left-[60%] translate-y-1/3 ' },
                c1,
                3,
                null
              ),
              l(
                'div',
                null,
                {
                  class:
                    'absolute w-36 top-0 right-0 -translate-x-1/3 -translate-y-1/2 ',
                },
                u1,
                3,
                null
              ),
            ],
            3,
            null
          ),
          l(
            'div',
            { 'q:slot': 'background-no-overlay' },
            null,
            [
              $(
                ee,
                {
                  class: 'absolute w-1/4 top-[25%] right-0',
                  showEnd: !1,
                  [d]: { class: d, showEnd: d },
                },
                3,
                'TC_1'
              ),
              $(
                ee,
                {
                  class:
                    'absolute w-52 bottom-0 left-[14%] rotate-90 origin-right -translate-x-full translate-y-1/2',
                  showEnd: !1,
                  [d]: { class: d, showEnd: d },
                },
                3,
                'TC_2'
              ),
            ],
            1,
            null
          ),
        ],
        id: 'sponsor',
        [d]: { id: d },
      },
      1,
      'TC_3'
    )
  ),
  m1 = R(j(p1, 's_D0iY34otgb0')),
  f1 = () =>
    $(
      $e,
      {
        children: [
          $(ao, null, 3, 'uo_0'),
          $(fm, null, 3, 'uo_1'),
          $(bm, null, 3, 'uo_2'),
          $(Sm, null, 3, 'uo_3'),
          $(Tm, null, 3, 'uo_4'),
          $(Am, null, 3, 'uo_5'),
          $(Fm, null, 3, 'uo_6'),
          $(a1, null, 3, 'uo_7'),
          $(Bm, null, 3, 'uo_8'),
          $(Ym, null, 3, 'uo_9'),
          $(s1, null, 3, 'uo_10'),
          $(e1, null, 3, 'uo_11'),
          $(m1, null, 3, 'uo_12'),
          $(io, null, 3, 'uo_13'),
        ],
      },
      1,
      'uo_14'
    ),
  h1 = R(j(f1, 's_bOB0JnUCSKY')),
  g1 = {
    title: 'app.title',
    meta: [
      { name: 'description', content: 'app.meta.description' },
      { property: 'og:image', content: '/default-og.png' },
    ],
  },
  y1 = Object.freeze(
    Object.defineProperty(
      { __proto__: null, default: h1, head: g1 },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  ),
  $1 = [],
  ss = () => vp,
  b1 = [
    [
      '[...lang]/privacy-policy/',
      [ss, () => nm],
      '/[...lang]/privacy-policy/',
      ['q-9THZec9p.js', 'q-oetCl3_F.js'],
    ],
    [
      '[...lang]/showcase/',
      [ss, () => lm],
      '/[...lang]/showcase/',
      ['q-9THZec9p.js', 'q-pgd5M9oM.js'],
    ],
    [
      '[...lang]',
      [ss, () => y1],
      '/[...lang]',
      ['q-9THZec9p.js', 'q-c2pXVZkc.js'],
    ],
  ],
  w1 = [],
  v1 = !0,
  Yl = '/',
  _1 = !0,
  x1 = {
    routes: b1,
    serverPlugins: $1,
    menus: w1,
    trailingSlash: v1,
    basePathname: Yl,
    cacheModules: _1,
  },
  k1 =
    '((i,a,r,s)=>{r=e=>{const t=document.querySelector("[q\\\\:base]");t&&a.active&&a.active.postMessage({type:"qprefetch",base:t.getAttribute("q:base"),...e})},document.addEventListener("qprefetch",e=>{const t=e.detail;a?r(t):i.push(t)}),navigator.serviceWorker.register("/service-worker.js").then(e=>{s=()=>{a=e,i.forEach(r),r({bundles:i})},e.installing?e.installing.addEventListener("statechange",t=>{t.target.state=="activated"&&s()}):e.active&&s()}).catch(e=>console.error(e))})([])',
  S1 = Ee('qc-s'),
  q1 = Ee('qc-c'),
  Gl = Ee('qc-ic'),
  Xl = Ee('qc-h'),
  Jl = Ee('qc-l'),
  C1 = Ee('qc-n'),
  j1 = Ee('qc-a'),
  T1 = Ee('qc-ir'),
  E1 = (e) => {
    const t = window,
      n = location.pathname + location.search,
      s = '_qCitySPA',
      o = '_qCityHistoryPatch',
      r = '_qCityBootstrap',
      a = '_qCityInitPopstate',
      i = '_qCityInitAnchors',
      c = '_qCityInitVisibility',
      u = '_qCityInitScroll',
      p = '_qCityScrollEnabled',
      f = '_qCityScrollDebounce',
      m = '_qCityScroll',
      g = (h) => {
        h && t.scrollTo(h.x, h.y);
      },
      b = () => {
        const h = document.documentElement;
        return {
          x: h.scrollLeft,
          y: h.scrollTop,
          w: Math.max(h.scrollWidth, h.clientWidth),
          h: Math.max(h.scrollHeight, h.clientHeight),
        };
      },
      w = (h) => {
        const y = history.state || {};
        (y[m] = h || b()), history.replaceState(y, '');
      };
    if (!t[s] && !t[a] && !t[i] && !t[c] && !t[u]) {
      if (
        (w(),
        (t[a] = () => {
          var h;
          if (!t[s]) {
            if (
              ((t[p] = !1),
              clearTimeout(t[f]),
              n !== location.pathname + location.search)
            ) {
              const k = e
                .closest('[q\\:container]')
                .querySelector('a[q\\:key="AD_1"]');
              if (k) {
                const _ = k.closest('[q\\:container]'),
                  v = k.cloneNode();
                v.setAttribute('q:nbs', ''),
                  (v.style.display = 'none'),
                  _.appendChild(v),
                  (t[r] = v),
                  v.click();
              } else location.reload();
            } else if (history.scrollRestoration === 'manual') {
              const y = (h = history.state) == null ? void 0 : h[m];
              g(y), (t[p] = !0);
            }
          }
        }),
        !t[o])
      ) {
        t[o] = !0;
        const h = history.pushState,
          y = history.replaceState,
          k = (_) => (
            _ === null || typeof _ > 'u'
              ? (_ = {})
              : (_ == null ? void 0 : _.constructor) !== Object &&
                (_ = { _data: _ }),
            (_._qCityScroll = _._qCityScroll || b()),
            _
          );
        (history.pushState = (_, v, q) => (
          (_ = k(_)), h.call(history, _, v, q)
        )),
          (history.replaceState = (_, v, q) => (
            (_ = k(_)), y.call(history, _, v, q)
          ));
      }
      (t[i] = (h) => {
        if (t[s] || h.defaultPrevented) return;
        const y = h.target.closest('a[href]');
        if (y && !y.hasAttribute('preventdefault:click')) {
          const k = y.getAttribute('href'),
            _ = new URL(location.href),
            v = new URL(k, _),
            q = v.origin === _.origin,
            E = v.pathname + v.search === _.pathname + _.search;
          if (q && E)
            if (
              (h.preventDefault(),
              v.href !== _.href && history.pushState(null, '', v),
              !v.hash)
            )
              v.href.endsWith('#')
                ? window.scrollTo(0, 0)
                : ((t[p] = !1),
                  clearTimeout(t[f]),
                  w({ ...b(), x: 0, y: 0 }),
                  location.reload());
            else {
              const S = v.hash.slice(1),
                T = document.getElementById(S);
              T && T.scrollIntoView();
            }
        }
      }),
        (t[c] = () => {
          !t[s] && t[p] && document.visibilityState === 'hidden' && w();
        }),
        (t[u] = () => {
          t[s] ||
            !t[p] ||
            (clearTimeout(t[f]),
            (t[f] = setTimeout(() => {
              w(), (t[f] = void 0);
            }, 200)));
        }),
        (t[p] = !0),
        setTimeout(() => {
          addEventListener('popstate', t[a]),
            addEventListener('scroll', t[u], { passive: !0 }),
            document.body.addEventListener('click', t[i]),
            t.navigation ||
              document.addEventListener('visibilitychange', t[c], {
                passive: !0,
              });
        }, 0);
    }
  },
  L1 = j(E1, 's_DyVc0YBIqQU'),
  N1 = () => {
    {
      const [e, t] = En().chunkForSymbol(L1.getSymbol(), null),
        n = Yl + 'build/' + t;
      return `(${A1.toString()})('${n}','${e}');`;
    }
  },
  A1 = async (e, t) => {
    var n;
    if (!window._qcs && history.scrollRestoration === 'manual') {
      window._qcs = !0;
      const s = (n = history.state) == null ? void 0 : n._qCityScroll;
      s && window.scrollTo(s.x, s.y);
      const o = document.currentScript;
      (await import(e))[t](o);
    }
  },
  z1 = () => {
    const e = N1();
    vt();
    const t = Pt('nonce'),
      n = Rn(Gl);
    if (n.value && n.value.length > 0) {
      const s = n.value.length;
      let o = null;
      for (let r = s - 1; r >= 0; r--)
        n.value[r].default &&
          (o = $(n.value[r].default, { children: o }, 1, 'zl_0'));
      return $(
        $e,
        {
          children: [
            o,
            l(
              'script',
              { dangerouslySetInnerHTML: e },
              { nonce: t },
              null,
              3,
              null
            ),
          ],
        },
        1,
        'zl_1'
      );
    }
    return Ms;
  },
  I1 = R(j(z1, 's_e0ssiDXoeAM')),
  R1 = (e, t) => new URL(e, t.href),
  M1 = (e, t) => e.origin === t.origin,
  P1 = (e, t) => e.pathname + e.search === t.pathname + t.search,
  D1 = (e) => e && typeof e.then == 'function',
  F1 = (e, t, n, s) => {
    const o = ea(),
      a = {
        head: o,
        withLocale: (i) => Do(s, i),
        resolveValue: (i) => {
          const c = i.__id;
          if (i.__brand === 'server_loader' && !(c in e.loaders))
            throw new Error(
              'You can not get the returned data of a loader that has not been executed for this request.'
            );
          const u = e.loaders[c];
          if (D1(u))
            throw new Error(
              'Loaders returning a function can not be referred to in the head function.'
            );
          return u;
        },
        ...t,
      };
    for (let i = n.length - 1; i >= 0; i--) {
      const c = n[i] && n[i].head;
      c &&
        (typeof c == 'function'
          ? nr(
              o,
              Do(s, () => c(a))
            )
          : typeof c == 'object' && nr(o, c));
    }
    return a.head;
  },
  nr = (e, t) => {
    typeof t.title == 'string' && (e.title = t.title),
      tn(e.meta, t.meta),
      tn(e.links, t.links),
      tn(e.styles, t.styles),
      tn(e.scripts, t.scripts),
      Object.assign(e.frontmatter, t.frontmatter);
  },
  tn = (e, t) => {
    if (Array.isArray(t))
      for (const n of t) {
        if (typeof n.key == 'string') {
          const s = e.findIndex((o) => o.key === n.key);
          if (s > -1) {
            e[s] = n;
            continue;
          }
        }
        e.push(n);
      }
  },
  ea = () => ({
    title: '',
    meta: [],
    links: [],
    styles: [],
    scripts: [],
    frontmatter: {},
  });
let sr;
(function (e) {
  (e[(e.EOL = 0)] = 'EOL'),
    (e[(e.OPEN_BRACKET = 91)] = 'OPEN_BRACKET'),
    (e[(e.CLOSE_BRACKET = 93)] = 'CLOSE_BRACKET'),
    (e[(e.DOT = 46)] = 'DOT'),
    (e[(e.SLASH = 47)] = 'SLASH');
})(sr || (sr = {}));
const O1 = () => Rn(Xl),
  ta = () => Rn(Jl),
  na = () => Zt(Pt('qwikcity')),
  H1 = ':root{view-transition-name:none}',
  U1 = async (e, t) => {
    const [n, s, o, r] = Ie(),
      {
        type: a = 'link',
        forceReload: i = e === void 0,
        replaceState: c = !1,
        scroll: u = !0,
      } = typeof t == 'object' ? t : { forceReload: t },
      p = o.value.dest,
      f = e === void 0 ? p : R1(e, r.url);
    if (M1(f, p) && !(!i && P1(f, p)))
      return (
        (o.value = {
          type: a,
          dest: f,
          forceReload: i,
          replaceState: c,
          scroll: u,
        }),
        (n.value = void 0),
        (r.isNavigating = !0),
        new Promise((m) => {
          s.r = m;
        })
      );
  },
  B1 = ({ track: e }) => {
    const [t, n, s, o, r, a, i, c, u, p, f] = Ie();
    async function m() {
      const [b, w] = e(() => [p.value, t.value]),
        h = Cc(''),
        y = f.url,
        k = w ? 'form' : b.type;
      b.replaceState;
      let _,
        v,
        q = null;
      if (
        ((_ = new URL(b.dest, f.url)), (q = r.loadedRoute), (v = r.response), q)
      ) {
        const [E, S, T, A] = q,
          C = T,
          L = C[C.length - 1];
        (f.prevUrl = y),
          (f.url = _),
          (f.params = { ...S }),
          (p.untrackedValue = { type: k, dest: _ });
        const z = F1(v, f, C, h);
        (n.headings = L.headings),
          (n.menu = A),
          (s.value = Zt(C)),
          (o.links = z.links),
          (o.meta = z.meta),
          (o.styles = z.styles),
          (o.scripts = z.scripts),
          (o.title = z.title),
          (o.frontmatter = z.frontmatter);
      }
    }
    return m();
  },
  W1 = (e) => {
    Dl(j(H1, 's_RPDJAz33WLA'));
    const t = na();
    if (!(t != null && t.params)) throw new Error('Missing Qwik City Env Data');
    const n = Pt('url');
    if (!n) throw new Error('Missing Qwik URL Env Data');
    const s = new URL(n),
      o = en(
        { url: s, params: t.params, isNavigating: !1, prevUrl: void 0 },
        { deep: !1 }
      ),
      r = {},
      a = pd(en(t.response.loaders, { deep: !1 })),
      i = pe({
        type: 'initial',
        dest: s,
        forceReload: !1,
        replaceState: !1,
        scroll: !0,
      }),
      c = en(ea),
      u = en({ headings: void 0, menu: void 0 }),
      p = pe(),
      f = t.response.action,
      m = f ? t.response.loaders[f] : void 0,
      g = pe(
        m
          ? {
              id: f,
              data: t.response.formData,
              output: { result: m, status: t.response.status },
            }
          : void 0
      ),
      b = j(U1, 's_fX0bDjeJa0E', [g, r, i, o]);
    return (
      Le(q1, u),
      Le(Gl, p),
      Le(Xl, c),
      Le(Jl, o),
      Le(C1, b),
      Le(S1, a),
      Le(j1, g),
      Le(T1, i),
      Vr(j(B1, 's_02wMImzEAbk', [g, u, p, c, t, b, a, r, e, i, o])),
      $(Z, null, 3, 'qY_0')
    );
  },
  Q1 = R(j(W1, 's_TxCFOy819ag')),
  K1 = (e) =>
    l(
      'script',
      { nonce: M(e, 'nonce') },
      { dangerouslySetInnerHTML: k1 },
      null,
      3,
      '1Z_0'
    ),
  V1 = async function (...e) {
    var n;
    const [t] = Ie();
    e.length > 0 && e[0] instanceof AbortSignal && e.shift();
    {
      const s = [(n = na()) == null ? void 0 : n.ev, this, Ac()].find(
        (o) =>
          o &&
          Object.prototype.hasOwnProperty.call(o, 'sharedMap') &&
          Object.prototype.hasOwnProperty.call(o, 'cookie')
      );
      return t.apply(s, e);
    }
  },
  Z1 = (e) => {
    {
      const n = e.getCaptured();
      if (n && n.length > 0 && !Nc())
        throw new Error(
          'For security reasons, we cannot serialize QRLs that capture lexical scope.'
        );
    }
    function t() {
      return j(V1, 's_wOIPfiQ04l4', [e]);
    }
    return t();
  },
  Y1 = () => {
    const e = O1(),
      t = ta();
    return $(
      $e,
      {
        children: [
          l('title', null, null, x(e.title), 1, null),
          l(
            'link',
            null,
            {
              href: H((n) => n.url.hash, [t], 'p0.url.hash'),
              rel: 'canonical',
            },
            null,
            3,
            null
          ),
          l(
            'meta',
            null,
            {
              content: 'width=device-width, initial-scale=1.0',
              name: 'viewport',
            },
            null,
            3,
            null
          ),
          l(
            'link',
            null,
            { href: '/favicon.svg', rel: 'icon', type: 'image/svg+xml' },
            null,
            3,
            null
          ),
          e.meta.map((n) =>
            Zn(
              'meta',
              { ...n, content: n.content ? x(n.content) : void 0 },
              null,
              0,
              '0Z_0'
            )
          ),
          e.links.map((n) => Zn('link', { ...n }, null, 0, '0Z_1')),
          e.styles.map((n) =>
            Zn(
              'style',
              { ...n.props, dangerouslySetInnerHTML: M(n, 'style') },
              null,
              0,
              '0Z_2'
            )
          ),
        ],
      },
      1,
      '0Z_3'
    );
  },
  G1 = R(j(Y1, 's_2Fq8wIUpq5I')),
  X1 = `.container{width:100%}@media (min-width: 640px){.container{max-width:640px}}@media (min-width: 768px){.container{max-width:768px}}@media (min-width: 1024px){.container{max-width:1024px}}@media (min-width: 1280px){.container{max-width:1280px}}@media (min-width: 1536px){.container{max-width:1536px}}*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;-o-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::-moz-placeholder,textarea::-moz-placeholder{opacity:1;color:#9ca3af}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]{display:none}[type=text],input:where(:not([type])),[type=email],[type=url],[type=password],[type=number],[type=date],[type=datetime-local],[type=month],[type=search],[type=tel],[type=time],[type=week],[multiple],textarea,select{-webkit-appearance:none;-moz-appearance:none;appearance:none;background-color:#fff;border-color:#6b7280;border-width:1px;border-radius:0;padding:.5rem .75rem;font-size:1rem;line-height:1.5rem;--tw-shadow: 0 0 #0000}[type=text]:focus,input:where(:not([type])):focus,[type=email]:focus,[type=url]:focus,[type=password]:focus,[type=number]:focus,[type=date]:focus,[type=datetime-local]:focus,[type=month]:focus,[type=search]:focus,[type=tel]:focus,[type=time]:focus,[type=week]:focus,[multiple]:focus,textarea:focus,select:focus{outline:2px solid transparent;outline-offset:2px;--tw-ring-inset: var(--tw-empty, );--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: #2563eb;--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow);border-color:#2563eb}input::-moz-placeholder,textarea::-moz-placeholder{color:#6b7280;opacity:1}input::placeholder,textarea::placeholder{color:#6b7280;opacity:1}::-webkit-datetime-edit-fields-wrapper{padding:0}::-webkit-date-and-time-value{min-height:1.5em;text-align:inherit}::-webkit-datetime-edit{display:inline-flex}::-webkit-datetime-edit,::-webkit-datetime-edit-year-field,::-webkit-datetime-edit-month-field,::-webkit-datetime-edit-day-field,::-webkit-datetime-edit-hour-field,::-webkit-datetime-edit-minute-field,::-webkit-datetime-edit-second-field,::-webkit-datetime-edit-millisecond-field,::-webkit-datetime-edit-meridiem-field{padding-top:0;padding-bottom:0}select{background-image:url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");background-position:right .5rem center;background-repeat:no-repeat;background-size:1.5em 1.5em;padding-right:2.5rem;-webkit-print-color-adjust:exact;print-color-adjust:exact}[multiple],[size]:where(select:not([size="1"])){background-image:initial;background-position:initial;background-repeat:unset;background-size:initial;padding-right:.75rem;-webkit-print-color-adjust:unset;print-color-adjust:unset}[type=checkbox],[type=radio]{-webkit-appearance:none;-moz-appearance:none;appearance:none;padding:0;-webkit-print-color-adjust:exact;print-color-adjust:exact;display:inline-block;vertical-align:middle;background-origin:border-box;-webkit-user-select:none;-moz-user-select:none;user-select:none;flex-shrink:0;height:1rem;width:1rem;color:#2563eb;background-color:#fff;border-color:#6b7280;border-width:1px;--tw-shadow: 0 0 #0000}[type=checkbox]{border-radius:0}[type=radio]{border-radius:100%}[type=checkbox]:focus,[type=radio]:focus{outline:2px solid transparent;outline-offset:2px;--tw-ring-inset: var(--tw-empty, );--tw-ring-offset-width: 2px;--tw-ring-offset-color: #fff;--tw-ring-color: #2563eb;--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}[type=checkbox]:checked,[type=radio]:checked{border-color:transparent;background-color:currentColor;background-size:100% 100%;background-position:center;background-repeat:no-repeat}[type=checkbox]:checked{background-image:url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e")}@media (forced-colors: active){[type=checkbox]:checked{-webkit-appearance:auto;-moz-appearance:auto;appearance:auto}}[type=radio]:checked{background-image:url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='3'/%3e%3c/svg%3e")}@media (forced-colors: active){[type=radio]:checked{-webkit-appearance:auto;-moz-appearance:auto;appearance:auto}}[type=checkbox]:checked:hover,[type=checkbox]:checked:focus,[type=radio]:checked:hover,[type=radio]:checked:focus{border-color:transparent;background-color:currentColor}[type=checkbox]:indeterminate{background-image:url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 16 16'%3e%3cpath stroke='white' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 8h8'/%3e%3c/svg%3e");border-color:transparent;background-color:currentColor;background-size:100% 100%;background-position:center;background-repeat:no-repeat}@media (forced-colors: active){[type=checkbox]:indeterminate{-webkit-appearance:auto;-moz-appearance:auto;appearance:auto}}[type=checkbox]:indeterminate:hover,[type=checkbox]:indeterminate:focus{border-color:transparent;background-color:currentColor}[type=file]{background:unset;border-color:inherit;border-width:0;border-radius:0;padding:0;font-size:unset;line-height:inherit}[type=file]:focus{outline:1px solid ButtonText;outline:1px auto -webkit-focus-ring-color}html{font-family:Avenir Next,Avenir Local}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: }.\\!pointer-events-none{pointer-events:none!important}.visible{visibility:visible}.invisible{visibility:hidden}.fixed{position:fixed}.absolute{position:absolute}.\\!relative{position:relative!important}.relative{position:relative}.bottom-0{bottom:0}.bottom-6{bottom:1.5rem}.bottom-\\[-6px\\]{bottom:-6px}.bottom-\\[12\\%\\]{bottom:12%}.bottom-\\[5\\%\\]{bottom:5%}.left-0{left:0}.left-1\\/2{left:50%}.left-\\[-1px\\]{left:-1px}.left-\\[-2px\\]{left:-2px}.left-\\[12\\%\\]{left:12%}.left-\\[14\\%\\]{left:14%}.left-\\[5\\%\\]{left:5%}.left-\\[60\\%\\]{left:60%}.left-full{left:100%}.right-0{right:0}.right-\\[-2px\\]{right:-2px}.right-\\[10\\%\\]{right:10%}.right-\\[12\\%\\]{right:12%}.right-\\[26px\\]{right:26px}.right-\\[5\\%\\]{right:5%}.top-0{top:0}.top-1\\/2{top:50%}.top-1\\/3{top:33.333333%}.top-6{top:1.5rem}.top-\\[-8px\\]{top:-8px}.top-\\[25\\%\\]{top:25%}.top-\\[55\\%\\]{top:55%}.top-\\[7px\\]{top:7px}.top-\\[88px\\]{top:88px}.z-10{z-index:10}.z-20{z-index:20}.z-50{z-index:50}.z-\\[60\\]{z-index:60}.z-\\[999\\]{z-index:999}.col-span-2{grid-column:span 2 / span 2}.mx-auto{margin-left:auto;margin-right:auto}.my-1{margin-top:.25rem;margin-bottom:.25rem}.my-1\\.5{margin-top:.375rem;margin-bottom:.375rem}.mr-6{margin-right:1.5rem}.mt-2{margin-top:.5rem}.mt-auto{margin-top:auto}.block{display:block}.inline-block{display:inline-block}.inline{display:inline}.flex{display:flex}.inline-flex{display:inline-flex}.grid{display:grid}.hidden{display:none}.aspect-\\[97\\/66\\]{aspect-ratio:97/66}.h-0{height:0px}.h-0\\.5{height:.125rem}.h-10{height:2.5rem}.h-12{height:3rem}.h-14{height:3.5rem}.h-16{height:4rem}.h-2{height:.5rem}.h-24{height:6rem}.h-\\[18px\\]{height:18px}.h-\\[1px\\]{height:1px}.h-\\[32px\\]{height:32px}.h-\\[3px\\]{height:3px}.h-\\[80px\\]{height:80px}.h-\\[88px\\]{height:88px}.h-full{height:100%}.h-screen{height:100vh}.min-h-\\[44px\\]{min-height:44px}.w-1\\/2{width:50%}.w-1\\/3{width:33.333333%}.w-1\\/4{width:25%}.w-11\\/12{width:91.666667%}.w-12{width:3rem}.w-14{width:3.5rem}.w-16{width:4rem}.w-2{width:.5rem}.w-20{width:5rem}.w-24{width:6rem}.w-3\\/12{width:25%}.w-3\\/4{width:75%}.w-32{width:8rem}.w-36{width:9rem}.w-40{width:10rem}.w-48{width:12rem}.w-52{width:13rem}.w-56{width:14rem}.w-6{width:1.5rem}.w-\\[30px\\]{width:30px}.w-\\[3px\\]{width:3px}.w-\\[80\\%\\]{width:80%}.w-\\[90\\%\\]{width:90%}.w-full{width:100%}.w-screen{width:100vw}.max-w-1225{max-width:1225px}.max-w-2xl{max-width:42rem}.max-w-4xl{max-width:56rem}.max-w-7xl{max-width:80rem}.max-w-full{max-width:100%}.max-w-lg{max-width:32rem}.max-w-sm{max-width:24rem}.flex-1{flex:1 1 0%}.origin-left{transform-origin:left}.origin-right{transform-origin:right}.-translate-x-1\\/2{--tw-translate-x: -50%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.-translate-x-1\\/3{--tw-translate-x: -33.333333%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.-translate-x-full{--tw-translate-x: -100%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.-translate-y-1\\/2{--tw-translate-y: -50%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.-translate-y-2\\/3{--tw-translate-y: -66.666667%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.translate-x-1\\/2{--tw-translate-x: 50%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.translate-x-1\\/3{--tw-translate-x: 33.333333%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.translate-x-full{--tw-translate-x: 100%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.translate-y-1\\/2{--tw-translate-y: 50%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.translate-y-1\\/3{--tw-translate-y: 33.333333%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.translate-y-2\\/3{--tw-translate-y: 66.666667%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.translate-y-full{--tw-translate-y: 100%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.-rotate-45{--tw-rotate: -45deg;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.-rotate-\\[30deg\\]{--tw-rotate: -30deg;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.rotate-45{--tw-rotate: 45deg;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.rotate-90{--tw-rotate: 90deg;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.rotate-\\[30deg\\]{--tw-rotate: 30deg;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.transform{transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.scroll-mt-32{scroll-margin-top:8rem}.grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}.flex-row-reverse{flex-direction:row-reverse}.flex-col{flex-direction:column}.flex-wrap{flex-wrap:wrap}.items-start{align-items:flex-start}.items-center{align-items:center}.justify-end{justify-content:flex-end}.justify-center{justify-content:center}.justify-between{justify-content:space-between}.gap-1{gap:.25rem}.gap-10{gap:2.5rem}.gap-12{gap:3rem}.gap-2{gap:.5rem}.gap-3{gap:.75rem}.gap-4{gap:1rem}.gap-5{gap:1.25rem}.gap-6{gap:1.5rem}.gap-8{gap:2rem}.gap-x-10{-moz-column-gap:2.5rem;column-gap:2.5rem}.gap-x-2{-moz-column-gap:.5rem;column-gap:.5rem}.gap-x-24{-moz-column-gap:6rem;column-gap:6rem}.gap-x-3{-moz-column-gap:.75rem;column-gap:.75rem}.gap-y-10{row-gap:2.5rem}.gap-y-12{row-gap:3rem}.gap-y-4{row-gap:1rem}.gap-y-8{row-gap:2rem}.overflow-hidden{overflow:hidden}.overflow-x-hidden{overflow-x:hidden}.overflow-y-scroll{overflow-y:scroll}.truncate{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.whitespace-nowrap{white-space:nowrap}.break-words{overflow-wrap:break-word}.rounded-full{border-radius:9999px}.border{border-width:1px}.border-0{border-width:0px}.border-solid{border-style:solid}.\\!border-blue-gray-400{--tw-border-opacity: 1 !important;border-color:rgb(148 159 197 / var(--tw-border-opacity))!important}.\\!border-blue-gray-900{--tw-border-opacity: 1 !important;border-color:rgb(28 33 53 / var(--tw-border-opacity))!important}.\\!border-transparent{border-color:transparent!important}.border-blue-gray-400{--tw-border-opacity: 1;border-color:rgb(148 159 197 / var(--tw-border-opacity))}.border-blue-gray-500{--tw-border-opacity: 1;border-color:rgb(123 132 163 / var(--tw-border-opacity))}.border-blue-gray-900{--tw-border-opacity: 1;border-color:rgb(28 33 53 / var(--tw-border-opacity))}.border-transparent{border-color:transparent}.\\!bg-blue-gray-400{--tw-bg-opacity: 1 !important;background-color:rgb(148 159 197 / var(--tw-bg-opacity))!important}.\\!bg-blue-gray-900{--tw-bg-opacity: 1 !important;background-color:rgb(28 33 53 / var(--tw-bg-opacity))!important}.\\!bg-transparent{background-color:transparent!important}.bg-\\[\\#EFEFFF\\]{--tw-bg-opacity: 1;background-color:rgb(239 239 255 / var(--tw-bg-opacity))}.bg-blue-gray-300{--tw-bg-opacity: 1;background-color:rgb(202 209 234 / var(--tw-bg-opacity))}.bg-blue-gray-400{--tw-bg-opacity: 1;background-color:rgb(148 159 197 / var(--tw-bg-opacity))}.bg-blue-gray-500{--tw-bg-opacity: 1;background-color:rgb(123 132 163 / var(--tw-bg-opacity))}.bg-blue-gray-900{--tw-bg-opacity: 1;background-color:rgb(28 33 53 / var(--tw-bg-opacity))}.bg-mf-gray{--tw-bg-opacity: 1;background-color:rgb(246 246 250 / var(--tw-bg-opacity))}.bg-transparent{background-color:transparent}.bg-white{--tw-bg-opacity: 1;background-color:rgb(255 255 255 / var(--tw-bg-opacity))}.bg-white\\/10{background-color:#ffffff1a}.bg-pattern{background-image:url(/pattern_9.png)}.bg-repeat{background-repeat:repeat}.p-0{padding:0}.p-10{padding:2.5rem}.p-12{padding:3rem}.p-4{padding:1rem}.p-6{padding:1.5rem}.px-16{padding-left:4rem;padding-right:4rem}.px-4{padding-left:1rem;padding-right:1rem}.px-6{padding-left:1.5rem;padding-right:1.5rem}.px-8{padding-left:2rem;padding-right:2rem}.py-1{padding-top:.25rem;padding-bottom:.25rem}.py-1\\.5{padding-top:.375rem;padding-bottom:.375rem}.py-14{padding-top:3.5rem;padding-bottom:3.5rem}.py-28{padding-top:7rem;padding-bottom:7rem}.py-3{padding-top:.75rem;padding-bottom:.75rem}.py-6{padding-top:1.5rem;padding-bottom:1.5rem}.py-8{padding-top:2rem;padding-bottom:2rem}.pb-1{padding-bottom:.25rem}.pb-14{padding-bottom:3.5rem}.pb-24{padding-bottom:6rem}.pr-4{padding-right:1rem}.pr-6{padding-right:1.5rem}.pr-8{padding-right:2rem}.pt-10{padding-top:2.5rem}.pt-14{padding-top:3.5rem}.text-left{text-align:left}.text-center{text-align:center}.text-right{text-align:right}.text-2xl{font-size:1.5rem;line-height:2rem}.text-3xl{font-size:1.875rem;line-height:2.25rem}.text-4xl{font-size:2.25rem;line-height:2.5rem}.text-base{font-size:1rem;line-height:1.5rem}.text-lg{font-size:1.125rem;line-height:1.75rem}.text-sm{font-size:.875rem;line-height:1.25rem}.text-xl{font-size:1.25rem;line-height:1.75rem}.font-bold{font-weight:700}.font-medium{font-weight:500}.font-normal{font-weight:400}.font-semibold{font-weight:600}.leading-normal{line-height:1.5}.leading-snug{line-height:1.375}.leading-tight{line-height:1.25}.\\!text-blue-gray-400{--tw-text-opacity: 1 !important;color:rgb(148 159 197 / var(--tw-text-opacity))!important}.\\!text-blue-gray-700{--tw-text-opacity: 1 !important;color:rgb(47 56 88 / var(--tw-text-opacity))!important}.\\!text-blue-gray-900{--tw-text-opacity: 1 !important;color:rgb(28 33 53 / var(--tw-text-opacity))!important}.\\!text-deep-purple-300{--tw-text-opacity: 1 !important;color:rgb(149 137 234 / var(--tw-text-opacity))!important}.\\!text-white{--tw-text-opacity: 1 !important;color:rgb(255 255 255 / var(--tw-text-opacity))!important}.text-blue-gray-500{--tw-text-opacity: 1;color:rgb(123 132 163 / var(--tw-text-opacity))}.text-blue-gray-900{--tw-text-opacity: 1;color:rgb(28 33 53 / var(--tw-text-opacity))}.text-deep-purple-700{--tw-text-opacity: 1;color:rgb(101 89 162 / var(--tw-text-opacity))}.text-green-700{--tw-text-opacity: 1;color:rgb(21 128 61 / var(--tw-text-opacity))}.text-ui-blue{--tw-text-opacity: 1;color:rgb(0 185 255 / var(--tw-text-opacity))}.text-white{--tw-text-opacity: 1;color:rgb(255 255 255 / var(--tw-text-opacity))}.underline{text-decoration-line:underline}.decoration-solid{text-decoration-style:solid}.decoration-1{text-decoration-thickness:1px}.underline-offset-2{text-underline-offset:2px}.opacity-0{opacity:0}.opacity-100{opacity:1}.opacity-40{opacity:.4}.opacity-70{opacity:.7}.outline-none{outline:2px solid transparent;outline-offset:2px}.outline{outline-style:solid}.outline-ui-blue{outline-color:#00b9ff}.backdrop-blur-md{--tw-backdrop-blur: blur(12px);-webkit-backdrop-filter:var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);backdrop-filter:var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia)}.backdrop-blur-xl{--tw-backdrop-blur: blur(24px);-webkit-backdrop-filter:var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);backdrop-filter:var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia)}.transition-all{transition-property:all;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.transition-opacity{transition-property:opacity;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.transition-shadow{transition-property:box-shadow;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.duration-300{transition-duration:.3s}@font-face{font-family:Avenir Local;font-style:normal;font-weight:100;src:url(/fonts/AvenirNextLTPro-UltLt.otf) format("opentype")}@font-face{font-family:Avenir Local;font-style:normal;font-weight:400;src:url(/fonts/AvenirNextLTPro-Regular.otf) format("opentype")}@font-face{font-family:Avenir Local;font-style:normal;font-weight:500;src:url(/fonts/AvenirNextLTPro-Medium.otf) format("opentype")}@font-face{font-family:Avenir Local;font-style:normal;font-weight:600;src:url(/fonts/AvenirNextLTPro-Demi.otf) format("opentype")}@font-face{font-family:Avenir Local;font-style:normal;font-weight:700;src:url(/fonts/AvenirNextLTPro-Bold.otf) format("opentype")}@font-face{font-family:Avenir Local;font-style:normal;font-weight:800;src:url(/fonts/AvenirNextLTPro-Heavy.otf) format("opentype")}.article{--tw-text-opacity: 1;color:rgb(28 33 53 / var(--tw-text-opacity))}.article h2{margin-bottom:1.5rem;font-size:1.875rem;line-height:2.25rem;font-weight:600}.article p,.article ul{margin-bottom:1.5rem}.article ul li{margin-bottom:1rem;list-style-position:inside;list-style-type:disc;padding-left:.5rem}.article a{--tw-text-opacity: 1;color:rgb(0 185 255 / var(--tw-text-opacity))}.empty\\:hidden:empty{display:none}.hover\\:border-blue-gray-600:hover{--tw-border-opacity: 1;border-color:rgb(70 83 128 / var(--tw-border-opacity))}.hover\\:border-blue-gray-700:hover{--tw-border-opacity: 1;border-color:rgb(47 56 88 / var(--tw-border-opacity))}.hover\\:bg-blue-gray-300:hover{--tw-bg-opacity: 1;background-color:rgb(202 209 234 / var(--tw-bg-opacity))}.hover\\:bg-blue-gray-600:hover{--tw-bg-opacity: 1;background-color:rgb(70 83 128 / var(--tw-bg-opacity))}.hover\\:bg-blue-gray-700:hover{--tw-bg-opacity: 1;background-color:rgb(47 56 88 / var(--tw-bg-opacity))}.hover\\:bg-white:hover{--tw-bg-opacity: 1;background-color:rgb(255 255 255 / var(--tw-bg-opacity))}.hover\\:text-blue-gray-600:hover{--tw-text-opacity: 1;color:rgb(70 83 128 / var(--tw-text-opacity))}.hover\\:text-deep-purple-700:hover{--tw-text-opacity: 1;color:rgb(101 89 162 / var(--tw-text-opacity))}.hover\\:text-white:hover{--tw-text-opacity: 1;color:rgb(255 255 255 / var(--tw-text-opacity))}.hover\\:shadow-card:hover{--tw-shadow: 0px 0px 32px 0px #201E3726;--tw-shadow-colored: 0px 0px 32px 0px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow)}.focus\\:border-ui-blue:focus{--tw-border-opacity: 1;border-color:rgb(0 185 255 / var(--tw-border-opacity))}.focus\\:bg-mf-gray:focus{--tw-bg-opacity: 1;background-color:rgb(246 246 250 / var(--tw-bg-opacity))}.focus-visible\\:border-transparent:focus-visible{border-color:transparent}.focus-visible\\:shadow-outline:focus-visible{--tw-shadow: 0 0 0 2px #00B9FF;--tw-shadow-colored: 0 0 0 2px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow)}.active\\:border-blue-gray-700:active{--tw-border-opacity: 1;border-color:rgb(47 56 88 / var(--tw-border-opacity))}.active\\:border-blue-gray-900:active{--tw-border-opacity: 1;border-color:rgb(28 33 53 / var(--tw-border-opacity))}.active\\:bg-blue-gray-700:active{--tw-bg-opacity: 1;background-color:rgb(47 56 88 / var(--tw-bg-opacity))}.active\\:bg-blue-gray-900:active{--tw-bg-opacity: 1;background-color:rgb(28 33 53 / var(--tw-bg-opacity))}.active\\:font-semibold:active{font-weight:600}.active\\:text-blue-gray-700:active{--tw-text-opacity: 1;color:rgb(47 56 88 / var(--tw-text-opacity))}.active\\:text-deep-purple-300:active{--tw-text-opacity: 1;color:rgb(149 137 234 / var(--tw-text-opacity))}.active\\:text-white:active{--tw-text-opacity: 1;color:rgb(255 255 255 / var(--tw-text-opacity))}@media (min-width: 768px){.md\\:bottom-\\[20\\%\\]{bottom:20%}.md\\:left-1\\/2{left:50%}.md\\:left-\\[14\\%\\]{left:14%}.md\\:left-\\[20\\%\\]{left:20%}.md\\:left-\\[5\\%\\]{left:5%}.md\\:right-1\\/4{right:25%}.md\\:right-\\[14\\%\\]{right:14%}.md\\:right-\\[5\\%\\]{right:5%}.md\\:top-1\\/2{top:50%}.md\\:top-1\\/3{top:33.333333%}.md\\:top-1\\/4{top:25%}.md\\:top-\\[60\\%\\]{top:60%}.md\\:flex{display:flex}.md\\:grid{display:grid}.md\\:hidden{display:none}.md\\:h-24{height:6rem}.md\\:h-\\[20px\\]{height:20px}.md\\:w-1\\/4{width:25%}.md\\:w-2\\/6{width:33.333333%}.md\\:w-20{width:5rem}.md\\:w-24{width:6rem}.md\\:w-36{width:9rem}.md\\:w-40{width:10rem}.md\\:w-44{width:11rem}.md\\:w-48{width:12rem}.md\\:w-5\\/12{width:41.666667%}.md\\:w-52{width:13rem}.md\\:w-56{width:14rem}.md\\:w-64{width:16rem}.md\\:w-72{width:18rem}.md\\:w-80{width:20rem}.md\\:w-\\[196px\\]{width:196px}.md\\:w-auto{width:auto}.md\\:min-w-\\[200px\\]{min-width:200px}.md\\:-translate-x-1\\/2{--tw-translate-x: -50%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.md\\:-translate-y-1\\/2{--tw-translate-y: -50%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.md\\:-translate-y-1\\/3{--tw-translate-y: -33.333333%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.md\\:translate-x-1\\/2{--tw-translate-x: 50%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.md\\:translate-y-0{--tw-translate-y: 0px;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.md\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.md\\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.md\\:grid-cols-\\[1fr_auto\\]{grid-template-columns:1fr auto}.md\\:flex-row{flex-direction:row}.md\\:items-center{align-items:center}.md\\:justify-start{justify-content:flex-start}.md\\:justify-center{justify-content:center}.md\\:gap-1{gap:.25rem}.md\\:gap-10{gap:2.5rem}.md\\:gap-8{gap:2rem}.md\\:p-12{padding:3rem}.md\\:py-28{padding-top:7rem;padding-bottom:7rem}.md\\:py-32{padding-top:8rem;padding-bottom:8rem}.md\\:pb-28{padding-bottom:7rem}.md\\:pt-28{padding-top:7rem}.md\\:text-left{text-align:left}.md\\:text-3xl{font-size:1.875rem;line-height:2.25rem}.md\\:text-6xl{font-size:3.75rem;line-height:1}.md\\:leading-none{line-height:1}}@media (min-width: 1024px){.lg\\:flex-row{flex-direction:row}}@media (min-width: 1280px){.xl\\:flex{display:flex}.xl\\:hidden{display:none}.xl\\:flex-row{flex-direction:row}.xl\\:justify-start{justify-content:flex-start}}`,
  J1 = `{\r
  "app": {\r
    "meta": {\r
      "description": "Module Federation aims to solve the sharing of modules in a distributed system. It allows you to ship those critical shared pieces as macro or as micro as you would like. It does this by pulling them out of the build pipeline and out of your apps"\r
    },\r
    "title": "Module Federation: streamline your microfrontends"\r
  },\r
  "ValorSoftware": ""\r
}\r
`,
  e0 = `{
  "banner": {
    "text": {
      "firstLine": "At Valor, we are delighted to be the exclusive support partners for Module Federation - a technology created by Zack Jackson that has revolutionized modern development.",
      "secondLine": "Our collaboration and status as core team members has enabled us to reduce the community's reliance on a single individual, as well as bring greater value to OSS."
    },
    "title": "Enterprise Support & Training"
  }
}
`,
  t0 = `{\r
  "contact": {\r
    "disclaimer": {\r
      "action": "Privacy & Policy",\r
      "text": "By submitting this form, I confirm that I have read and understood the"\r
    },\r
    "form": {\r
      "action": "Submit",\r
      "company-email": {\r
        "label": "Company email"\r
      },\r
      "company-size": {\r
        "label": "Company size"\r
      },\r
      "company-website": {\r
        "label": "Company website"\r
      },\r
      "how-can-we-help-you": {\r
        "label": "How can we help you?"\r
      },\r
      "name": {\r
        "label": "Your name"\r
      }\r
    },\r
    "quote": {\r
      "author": {\r
        "name": "Zack Jackson",\r
        "title": "the сreator of Module Federation"\r
      },\r
      "text": "There are now 4000 companies using Module Federation in a detectable way. Likely many more who we cannot trace, but 4000 is still an impressive number of known entities."\r
    },\r
    "title": "Talk to our experts"\r
  }\r
}\r
`,
  n0 = `{
  "discord": {
    "action": "Discord",
    "title": "Join to Module Federation community in"
  }
}
`,
  s0 = `{
  "doc-summary": {
    "action": "Start using module federation",
    "cards": {
      "decentralized": {
        "action": "Documentation",
        "desc": "Module Federation allows developers to share code between multiple projects in a decentralized manner, making it easier to manage complex applications.",
        "title": "Decentralized code sharing"
      },
      "federated-runtime": {
        "action": "Documentation",
        "desc": "The modules can be combined and federated at runtime, allowing for greater collaboration and faster development times.",
        "title": "Federated runtime"
      },
      "flexibility": {
        "action": "Documentation",
        "desc": "Module Federation gives developers the freedom to choose and implement the architecture that best suits their needs, promoting a modular and scalable approach to application development.",
        "title": "Flexibility"
      },
      "modular-architecture": {
        "action": "Documentation",
        "desc": "Applications can be split into smaller, self-contained modules that can be developed, tested, and deployed independently.",
        "title": "Modular architecture"
      },
      "scalability": {
        "action": "Documentation",
        "desc": "Module Federation brings scalability to not only code but also individual and organizational productivity",
        "title": "Scalability with Module Federation"
      },
      "team-colaboration": {
        "action": "Documentation",
        "desc": "Independent teams can be assigned responsibility for specific microfrontends, making it easier to manage the development process and promote collaboration between team members.",
        "title": "Team collaboration"
      }
    },
    "subtitle": "Module Federation brings scalability to not only code but also individual and organizational productivity",
    "title": "Scalability with Module Federation"
  }
}
`,
  o0 = `{
  "evolving": {
    "rfcs": {
      "action": "Take part now!",
      "subtitle": "Participate in the community discussions to decide on what features are coming next",
      "title": "RFCs"
    },
    "roadmap": {
      "action": "Explore it!",
      "subtitle": "Discover the future of Module Federation",
      "title": "Module Federation Roadmap"
    },
    "subtitle": "The world of Module Federation is constantly evolving and growing based on the feedback from the community. The RFCs are open for all to participate in the discussion and the roadmap is published.",
    "supported-bundlers": {
      "title": "Supported bundlers"
    },
    "title": "Evolving Module Federation"
  }
}
`,
  r0 = `{
  "explore": {
    "cards": {
      "community-content": {
        "action": "Find out more",
        "title": "Community content"
      },
      "conference-talks": {
        "action": "Watch now",
        "title": "Conference talks"
      },
      "implementing-module-federation": {
        "action": "Learn more",
        "title": "Implementing Module Federation"
      },
      "module-federation-courses": {
        "action": "Start exploring",
        "subtitle": "Gain expertise in Module Federation and enhance your skills now",
        "title": "Module Federation courses"
      },
      "practical-module-federation": {
        "action": "Get the book",
        "title": "Practical Module Federation"
      }
    },
    "disabled": "Coming soon"
  }
}
`,
  l0 = `{\r
  "footer": {\r
    "menu": {\r
      "documentation": "Documentation",\r
      "examples": "Examples",\r
      "medusa": "Try Medusa",\r
      "practical-guide": "Practical guide",\r
      "privacy-policy": "Privacy Policy",\r
      "sponsor": "Become a sponsor"\r
    }\r
  }\r
}\r
`,
  a0 = `{
  "hero": {
    "actions": {
      "documentation": "Documentation",
      "learn": "Learn"
    },
    "subtitle": "Module Federation aims to solve the sharing of modules in a distributed system. It allows you to ship those critical shared pieces as macro or as micro as you would like. It does this by pulling them out of the build pipeline and out of your apps",
    "title": "Module Federation: streamline your microfrontends"
  }
}
`,
  i0 = `{
  "medusa": {
    "title": "Start using Module Federation with"
  }
}
`,
  c0 = `{
  "navbar": {
    "menu": {
      "discover": "Discover",
      "documentation": "Documentation",
      "enterprise": "Enterprise",
      "medusa": "Medusa",
      "showcase": "Showcase"
    }
  }
}
`,
  u0 = `{
  "showcase-page": {
    "action": "Become a showcase",
    "subtitle": "Meet leading companies embracing Module Federation for their web development needs.",
    "title": "Showcase"
  }
}
`,
  d0 = `{
  "showcase": {
    "action": "See more showcases",
    "title": "Showcase"
  }
}
`,
  p0 = `{
  "sponsor": {
    "action": "Become a sponsor",
    "subtitle": "Sponsoring Module Federation offers the chance to be part of a technology community making a positive impact<br> and receive benefits and recognition opportunities in return.",
    "title": "Sponsor Module Federation!"
  }
}
`,
  m0 = `{
  "subscribe": {
    "action": "Subscribe",
    "input": {
      "placeholder": "Enter your email"
    },
    "title": "Subscribe to our email newsletter!"
  }
}
`,
  f0 = `{\r
  "app": {\r
    "meta": {\r
      "description": "A Federação de Módulos tem como objetivo resolver o compartilhamento de módulos em um sistema distribuído. Ela permite que você envie essas peças críticas compartilhadas como macro ou micro conforme desejar. Isso é feito retirando-as do pipeline de build e de seus aplicativos."\r
    },\r
    "title": "Federação de Módulos: otimize seus microfrontends"\r
  },\r
  "ValorSoftware": ""\r
}\r
`,
  h0 = `{
  "banner": {
    "text": {
      "firstLine": "At Valor, we are delighted to be the exclusive support partners for Module Federation - a technology created by Zack Jackson that has revolutionized modern development.",
      "secondLine": "Our collaboration and status as core team members has enabled us to reduce the community's reliance on a single individual, as well as bring greater value to OSS."
    },
    "title": "Enterprise Support & Training"
  }
}
`,
  g0 = `{\r
  "contact": {\r
    "disclaimer": {\r
      "action": "Política de privacidade",\r
      "text": "Ao enviar este formulário, confirmo que li e compreendi a nossa "\r
    },\r
    "form": {\r
      "action": "Enviar",\r
      "company-email": {\r
        "label": "Email corporativo"\r
      },\r
      "company-size": {\r
        "label": "Tamanho da empresa"\r
      },\r
      "company-website": {\r
        "label": "Website da empresa"\r
      },\r
      "how-can-we-help-you": {\r
        "label": "Como podemos te ajudar?"\r
      },\r
      "name": {\r
        "label": "Seu nome"\r
      }\r
    },\r
    "quote": {\r
      "author": {\r
        "name": "Zack Jackson",\r
        "title": "o criador de Module Federation"\r
      },\r
      "text": "Existem agora 4.000 empresas usando o Module Federation de forma detectável. Provavelmente muitos mais que não podemos rastrear, mas 4000 ainda é um número impressionante de entidades conhecidas."\r
    },\r
    "title": "Fale com nossos especialistas"\r
  }\r
}\r
`,
  y0 = `{
  "discord": {
    "action": "Discord",
    "title": "Junte-se à comunidade Module Federation no"
  }
}
`,
  $0 = `{
  "doc-summary": {
    "action": "Comece a usar Module Federation",
    "cards": {
      "decentralized": {
        "action": "Documentação",
        "desc": "Module Federation permite que os desenvolvedores compartilhem código entre vários projetos de maneira descentralizada, facilitando o gerenciamento de aplicativos complexos.",
        "title": "Compartilhamento de código descentralizado"
      },
      "federated-runtime": {
        "action": "Documentação",
        "desc": "Os módulos podem ser combinados e federados em tempo de execução, permitindo maior colaboração e tempos de desenvolvimento mais rápidos.",
        "title": "Tempo de execução federado"
      },
      "flexibility": {
        "action": "Documentação",
        "desc": "Module Federation dá aos desenvolvedores a liberdade de escolher e implementar a arquitetura que melhor se adapta às suas necessidades, promovendo uma abordagem modular e escalável para o desenvolvimento de aplicativos.",
        "title": "Flexibilidade"
      },
      "modular-architecture": {
        "action": "Documentação",
        "desc": "Os aplicativos podem ser divididos em módulos menores e independentes que podem ser desenvolvidos, testados e implantados de forma independente.",
        "title": "Modular architecture"
      },
      "team-colaboration": {
        "action": "Documentação",
        "desc": "Equipes independentes podem ser responsáveis por microfrontends específicos, facilitando o gerenciamento do processo de desenvolvimento e promovendo a colaboração entre os membros da equipe.",
        "title": "Colaboração em equipe"
      }
    },
    "subtitle": "Module Federation traz escalabilidade não apenas para o código, mas também para a produtividade individual e organizacional",
    "title": "Escalabilidade com Module Federation"
  }
}
`,
  b0 = `{
  "evolving": {
    "rfcs": {
      "action": "Participe agora!",
      "subtitle": "Participe das discussões comunitárias para decidir quais recursos virão a seguir",
      "title": "RFCs"
    },
    "roadmap": {
      "action": "Explore!",
      "subtitle": "Descubra o futuro do Module Federation",
      "title": "Roadmap do Module Federation"
    },
    "subtitle": "O mundo do Module Federation está em constante evolução e crescimento com base nos feedbacks da comunidade. Os RFCs estão abertos para que todos possam participar da discussão e o roadmap é publicado.",
    "supported-bundlers": {
      "title": "Empacotadores suportados"
    },
    "title": "Evolução do Module Federation"
  }
}
`,
  w0 = `{
  "explore": {
    "cards": {
      "community-content": {
        "action": "Saiba mais",
        "title": "Conteúdo da comunidade"
      },
      "conference-talks": {
        "action": "Assista agora",
        "title": "Palestras em conferências"
      },
      "implementing-module-federation": {
        "action": "Saiba mais",
        "title": "Implementando o Module Federation"
      },
      "module-federation-courses": {
        "action": "Comece a explorar",
        "subtitle": "Ganhe especialização em Module Federation e aprimore suas habilidades agora",
        "title": "Cursos de Module Federation"
      },
      "practical-module-federation": {
        "action": "Adquira o livro",
        "title": "Module Federation na prática"
      }
    },
    "disabled": "Em breve"
  }
}
`,
  v0 = `{\r
  "footer": {\r
    "menu": {\r
      "documentation": "Documentação",\r
      "examples": "Exemplos",\r
      "medusa": "Experimente o Medusa",\r
      "practical-guide": "Guia prático",\r
      "privacy-policy": "Política de Privacidade",\r
      "sponsor": "Torne-se um patrocinador"\r
    }\r
  }\r
}\r
`,
  _0 = `{
  "hero": {
    "actions": {
      "documentation": "Documentação",
      "learn": "Aprender"
    },
    "subtitle": "Module Federation tem como objetivo resolver o compartilhamento de módulos em um sistema distribuído. Ele permite que você envie esses pedaços compartilhados críticos como macro ou micro quanto desejar. Ele faz isso retirando-os do pipeline de build e de seus aplicativos",
    "title": "Module Federation: otimize seus microfrontends"
  }
}
`,
  x0 = `{
  "medusa": {
    "title": "Comece a usar Module Federation com"
  }
}
`,
  k0 = `{
  "navbar": {
    "menu": {
      "discover": "Descobrir",
      "documentation": "Documentação",
      "enterprise": "Empresarial",
      "medusa": "Medusa",
      "showcase": "Exemplos"
    }
  }
}
`,
  S0 = `{
  "showcase-page": {
    "action": "Torne-se um exemplo",
    "subtitle": "Conheça as principais empresas que adotaram o Module Federation para suas necessidades de desenvolvimento web.",
    "title": "Exemplos"
  }
}
`,
  q0 = `{
  "showcase": {
    "action": "Ver mais exemplos",
    "title": "Exemplos"
  }
}
`,
  C0 = `{
  "sponsor": {
    "action": "Torne-se um patrocinador",
    "subtitle": "Module Federation oferece a chance de fazer parte de uma comunidade tecnológica que está fazendo um impacto positivo e receber benefícios e oportunidades de reconhecimento em troca.",
    "title": "Patrocine o Module Federation!"
  }
}
`,
  j0 = `{
  "subscribe": {
    "action": "Inscreva-se",
    "input": {
      "placeholder": "Digite seu e-mail"
    },
    "title": "Inscreva-se em nossa newsletter!"
  }
}
`,
  T0 = `{\r
  "app": {\r
    "meta": {\r
      "description": "模块联邦旨在解决分布式系统中的模块共享问题。它允许您将这些关键的共享部分作为宏或微来发布，这是通过将它们从构建管道和应用程序中拉出来实现的"\r
    },\r
    "title": "模块联邦：简化你的微前端"\r
  },\r
  "ValorSoftware": ""\r
}\r
`,
  E0 = `{\r
  "banner": {\r
    "text": {\r
      "firstLine": "在Valor，我们很高兴能成为Module Federation的独家支持合作伙伴，这是Zack Jackson创造的一项革命性的现代开发技术。",\r
      "secondLine": "我们作为核心团队成员的协作和地位使我们能够减少社区对单个个人的依赖，并为OSS带来更大的价值。"\r
    },\r
    "title": "企业支持与培训"\r
  }\r
}\r
`,
  L0 = `{\r
  "contact": {\r
    "disclaimer": {\r
      "action": "隐私政策",\r
      "text": "通过提交此表单，我确认我已经阅读并理解"\r
    },\r
    "form": {\r
      "action": "提交",\r
      "company-email": {\r
        "label": "公司电子邮件"\r
      },\r
      "company-size": {\r
        "label": "公司规模"\r
      },\r
      "company-website": {\r
        "label": "公司网站"\r
      },\r
      "how-can-we-help-you": {\r
        "label": "我们能为您做些什么?"\r
      },\r
      "name": {\r
        "label": "您的名字"\r
      }\r
    },\r
    "quote": {\r
      "author": {\r
        "name": "Zack Jackson",\r
        "title": "模块联邦的创建者"\r
      },\r
      "text": "以可检测的方式现在有4000家公司使用Module Federation。可能还有更多我们无法追踪的人，但4000个已知的数量仍然令人印象深刻。"\r
    },\r
    "title": "和我们的专家谈谈"\r
  }\r
}\r
`,
  N0 = `{\r
  "discord": {\r
    "action": "Discord",\r
    "title": "加入模块联邦社区"\r
  }\r
}\r
`,
  A0 = `{\r
  "doc-summary": {\r
    "action": "开始使用模块联邦",\r
    "cards": {\r
      "decentralized": {\r
        "action": "文档",\r
        "desc": "模块联邦允许开发人员以分散的方式在多个项目之间共享代码，使管理复杂的应用程序变得更加容易。",\r
        "title": "分散的代码共享"\r
      },\r
      "federated-runtime": {\r
        "action": "文档",\r
        "desc": "模块可以在运行时进行组合和联合，从而实现更好的协作和更快的开发时间。",\r
        "title": "联邦运行时"\r
      },\r
      "flexibility": {\r
        "action": "文档",\r
        "desc": "模块联邦赋予开发人员自由选择和实现最适合他们需求的架构，促进应用程序开发的模块化和可伸缩性。",\r
        "title": "灵活的"\r
      },\r
      "modular-architecture": {\r
        "action": "文档",\r
        "desc": "应用程序可以被拆分成更小的、自包含的模块，这些模块可以独立地开发、测试和部署。",\r
        "title": "模块化架构"\r
      },\r
      "scalability": {\r
        "action": "文档",\r
        "desc": "模块联邦不仅为代码带来了可扩展性，还为个人和组织的生产力带来了可扩展性。",\r
        "title": "模块联邦的可扩展性"\r
      },\r
      "team-colaboration": {\r
        "action": "文档",\r
        "desc": "独立的团队可以被分配负责特定的微前端，使开发过程更容易管理，并促进团队成员之间的协作。",\r
        "title": "团队合作"\r
      }\r
    },\r
    "subtitle": "模块联邦不仅为代码带来了可扩展性，还为个人和组织的生产力带来了可扩展性。",\r
    "title": "模块联邦的可扩展性"\r
  }\r
}\r
`,
  z0 = `{\r
  "evolving": {\r
    "rfcs": {\r
      "action": "现在就参加吧!",\r
      "subtitle": "参与社区讨论，决定接下来会有哪些功能",\r
      "title": "RFCs"\r
    },\r
    "roadmap": {\r
      "action": "探索它!",\r
      "subtitle": "探索模块联邦的未来",\r
      "title": "模块联邦路线图"\r
    },\r
    "subtitle": "基于社区的反馈，模块联邦的世界正在不断发展和壮大。RFC面向所有参与讨论的人开放，并发布了路线图。",\r
    "supported-bundlers": {\r
      "title": "支持的打包工具"\r
    },\r
    "title": "不断发展的模块联邦"\r
  }\r
}\r
`,
  I0 = `{\r
  "explore": {\r
    "cards": {\r
      "community-content": {\r
        "action": "了解更多",\r
        "title": "社区内容"\r
      },\r
      "conference-talks": {\r
        "action": "立即观看",\r
        "title": "会议演讲"\r
      },\r
      "implementing-module-federation": {\r
        "action": "了解更多",\r
        "title": "实现模块联邦"\r
      },\r
      "module-federation-courses": {\r
        "action": "开始探索",\r
        "subtitle": "立即获得模块联邦的专业知识并提高你的技能",\r
        "title": "模块联邦课程"\r
      },\r
      "practical-module-federation": {\r
        "action": "购买本书",\r
        "title": "实用模块联邦"\r
      }\r
    },\r
    "disabled": "即将推出"\r
  }\r
}\r
`,
  R0 = `{\r
  "footer": {\r
    "menu": {\r
      "documentation": "文档",\r
      "examples": "案例",\r
      "medusa": "尝试Medusa",\r
      "practical-guide": "实用指南",\r
      "privacy-policy": "隐私政策",\r
      "sponsor": "成为赞助商"\r
    }\r
  }\r
}\r
`,
  M0 = `{\r
  "hero": {\r
    "actions": {\r
      "documentation": "文档",\r
      "learn": "学习"\r
    },\r
    "subtitle": "模块联邦旨在解决分布式系统中的模块共享问题。它允许您将这些关键的共享部分作为宏或微来发布，这是通过将它们从构建流水线和应用程序中拉取出来实现的",\r
    "title": "模块联邦：简化你的微前端"\r
  }\r
}\r
`,
  P0 = `{\r
  "medusa": {\r
    "title": "开始使用模块联邦通过"\r
  }\r
}\r
`,
  D0 = `{\r
  "navbar": {\r
    "menu": {\r
      "discover": "探索",\r
      "documentation": "文档",\r
      "enterprise": "企业",\r
      "medusa": "Medusa",\r
      "showcase": "案例展示"\r
    }\r
  }\r
}\r
`,
  F0 = `{\r
  "showcase-page": {\r
    "action": "成为案例展示",\r
    "subtitle": "与采用模块联邦技术满足其网页开发需求的领先公司见面",\r
    "title": "案例展示"\r
  }\r
}\r
`,
  O0 = `{\r
  "showcase": {\r
    "action": "查看更多案例",\r
    "title": "案例展示"\r
  }\r
}\r
`,
  H0 = `{\r
  "sponsor": {\r
    "action": "成为赞助商",\r
    "subtitle": "赞助模块联邦会提供成为技术社区一员的机会，产生积极影响，<br/>并获得利益和认可机会作为回报。",\r
    "title": "赞助模块联邦!"\r
  }\r
}\r
`,
  U0 = `{\r
  "subscribe": {\r
    "action": "订阅",\r
    "input": {\r
      "placeholder": "输入您的邮箱地址"\r
    },\r
    "title": "订阅我们的电子邮件新闻通讯！"\r
  }\r
}\r
`,
  B0 = Object.assign({
    '/src/i18n/en-US/app.json': J1,
    '/src/i18n/en-US/banner.json': e0,
    '/src/i18n/en-US/contact.json': t0,
    '/src/i18n/en-US/discord.json': n0,
    '/src/i18n/en-US/doc-summary.json': s0,
    '/src/i18n/en-US/evolving.json': o0,
    '/src/i18n/en-US/explore.json': r0,
    '/src/i18n/en-US/footer.json': l0,
    '/src/i18n/en-US/hero.json': a0,
    '/src/i18n/en-US/medusa.json': i0,
    '/src/i18n/en-US/navbar.json': c0,
    '/src/i18n/en-US/showcase-page.json': u0,
    '/src/i18n/en-US/showcase.json': d0,
    '/src/i18n/en-US/sponsor.json': p0,
    '/src/i18n/en-US/subscribe.json': m0,
    '/src/i18n/pt-BR/app.json': f0,
    '/src/i18n/pt-BR/banner.json': h0,
    '/src/i18n/pt-BR/contact.json': g0,
    '/src/i18n/pt-BR/discord.json': y0,
    '/src/i18n/pt-BR/doc-summary.json': $0,
    '/src/i18n/pt-BR/evolving.json': b0,
    '/src/i18n/pt-BR/explore.json': w0,
    '/src/i18n/pt-BR/footer.json': v0,
    '/src/i18n/pt-BR/hero.json': _0,
    '/src/i18n/pt-BR/medusa.json': x0,
    '/src/i18n/pt-BR/navbar.json': k0,
    '/src/i18n/pt-BR/showcase-page.json': S0,
    '/src/i18n/pt-BR/showcase.json': q0,
    '/src/i18n/pt-BR/sponsor.json': C0,
    '/src/i18n/pt-BR/subscribe.json': j0,
    '/src/i18n/zh-CN/app.json': T0,
    '/src/i18n/zh-CN/banner.json': E0,
    '/src/i18n/zh-CN/contact.json': L0,
    '/src/i18n/zh-CN/discord.json': N0,
    '/src/i18n/zh-CN/doc-summary.json': A0,
    '/src/i18n/zh-CN/evolving.json': z0,
    '/src/i18n/zh-CN/explore.json': I0,
    '/src/i18n/zh-CN/footer.json': R0,
    '/src/i18n/zh-CN/hero.json': M0,
    '/src/i18n/zh-CN/medusa.json': P0,
    '/src/i18n/zh-CN/navbar.json': D0,
    '/src/i18n/zh-CN/showcase-page.json': F0,
    '/src/i18n/zh-CN/showcase.json': O0,
    '/src/i18n/zh-CN/sponsor.json': H0,
    '/src/i18n/zh-CN/subscribe.json': U0,
  }),
  W0 = Nu((e, t) => JSON.parse(B0[`/src/i18n/${e}/${t}.json`]), 'dfQtLy0YQcA'),
  Q0 = Z1(j(W0, 's_dfQtLy0YQcA')),
  K0 = { loadTranslation$: Q0 },
  V0 = () => (
    Dl(j(X1, 's_kJTkeEh1U5c')),
    $(
      Pp,
      {
        children: $(
          Q1,
          {
            children: [
              l(
                'head',
                null,
                null,
                [
                  l('meta', null, { charSet: 'utf-8' }, null, 3, null),
                  l(
                    'script',
                    null,
                    {
                      async: !0,
                      src: 'https://www.googletagmanager.com/gtag/js?id=G-SDV5HRTM4G',
                    },
                    null,
                    3,
                    null
                  ),
                  l(
                    'script',
                    null,
                    {
                      dangerouslySetInnerHTML: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-SDV5HRTM4G');
          `,
                    },
                    null,
                    3,
                    null
                  ),
                  l(
                    'link',
                    null,
                    { href: '/manifest.json', rel: 'manifest' },
                    null,
                    3,
                    null
                  ),
                  $(G1, null, 3, 'Le_0'),
                ],
                1,
                null
              ),
              l(
                'body',
                null,
                { class: 'relative w-full bg-mf-gray overflow-y-scroll' },
                [
                  l(
                    'div',
                    null,
                    { class: 'w-full overflow-x-hidden' },
                    $(I1, null, 3, 'Le_1'),
                    1,
                    null
                  ),
                  $(K1, null, 3, 'Le_2'),
                ],
                1,
                null
              ),
            ],
          },
          1,
          'Le_3'
        ),
        config: $t,
        translationFn: K0,
        [d]: { config: d, translationFn: d },
      },
      1,
      'Le_4'
    )
  ),
  Z0 = R(j(V0, 's_eXD0K9bzzlo'));
function Y0(e) {
  var t;
  return op($(Z0, null, 3, 'Ro_0'), {
    manifest: yp,
    ...e,
    containerAttributes: {
      lang:
        ((t = e.serverData) == null ? void 0 : t.locale) ||
        $t.defaultLocale.lang,
      ...e.containerAttributes,
    },
  });
}
const lf = gp({ render: Y0, qwikCityPlan: x1 });
export { lf as default };
