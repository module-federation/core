// @ts-nocheck
/* eslint-disable */
/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 */
export const validate = o;
export default o;
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
};
function t(
  r,
  {
    instancePath: e = '',
    parentData: a,
    parentDataProperty: n,
    rootData: o = r,
  } = {},
) {
  if (!Array.isArray(r))
    return (t.errors = [{ params: { type: 'array' } }]), !1;
  {
    const e = r.length;
    for (let a = 0; a < e; a++) {
      let e = r[a];
      const n = 0;
      if ('string' != typeof e)
        return (t.errors = [{ params: { type: 'string' } }]), !1;
      if (e.length < 1) return (t.errors = [{ params: {} }]), !1;
      if (0 !== n) break;
    }
  }
  return (t.errors = null), !0;
}
function e(
  r,
  {
    instancePath: a = '',
    parentData: n,
    parentDataProperty: o,
    rootData: s = r,
  } = {},
) {
  let l = null,
    i = 0;
  if (0 === i) {
    if (!r || 'object' != typeof r || Array.isArray(r))
      return (e.errors = [{ params: { type: 'object' } }]), !1;
    {
      let n;
      if (void 0 === r.external && (n = 'external'))
        return (e.errors = [{ params: { missingProperty: n } }]), !1;
      {
        const n = i;
        for (const t in r)
          if ('external' !== t && 'shareScope' !== t)
            return (e.errors = [{ params: { additionalProperty: t } }]), !1;
        if (n === i) {
          if (void 0 !== r.external) {
            let n = r.external;
            const o = i,
              u = i;
            let m = !1;
            const f = i;
            if (i == i)
              if ('string' == typeof n) {
                if (n.length < 1) {
                  const r = { params: {} };
                  null === l ? (l = [r]) : l.push(r), i++;
                }
              } else {
                const r = { params: { type: 'string' } };
                null === l ? (l = [r]) : l.push(r), i++;
              }
            var p = f === i;
            if (((m = m || p), !m)) {
              const e = i;
              t(n, {
                instancePath: a + '/external',
                parentData: r,
                parentDataProperty: 'external',
                rootData: s,
              }) ||
                ((l = null === l ? t.errors : l.concat(t.errors)),
                (i = l.length)),
                (p = e === i),
                (m = m || p);
            }
            if (!m) {
              const r = { params: {} };
              return (
                null === l ? (l = [r]) : l.push(r), i++, (e.errors = l), !1
              );
            }
            (i = u), null !== l && (u ? (l.length = u) : (l = null));
            var c = o === i;
          } else c = !0;
          if (c)
            if (void 0 !== r.shareScope) {
              let t = r.shareScope;
              const a = i;
              if (i === a) {
                if ('string' != typeof t)
                  return (e.errors = [{ params: { type: 'string' } }]), !1;
                if (t.length < 1) return (e.errors = [{ params: {} }]), !1;
              }
              c = a === i;
            } else c = !0;
        }
      }
    }
  }
  return (e.errors = l), 0 === i;
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
    for (const o in r) {
      let s = r[o];
      const u = p,
        m = p;
      let f = !1;
      const y = p;
      e(s, {
        instancePath: n + '/' + o.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: r,
        parentDataProperty: o,
        rootData: l,
      }) || ((i = null === i ? e.errors : i.concat(e.errors)), (p = i.length));
      var c = y === p;
      if (((f = f || c), !f)) {
        const e = p;
        if (p == p)
          if ('string' == typeof s) {
            if (s.length < 1) {
              const r = { params: {} };
              null === i ? (i = [r]) : i.push(r), p++;
            }
          } else {
            const r = { params: { type: 'string' } };
            null === i ? (i = [r]) : i.push(r), p++;
          }
        if (((c = e === p), (f = f || c), !f)) {
          const e = p;
          t(s, {
            instancePath: n + '/' + o.replace(/~/g, '~0').replace(/\//g, '~1'),
            parentData: r,
            parentDataProperty: o,
            rootData: l,
          }) ||
            ((i = null === i ? t.errors : i.concat(t.errors)), (p = i.length)),
            (c = e === p),
            (f = f || c);
        }
      }
      if (!f) {
        const r = { params: {} };
        return null === i ? (i = [r]) : i.push(r), p++, (a.errors = i), !1;
      }
      if (((p = m), null !== i && (m ? (i.length = m) : (i = null)), u !== p))
        break;
    }
  }
  return (a.errors = i), 0 === p;
}
function n(
  r,
  {
    instancePath: t = '',
    parentData: e,
    parentDataProperty: o,
    rootData: s = r,
  } = {},
) {
  let l = null,
    i = 0;
  const p = i;
  let c = !1;
  const u = i;
  if (i === u)
    if (Array.isArray(r)) {
      const e = r.length;
      for (let n = 0; n < e; n++) {
        let e = r[n];
        const o = i,
          p = i;
        let c = !1;
        const u = i;
        if (i == i)
          if ('string' == typeof e) {
            if (e.length < 1) {
              const r = { params: {} };
              null === l ? (l = [r]) : l.push(r), i++;
            }
          } else {
            const r = { params: { type: 'string' } };
            null === l ? (l = [r]) : l.push(r), i++;
          }
        var m = u === i;
        if (((c = c || m), !c)) {
          const o = i;
          a(e, {
            instancePath: t + '/' + n,
            parentData: r,
            parentDataProperty: n,
            rootData: s,
          }) ||
            ((l = null === l ? a.errors : l.concat(a.errors)), (i = l.length)),
            (m = o === i),
            (c = c || m);
        }
        if (c) (i = p), null !== l && (p ? (l.length = p) : (l = null));
        else {
          const r = { params: {} };
          null === l ? (l = [r]) : l.push(r), i++;
        }
        if (o !== i) break;
      }
    } else {
      const r = { params: { type: 'array' } };
      null === l ? (l = [r]) : l.push(r), i++;
    }
  var f = u === i;
  if (((c = c || f), !c)) {
    const n = i;
    a(r, {
      instancePath: t,
      parentData: e,
      parentDataProperty: o,
      rootData: s,
    }) || ((l = null === l ? a.errors : l.concat(a.errors)), (i = l.length)),
      (f = n === i),
      (c = c || f);
  }
  if (!c) {
    const r = { params: {} };
    return null === l ? (l = [r]) : l.push(r), i++, (n.errors = l), !1;
  }
  return (
    (i = p),
    null !== l && (p ? (l.length = p) : (l = null)),
    (n.errors = l),
    0 === i
  );
}
function o(
  t,
  {
    instancePath: e = '',
    parentData: a,
    parentDataProperty: s,
    rootData: l = t,
  } = {},
) {
  let i = null,
    p = 0;
  if (0 === p) {
    if (!t || 'object' != typeof t || Array.isArray(t))
      return (o.errors = [{ params: { type: 'object' } }]), !1;
    {
      let a;
      if (
        (void 0 === t.remoteType && (a = 'remoteType')) ||
        (void 0 === t.remotes && (a = 'remotes'))
      )
        return (o.errors = [{ params: { missingProperty: a } }]), !1;
      {
        const a = p;
        for (const r in t)
          if ('remoteType' !== r && 'remotes' !== r && 'shareScope' !== r)
            return (o.errors = [{ params: { additionalProperty: r } }]), !1;
        if (a === p) {
          if (void 0 !== t.remoteType) {
            let e = t.remoteType;
            const a = p,
              n = p;
            let s = !1,
              l = null;
            const u = p;
            if (
              'var' !== e &&
              'module' !== e &&
              'assign' !== e &&
              'this' !== e &&
              'window' !== e &&
              'self' !== e &&
              'global' !== e &&
              'commonjs' !== e &&
              'commonjs2' !== e &&
              'commonjs-module' !== e &&
              'commonjs-static' !== e &&
              'amd' !== e &&
              'amd-require' !== e &&
              'umd' !== e &&
              'umd2' !== e &&
              'jsonp' !== e &&
              'system' !== e &&
              'promise' !== e &&
              'import' !== e &&
              'script' !== e &&
              'node-commonjs' !== e
            ) {
              const t = { params: { allowedValues: r.enum } };
              null === i ? (i = [t]) : i.push(t), p++;
            }
            if ((u === p && ((s = !0), (l = 0)), !s)) {
              const r = { params: { passingSchemas: l } };
              return (
                null === i ? (i = [r]) : i.push(r), p++, (o.errors = i), !1
              );
            }
            (p = n), null !== i && (n ? (i.length = n) : (i = null));
            var c = a === p;
          } else c = !0;
          if (c) {
            if (void 0 !== t.remotes) {
              const r = p;
              n(t.remotes, {
                instancePath: e + '/remotes',
                parentData: t,
                parentDataProperty: 'remotes',
                rootData: l,
              }) ||
                ((i = null === i ? n.errors : i.concat(n.errors)),
                (p = i.length)),
                (c = r === p);
            } else c = !0;
            if (c)
              if (void 0 !== t.shareScope) {
                let r = t.shareScope;
                const e = p;
                if (p === e) {
                  if ('string' != typeof r)
                    return (o.errors = [{ params: { type: 'string' } }]), !1;
                  if (r.length < 1) return (o.errors = [{ params: {} }]), !1;
                }
                c = e === p;
              } else c = !0;
          }
        }
      }
    }
  }
  return (o.errors = i), 0 === p;
}
