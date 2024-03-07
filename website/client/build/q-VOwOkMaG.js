import { d as r, B as c } from './q-v9P9ygUp.js';
import { l as u, u as i, m, P as l, F as f, h, L as d } from './q-9ngTyHsh.js';
const L = () => {
  const s = c();
  u();
  const o = i('nonce'),
    n = m(r);
  if (n.value && n.value.length > 0) {
    const a = n.value.length;
    let t = null;
    for (let e = a - 1; e >= 0; e--)
      n.value[e].default &&
        (t = l(n.value[e].default, { children: t }, 1, 'zl_0'));
    return l(
      d,
      {
        children: [
          t,
          h(
            'script',
            { dangerouslySetInnerHTML: s },
            { nonce: o },
            null,
            3,
            null
          ),
        ],
      },
      1,
      'zl_1'
    );
  }
  return f;
};
export { L as s_e0ssiDXoeAM };
