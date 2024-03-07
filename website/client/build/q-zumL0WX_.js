import {
  n as f,
  P as n,
  K as e,
  h as l,
  l as d,
  i as s,
  R as i,
  g,
  _ as p,
} from './q-9ngTyHsh.js';
import { a as h, B as v } from './q-UhehzwuD.js';
import { C as a } from './q-GyeNLo0W.js';
import { C as x } from './q-XhXTUHYG.js';
import { I as b } from './q-ps5hdwuV.js';
import { I as _ } from './q-gLuYvr2d.js';
import { L as r } from './q-51TGVSGw.js';
import { b as w, S as E, a as S } from './q-T3cxTwNd.js';
import { b as y } from './q-0yXnO8UR.js';
import { u as o } from './q-Scd2ZB6o.js';
const T = () => {
    f(
      g(() => p(() => Promise.resolve().then(() => I), void 0), 's_00VE9E0kYIc')
    );
    const u = [
        {
          title: o('evolving.rfcs.title@@RFCs'),
          subtitle: o(
            'evolving.rfcs.subtitle@@Participate in the community discussions to decide on what features are coming next'
          ),
          actionText: o('evolving.rfcs.action@@Take part now!'),
          actionHref:
            'https://github.com/module-federation/universe/discussions/categories/rfc',
          target: '_blank',
          lineClass:
            'absolute w-24 bottom-[5%] md:bottom-[20%] left-full -translate-x-full',
          lineShowStart: !0,
          lineShowEnd: !1,
        },
        {
          title: o('evolving.roadmap.title@@Module Federation Roadmap'),
          subtitle: o(
            'evolving.roadmap.subtitle@@Discover the future of Module Federation'
          ),
          actionText: o('evolving.roadmap.action@@Explore it!'),
          actionHref:
            'https://miro.com/app/board/uXjVPvdfG2I=/?share_link_id=45887343083',
          target: '_blank',
          lineClass:
            'absolute w-24 top-0 rotate-90 right-[10%] origin-left translate-x-full -translate-y-1/2',
          lineShowStart: !1,
          lineShowEnd: !0,
        },
      ],
      m = o('evolving.title@@Evolving Module Federation'),
      c = o(
        'evolving.subtitle@@The world of Module Federation is constantly evolving and growing based on the feedback from the community. The RFCs are open for all to participate in the discussion and the roadmap is published.'
      );
    return n(
      S,
      {
        get padding() {
          return w.BOTTOM;
        },
        get theme() {
          return x.OPAQUE;
        },
        children: [
          n(
            E,
            { 'q:slot': 'header', subtitle: c, title: m, [e]: { 'q:slot': e } },
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
                u.map(
                  (t) => (
                    d(),
                    n(
                      a,
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
                                s(t, 'title'),
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
                                s(t, 'subtitle'),
                                1,
                                null
                              ),
                              l(
                                'div',
                                null,
                                { class: 'mt-auto' },
                                n(
                                  h,
                                  {
                                    class: 'w-full md:w-auto',
                                    get theme() {
                                      return v.SOLID;
                                    },
                                    get href() {
                                      return t.actionHref;
                                    },
                                    get target() {
                                      return t.target;
                                    },
                                    children: [
                                      s(t, 'actionText'),
                                      n(
                                        b,
                                        {
                                          'q:slot': 'suffix',
                                          get name() {
                                            return _.ARROW_NARROW_RIGHT;
                                          },
                                          size: '24px',
                                          [e]: {
                                            name: e,
                                            'q:slot': e,
                                            size: e,
                                          },
                                        },
                                        3,
                                        'EQ_1'
                                      ),
                                    ],
                                    small: !0,
                                    type: 'link',
                                    [e]: {
                                      class: e,
                                      href: i(t, 'actionHref'),
                                      small: e,
                                      target: i(t, 'target'),
                                      theme: e,
                                      type: e,
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
                          t.lineClass &&
                            n(
                              r,
                              {
                                get class() {
                                  return t.lineClass;
                                },
                                get showEnd() {
                                  return t.lineShowEnd;
                                },
                                get showStart() {
                                  return t.lineShowStart;
                                },
                                [e]: {
                                  class: i(t, 'lineClass'),
                                  showEnd: i(t, 'lineShowEnd'),
                                  showStart: i(t, 'lineShowStart'),
                                },
                              },
                              3,
                              'EQ_3'
                            ),
                        ],
                      },
                      1,
                      t.title
                    )
                  )
                ),
                1,
                null
              ),
              n(
                a,
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
                          o(
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
                          y.map((t) =>
                            l(
                              'a',
                              {
                                href: s(t, 'actionHref'),
                                target: s(t, 'target'),
                              },
                              { class: 'flex flex-col items-center ' },
                              [
                                l(
                                  'img',
                                  { alt: s(t, 'name'), src: s(t, 'logo') },
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
                                  s(t, 'name'),
                                  1,
                                  null
                                ),
                              ],
                              1,
                              t.name
                            )
                          ),
                          1,
                          null
                        ),
                      ],
                      1,
                      null
                    ),
                    n(
                      r,
                      {
                        class:
                          'absolute w-6 bottom-0 rotate-90 left-1/2 origin-right translate-y-1/2 -translate-x-full',
                        showEnd: !1,
                        [e]: { class: e, showEnd: e },
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
        [e]: { padding: e, theme: e },
      },
      1,
      'EQ_6'
    );
  },
  C = '',
  R = C,
  I = Object.freeze(
    Object.defineProperty(
      { __proto__: null, s_00VE9E0kYIc: R, s_pbG9H8ze2g4: T },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  );
export { R as s_00VE9E0kYIc, T as s_pbG9H8ze2g4 };
function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = [];
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i]);
}
