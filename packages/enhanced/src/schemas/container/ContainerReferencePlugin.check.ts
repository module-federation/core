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
    'module-import',
    'script',
    'node-commonjs',
  ],
};
function t(
  r,
  {
    instancePath: e = '',
    parentData: n,
    parentDataProperty: a,
    rootData: s = r,
  } = {},
) {
  if (!Array.isArray(r))
    return (t.errors = [{ params: { type: 'array' } }]), !1;
  {
    const e = r.length;
    for (let n = 0; n < e; n++) {
      let e = r[n];
      const a = 0;
      if ('string' != typeof e)
        return (t.errors = [{ params: { type: 'string' } }]), !1;
      if (e.length < 1) return (t.errors = [{ params: {} }]), !1;
      if (0 !== a) break;
    }
  }
  return (t.errors = null), !0;
}
function e(
  r,
  {
    instancePath: n = '',
    parentData: a,
    parentDataProperty: s,
    rootData: o = r,
  } = {},
) {
  let l = null,
    p = 0;
  if (0 === p) {
    if (!r || 'object' != typeof r || Array.isArray(r))
      return (e.errors = [{ params: { type: 'object' } }]), !1;
    {
      let a;
      if (void 0 === r.external && (a = 'external'))
        return (e.errors = [{ params: { missingProperty: a } }]), !1;
      {
        const a = p;
        for (const t in r)
          if ('external' !== t && 'shareScope' !== t)
            return (e.errors = [{ params: { additionalProperty: t } }]), !1;
        if (a === p) {
          if (void 0 !== r.external) {
            let a = r.external;
            const s = p,
              u = p;
            let f = !1;
            const m = p;
            if (p == p)
              if ('string' == typeof a) {
                if (a.length < 1) {
                  const r = { params: {} };
                  null === l ? (l = [r]) : l.push(r), p++;
                }
              } else {
                const r = { params: { type: 'string' } };
                null === l ? (l = [r]) : l.push(r), p++;
              }
            var i = m === p;
            if (((f = f || i), !f)) {
              const e = p;
              t(a, {
                instancePath: n + '/external',
                parentData: r,
                parentDataProperty: 'external',
                rootData: o,
              }) ||
                ((l = null === l ? t.errors : l.concat(t.errors)),
                (p = l.length)),
                (i = e === p),
                (f = f || i);
            }
            if (!f) {
              const r = { params: {} };
              return (
                null === l ? (l = [r]) : l.push(r), p++, (e.errors = l), !1
              );
            }
            (p = u), null !== l && (u ? (l.length = u) : (l = null));
            var c = s === p;
          } else c = !0;
          if (c)
            if (void 0 !== r.shareScope) {
              let t = r.shareScope;
              const n = p,
                a = p;
              let s = !1;
              const o = p;
              if (p === o)
                if ('string' == typeof t) {
                  if (t.length < 1) {
                    const r = { params: {} };
                    null === l ? (l = [r]) : l.push(r), p++;
                  }
                } else {
                  const r = { params: { type: 'string' } };
                  null === l ? (l = [r]) : l.push(r), p++;
                }
              var u = o === p;
              if (((s = s || u), !s)) {
                const r = p;
                if (p === r)
                  if (Array.isArray(t)) {
                    const r = t.length;
                    for (let e = 0; e < r; e++) {
                      let r = t[e];
                      const n = p;
                      if (p === n)
                        if ('string' == typeof r) {
                          if (r.length < 1) {
                            const r = { params: {} };
                            null === l ? (l = [r]) : l.push(r), p++;
                          }
                        } else {
                          const r = { params: { type: 'string' } };
                          null === l ? (l = [r]) : l.push(r), p++;
                        }
                      if (n !== p) break;
                    }
                  } else {
                    const r = { params: { type: 'array' } };
                    null === l ? (l = [r]) : l.push(r), p++;
                  }
                (u = r === p), (s = s || u);
              }
              if (!s) {
                const r = { params: {} };
                return (
                  null === l ? (l = [r]) : l.push(r), p++, (e.errors = l), !1
                );
              }
              (p = a),
                null !== l && (a ? (l.length = a) : (l = null)),
                (c = n === p);
            } else c = !0;
        }
      }
    }
  }
  return (e.errors = l), 0 === p;
}
function n(
  r,
  {
    instancePath: a = '',
    parentData: s,
    parentDataProperty: o,
    rootData: l = r,
  } = {},
) {
  let p = null,
    i = 0;
  if (0 === i) {
    if (!r || 'object' != typeof r || Array.isArray(r))
      return (n.errors = [{ params: { type: 'object' } }]), !1;
    for (const s in r) {
      let o = r[s];
      const u = i,
        f = i;
      let m = !1;
      const y = i;
      e(o, {
        instancePath: a + '/' + s.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: r,
        parentDataProperty: s,
        rootData: l,
      }) || ((p = null === p ? e.errors : p.concat(e.errors)), (i = p.length));
      var c = y === i;
      if (((m = m || c), !m)) {
        const e = i;
        if (i == i)
          if ('string' == typeof o) {
            if (o.length < 1) {
              const r = { params: {} };
              null === p ? (p = [r]) : p.push(r), i++;
            }
          } else {
            const r = { params: { type: 'string' } };
            null === p ? (p = [r]) : p.push(r), i++;
          }
        if (((c = e === i), (m = m || c), !m)) {
          const e = i;
          t(o, {
            instancePath: a + '/' + s.replace(/~/g, '~0').replace(/\//g, '~1'),
            parentData: r,
            parentDataProperty: s,
            rootData: l,
          }) ||
            ((p = null === p ? t.errors : p.concat(t.errors)), (i = p.length)),
            (c = e === i),
            (m = m || c);
        }
      }
      if (!m) {
        const r = { params: {} };
        return null === p ? (p = [r]) : p.push(r), i++, (n.errors = p), !1;
      }
      if (((i = f), null !== p && (f ? (p.length = f) : (p = null)), u !== i))
        break;
    }
  }
  return (n.errors = p), 0 === i;
}
function a(
  r,
  {
    instancePath: t = '',
    parentData: e,
    parentDataProperty: s,
    rootData: o = r,
  } = {},
) {
  let l = null,
    p = 0;
  const i = p;
  let c = !1;
  const u = p;
  if (p === u)
    if (Array.isArray(r)) {
      const e = r.length;
      for (let a = 0; a < e; a++) {
        let e = r[a];
        const s = p,
          i = p;
        let c = !1;
        const u = p;
        if (p == p)
          if ('string' == typeof e) {
            if (e.length < 1) {
              const r = { params: {} };
              null === l ? (l = [r]) : l.push(r), p++;
            }
          } else {
            const r = { params: { type: 'string' } };
            null === l ? (l = [r]) : l.push(r), p++;
          }
        var f = u === p;
        if (((c = c || f), !c)) {
          const s = p;
          n(e, {
            instancePath: t + '/' + a,
            parentData: r,
            parentDataProperty: a,
            rootData: o,
          }) ||
            ((l = null === l ? n.errors : l.concat(n.errors)), (p = l.length)),
            (f = s === p),
            (c = c || f);
        }
        if (c) (p = i), null !== l && (i ? (l.length = i) : (l = null));
        else {
          const r = { params: {} };
          null === l ? (l = [r]) : l.push(r), p++;
        }
        if (s !== p) break;
      }
    } else {
      const r = { params: { type: 'array' } };
      null === l ? (l = [r]) : l.push(r), p++;
    }
  var m = u === p;
  if (((c = c || m), !c)) {
    const a = p;
    n(r, {
      instancePath: t,
      parentData: e,
      parentDataProperty: s,
      rootData: o,
    }) || ((l = null === l ? n.errors : l.concat(n.errors)), (p = l.length)),
      (m = a === p),
      (c = c || m);
  }
  if (!c) {
    const r = { params: {} };
    return null === l ? (l = [r]) : l.push(r), p++, (a.errors = l), !1;
  }
  return (
    (p = i),
    null !== l && (i ? (l.length = i) : (l = null)),
    (a.errors = l),
    0 === p
  );
}
function s(
  t,
  {
    instancePath: e = '',
    parentData: n,
    parentDataProperty: o,
    rootData: l = t,
  } = {},
) {
  let p = null,
    i = 0;
  if (0 === i) {
    if (!t || 'object' != typeof t || Array.isArray(t))
      return (s.errors = [{ params: { type: 'object' } }]), !1;
    {
      let n;
      if (
        (void 0 === t.remoteType && (n = 'remoteType')) ||
        (void 0 === t.remotes && (n = 'remotes'))
      )
        return (s.errors = [{ params: { missingProperty: n } }]), !1;
      {
        const n = i;
        for (const r in t)
          if (
            'async' !== r &&
            'remoteType' !== r &&
            'remotes' !== r &&
            'shareScope' !== r
          )
            return (s.errors = [{ params: { additionalProperty: r } }]), !1;
        if (n === i) {
          if (void 0 !== t.async) {
            const r = i;
            if ('boolean' != typeof t.async)
              return (s.errors = [{ params: { type: 'boolean' } }]), !1;
            var c = r === i;
          } else c = !0;
          if (c) {
            if (void 0 !== t.remoteType) {
              let e = t.remoteType;
              const n = i,
                a = i;
              let o = !1,
                l = null;
              const u = i;
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
                'module-import' !== e &&
                'script' !== e &&
                'node-commonjs' !== e
              ) {
                const t = { params: { allowedValues: r.enum } };
                null === p ? (p = [t]) : p.push(t), i++;
              }
              if ((u === i && ((o = !0), (l = 0)), !o)) {
                const r = { params: { passingSchemas: l } };
                return (
                  null === p ? (p = [r]) : p.push(r), i++, (s.errors = p), !1
                );
              }
              (i = a),
                null !== p && (a ? (p.length = a) : (p = null)),
                (c = n === i);
            } else c = !0;
            if (c) {
              if (void 0 !== t.remotes) {
                const r = i;
                a(t.remotes, {
                  instancePath: e + '/remotes',
                  parentData: t,
                  parentDataProperty: 'remotes',
                  rootData: l,
                }) ||
                  ((p = null === p ? a.errors : p.concat(a.errors)),
                  (i = p.length)),
                  (c = r === i);
              } else c = !0;
              if (c)
                if (void 0 !== t.shareScope) {
                  let r = t.shareScope;
                  const e = i,
                    n = i;
                  let a = !1;
                  const o = i;
                  if (i === o)
                    if ('string' == typeof r) {
                      if (r.length < 1) {
                        const r = { params: {} };
                        null === p ? (p = [r]) : p.push(r), i++;
                      }
                    } else {
                      const r = { params: { type: 'string' } };
                      null === p ? (p = [r]) : p.push(r), i++;
                    }
                  var u = o === i;
                  if (((a = a || u), !a)) {
                    const t = i;
                    if (i === t)
                      if (Array.isArray(r)) {
                        const t = r.length;
                        for (let e = 0; e < t; e++) {
                          let t = r[e];
                          const n = i;
                          if (i === n)
                            if ('string' == typeof t) {
                              if (t.length < 1) {
                                const r = { params: {} };
                                null === p ? (p = [r]) : p.push(r), i++;
                              }
                            } else {
                              const r = { params: { type: 'string' } };
                              null === p ? (p = [r]) : p.push(r), i++;
                            }
                          if (n !== i) break;
                        }
                      } else {
                        const r = { params: { type: 'array' } };
                        null === p ? (p = [r]) : p.push(r), i++;
                      }
                    (u = t === i), (a = a || u);
                  }
                  if (!a) {
                    const r = { params: {} };
                    return (
                      null === p ? (p = [r]) : p.push(r),
                      i++,
                      (s.errors = p),
                      !1
                    );
                  }
                  (i = n),
                    null !== p && (n ? (p.length = n) : (p = null)),
                    (c = e === i);
                } else c = !0;
            }
          }
        }
      }
    }
  }
  return (s.errors = p), 0 === i;
}
