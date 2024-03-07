import {
  n as i,
  P as t,
  h as a,
  C as r,
  K as n,
  N as o,
  g as u,
  _ as m,
} from './q-9ngTyHsh.js';
import { a as c } from './q-XhXTUHYG.js';
import { b as s } from './q-T3cxTwNd.js';
const _ = '',
  f = _,
  g = (e) => {
    i(
      u(() => m(() => Promise.resolve().then(() => h), void 0), 's_MR5rBPxRKDs')
    );
    const d = {
      [s.TOP]: 'pt-14 md:pt-28',
      [s.BOTTOM]: 'pb-14 md:pb-28',
      [s.BOTH]: 'py-14 md:py-28',
      [s.NONE]: '',
    }[e.padding || s.BOTH];
    return t(
      c,
      {
        get fullWidth() {
          return e.fullWidth;
        },
        get theme() {
          return e.theme;
        },
        children: [
          a(
            'section',
            {
              class: `flex flex-col items-center gap-10 ${d} ${e.class || ''}`,
            },
            { id: r((l) => l.id, [e]) },
            [
              a(
                'div',
                null,
                { class: 'empty:hidden' },
                t(o, { name: 'header', [n]: { name: n } }, 3, 'fW_0'),
                1,
                null
              ),
              a(
                'div',
                null,
                { class: 'w-full' },
                t(o, null, 3, 'fW_1'),
                1,
                null
              ),
            ],
            1,
            null
          ),
          a(
            'span',
            { 'q:slot': 'background' },
            null,
            t(o, { name: 'background', [n]: { name: n } }, 3, 'fW_2'),
            1,
            null
          ),
          a(
            'span',
            { 'q:slot': 'background-no-overlay' },
            null,
            t(
              o,
              { name: 'background-no-overlay', [n]: { name: n } },
              3,
              'fW_3'
            ),
            1,
            null
          ),
        ],
        [n]: {
          fullWidth: r((l) => l.fullWidth, [e]),
          theme: r((l) => l.theme, [e]),
        },
      },
      1,
      'fW_4'
    );
  },
  h = Object.freeze(
    Object.defineProperty(
      { __proto__: null, s_MBnCRhRrMNs: g, s_MR5rBPxRKDs: f },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  );
export { g as s_MBnCRhRrMNs, f as s_MR5rBPxRKDs };
function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = [];
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i]);
}
