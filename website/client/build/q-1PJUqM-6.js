import { a as h, B as p } from './q-UhehzwuD.js';
import { C as n } from './q-XhXTUHYG.js';
import { F as v } from './q-5QrMjcEM.js';
import { N as _ } from './q-ydNx7cQB.js';
import { a as f, b as g, S as w } from './q-T3cxTwNd.js';
import {
  P as s,
  K as e,
  h as l,
  i as a,
  L as S,
  n as y,
  g as O,
  _ as L,
} from './q-9ngTyHsh.js';
import { cardRows as G } from './q-pgd5M9oM.js';
import { l as b } from './q-JZLb1D8d.js';
import { a as x, u as r } from './q-Scd2ZB6o.js';
import { c as U } from './q-uSJWasxr.js';
const P = () => {
    const i = x(),
      u = (d) => b(d, i),
      c = r('showcase-page.title@@Showcase'),
      t = r(
        'showcase-page.subtitle@@Meet leading companies embracing Module Federation for their web development needs.'
      );
    return s(
      S,
      {
        children: [
          s(
            _,
            {
              get theme() {
                return n.NONE;
              },
              activeHref: u('showcase'),
              [e]: { theme: e },
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
          s(
            f,
            {
              get padding() {
                return g.TOP;
              },
              get theme() {
                return n.NONE;
              },
              children: [
                s(
                  w,
                  {
                    'q:slot': 'header',
                    subtitle: t,
                    title: c,
                    [e]: { 'q:slot': e },
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
                      G.map((d, m) =>
                        l(
                          'div',
                          {
                            class: `w-full grid gap-x-2 gap-y-4 grid-cols-1 ${
                              m > 1 && 'md:grid-cols-3'
                            }  ${m === 1 && 'md:grid-cols-2'} `,
                          },
                          null,
                          d.map((o) =>
                            l(
                              'div',
                              null,
                              { class: 'relative' },
                              [
                                l(
                                  'img',
                                  {
                                    alt: a(o, 'name'),
                                    src: a(o, 'previewSrc'),
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
                                          a(o, 'name'),
                                          1,
                                          null
                                        ),
                                        l(
                                          'a',
                                          { href: `https://${o.url}` },
                                          {
                                            class:
                                              'text-xl text-ui-blue font-semibold',
                                          },
                                          a(o, 'url'),
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
                    s(
                      h,
                      {
                        class: 'w-full md:w-auto',
                        get theme() {
                          return p.SOLID;
                        },
                        children: r('showcase-page.action@@Become a showcase'),
                        href: 'https://opencollective.com/module-federation-universe',
                        type: 'link',
                        [e]: { class: e, href: e, theme: e, type: e },
                      },
                      1,
                      'iG_4'
                    ),
                  ],
                  1,
                  null
                ),
              ],
              [e]: { padding: e, theme: e },
            },
            1,
            'iG_5'
          ),
          s(
            v,
            {
              get theme() {
                return n.NONE;
              },
              [e]: { theme: e },
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
  k =
    '.showcase-grid{grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}',
  E = k,
  I = () => {
    y(
      O(() => L(() => Promise.resolve().then(() => N), void 0), 's_IMLVEX3dgUw')
    );
    const i = x(),
      u = (t) => b(t, i),
      c = r('showcase.title@@Showcase');
    return s(
      f,
      {
        get padding() {
          return g.BOTTOM;
        },
        get theme() {
          return n.OPAQUE;
        },
        children: [
          s(
            w,
            { 'q:slot': 'header', title: c, [e]: { 'q:slot': e } },
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
                U.map((t) =>
                  l(
                    'div',
                    null,
                    { class: 'flex flex-col gap-4' },
                    [
                      l(
                        'img',
                        { alt: a(t, 'name'), src: a(t, 'previewSrc') },
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
                            a(t, 'name'),
                            1,
                            null
                          ),
                          l(
                            'div',
                            null,
                            { class: 'max-w-full truncate' },
                            l(
                              'a',
                              { href: `https://${t.url}` },
                              { class: 'text-xl font-semibold text-ui-blue' },
                              a(t, 'url'),
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
              s(
                h,
                {
                  class: 'w-full md:w-auto',
                  get theme() {
                    return p.SOLID;
                  },
                  children: r('showcase.action@@See more showcases'),
                  href: u('/showcase'),
                  type: 'link',
                  [e]: { class: e, theme: e, type: e },
                },
                1,
                'LU_2'
              ),
            ],
            1,
            null
          ),
        ],
        [e]: { padding: e, theme: e },
      },
      1,
      'LU_3'
    );
  },
  N = Object.freeze(
    Object.defineProperty(
      { __proto__: null, s_IMLVEX3dgUw: E, s_JGcGwM6uqSo: P, s_VoSI6o07IFI: I },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  );
export { E as s_IMLVEX3dgUw, P as s_JGcGwM6uqSo, I as s_VoSI6o07IFI };
function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = [];
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i]);
}
