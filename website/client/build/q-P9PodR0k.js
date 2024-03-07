import {
  f as v,
  n as R,
  o as E,
  p as S,
  h as t,
  P as s,
  i as A,
  K as e,
  R as L,
  g,
  C as b,
  _ as h,
  v as V,
} from './q-9ngTyHsh.js';
import { a as d, B as f } from './q-UhehzwuD.js';
import { C as P, a as X } from './q-XhXTUHYG.js';
import { I as T } from './q-ps5hdwuV.js';
import { I as O } from './q-gLuYvr2d.js';
import { S as C, a as H } from './q-Jbye9dve.js';
import { l as j, c as $, L as k } from './q-JZLb1D8d.js';
import { l as I } from './q-ydNx7cQB.js';
import { a as N, u as y } from './q-Scd2ZB6o.js';
import { a as U } from './q-v9P9ygUp.js';
const K = () => {
    const [r] = v();
    return (r.value = !r.value);
  },
  B = () => {
    const [r, n, o] = v(),
      a = (D) => {
        const u = document.querySelector(D);
        if (!u) return !1;
        const c = u.getBoundingClientRect(),
          m = c.top + 100,
          _ = c.bottom - 100,
          x = c.height,
          w = window.innerHeight || document.documentElement.clientHeight,
          l = m >= 0 && _ <= w,
          z = m + x >= 0 && _ <= w;
        return l || z;
      },
      i = () => {
        (o.value = window.scrollY),
          (r.value = a('#discover')),
          (n.value = a('#contact'));
      };
    return (
      i(),
      document.addEventListener('scroll', i),
      () => {
        document.removeEventListener('scroll', i);
      }
    );
  },
  Q = async (r, n) => {
    var a;
    const [o] = v();
    await o((a = r.target) == null ? void 0 : a.value);
  },
  W = (r) => {
    R(
      g(() => h(() => Promise.resolve().then(() => p), void 0), 's_K8TT2dajw7I')
    );
    const n = E(!1),
      o = E(!1),
      a = E(!1),
      i = E(1),
      D = U(),
      u = N(),
      c = I.find((l) => l.lang === u.locale.lang),
      m = (l) => j(l, u);
    S(
      g(
        () => h(() => Promise.resolve().then(() => p), void 0),
        's_dBzp75i0JUA',
        [o, a, i]
      ),
      { strategy: 'document-ready' }
    );
    const _ = g(
        () => h(() => Promise.resolve().then(() => p), void 0),
        's_EQll1XU2k6A',
        [D]
      ),
      x = [
        {
          label: y('navbar.menu.documentation@@Documentation'),
          href: '/docs/en/mf-docs/0.2/getting-started/',
        },
        {
          label: y('navbar.menu.discover@@Discover'),
          href: m('/#discover'),
          active: o.value,
        },
        { label: y('navbar.menu.showcase@@Showcase'), href: m('showcase') },
        {
          label: y('navbar.menu.enterprise@@Enterprise'),
          href: m('/#contact'),
          active: a.value,
        },
        {
          label: y('navbar.menu.medusa@@Medusa'),
          href: 'https://app.medusa.codes/',
          target: '_blank',
        },
      ],
      w = i.value === 0 ? r.theme || P.NONE : P.GRAY;
    return t(
      'div',
      null,
      null,
      t(
        'div',
        null,
        { class: 'fixed w-full top-0 z-[999]' },
        [
          s(
            X,
            {
              get pattern() {
                return i.value === 0;
              },
              children: t(
                'nav',
                null,
                {
                  class:
                    'max-w-7xl mx-auto flex flex-row-reverse xl:flex-row  items-center justify-between px-4 py-6',
                },
                [
                  t(
                    'a',
                    { href: m('/') },
                    {
                      class:
                        'flex w-full items-center justify-end xl:justify-start',
                    },
                    t(
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
                  t(
                    'ul',
                    null,
                    { class: 'hidden xl:flex w-full justify-center gap-8' },
                    x.map((l) =>
                      t(
                        'li',
                        null,
                        null,
                        s(
                          d,
                          {
                            get href() {
                              return l.href;
                            },
                            get target() {
                              return l.target;
                            },
                            type: 'link',
                            get theme() {
                              return f.NAV;
                            },
                            active: l.active || r.activeHref === l.href || !1,
                            children: A(l, 'label'),
                            [e]: {
                              href: L(l, 'href'),
                              target: L(l, 'target'),
                              theme: e,
                              type: e,
                            },
                          },
                          1,
                          'Xn_0'
                        ),
                        1,
                        l.label
                      )
                    ),
                    1,
                    null
                  ),
                  t(
                    'ul',
                    null,
                    {
                      class:
                        'hidden xl:flex w-full justify-end items-center gap-5',
                    },
                    [
                      t(
                        'li',
                        null,
                        { class: 'flex' },
                        s(
                          d,
                          {
                            href: 'https://github.com/module-federation',
                            target: '_blank',
                            type: 'link',
                            get theme() {
                              return f.NAKED_ALT;
                            },
                            children: s(
                              T,
                              {
                                get name() {
                                  return O.GITHUB;
                                },
                                size: '36px',
                                [e]: { name: e, size: e },
                              },
                              3,
                              'Xn_1'
                            ),
                            [e]: { href: e, target: e, theme: e, type: e },
                          },
                          1,
                          'Xn_2'
                        ),
                        1,
                        null
                      ),
                      t(
                        'li',
                        null,
                        { class: 'flex' },
                        s(
                          d,
                          {
                            href: 'https://discord.gg/T8c6yAxkbv',
                            target: '_blank',
                            type: 'link',
                            get theme() {
                              return f.NAKED_ALT;
                            },
                            children: s(
                              T,
                              {
                                get name() {
                                  return O.DISCORD;
                                },
                                size: '36px',
                                [e]: { name: e, size: e },
                              },
                              3,
                              'Xn_3'
                            ),
                            [e]: { href: e, target: e, theme: e, type: e },
                          },
                          1,
                          'Xn_4'
                        ),
                        1,
                        null
                      ),
                      t(
                        'li',
                        null,
                        null,
                        s(
                          C,
                          {
                            children: I.map((l) =>
                              s(
                                H,
                                {
                                  children: A(l, 'name'),
                                  onClick$: g(
                                    () =>
                                      h(
                                        () => Promise.resolve().then(() => p),
                                        void 0
                                      ),
                                    's_HSLHKDE0Tc8',
                                    [_, l]
                                  ),
                                  selected: u.locale.lang === l.lang,
                                },
                                1,
                                l.lang
                              )
                            ),
                            name: 'language',
                            value: c == null ? void 0 : c.name,
                            [e]: { name: e },
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
                  t(
                    'div',
                    null,
                    { class: 'flex xl:hidden relative' },
                    t(
                      'button',
                      null,
                      {
                        onClick$: g(
                          () =>
                            h(() => Promise.resolve().then(() => p), void 0),
                          's_Qj09dIbebQs',
                          [n]
                        ),
                      },
                      [
                        t(
                          'span',
                          null,
                          {
                            class: b(
                              (l) =>
                                `relative my-1.5 block h-0.5 w-[30px] bg-blue-gray-900 transition-all duration-300  ${
                                  l.value ? ' top-[7px] rotate-45' : ' '
                                }`,
                              [n]
                            ),
                          },
                          null,
                          3,
                          null
                        ),
                        t(
                          'span',
                          null,
                          {
                            class: b(
                              (l) =>
                                `relative my-1.5 block h-0.5 w-[30px] bg-blue-gray-900 transition-all duration-300  ${
                                  l.value ? 'opacity-0 ' : ' '
                                }`,
                              [n]
                            ),
                          },
                          null,
                          3,
                          null
                        ),
                        t(
                          'span',
                          null,
                          {
                            class: b(
                              (l) =>
                                `relative my-1.5 block h-0.5 w-[30px] bg-blue-gray-900 transition-all duration-300 ${
                                  l.value ? ' top-[-8px] -rotate-45' : ' '
                                }`,
                              [n]
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
              theme: w,
              [e]: { fullWidth: e, pattern: b((l) => l.value === 0, [i]) },
            },
            1,
            'Xn_6'
          ),
          t(
            'div',
            null,
            {
              class: b(
                (l) =>
                  `absolute w-screen z-50 h-screen top-0 right-0 bg-transparent ${
                    l.value ? 'visible' : 'invisible'
                  }`,
                [n]
              ),
              onClick$: g(
                () => h(() => Promise.resolve().then(() => p), void 0),
                's_LQcmHAxuFaU',
                [n]
              ),
            },
            null,
            3,
            null
          ),
          t(
            'div',
            {
              class: `navbar bg-mf-gray inline-block xl:hidden absolute left-0 px-4 top-[88px] w-full h-screen z-[60] transition-opacity duration-300 ${
                n.value ? 'visible opacity-100' : 'invisible opacity-0'
              }`,
            },
            null,
            t(
              'ul',
              null,
              { class: 'flex flex-col gap-8' },
              [
                x.map((l) =>
                  t(
                    'li',
                    null,
                    null,
                    s(
                      d,
                      {
                        get href() {
                          return l.href;
                        },
                        type: 'link',
                        get theme() {
                          return f.NAKED_ALT;
                        },
                        get active() {
                          return l.active;
                        },
                        children: A(l, 'label'),
                        [e]: {
                          active: L(l, 'active'),
                          href: L(l, 'href'),
                          theme: e,
                          type: e,
                        },
                      },
                      1,
                      'Xn_7'
                    ),
                    1,
                    l.label
                  )
                ),
                t(
                  'li',
                  null,
                  { class: 'flex gap-8' },
                  [
                    s(
                      d,
                      {
                        href: 'https://github.com/module-federation',
                        target: '_blank',
                        type: 'link',
                        get theme() {
                          return f.NAKED_ALT;
                        },
                        children: s(
                          T,
                          {
                            get name() {
                              return O.GITHUB;
                            },
                            size: '36px',
                            [e]: { name: e, size: e },
                          },
                          3,
                          'Xn_8'
                        ),
                        [e]: { href: e, target: e, theme: e, type: e },
                      },
                      1,
                      'Xn_9'
                    ),
                    s(
                      d,
                      {
                        href: 'https://discord.gg/T8c6yAxkbv',
                        target: '_blank',
                        type: 'link',
                        get theme() {
                          return f.NAKED_ALT;
                        },
                        children: s(
                          T,
                          {
                            get name() {
                              return O.DISCORD;
                            },
                            size: '36px',
                            [e]: { name: e, size: e },
                          },
                          3,
                          'Xn_10'
                        ),
                        [e]: { href: e, target: e, theme: e, type: e },
                      },
                      1,
                      'Xn_11'
                    ),
                  ],
                  1,
                  null
                ),
                t(
                  'li',
                  null,
                  null,
                  t(
                    'select',
                    null,
                    {
                      class:
                        'border-blue-gray-900 w-1/2 px-4 py-1.5 pr-8 bg-mf-gray hover:bg-white focus:bg-mf-gray text-lg focus:border-ui-blue',
                      id: 'language',
                      name: 'language',
                      onChange$: g(
                        () => h(() => Promise.resolve().then(() => p), void 0),
                        's_YWAZ5f0lJEw',
                        [_]
                      ),
                    },
                    I.map((l) =>
                      t(
                        'option',
                        {
                          selected: u.locale.lang === l.lang,
                          value: A(l, 'lang'),
                        },
                        null,
                        l.name,
                        1,
                        l.lang
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
  F = (r) => {
    const [n] = v(),
      o = k[r],
      a = new URL(location.href);
    n.params.lang
      ? o.lang !== $.defaultLocale.lang
        ? (a.pathname = a.pathname.replace(n.params.lang, o.lang))
        : (a.pathname = a.pathname.replace(
            new RegExp(`(/${n.params.lang}/)|(/${n.params.lang}$)`),
            '/'
          ))
      : o.lang !== $.defaultLocale.lang &&
        (a.pathname = `/${o.lang}${a.pathname}`),
      (location.href = a.toString());
  },
  J = () => {
    const [r] = v();
    return (r.value = !1);
  },
  Y = '',
  G = Y,
  M = async () => {
    const [r, n] = v();
    return await r(n.lang);
  },
  p = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        _hW: V,
        s_EQll1XU2k6A: F,
        s_HSLHKDE0Tc8: M,
        s_K8TT2dajw7I: G,
        s_LQcmHAxuFaU: J,
        s_Qj09dIbebQs: K,
        s_YWAZ5f0lJEw: Q,
        s_dBzp75i0JUA: B,
        s_e0RDNPJNIGY: W,
      },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  );
export {
  V as _hW,
  F as s_EQll1XU2k6A,
  M as s_HSLHKDE0Tc8,
  G as s_K8TT2dajw7I,
  J as s_LQcmHAxuFaU,
  K as s_Qj09dIbebQs,
  Q as s_YWAZ5f0lJEw,
  B as s_dBzp75i0JUA,
  W as s_e0RDNPJNIGY,
};
function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = [];
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i]);
}
