// @ts-nocheck
/* eslint-disable */
/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 */
export const validate = a;
export default a;
const r = require('ajv/dist/runtime/ucs2length').default,
  e = {
    type: 'object',
    additionalProperties: !1,
    properties: {
      eager: { type: 'boolean' },
      import: {
        anyOf: [{ enum: [!1] }, { $ref: '#/definitions/ConsumesItem' }],
      },
      packageName: { type: 'string', minLength: 1 },
      requiredVersion: { anyOf: [{ enum: [!1] }, { type: 'string' }] },
      shareKey: { type: 'string', minLength: 1 },
      shareScope: { type: 'string', minLength: 1 },
      singleton: { type: 'boolean' },
      strictVersion: { type: 'boolean' },
    },
  };
function t(
  n,
  {
    instancePath: s = '',
    parentData: a,
    parentDataProperty: o,
    rootData: i = n,
  } = {},
) {
  let l = null,
    p = 0;
  if (0 === p) {
    if (!n || 'object' != typeof n || Array.isArray(n))
      return (t.errors = [{ params: { type: 'object' } }]), !1;
    {
      const s = p;
      for (const r in n)
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
          return (t.errors = [{ params: { additionalProperty: r } }]), !1;
      if (s === p) {
        if (void 0 !== n.eager) {
          const r = p;
          if ('boolean' != typeof n.eager)
            return (t.errors = [{ params: { type: 'boolean' } }]), !1;
          var u = r === p;
        } else u = !0;
        if (u) {
          if (void 0 !== n.import) {
            let s = n.import;
            const a = p,
              o = p;
            let i = !1;
            const c = p;
            if (!1 !== s) {
              const r = {
                params: { allowedValues: e.properties.import.anyOf[0].enum },
              };
              null === l ? (l = [r]) : l.push(r), p++;
            }
            var f = c === p;
            if (((i = i || f), !i)) {
              const e = p;
              if (p == p)
                if ('string' == typeof s) {
                  if (r(s) < 1) {
                    const r = { params: { limit: 1 } };
                    null === l ? (l = [r]) : l.push(r), p++;
                  }
                } else {
                  const r = { params: { type: 'string' } };
                  null === l ? (l = [r]) : l.push(r), p++;
                }
              (f = e === p), (i = i || f);
            }
            if (!i) {
              const r = { params: {} };
              return (
                null === l ? (l = [r]) : l.push(r), p++, (t.errors = l), !1
              );
            }
            (p = o),
              null !== l && (o ? (l.length = o) : (l = null)),
              (u = a === p);
          } else u = !0;
          if (u) {
            if (void 0 !== n.packageName) {
              let e = n.packageName;
              const s = p;
              if (p === s) {
                if ('string' != typeof e)
                  return (t.errors = [{ params: { type: 'string' } }]), !1;
                if (r(e) < 1)
                  return (t.errors = [{ params: { limit: 1 } }]), !1;
              }
              u = s === p;
            } else u = !0;
            if (u) {
              if (void 0 !== n.requiredVersion) {
                let r = n.requiredVersion;
                const s = p,
                  a = p;
                let o = !1;
                const i = p;
                if (!1 !== r) {
                  const r = {
                    params: {
                      allowedValues: e.properties.requiredVersion.anyOf[0].enum,
                    },
                  };
                  null === l ? (l = [r]) : l.push(r), p++;
                }
                var c = i === p;
                if (((o = o || c), !o)) {
                  const e = p;
                  if ('string' != typeof r) {
                    const r = { params: { type: 'string' } };
                    null === l ? (l = [r]) : l.push(r), p++;
                  }
                  (c = e === p), (o = o || c);
                }
                if (!o) {
                  const r = { params: {} };
                  return (
                    null === l ? (l = [r]) : l.push(r), p++, (t.errors = l), !1
                  );
                }
                (p = a),
                  null !== l && (a ? (l.length = a) : (l = null)),
                  (u = s === p);
              } else u = !0;
              if (u) {
                if (void 0 !== n.shareKey) {
                  let e = n.shareKey;
                  const s = p;
                  if (p === s) {
                    if ('string' != typeof e)
                      return (t.errors = [{ params: { type: 'string' } }]), !1;
                    if (r(e) < 1)
                      return (t.errors = [{ params: { limit: 1 } }]), !1;
                  }
                  u = s === p;
                } else u = !0;
                if (u) {
                  if (void 0 !== n.shareScope) {
                    let e = n.shareScope;
                    const s = p;
                    if (p === s) {
                      if ('string' != typeof e)
                        return (
                          (t.errors = [{ params: { type: 'string' } }]), !1
                        );
                      if (r(e) < 1)
                        return (t.errors = [{ params: { limit: 1 } }]), !1;
                    }
                    u = s === p;
                  } else u = !0;
                  if (u) {
                    if (void 0 !== n.singleton) {
                      const r = p;
                      if ('boolean' != typeof n.singleton)
                        return (
                          (t.errors = [{ params: { type: 'boolean' } }]), !1
                        );
                      u = r === p;
                    } else u = !0;
                    if (u)
                      if (void 0 !== n.strictVersion) {
                        const r = p;
                        if ('boolean' != typeof n.strictVersion)
                          return (
                            (t.errors = [{ params: { type: 'boolean' } }]), !1
                          );
                        u = r === p;
                      } else u = !0;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return (t.errors = l), 0 === p;
}
function n(
  e,
  {
    instancePath: s = '',
    parentData: a,
    parentDataProperty: o,
    rootData: i = e,
  } = {},
) {
  let l = null,
    p = 0;
  if (0 === p) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (n.errors = [{ params: { type: 'object' } }]), !1;
    for (const a in e) {
      let o = e[a];
      const f = p,
        c = p;
      let m = !1;
      const y = p;
      t(o, {
        instancePath: s + '/' + a.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: e,
        parentDataProperty: a,
        rootData: i,
      }) || ((l = null === l ? t.errors : l.concat(t.errors)), (p = l.length));
      var u = y === p;
      if (((m = m || u), !m)) {
        const e = p;
        if (p == p)
          if ('string' == typeof o) {
            if (r(o) < 1) {
              const r = { params: { limit: 1 } };
              null === l ? (l = [r]) : l.push(r), p++;
            }
          } else {
            const r = { params: { type: 'string' } };
            null === l ? (l = [r]) : l.push(r), p++;
          }
        (u = e === p), (m = m || u);
      }
      if (!m) {
        const r = { params: {} };
        return null === l ? (l = [r]) : l.push(r), p++, (n.errors = l), !1;
      }
      if (((p = c), null !== l && (c ? (l.length = c) : (l = null)), f !== p))
        break;
    }
  }
  return (n.errors = l), 0 === p;
}
function s(
  e,
  {
    instancePath: t = '',
    parentData: a,
    parentDataProperty: o,
    rootData: i = e,
  } = {},
) {
  let l = null,
    p = 0;
  const u = p;
  let f = !1;
  const c = p;
  if (p === c)
    if (Array.isArray(e)) {
      const s = e.length;
      for (let a = 0; a < s; a++) {
        let s = e[a];
        const o = p,
          u = p;
        let f = !1;
        const c = p;
        if (p == p)
          if ('string' == typeof s) {
            if (r(s) < 1) {
              const r = { params: { limit: 1 } };
              null === l ? (l = [r]) : l.push(r), p++;
            }
          } else {
            const r = { params: { type: 'string' } };
            null === l ? (l = [r]) : l.push(r), p++;
          }
        var m = c === p;
        if (((f = f || m), !f)) {
          const r = p;
          n(s, {
            instancePath: t + '/' + a,
            parentData: e,
            parentDataProperty: a,
            rootData: i,
          }) ||
            ((l = null === l ? n.errors : l.concat(n.errors)), (p = l.length)),
            (m = r === p),
            (f = f || m);
        }
        if (f) (p = u), null !== l && (u ? (l.length = u) : (l = null));
        else {
          const r = { params: {} };
          null === l ? (l = [r]) : l.push(r), p++;
        }
        if (o !== p) break;
      }
    } else {
      const r = { params: { type: 'array' } };
      null === l ? (l = [r]) : l.push(r), p++;
    }
  var y = c === p;
  if (((f = f || y), !f)) {
    const r = p;
    n(e, {
      instancePath: t,
      parentData: a,
      parentDataProperty: o,
      rootData: i,
    }) || ((l = null === l ? n.errors : l.concat(n.errors)), (p = l.length)),
      (y = r === p),
      (f = f || y);
  }
  if (!f) {
    const r = { params: {} };
    return null === l ? (l = [r]) : l.push(r), p++, (s.errors = l), !1;
  }
  return (
    (p = u),
    null !== l && (u ? (l.length = u) : (l = null)),
    (s.errors = l),
    0 === p
  );
}
function a(
  e,
  {
    instancePath: t = '',
    parentData: n,
    parentDataProperty: o,
    rootData: i = e,
  } = {},
) {
  let l = null,
    p = 0;
  if (0 === p) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (a.errors = [{ params: { type: 'object' } }]), !1;
    {
      let n;
      if (void 0 === e.consumes && (n = 'consumes'))
        return (a.errors = [{ params: { missingProperty: n } }]), !1;
      {
        const n = p;
        for (const r in e)
          if ('consumes' !== r && 'shareScope' !== r)
            return (a.errors = [{ params: { additionalProperty: r } }]), !1;
        if (n === p) {
          if (void 0 !== e.consumes) {
            const r = p;
            s(e.consumes, {
              instancePath: t + '/consumes',
              parentData: e,
              parentDataProperty: 'consumes',
              rootData: i,
            }) ||
              ((l = null === l ? s.errors : l.concat(s.errors)),
              (p = l.length));
            var u = r === p;
          } else u = !0;
          if (u)
            if (void 0 !== e.shareScope) {
              let t = e.shareScope;
              const n = p;
              if (p === n) {
                if ('string' != typeof t)
                  return (a.errors = [{ params: { type: 'string' } }]), !1;
                if (r(t) < 1)
                  return (a.errors = [{ params: { limit: 1 } }]), !1;
              }
              u = n === p;
            } else u = !0;
        }
      }
    }
  }
  return (a.errors = l), 0 === p;
}
