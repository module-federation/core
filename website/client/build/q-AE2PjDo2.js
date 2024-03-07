import {
  n as r,
  P as s,
  h as n,
  i as l,
  K as a,
  g as o,
  _ as m,
} from './q-9ngTyHsh.js';
import { C as d } from './q-XhXTUHYG.js';
import { a as u } from './q-T3cxTwNd.js';
import { r as f } from './q-qP2n7w9d.js';
const c = () => (
    r(
      o(() => m(() => Promise.resolve().then(() => h), void 0), 's_ZwZ0qjzCTZQ')
    ),
    s(
      u,
      {
        fullWidth: !0,
        get theme() {
          return d.OPAQUE;
        },
        children: n(
          'div',
          null,
          { class: 'flex flex-col gap-8' },
          [
            f.map((e, i) =>
              n(
                'div',
                null,
                { class: 'overflow-hidden w-full animation-container h-12' },
                n(
                  'div',
                  { class: `flex justify-between animated animated--${i}` },
                  null,
                  [...e, ...e, ...e].map((t) =>
                    n(
                      'img',
                      { alt: l(t, 'name'), src: l(t, 'src') },
                      { class: 'h-12 px-16' },
                      null,
                      3,
                      t.name + '0'
                    )
                  ),
                  1,
                  i
                ),
                1,
                'xz_0'
              )
            ),
            n('div', null, null, null, 3, null),
          ],
          1,
          null
        ),
        [a]: { fullWidth: a, theme: a },
      },
      1,
      'xz_1'
    )
  ),
  _ =
    '@keyframes slide{0%{transform:translateZ(0)}to{transform:translate3d(-50%,0,0)}}.animation-container{position:relative}.animated{position:absolute;top:0;left:0;width:100%;animation-direction:normal;animation-fill-mode:none;animation-play-state:running}.animated--0{animation:slide 30s linear infinite}.animated--1{animation:slide 40s linear infinite}',
  p = _,
  h = Object.freeze(
    Object.defineProperty(
      { __proto__: null, s_5qyIIEjMPSA: c, s_ZwZ0qjzCTZQ: p },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  );
export { c as s_5qyIIEjMPSA, p as s_ZwZ0qjzCTZQ };
function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = [];
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i]);
}
