/* Qwik Service Worker */
const appBundles = [
  ['q-0yXnO8UR.js', [8]],
  [
    'q-1PJUqM-6.js',
    [6, 8, 33, 42, 46, 47, 51, 53, 59, 61],
    ['IMLVEX3dgUw', 'JGcGwM6uqSo', 'VoSI6o07IFI'],
  ],
  [
    'q-1XWnfME1.js',
    [8, 30],
    ['2HCPp1ydyqs', 'MOjpn7epc74', 'Pl7vAlduOuo', 'tNYOaCIm0Qc'],
  ],
  ['q-2o2AZ-2V.js', [8], ['3SsPTS5utQk', 'gft6e4M8el4']],
  ['q-4WI62hmk.js', [5, 8, 46, 47, 51], ['D0iY34otgb0', 'prGAgB6H1F4']],
  ['q-51TGVSGw.js', [8]],
  ['q-5QrMjcEM.js', [8]],
  ['q-6X-UaKF_.js', [8, 30], ['lHJ6l0hcvRg']],
  ['q-9ngTyHsh.js', []],
  ['q-9THZec9p.js', [8]],
  ['q-_WeoXnTm.js', [8, 54], ['Nk9PlpjQm9Y', 'p9MSze0ojs4']],
  ['q-AbDvPjbv.js', [5, 8, 33, 46, 51, 59], ['0CLaYnIloJk', 'DRT9K1jPHw0']],
  ['q-AE2PjDo2.js', [8, 45, 47, 59], ['5qyIIEjMPSA', 'ZwZ0qjzCTZQ']],
  ['q-bc5tXQza.js', [8, 46], ['AkJ7NeLjpWM', 'b8fpOLpx7NA']],
  ['q-bGXkwLI2.js', [8, 54], ['BUbtvTyvVRE', 'WmYC5H00wtI']],
  ['q-Blmdvjby.js', [8, 33, 46, 51, 59], ['2fkm5zc0rek', 'g0E4nZcqTc8']],
  ['q-c2pXVZkc.js', [8]],
  [
    'q-C_G-7RYd.js',
    [8, 23, 24, 43, 46, 47, 51, 59],
    ['14NE37yaMfA', 'TCwB4TUhbFA'],
  ],
  ['q-D-Wr-qe8.js', [8, 47, 59], ['MBnCRhRrMNs', 'MR5rBPxRKDs']],
  ['q-dN21Z2-Z.js', [5, 8, 46, 47, 51], ['eh3Zleb9svU', 'oIzTMtTO2NI']],
  [
    'q-EfRLsstC.js',
    [5, 8, 46, 47, 51],
    ['i9FQ1vZJ8l0', 'KnttE033sL4', 'KPHXz30Lh3M', 'n1zdSBKIeTw'],
  ],
  [
    'q-egSWN4bi.js',
    [8, 23, 24, 43, 46, 47, 51, 59],
    ['DkNHR022s5k', 'RZ4kRsPh3h0'],
  ],
  ['q-EoLAf2n0.js', [], ['DyVc0YBIqQU']],
  ['q-gLuYvr2d.js', [8]],
  ['q-GyeNLo0W.js', [8]],
  ['q-hJ_tRRnN.js', [8], ['mekDswQeFyQ']],
  ['q-i0s5P0zz.js', [8, 54], ['wOIPfiQ04l4']],
  ['q-IUF-AQHZ.js', [8], ['E6HOLccZhOI', 'wM7DasAxykk']],
  ['q-iYSRzWsC.js', [8, 46], ['t8pAmchwKZE']],
  ['q-izOB4Fo9.js', [8], ['FQPutlW041U']],
  ['q-Jbye9dve.js', [8]],
  ['q-JmyJ0qA7.js', [6, 8, 38, 47, 51, 59, 61], ['CQ1t0RXar34']],
  ['q-jX1EXmT-.js', [8, 46, 47, 59], ['dVIPHMdh004', 'HdsYayhDkLg']],
  ['q-JZLb1D8d.js', []],
  ['q-k592WfaK.js', [8, 46, 54], ['2Fq8wIUpq5I']],
  ['q-mQilmcTJ.js', [8, 51], ['rIehxbCtAqU', 'rk5oELlKahs']],
  ['q-NXuWezL-.js', [8, 46], ['MIDC22ueZrk', 'sfbNflx0Y2A', 'yigdOibvcXE']],
  ['q-O_psKbTY.js', [8]],
  ['q-oetCl3_F.js', [8]],
  ['q-oKS61hcj.js', [0, 6, 8, 45, 53, 61], ['bOB0JnUCSKY']],
  [
    'q-P9PodR0k.js',
    [8, 23, 30, 33, 43, 46, 51, 54, 59, 61],
    [
      'dBzp75i0JUA',
      'e0RDNPJNIGY',
      'EQll1XU2k6A',
      'HSLHKDE0Tc8',
      'K8TT2dajw7I',
      'LQcmHAxuFaU',
      'Qj09dIbebQs',
      'YWAZ5f0lJEw',
    ],
  ],
  ['q-pb_RrnRq.js', [5, 8, 46, 47], ['0kXSZC4QkmM', 'KHl60H7GIzk']],
  ['q-pgd5M9oM.js', [8]],
  ['q-ps5hdwuV.js', [8]],
  [
    'q-PvTUl8sS.js',
    [8, 33, 46, 47, 51, 59],
    ['6VMpNf7ZCJ0', 'kK15dHxr40k', 'tVi0Ug0Y1rA', 'Z790sFa7bTY'],
  ],
  ['q-qP2n7w9d.js', [8]],
  ['q-Scd2ZB6o.js', [8]],
  ['q-T3cxTwNd.js', [8]],
  ['q-TgftcdoX.js', [8, 54], ['8gdLBszqbaM', 'i1Cv0pYJNR0']],
  ['q-TM-xkJLr.js', [8, 33, 46, 54], ['eXD0K9bzzlo', 'kJTkeEh1U5c']],
  ['q-U-FLH8EN.js', [8], ['5Bmm03gq0i0', 'M2E9iDaUBT4']],
  ['q-UhehzwuD.js', [8]],
  ['q-UnfajP0r.js', [8], ['A5bZC7WO00A']],
  ['q-uSJWasxr.js', [8]],
  ['q-v9P9ygUp.js', [8]],
  ['q-vd-w_KXm.js', [8, 59], ['07tGklv0JFU', 'onhenAasZyM']],
  ['q-VOwOkMaG.js', [8, 54], ['e0ssiDXoeAM']],
  ['q-vTq5evZ5.js', []],
  [
    'q-WAQTkgVr.js',
    [8, 54],
    ['02wMImzEAbk', 'fX0bDjeJa0E', 'RPDJAz33WLA', 'TxCFOy819ag'],
  ],
  ['q-XhXTUHYG.js', [8]],
  ['q-xQtrsSrw.js', [8]],
  ['q-ydNx7cQB.js', [8]],
  ['q-yNMDHcTE.js', [8, 54], ['eBQ0vFsFKsk']],
  ['q-Zg0D1cBu.js', [8, 23], ['outyRSHf0Tw', 'sOgQv7sgR00']],
  [
    'q-zumL0WX_.js',
    [0, 5, 8, 23, 24, 43, 46, 47, 51, 59],
    ['00VE9E0kYIc', 'pbG9H8ze2g4'],
  ],
];
const libraryBundleIds = [58];
const linkBundles = [
  [/^(?:\/(.*))?\/privacy-policy\/?$/, [9, 29, 38, 31]],
  [/^(?:\/(.*))?\/showcase\/?$/, [9, 29, 42, 1]],
  [/^(?:\/(.*))?\/?$/, [9, 29, 16, 39]],
];
const m = 'QwikBuild',
  k = new Set(),
  g = new Map(),
  u = [],
  L = (e, n) => n.filter((s) => !e.some((i) => s.endsWith(i[0]))),
  q = (e, n) => !!n && !E(n),
  E = (e) => {
    const n = e.headers.get('Cache-Control') || '';
    return n.includes('no-cache') || n.includes('max-age=0');
  },
  C = (e, n) => e.some((s) => n.endsWith('/' + s[0])),
  U = (e, n) => e.find((s) => s[0] === n),
  b = (e, n) => n.map((s) => (e[s] ? e[s][0] : null)),
  W = (e, n) => n.map((s) => e.get(s)).filter((s) => s != null),
  p = (e) => {
    const n = new Map();
    for (const s of e) {
      const i = s[2];
      if (i) for (const c of i) n.set(c, s[0]);
    }
    return n;
  },
  v = (e, n, s, i) =>
    new Promise((c, h) => {
      const t = i.url,
        r = s.get(t);
      if (r) r.push([c, h]);
      else {
        const o = (l) => {
            const a = s.get(t);
            if (a) {
              s.delete(t);
              for (const [d] of a) d(l.clone());
            } else c(l.clone());
          },
          f = (l) => {
            const a = s.get(t);
            if (a) {
              s.delete(t);
              for (const [d, A] of a) A(l);
            } else h(l);
          };
        s.set(t, [[c, h]]),
          e
            .match(t)
            .then((l) => {
              if (q(i, l)) o(l);
              else
                return n(i).then(async (a) => {
                  a.ok && (await e.put(t, a.clone())), o(a);
                });
            })
            .catch((l) =>
              e.match(t).then((a) => {
                a ? o(a) : f(l);
              })
            );
      }
    }),
  y = (e, n, s, i, c, h = !1) => {
    const t = () => {
        for (; u.length > 0 && g.size < 6; ) {
          const o = u.shift(),
            f = new Request(o);
          k.has(o) ? t() : (k.add(o), v(n, s, g, f).finally(t));
        }
      },
      r = (o) => {
        try {
          const f = U(e, o);
          if (f) {
            const l = b(e, f[1]),
              a = new URL(o, i).href,
              d = u.indexOf(a);
            d > -1
              ? h && (u.splice(d, 1), u.unshift(a))
              : h
              ? u.unshift(a)
              : u.push(a),
              l.forEach(r);
          }
        } catch (f) {
          console.error(f);
        }
      };
    Array.isArray(c) && c.forEach(r), t();
  },
  w = (e, n, s, i, c, h, t) => {
    try {
      y(e, i, c, h, b(e, n));
    } catch (r) {
      console.error(r);
    }
    for (const r of t)
      try {
        for (const o of s) {
          const [f, l] = o;
          if (f.test(r)) {
            y(e, i, c, h, b(e, l));
            break;
          }
        }
      } catch (o) {
        console.error(o);
      }
  },
  B = (e, n, s, i) => {
    try {
      const c = i.href.split('/'),
        h = c[c.length - 1];
      c[c.length - 1] = '';
      const t = new URL(c.join('/'));
      y(e, n, s, t, [h], !0);
    } catch (c) {
      console.error(c);
    }
  },
  N = (e, n, s, i) => {
    const c = e.fetch.bind(e),
      h = p(n);
    e.addEventListener('fetch', (t) => {
      const r = t.request;
      if (r.method === 'GET') {
        const o = new URL(r.url);
        C(n, o.pathname) &&
          t.respondWith(
            e.caches.open(m).then((f) => (B(n, f, c, o), v(f, c, g, r)))
          );
      }
    }),
      e.addEventListener('message', async ({ data: t }) => {
        if (t.type === 'qprefetch' && typeof t.base == 'string') {
          const r = await e.caches.open(m),
            o = new URL(t.base, e.origin);
          Array.isArray(t.links) && w(n, s, i, r, c, o, t.links),
            Array.isArray(t.bundles) && y(n, r, c, o, t.bundles),
            Array.isArray(t.symbols) && y(n, r, c, o, W(h, t.symbols));
        }
      }),
      e.addEventListener('activate', () => {
        (async () => {
          try {
            const t = await e.caches.open(m),
              o = (await t.keys()).map((l) => l.url),
              f = L(n, o);
            await Promise.all(f.map((l) => t.delete(l)));
          } catch (t) {
            console.error(t);
          }
        })();
      });
  },
  x = () => {
    typeof self < 'u' &&
      typeof appBundles < 'u' &&
      N(self, appBundles, libraryBundleIds, linkBundles);
  };
x();
addEventListener('install', () => self.skipWaiting());
addEventListener('activate', () => self.clients.claim());
