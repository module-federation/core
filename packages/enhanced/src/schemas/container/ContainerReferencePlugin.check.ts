// @ts-nocheck
/* eslint-disable */
/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 */
export const validate = s;
export default s;
const r = {
    enum: [
      'var',
      'module',
      'assign',
      'this',
      'window',
      'self',
      'global',
      'commonjs',
      'commonjs2',
      'commonjs-module',
      'commonjs-static',
      'amd',
      'amd-require',
      'umd',
      'umd2',
      'jsonp',
      'system',
      'promise',
      'import',
      'script',
      'node-commonjs',
    ],
  },
  t = require('ajv/dist/runtime/ucs2length').default;
function e(
  r,
  {
    instancePath: a = '',
    parentData: n,
    parentDataProperty: o,
    rootData: s = r,
  } = {},
) {
  if (!Array.isArray(r))
    return (e.errors = [{ params: { type: 'array' } }]), !1;
  {
    const a = r.length;
    for (let n = 0; n < a; n++) {
      let a = r[n];
      const o = 0;
      if ('string' != typeof a)
        return (e.errors = [{ params: { type: 'string' } }]), !1;
      if (t(a) < 1) return (e.errors = [{ params: { limit: 1 } }]), !1;
      if (0 !== o) break;
    }
  }
  return (e.errors = null), !0;
}
function a(
  r,
  {
    instancePath: n = '',
    parentData: o,
    parentDataProperty: s,
    rootData: l = r,
  } = {},
) {
  let i = null,
    p = 0;
  if (0 === p) {
    if (!r || 'object' != typeof r || Array.isArray(r))
      return (a.errors = [{ params: { type: 'object' } }]), !1;
    {
      let o;
      if (void 0 === r.external && (o = 'external'))
        return (a.errors = [{ params: { missingProperty: o } }]), !1;
      {
        const o = p;
        for (const t in r)
          if ('external' !== t && 'shareScope' !== t)
            return (a.errors = [{ params: { additionalProperty: t } }]), !1;
        if (o === p) {
          if (void 0 !== r.external) {
            let o = r.external;
            const s = p,
              m = p;
            let f = !1;
            const y = p;
            if (p == p)
              if ('string' == typeof o) {
                if (t(o) < 1) {
                  const r = { params: { limit: 1 } };
                  null === i ? (i = [r]) : i.push(r), p++;
                }
              } else {
                const r = { params: { type: 'string' } };
                null === i ? (i = [r]) : i.push(r), p++;
              }
            var c = y === p;
            if (((f = f || c), !f)) {
              const t = p;
              e(o, {
                instancePath: n + '/external',
                parentData: r,
                parentDataProperty: 'external',
                rootData: l,
              }) ||
                ((i = null === i ? e.errors : i.concat(e.errors)),
                (p = i.length)),
                (c = t === p),
                (f = f || c);
            }
            if (!f) {
              const r = { params: {} };
              return (
                null === i ? (i = [r]) : i.push(r), p++, (a.errors = i), !1
              );
            }
            (p = m), null !== i && (m ? (i.length = m) : (i = null));
            var u = s === p;
          } else u = !0;
          if (u)
            if (void 0 !== r.shareScope) {
              let e = r.shareScope;
              const n = p;
              if (p === n) {
                if ('string' != typeof e)
                  return (a.errors = [{ params: { type: 'string' } }]), !1;
                if (t(e) < 1)
                  return (a.errors = [{ params: { limit: 1 } }]), !1;
              }
              u = n === p;
            } else u = !0;
        }
      }
    }
  }
  return (a.errors = i), 0 === p;
}
function n(
  r,
  {
    instancePath: o = '',
    parentData: s,
    parentDataProperty: l,
    rootData: i = r,
  } = {},
) {
  let p = null,
    c = 0;
  if (0 === c) {
    if (!r || 'object' != typeof r || Array.isArray(r))
      return (n.errors = [{ params: { type: 'object' } }]), !1;
    for (const s in r) {
      let l = r[s];
      const m = c,
        f = c;
      let y = !1;
      const h = c;
      a(l, {
        instancePath: o + '/' + s.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: r,
        parentDataProperty: s,
        rootData: i,
      }) || ((p = null === p ? a.errors : p.concat(a.errors)), (c = p.length));
      var u = h === c;
      if (((y = y || u), !y)) {
        const a = c;
        if (c == c)
          if ('string' == typeof l) {
            if (t(l) < 1) {
              const r = { params: { limit: 1 } };
              null === p ? (p = [r]) : p.push(r), c++;
            }
          } else {
            const r = { params: { type: 'string' } };
            null === p ? (p = [r]) : p.push(r), c++;
          }
        if (((u = a === c), (y = y || u), !y)) {
          const t = c;
          e(l, {
            instancePath: o + '/' + s.replace(/~/g, '~0').replace(/\//g, '~1'),
            parentData: r,
            parentDataProperty: s,
            rootData: i,
          }) ||
            ((p = null === p ? e.errors : p.concat(e.errors)), (c = p.length)),
            (u = t === c),
            (y = y || u);
        }
      }
      if (!y) {
        const r = { params: {} };
        return null === p ? (p = [r]) : p.push(r), c++, (n.errors = p), !1;
      }
      if (((c = f), null !== p && (f ? (p.length = f) : (p = null)), m !== c))
        break;
    }
  }
  return (n.errors = p), 0 === c;
}
function o(
  r,
  {
    instancePath: e = '',
    parentData: a,
    parentDataProperty: s,
    rootData: l = r,
  } = {},
) {
  let i = null,
    p = 0;
  const c = p;
  let u = !1;
  const m = p;
  if (p === m)
    if (Array.isArray(r)) {
      const a = r.length;
      for (let o = 0; o < a; o++) {
        let a = r[o];
        const s = p,
          c = p;
        let u = !1;
        const m = p;
        if (p == p)
          if ('string' == typeof a) {
            if (t(a) < 1) {
              const r = { params: { limit: 1 } };
              null === i ? (i = [r]) : i.push(r), p++;
            }
          } else {
            const r = { params: { type: 'string' } };
            null === i ? (i = [r]) : i.push(r), p++;
          }
        var f = m === p;
        if (((u = u || f), !u)) {
          const t = p;
          n(a, {
            instancePath: e + '/' + o,
            parentData: r,
            parentDataProperty: o,
            rootData: l,
          }) ||
            ((i = null === i ? n.errors : i.concat(n.errors)), (p = i.length)),
            (f = t === p),
            (u = u || f);
        }
        if (u) (p = c), null !== i && (c ? (i.length = c) : (i = null));
        else {
          const r = { params: {} };
          null === i ? (i = [r]) : i.push(r), p++;
        }
        if (s !== p) break;
      }
    } else {
      const r = { params: { type: 'array' } };
      null === i ? (i = [r]) : i.push(r), p++;
    }
  var y = m === p;
  if (((u = u || y), !u)) {
    const t = p;
    n(r, {
      instancePath: e,
      parentData: a,
      parentDataProperty: s,
      rootData: l,
    }) || ((i = null === i ? n.errors : i.concat(n.errors)), (p = i.length)),
      (y = t === p),
      (u = u || y);
  }
  if (!u) {
    const r = { params: {} };
    return null === i ? (i = [r]) : i.push(r), p++, (o.errors = i), !1;
  }
  return (
    (p = c),
    null !== i && (c ? (i.length = c) : (i = null)),
    (o.errors = i),
    0 === p
  );
}
function s(
  e,
  {
    instancePath: a = '',
    parentData: n,
    parentDataProperty: l,
    rootData: i = e,
  } = {},
) {
  let p = null,
    c = 0;
  if (0 === c) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (s.errors = [{ params: { type: 'object' } }]), !1;
    {
      let n;
      if (
        (void 0 === e.remoteType && (n = 'remoteType')) ||
        (void 0 === e.remotes && (n = 'remotes'))
      )
        return (s.errors = [{ params: { missingProperty: n } }]), !1;
      {
        const n = c;
        for (const r in e)
          if ('remoteType' !== r && 'remotes' !== r && 'shareScope' !== r)
            return (s.errors = [{ params: { additionalProperty: r } }]), !1;
        if (n === c) {
          if (void 0 !== e.remoteType) {
            let t = e.remoteType;
            const a = c,
              n = c;
            let o = !1,
              l = null;
            const i = c;
            if (
              'var' !== t &&
              'module' !== t &&
              'assign' !== t &&
              'this' !== t &&
              'window' !== t &&
              'self' !== t &&
              'global' !== t &&
              'commonjs' !== t &&
              'commonjs2' !== t &&
              'commonjs-module' !== t &&
              'commonjs-static' !== t &&
              'amd' !== t &&
              'amd-require' !== t &&
              'umd' !== t &&
              'umd2' !== t &&
              'jsonp' !== t &&
              'system' !== t &&
              'promise' !== t &&
              'import' !== t &&
              'script' !== t &&
              'node-commonjs' !== t
            ) {
              const t = { params: { allowedValues: r.enum } };
              null === p ? (p = [t]) : p.push(t), c++;
            }
            if ((i === c && ((o = !0), (l = 0)), !o)) {
              const r = { params: { passingSchemas: l } };
              return (
                null === p ? (p = [r]) : p.push(r), c++, (s.errors = p), !1
              );
            }
            (c = n), null !== p && (n ? (p.length = n) : (p = null));
            var u = a === c;
          } else u = !0;
          if (u) {
            if (void 0 !== e.remotes) {
              const r = c;
              o(e.remotes, {
                instancePath: a + '/remotes',
                parentData: e,
                parentDataProperty: 'remotes',
                rootData: i,
              }) ||
                ((p = null === p ? o.errors : p.concat(o.errors)),
                (c = p.length)),
                (u = r === c);
            } else u = !0;
            if (u)
              if (void 0 !== e.shareScope) {
                let r = e.shareScope;
                const a = c;
                if (c === a) {
                  if ('string' != typeof r)
                    return (s.errors = [{ params: { type: 'string' } }]), !1;
                  if (t(r) < 1)
                    return (s.errors = [{ params: { limit: 1 } }]), !1;
                }
                u = a === c;
              } else u = !0;
          }
        }
      }
    }
  }
  return (s.errors = p), 0 === c;
}
