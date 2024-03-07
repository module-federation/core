import {
  V as c,
  g as s,
  _ as g,
  l as m,
  n as x,
  h as l,
  P as i,
  C as a,
  K as r,
  N as o,
} from './q-9ngTyHsh.js';
import { B as n } from './q-UhehzwuD.js';
const y = '',
  f = y,
  _ = c(
    s(
      () => g(() => import('./q-U-FLH8EN.js'), __vite__mapDeps([])),
      's_M2E9iDaUBT4'
    )
  ),
  h = (e) => {
    m(),
      x(
        s(
          () => g(() => Promise.resolve().then(() => N), void 0),
          's_rk5oELlKahs'
        )
      );
    const u = e.small ? 'py-3 px-4' : 'py-6 px-8',
      b = {
        [n.SOLID]: [
          u,
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
        [n.OUTLINE]: [
          u,
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
        [n.NAKED]: [
          'p-0',
          'relative bg-transparent text-ui-blue !border-transparent outline-none font-medium leading-snug text-lg',
          'focus-visible:shadow-outline',
          e.disabled ? 'text-deep-purple-700 !pointer-events-none' : '',
          '',
        ].join(' '),
        [n.NAKED_ALT]: [
          'relative text-blue-gray-900 border-transparent active:font-semibold text-lg outline-ui-blue font-medium leading-snug',
          'hover:text-blue-gray-600',
          'active:text-blue-gray-700',
          e.active ? '!text-blue-gray-700' : '',
          (e.disabled, ''),
          (e.loading, ''),
        ].join(' '),
        [n.NAV]: [
          'relative text-blue-gray-900 border-transparent text-lg outline-ui-blue font-medium leading-snug',
          'active:font-semibold',
          'hover:text-deep-purple-700',
          'active:text-deep-purple-300',
          e.active ? '!text-deep-purple-300' : '',
          (e.disabled, ''),
          (e.loading, ''),
        ].join(' '),
        [n.SUB_NAV]: [
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
      v = { center: 'text-center', left: 'text-left', right: 'text-right' }[
        e.align || 'center'
      ],
      d = l(
        'div',
        null,
        { class: 'flex justify-center items-center gap-3' },
        [
          l(
            'div',
            null,
            { class: 'flex empty:hidden' },
            i(o, { name: 'prefix', [r]: { name: r } }, 3, 'Nm_0'),
            1,
            null
          ),
          l(
            'div',
            { class: `flex ${v}` },
            null,
            [
              l(
                'div',
                null,
                {
                  class: a((t) => `flex ${t.loading ? 'invisible' : ''}`, [e]),
                },
                i(o, null, 3, 'Nm_1'),
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
                  i(_, null, 3, 'Nm_2'),
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
            i(o, { name: 'suffix', [r]: { name: r } }, 3, 'Nm_4'),
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
          { class: `inline-block border-solid ${b[e.theme]} ${e.class || ''}` },
          {
            href: a((t) => t.href, [e]),
            rel: a((t) => t.rel, [e]),
            target: a((t) => t.target, [e]),
          },
          d,
          1,
          'Nm_6'
        )
      : l(
          'button',
          {
            class: `inline-block border-solid ${b[e.theme]} ${e.class || ''}`,
            onClick$: e.onClick,
          },
          { type: a((t) => t.type, [e]) },
          d,
          0,
          null
        );
  },
  N = Object.freeze(
    Object.defineProperty(
      { __proto__: null, s_rIehxbCtAqU: h, s_rk5oELlKahs: f },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  );
export { h as s_rIehxbCtAqU, f as s_rk5oELlKahs };
function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = [];
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i]);
}
