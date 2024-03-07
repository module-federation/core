import {
  n as u,
  P as l,
  h as o,
  i,
  K as t,
  R as n,
  g as f,
  _ as p,
} from './q-9ngTyHsh.js';
import { a as d, B as h } from './q-UhehzwuD.js';
import { C as g, a as _ } from './q-XhXTUHYG.js';
import { l as y } from './q-JZLb1D8d.js';
import { a as b, u as r } from './q-Scd2ZB6o.js';
const v = '',
  x = v,
  P = (a) => {
    u(
      f(() => p(() => Promise.resolve().then(() => T), void 0), 's_g0E4nZcqTc8')
    );
    const s = b(),
      c = (e) => y(e, s),
      m = [
        {
          label: r('footer.menu.examples@@Examples'),
          href: 'https://github.com/module-federation/module-federation-examples',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
        {
          label: r('footer.menu.practical-guide@@Practical guide'),
          href: 'https://module-federation.myshopify.com/products/practical-module-federation',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
        {
          label: r('footer.menu.medusa@@Try Medusa'),
          href: 'https://app.medusa.codes/',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
        {
          label: r('footer.menu.documentation@@Documentation'),
          href: '/docs/en/mf-docs/0.2/getting-started/',
        },
        {
          label: r('footer.menu.sponsor@@Become a sponsor'),
          href: 'https://opencollective.com/module-federation-universe',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
        {
          label: r('footer.menu.privacy-policy@@Privacy Policy'),
          href: c('/privacy-policy'),
        },
      ];
    return l(
      _,
      {
        children: o(
          'footer',
          null,
          { class: 'flex flex-col items-center py-28 gap-10' },
          [
            o(
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
            o(
              'div',
              null,
              {
                class:
                  'flex items-center justify-center flex-wrap gap-y-4 gap-x-10',
              },
              m.map((e) =>
                l(
                  d,
                  {
                    get href() {
                      return e.href;
                    },
                    type: 'link',
                    get theme() {
                      return h.NAKED_ALT;
                    },
                    get rel() {
                      return e.rel;
                    },
                    children: i(e, 'label'),
                    [t]: {
                      href: n(e, 'href'),
                      rel: n(e, 'rel'),
                      theme: t,
                      type: t,
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
        theme: a.theme || g.PINK,
      },
      1,
      'yk_1'
    );
  },
  T = Object.freeze(
    Object.defineProperty(
      { __proto__: null, s_2fkm5zc0rek: P, s_g0E4nZcqTc8: x },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  );
export { P as s_2fkm5zc0rek, x as s_g0E4nZcqTc8 };
function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = [];
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i]);
}
