import {
  f as _,
  l as c,
  n as v,
  o as d,
  P as a,
  h as e,
  C as u,
  g as t,
  N as p,
  L as C,
  _ as o,
} from './q-9ngTyHsh.js';
import { b as i, s as f } from './q-Jbye9dve.js';
const m = '.dropdown{min-width:calc(100% + 2px)}',
  h = m,
  P = () => {
    const [l] = _();
    return (l.value = !1);
  },
  b = () => {
    const [l] = _();
    return (l.value = !l.value);
  },
  g = (l) => {
    c(),
      v(
        t(
          () => o(() => Promise.resolve().then(() => r), void 0),
          's_tNYOaCIm0Qc'
        )
      );
    const s = d(!1);
    return a(
      C,
      {
        children: [
          e(
            'div',
            null,
            {
              class: u(
                (n) =>
                  `absolute w-screen h-screen top-0 right-0 bg-transparent ${
                    n.value ? 'visible' : 'invisible'
                  }`,
                [s]
              ),
              onClick$: t(
                () => o(() => Promise.resolve().then(() => r), void 0),
                's_2HCPp1ydyqs',
                [s]
              ),
            },
            null,
            3,
            null
          ),
          e(
            'button',
            { class: `relative ${i} ${f} ${l.class || ''}` },
            {
              onClick$: t(
                () => o(() => Promise.resolve().then(() => r), void 0),
                's_MOjpn7epc74',
                [s]
              ),
            },
            [
              e(
                'div',
                null,
                { class: 'flex gap-2 items-center ' },
                [
                  e(
                    'div',
                    null,
                    null,
                    u((n) => n.value, [l]),
                    3,
                    null
                  ),
                  e(
                    'svg',
                    null,
                    {
                      fill: 'none',
                      height: '8',
                      viewBox: '0 0 12 8',
                      width: '12',
                      xmlns: 'http://www.w3.org/2000/svg',
                    },
                    e(
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
              s.value &&
                e(
                  'div',
                  null,
                  {
                    class: `dropdown absolute bottom-[-6px] left-[-1px] translate-y-full p-0 ${i} z-[60]`,
                  },
                  a(p, null, 3, 'Vv_0'),
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
  r = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        s_2HCPp1ydyqs: P,
        s_MOjpn7epc74: b,
        s_Pl7vAlduOuo: g,
        s_tNYOaCIm0Qc: h,
      },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  );
export {
  P as s_2HCPp1ydyqs,
  b as s_MOjpn7epc74,
  g as s_Pl7vAlduOuo,
  h as s_tNYOaCIm0Qc,
};
function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = [];
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i]);
}
