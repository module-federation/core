import {
  f as p,
  h as l,
  l as _,
  n as h,
  o as m,
  P as o,
  g as u,
  K as e,
  C as w,
  _ as r,
  v as g,
} from './q-9ngTyHsh.js';
import { a as v, B as b } from './q-UhehzwuD.js';
import { L as f } from './q-51TGVSGw.js';
import { a as x } from './q-T3cxTwNd.js';
import { u as i } from './q-Scd2ZB6o.js';
const y = async (n) => {
    const [t] = p();
    return t(n);
  },
  L = '',
  S = L,
  E = (n) => {
    const [t, s] = p(),
      a = n.target,
      d = new FormData(a);
    d.get('email') &&
      ((t.value = !0),
      (s.value = !1),
      fetch('/docs/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(d).toString(),
      })
        .then(() => {
          (s.value = !0), (t.value = !1), a.reset();
        })
        .catch((D) => (t.value = !1)));
  },
  O = l(
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
  P = l(
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
  T = l(
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
  B = () => {
    _(),
      h(
        u(
          () => r(() => Promise.resolve().then(() => c), void 0),
          's_i9FQ1vZJ8l0'
        )
      );
    const n = m(!1),
      t = m(!1),
      s = u(
        () => r(() => Promise.resolve().then(() => c), void 0),
        's_KPHXz30Lh3M',
        [n, t]
      );
    return o(
      x,
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
                  i('subscribe.title@@Subscribe to our email newsletter!'),
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
                      onSubmit$: u(
                        () => r(() => Promise.resolve().then(() => c), void 0),
                        's_n1zdSBKIeTw',
                        [s]
                      ),
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
                          placeholder: i(
                            'subscribe.input.placeholder@@Enter your email'
                          ),
                          type: 'email',
                        },
                        null,
                        3,
                        null
                      ),
                      o(
                        v,
                        {
                          class: 'whitespace-nowrap w-full md:w-auto',
                          get theme() {
                            return b.SOLID;
                          },
                          small: !0,
                          type: 'submit',
                          get loading() {
                            return n.value;
                          },
                          children: i('subscribe.action@@Subscribe'),
                          [e]: {
                            class: e,
                            loading: w((a) => a.value, [n]),
                            small: e,
                            theme: e,
                            type: e,
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
                O,
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
                P,
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
                T,
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
              o(
                f,
                {
                  class:
                    'absolute w-12 md:w-1/4 top-[25%] md:top-[60%] right-0',
                  showEnd: !1,
                  [e]: { class: e, showEnd: e },
                },
                3,
                'xO_3'
              ),
              o(
                f,
                {
                  class:
                    'absolute w-24 md:w-52 top-0 left-[12%] md:left-[14%] rotate-90 origin-left -translate-y-1/2',
                  showStart: !1,
                  [e]: { class: e, showStart: e },
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
  c = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        _hW: g,
        s_KPHXz30Lh3M: E,
        s_KnttE033sL4: B,
        s_i9FQ1vZJ8l0: S,
        s_n1zdSBKIeTw: y,
      },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  );
export {
  g as _hW,
  E as s_KPHXz30Lh3M,
  B as s_KnttE033sL4,
  S as s_i9FQ1vZJ8l0,
  y as s_n1zdSBKIeTw,
};
function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = [];
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i]);
}
