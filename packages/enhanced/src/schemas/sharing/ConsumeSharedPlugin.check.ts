// @ts-nocheck
/* eslint-disable */
/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 */
export const validate = s;
export default s;
const r = {
  type: 'object',
  additionalProperties: !1,
  properties: {
    eager: { type: 'boolean' },
    import: { anyOf: [{ enum: [!1] }, { $ref: '#/definitions/ConsumesItem' }] },
    packageName: { type: 'string', minLength: 1 },
    requiredVersion: { anyOf: [{ enum: [!1] }, { type: 'string' }] },
    shareKey: { type: 'string', minLength: 1 },
    shareScope: { type: 'string', minLength: 1 },
    singleton: { type: 'boolean' },
    strictVersion: { type: 'boolean' },
  },
};
function e(
  t,
  {
    instancePath: n = '',
    parentData: s,
    parentDataProperty: a,
    rootData: o = t,
  } = {},
) {
  let i = null,
    l = 0;
  if (0 === l) {
    if (!t || 'object' != typeof t || Array.isArray(t))
      return (e.errors = [{ params: { type: 'object' } }]), !1;
    {
      const n = l;
      for (const r in t)
        if (
          'eager' !== r &&
          'import' !== r &&
          'packageName' !== r &&
          'requiredVersion' !== r &&
          'shareKey' !== r &&
          'shareScope' !== r &&
          'singleton' !== r &&
          'strictVersion' !== r
        )
          return (e.errors = [{ params: { additionalProperty: r } }]), !1;
      if (n === l) {
        if (void 0 !== t.eager) {
          const r = l;
          if ('boolean' != typeof t.eager)
            return (e.errors = [{ params: { type: 'boolean' } }]), !1;
          var p = r === l;
        } else p = !0;
        if (p) {
          if (void 0 !== t.import) {
            let n = t.import;
            const s = l,
              a = l;
            let o = !1;
            const c = l;
            if (!1 !== n) {
              const e = {
                params: { allowedValues: r.properties.import.anyOf[0].enum },
              };
              null === i ? (i = [e]) : i.push(e), l++;
            }
            var f = c === l;
            if (((o = o || f), !o)) {
              const r = l;
              if (l == l)
                if ('string' == typeof n) {
                  if (n.length < 1) {
                    const r = { params: {} };
                    null === i ? (i = [r]) : i.push(r), l++;
                  }
                } else {
                  const r = { params: { type: 'string' } };
                  null === i ? (i = [r]) : i.push(r), l++;
                }
              (f = r === l), (o = o || f);
            }
            if (!o) {
              const r = { params: {} };
              return (
                null === i ? (i = [r]) : i.push(r), l++, (e.errors = i), !1
              );
            }
            (l = a),
              null !== i && (a ? (i.length = a) : (i = null)),
              (p = s === l);
          } else p = !0;
          if (p) {
            if (void 0 !== t.packageName) {
              let r = t.packageName;
              const n = l;
              if (l === n) {
                if ('string' != typeof r)
                  return (e.errors = [{ params: { type: 'string' } }]), !1;
                if (r.length < 1) return (e.errors = [{ params: {} }]), !1;
              }
              p = n === l;
            } else p = !0;
            if (p) {
              if (void 0 !== t.requiredVersion) {
                let n = t.requiredVersion;
                const s = l,
                  a = l;
                let o = !1;
                const f = l;
                if (!1 !== n) {
                  const e = {
                    params: {
                      allowedValues: r.properties.requiredVersion.anyOf[0].enum,
                    },
                  };
                  null === i ? (i = [e]) : i.push(e), l++;
                }
                var c = f === l;
                if (((o = o || c), !o)) {
                  const r = l;
                  if ('string' != typeof n) {
                    const r = { params: { type: 'string' } };
                    null === i ? (i = [r]) : i.push(r), l++;
                  }
                  (c = r === l), (o = o || c);
                }
                if (!o) {
                  const r = { params: {} };
                  return (
                    null === i ? (i = [r]) : i.push(r), l++, (e.errors = i), !1
                  );
                }
                (l = a),
                  null !== i && (a ? (i.length = a) : (i = null)),
                  (p = s === l);
              } else p = !0;
              if (p) {
                if (void 0 !== t.shareKey) {
                  let r = t.shareKey;
                  const n = l;
                  if (l === n) {
                    if ('string' != typeof r)
                      return (e.errors = [{ params: { type: 'string' } }]), !1;
                    if (r.length < 1) return (e.errors = [{ params: {} }]), !1;
                  }
                  p = n === l;
                } else p = !0;
                if (p) {
                  if (void 0 !== t.shareScope) {
                    let r = t.shareScope;
                    const n = l;
                    if (l === n) {
                      if ('string' != typeof r)
                        return (
                          (e.errors = [{ params: { type: 'string' } }]), !1
                        );
                      if (r.length < 1)
                        return (e.errors = [{ params: {} }]), !1;
                    }
                    p = n === l;
                  } else p = !0;
                  if (p) {
                    if (void 0 !== t.singleton) {
                      const r = l;
                      if ('boolean' != typeof t.singleton)
                        return (
                          (e.errors = [{ params: { type: 'boolean' } }]), !1
                        );
                      p = r === l;
                    } else p = !0;
                    if (p)
                      if (void 0 !== t.strictVersion) {
                        const r = l;
                        if ('boolean' != typeof t.strictVersion)
                          return (
                            (e.errors = [{ params: { type: 'boolean' } }]), !1
                          );
                        p = r === l;
                      } else p = !0;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return (e.errors = i), 0 === l;
}
function t(
  r,
  {
    instancePath: n = '',
    parentData: s,
    parentDataProperty: a,
    rootData: o = r,
  } = {},
) {
  let i = null,
    l = 0;
  if (0 === l) {
    if (!r || 'object' != typeof r || Array.isArray(r))
      return (t.errors = [{ params: { type: 'object' } }]), !1;
    for (const s in r) {
      let a = r[s];
      const f = l,
        c = l;
      let u = !1;
      const y = l;
      e(a, {
        instancePath: n + '/' + s.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: r,
        parentDataProperty: s,
        rootData: o,
      }) || ((i = null === i ? e.errors : i.concat(e.errors)), (l = i.length));
      var p = y === l;
      if (((u = u || p), !u)) {
        const r = l;
        if (l == l)
          if ('string' == typeof a) {
            if (a.length < 1) {
              const r = { params: {} };
              null === i ? (i = [r]) : i.push(r), l++;
            }
          } else {
            const r = { params: { type: 'string' } };
            null === i ? (i = [r]) : i.push(r), l++;
          }
        (p = r === l), (u = u || p);
      }
      if (!u) {
        const r = { params: {} };
        return null === i ? (i = [r]) : i.push(r), l++, (t.errors = i), !1;
      }
      if (((l = c), null !== i && (c ? (i.length = c) : (i = null)), f !== l))
        break;
    }
  }
  return (t.errors = i), 0 === l;
}
function n(
  r,
  {
    instancePath: e = '',
    parentData: s,
    parentDataProperty: a,
    rootData: o = r,
  } = {},
) {
  let i = null,
    l = 0;
  const p = l;
  let f = !1;
  const c = l;
  if (l === c)
    if (Array.isArray(r)) {
      const n = r.length;
      for (let s = 0; s < n; s++) {
        let n = r[s];
        const a = l,
          p = l;
        let f = !1;
        const c = l;
        if (l == l)
          if ('string' == typeof n) {
            if (n.length < 1) {
              const r = { params: {} };
              null === i ? (i = [r]) : i.push(r), l++;
            }
          } else {
            const r = { params: { type: 'string' } };
            null === i ? (i = [r]) : i.push(r), l++;
          }
        var u = c === l;
        if (((f = f || u), !f)) {
          const a = l;
          t(n, {
            instancePath: e + '/' + s,
            parentData: r,
            parentDataProperty: s,
            rootData: o,
          }) ||
            ((i = null === i ? t.errors : i.concat(t.errors)), (l = i.length)),
            (u = a === l),
            (f = f || u);
        }
        if (f) (l = p), null !== i && (p ? (i.length = p) : (i = null));
        else {
          const r = { params: {} };
          null === i ? (i = [r]) : i.push(r), l++;
        }
        if (a !== l) break;
      }
    } else {
      const r = { params: { type: 'array' } };
      null === i ? (i = [r]) : i.push(r), l++;
    }
  var y = c === l;
  if (((f = f || y), !f)) {
    const n = l;
    t(r, {
      instancePath: e,
      parentData: s,
      parentDataProperty: a,
      rootData: o,
    }) || ((i = null === i ? t.errors : i.concat(t.errors)), (l = i.length)),
      (y = n === l),
      (f = f || y);
  }
  if (!f) {
    const r = { params: {} };
    return null === i ? (i = [r]) : i.push(r), l++, (n.errors = i), !1;
  }
  return (
    (l = p),
    null !== i && (p ? (i.length = p) : (i = null)),
    (n.errors = i),
    0 === l
  );
}
function s(
  r,
  {
    instancePath: e = '',
    parentData: t,
    parentDataProperty: a,
    rootData: o = r,
  } = {},
) {
  let i = null,
    l = 0;
  if (0 === l) {
    if (!r || 'object' != typeof r || Array.isArray(r))
      return (s.errors = [{ params: { type: 'object' } }]), !1;
    {
      let t;
      if (void 0 === r.consumes && (t = 'consumes'))
        return (s.errors = [{ params: { missingProperty: t } }]), !1;
      {
        const t = l;
        for (const e in r)
          if ('consumes' !== e && 'shareScope' !== e)
            return (s.errors = [{ params: { additionalProperty: e } }]), !1;
        if (t === l) {
          if (void 0 !== r.consumes) {
            const t = l;
            n(r.consumes, {
              instancePath: e + '/consumes',
              parentData: r,
              parentDataProperty: 'consumes',
              rootData: o,
            }) ||
              ((i = null === i ? n.errors : i.concat(n.errors)),
              (l = i.length));
            var p = t === l;
          } else p = !0;
          if (p)
            if (void 0 !== r.shareScope) {
              let e = r.shareScope;
              const t = l;
              if (l === t) {
                if ('string' != typeof e)
                  return (s.errors = [{ params: { type: 'string' } }]), !1;
                if (e.length < 1) return (s.errors = [{ params: {} }]), !1;
              }
              p = t === l;
            } else p = !0;
        }
      }
    }
  }
  return (s.errors = i), 0 === l;
}
