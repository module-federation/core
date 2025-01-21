// @ts-nocheck
/* eslint-disable */
/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 */
export const validate = o;
export default o;
const r = require('ajv/dist/runtime/ucs2length').default,
  e = {
    type: 'object',
    additionalProperties: !1,
    properties: {
      eager: { type: 'boolean' },
      import: { anyOf: [{ enum: [!1] }, { $ref: '#/definitions/SharedItem' }] },
      packageName: { type: 'string', minLength: 1 },
      requiredVersion: { anyOf: [{ enum: [!1] }, { type: 'string' }] },
      shareKey: { type: 'string', minLength: 1 },
      shareScope: { type: 'string', minLength: 1 },
      singleton: { type: 'boolean' },
      strictVersion: { type: 'boolean' },
      version: { anyOf: [{ enum: [!1] }, { type: 'string' }] },
    },
  },
  t = Object.prototype.hasOwnProperty;
function n(
  a,
  {
    instancePath: s = '',
    parentData: o,
    parentDataProperty: i,
    rootData: l = a,
  } = {},
) {
  let p = null,
    f = 0;
  if (0 === f) {
    if (!a || 'object' != typeof a || Array.isArray(a))
      return (n.errors = [{ params: { type: 'object' } }]), !1;
    {
      const s = f;
      for (const r in a)
        if (!t.call(e.properties, r))
          return (n.errors = [{ params: { additionalProperty: r } }]), !1;
      if (s === f) {
        if (void 0 !== a.eager) {
          const r = f;
          if ('boolean' != typeof a.eager)
            return (n.errors = [{ params: { type: 'boolean' } }]), !1;
          var u = r === f;
        } else u = !0;
        if (u) {
          if (void 0 !== a.import) {
            let t = a.import;
            const s = f,
              o = f;
            let i = !1;
            const l = f;
            if (!1 !== t) {
              const r = {
                params: { allowedValues: e.properties.import.anyOf[0].enum },
              };
              null === p ? (p = [r]) : p.push(r), f++;
            }
            var c = l === f;
            if (((i = i || c), !i)) {
              const e = f;
              if (f == f)
                if ('string' == typeof t) {
                  if (r(t) < 1) {
                    const r = { params: { limit: 1 } };
                    null === p ? (p = [r]) : p.push(r), f++;
                  }
                } else {
                  const r = { params: { type: 'string' } };
                  null === p ? (p = [r]) : p.push(r), f++;
                }
              (c = e === f), (i = i || c);
            }
            if (!i) {
              const r = { params: {} };
              return (
                null === p ? (p = [r]) : p.push(r), f++, (n.errors = p), !1
              );
            }
            (f = o),
              null !== p && (o ? (p.length = o) : (p = null)),
              (u = s === f);
          } else u = !0;
          if (u) {
            if (void 0 !== a.packageName) {
              let e = a.packageName;
              const t = f;
              if (f === t) {
                if ('string' != typeof e)
                  return (n.errors = [{ params: { type: 'string' } }]), !1;
                if (r(e) < 1)
                  return (n.errors = [{ params: { limit: 1 } }]), !1;
              }
              u = t === f;
            } else u = !0;
            if (u) {
              if (void 0 !== a.requiredVersion) {
                let r = a.requiredVersion;
                const t = f,
                  s = f;
                let o = !1;
                const i = f;
                if (!1 !== r) {
                  const r = {
                    params: {
                      allowedValues: e.properties.requiredVersion.anyOf[0].enum,
                    },
                  };
                  null === p ? (p = [r]) : p.push(r), f++;
                }
                var y = i === f;
                if (((o = o || y), !o)) {
                  const e = f;
                  if ('string' != typeof r) {
                    const r = { params: { type: 'string' } };
                    null === p ? (p = [r]) : p.push(r), f++;
                  }
                  (y = e === f), (o = o || y);
                }
                if (!o) {
                  const r = { params: {} };
                  return (
                    null === p ? (p = [r]) : p.push(r), f++, (n.errors = p), !1
                  );
                }
                (f = s),
                  null !== p && (s ? (p.length = s) : (p = null)),
                  (u = t === f);
              } else u = !0;
              if (u) {
                if (void 0 !== a.shareKey) {
                  let e = a.shareKey;
                  const t = f;
                  if (f === t) {
                    if ('string' != typeof e)
                      return (n.errors = [{ params: { type: 'string' } }]), !1;
                    if (r(e) < 1)
                      return (n.errors = [{ params: { limit: 1 } }]), !1;
                  }
                  u = t === f;
                } else u = !0;
                if (u) {
                  if (void 0 !== a.shareScope) {
                    let e = a.shareScope;
                    const t = f;
                    if (f === t) {
                      if ('string' != typeof e)
                        return (
                          (n.errors = [{ params: { type: 'string' } }]), !1
                        );
                      if (r(e) < 1)
                        return (n.errors = [{ params: { limit: 1 } }]), !1;
                    }
                    u = t === f;
                  } else u = !0;
                  if (u) {
                    if (void 0 !== a.singleton) {
                      const r = f;
                      if ('boolean' != typeof a.singleton)
                        return (
                          (n.errors = [{ params: { type: 'boolean' } }]), !1
                        );
                      u = r === f;
                    } else u = !0;
                    if (u) {
                      if (void 0 !== a.strictVersion) {
                        const r = f;
                        if ('boolean' != typeof a.strictVersion)
                          return (
                            (n.errors = [{ params: { type: 'boolean' } }]), !1
                          );
                        u = r === f;
                      } else u = !0;
                      if (u)
                        if (void 0 !== a.version) {
                          let r = a.version;
                          const t = f,
                            s = f;
                          let o = !1;
                          const i = f;
                          if (!1 !== r) {
                            const r = {
                              params: {
                                allowedValues:
                                  e.properties.version.anyOf[0].enum,
                              },
                            };
                            null === p ? (p = [r]) : p.push(r), f++;
                          }
                          var m = i === f;
                          if (((o = o || m), !o)) {
                            const e = f;
                            if ('string' != typeof r) {
                              const r = { params: { type: 'string' } };
                              null === p ? (p = [r]) : p.push(r), f++;
                            }
                            (m = e === f), (o = o || m);
                          }
                          if (!o) {
                            const r = { params: {} };
                            return (
                              null === p ? (p = [r]) : p.push(r),
                              f++,
                              (n.errors = p),
                              !1
                            );
                          }
                          (f = s),
                            null !== p && (s ? (p.length = s) : (p = null)),
                            (u = t === f);
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
  }
  return (n.errors = p), 0 === f;
}
function a(
  e,
  {
    instancePath: t = '',
    parentData: s,
    parentDataProperty: o,
    rootData: i = e,
  } = {},
) {
  let l = null,
    p = 0;
  if (0 === p) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (a.errors = [{ params: { type: 'object' } }]), !1;
    for (const s in e) {
      let o = e[s];
      const u = p,
        c = p;
      let y = !1;
      const m = p;
      n(o, {
        instancePath: t + '/' + s.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: e,
        parentDataProperty: s,
        rootData: i,
      }) || ((l = null === l ? n.errors : l.concat(n.errors)), (p = l.length));
      var f = m === p;
      if (((y = y || f), !y)) {
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
        (f = e === p), (y = y || f);
      }
      if (!y) {
        const r = { params: {} };
        return null === l ? (l = [r]) : l.push(r), p++, (a.errors = l), !1;
      }
      if (((p = c), null !== l && (c ? (l.length = c) : (l = null)), u !== p))
        break;
    }
  }
  return (a.errors = l), 0 === p;
}
function s(
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
  const f = p;
  let u = !1;
  const c = p;
  if (p === c)
    if (Array.isArray(e)) {
      const n = e.length;
      for (let s = 0; s < n; s++) {
        let n = e[s];
        const o = p,
          f = p;
        let u = !1;
        const c = p;
        if (p == p)
          if ('string' == typeof n) {
            if (r(n) < 1) {
              const r = { params: { limit: 1 } };
              null === l ? (l = [r]) : l.push(r), p++;
            }
          } else {
            const r = { params: { type: 'string' } };
            null === l ? (l = [r]) : l.push(r), p++;
          }
        var y = c === p;
        if (((u = u || y), !u)) {
          const r = p;
          a(n, {
            instancePath: t + '/' + s,
            parentData: e,
            parentDataProperty: s,
            rootData: i,
          }) ||
            ((l = null === l ? a.errors : l.concat(a.errors)), (p = l.length)),
            (y = r === p),
            (u = u || y);
        }
        if (u) (p = f), null !== l && (f ? (l.length = f) : (l = null));
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
  var m = c === p;
  if (((u = u || m), !u)) {
    const r = p;
    a(e, {
      instancePath: t,
      parentData: n,
      parentDataProperty: o,
      rootData: i,
    }) || ((l = null === l ? a.errors : l.concat(a.errors)), (p = l.length)),
      (m = r === p),
      (u = u || m);
  }
  if (!u) {
    const r = { params: {} };
    return null === l ? (l = [r]) : l.push(r), p++, (s.errors = l), !1;
  }
  return (
    (p = f),
    null !== l && (f ? (l.length = f) : (l = null)),
    (s.errors = l),
    0 === p
  );
}
function o(
  e,
  {
    instancePath: t = '',
    parentData: n,
    parentDataProperty: a,
    rootData: i = e,
  } = {},
) {
  let l = null,
    p = 0;
  if (0 === p) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (o.errors = [{ params: { type: 'object' } }]), !1;
    {
      let n;
      if (void 0 === e.shared && (n = 'shared'))
        return (o.errors = [{ params: { missingProperty: n } }]), !1;
      {
        const n = p;
        for (const r in e)
          if ('shareScope' !== r && 'shared' !== r)
            return (o.errors = [{ params: { additionalProperty: r } }]), !1;
        if (n === p) {
          if (void 0 !== e.shareScope) {
            let t = e.shareScope;
            const n = p;
            if (p === n) {
              if ('string' != typeof t)
                return (o.errors = [{ params: { type: 'string' } }]), !1;
              if (r(t) < 1) return (o.errors = [{ params: { limit: 1 } }]), !1;
            }
            var f = n === p;
          } else f = !0;
          if (f)
            if (void 0 !== e.shared) {
              const r = p;
              s(e.shared, {
                instancePath: t + '/shared',
                parentData: e,
                parentDataProperty: 'shared',
                rootData: i,
              }) ||
                ((l = null === l ? s.errors : l.concat(s.errors)),
                (p = l.length)),
                (f = r === p);
            } else f = !0;
        }
      }
    }
  }
  return (o.errors = l), 0 === p;
}
