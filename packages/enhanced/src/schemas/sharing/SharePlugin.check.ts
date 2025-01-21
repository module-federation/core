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
  e = Object.prototype.hasOwnProperty;
function t(
  n,
  {
    instancePath: a = '',
    parentData: s,
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
      const a = p;
      for (const a in n)
        if (!e.call(r.properties, a))
          return (t.errors = [{ params: { additionalProperty: a } }]), !1;
      if (a === p) {
        if (void 0 !== n.eager) {
          const r = p;
          if ('boolean' != typeof n.eager)
            return (t.errors = [{ params: { type: 'boolean' } }]), !1;
          var f = r === p;
        } else f = !0;
        if (f) {
          if (void 0 !== n.import) {
            let e = n.import;
            const a = p,
              s = p;
            let o = !1;
            const i = p;
            if (!1 !== e) {
              const e = {
                params: { allowedValues: r.properties.import.anyOf[0].enum },
              };
              null === l ? (l = [e]) : l.push(e), p++;
            }
            var u = i === p;
            if (((o = o || u), !o)) {
              const r = p;
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
              (u = r === p), (o = o || u);
            }
            if (!o) {
              const r = { params: {} };
              return (
                null === l ? (l = [r]) : l.push(r), p++, (t.errors = l), !1
              );
            }
            (p = s),
              null !== l && (s ? (l.length = s) : (l = null)),
              (f = a === p);
          } else f = !0;
          if (f) {
            if (void 0 !== n.packageName) {
              let r = n.packageName;
              const e = p;
              if (p === e) {
                if ('string' != typeof r)
                  return (t.errors = [{ params: { type: 'string' } }]), !1;
                if (r.length < 1) return (t.errors = [{ params: {} }]), !1;
              }
              f = e === p;
            } else f = !0;
            if (f) {
              if (void 0 !== n.requiredVersion) {
                let e = n.requiredVersion;
                const a = p,
                  s = p;
                let o = !1;
                const i = p;
                if (!1 !== e) {
                  const e = {
                    params: {
                      allowedValues: r.properties.requiredVersion.anyOf[0].enum,
                    },
                  };
                  null === l ? (l = [e]) : l.push(e), p++;
                }
                var c = i === p;
                if (((o = o || c), !o)) {
                  const r = p;
                  if ('string' != typeof e) {
                    const r = { params: { type: 'string' } };
                    null === l ? (l = [r]) : l.push(r), p++;
                  }
                  (c = r === p), (o = o || c);
                }
                if (!o) {
                  const r = { params: {} };
                  return (
                    null === l ? (l = [r]) : l.push(r), p++, (t.errors = l), !1
                  );
                }
                (p = s),
                  null !== l && (s ? (l.length = s) : (l = null)),
                  (f = a === p);
              } else f = !0;
              if (f) {
                if (void 0 !== n.shareKey) {
                  let r = n.shareKey;
                  const e = p;
                  if (p === e) {
                    if ('string' != typeof r)
                      return (t.errors = [{ params: { type: 'string' } }]), !1;
                    if (r.length < 1) return (t.errors = [{ params: {} }]), !1;
                  }
                  f = e === p;
                } else f = !0;
                if (f) {
                  if (void 0 !== n.shareScope) {
                    let r = n.shareScope;
                    const e = p;
                    if (p === e) {
                      if ('string' != typeof r)
                        return (
                          (t.errors = [{ params: { type: 'string' } }]), !1
                        );
                      if (r.length < 1)
                        return (t.errors = [{ params: {} }]), !1;
                    }
                    f = e === p;
                  } else f = !0;
                  if (f) {
                    if (void 0 !== n.singleton) {
                      const r = p;
                      if ('boolean' != typeof n.singleton)
                        return (
                          (t.errors = [{ params: { type: 'boolean' } }]), !1
                        );
                      f = r === p;
                    } else f = !0;
                    if (f) {
                      if (void 0 !== n.strictVersion) {
                        const r = p;
                        if ('boolean' != typeof n.strictVersion)
                          return (
                            (t.errors = [{ params: { type: 'boolean' } }]), !1
                          );
                        f = r === p;
                      } else f = !0;
                      if (f)
                        if (void 0 !== n.version) {
                          let e = n.version;
                          const a = p,
                            s = p;
                          let o = !1;
                          const i = p;
                          if (!1 !== e) {
                            const e = {
                              params: {
                                allowedValues:
                                  r.properties.version.anyOf[0].enum,
                              },
                            };
                            null === l ? (l = [e]) : l.push(e), p++;
                          }
                          var y = i === p;
                          if (((o = o || y), !o)) {
                            const r = p;
                            if ('string' != typeof e) {
                              const r = { params: { type: 'string' } };
                              null === l ? (l = [r]) : l.push(r), p++;
                            }
                            (y = r === p), (o = o || y);
                          }
                          if (!o) {
                            const r = { params: {} };
                            return (
                              null === l ? (l = [r]) : l.push(r),
                              p++,
                              (t.errors = l),
                              !1
                            );
                          }
                          (p = s),
                            null !== l && (s ? (l.length = s) : (l = null)),
                            (f = a === p);
                        } else f = !0;
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
  return (t.errors = l), 0 === p;
}
function n(
  r,
  {
    instancePath: e = '',
    parentData: a,
    parentDataProperty: s,
    rootData: o = r,
  } = {},
) {
  let i = null,
    l = 0;
  if (0 === l) {
    if (!r || 'object' != typeof r || Array.isArray(r))
      return (n.errors = [{ params: { type: 'object' } }]), !1;
    for (const a in r) {
      let s = r[a];
      const f = l,
        u = l;
      let c = !1;
      const y = l;
      t(s, {
        instancePath: e + '/' + a.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: r,
        parentDataProperty: a,
        rootData: o,
      }) || ((i = null === i ? t.errors : i.concat(t.errors)), (l = i.length));
      var p = y === l;
      if (((c = c || p), !c)) {
        const r = l;
        if (l == l)
          if ('string' == typeof s) {
            if (s.length < 1) {
              const r = { params: {} };
              null === i ? (i = [r]) : i.push(r), l++;
            }
          } else {
            const r = { params: { type: 'string' } };
            null === i ? (i = [r]) : i.push(r), l++;
          }
        (p = r === l), (c = c || p);
      }
      if (!c) {
        const r = { params: {} };
        return null === i ? (i = [r]) : i.push(r), l++, (n.errors = i), !1;
      }
      if (((l = u), null !== i && (u ? (i.length = u) : (i = null)), f !== l))
        break;
    }
  }
  return (n.errors = i), 0 === l;
}
function a(
  r,
  {
    instancePath: e = '',
    parentData: t,
    parentDataProperty: s,
    rootData: o = r,
  } = {},
) {
  let i = null,
    l = 0;
  const p = l;
  let f = !1;
  const u = l;
  if (l === u)
    if (Array.isArray(r)) {
      const t = r.length;
      for (let a = 0; a < t; a++) {
        let t = r[a];
        const s = l,
          p = l;
        let f = !1;
        const u = l;
        if (l == l)
          if ('string' == typeof t) {
            if (t.length < 1) {
              const r = { params: {} };
              null === i ? (i = [r]) : i.push(r), l++;
            }
          } else {
            const r = { params: { type: 'string' } };
            null === i ? (i = [r]) : i.push(r), l++;
          }
        var c = u === l;
        if (((f = f || c), !f)) {
          const s = l;
          n(t, {
            instancePath: e + '/' + a,
            parentData: r,
            parentDataProperty: a,
            rootData: o,
          }) ||
            ((i = null === i ? n.errors : i.concat(n.errors)), (l = i.length)),
            (c = s === l),
            (f = f || c);
        }
        if (f) (l = p), null !== i && (p ? (i.length = p) : (i = null));
        else {
          const r = { params: {} };
          null === i ? (i = [r]) : i.push(r), l++;
        }
        if (s !== l) break;
      }
    } else {
      const r = { params: { type: 'array' } };
      null === i ? (i = [r]) : i.push(r), l++;
    }
  var y = u === l;
  if (((f = f || y), !f)) {
    const a = l;
    n(r, {
      instancePath: e,
      parentData: t,
      parentDataProperty: s,
      rootData: o,
    }) || ((i = null === i ? n.errors : i.concat(n.errors)), (l = i.length)),
      (y = a === l),
      (f = f || y);
  }
  if (!f) {
    const r = { params: {} };
    return null === i ? (i = [r]) : i.push(r), l++, (a.errors = i), !1;
  }
  return (
    (l = p),
    null !== i && (p ? (i.length = p) : (i = null)),
    (a.errors = i),
    0 === l
  );
}
function s(
  r,
  {
    instancePath: e = '',
    parentData: t,
    parentDataProperty: n,
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
      if (void 0 === r.shared && (t = 'shared'))
        return (s.errors = [{ params: { missingProperty: t } }]), !1;
      {
        const t = l;
        for (const e in r)
          if ('shareScope' !== e && 'shared' !== e)
            return (s.errors = [{ params: { additionalProperty: e } }]), !1;
        if (t === l) {
          if (void 0 !== r.shareScope) {
            let e = r.shareScope;
            const t = l;
            if (l === t) {
              if ('string' != typeof e)
                return (s.errors = [{ params: { type: 'string' } }]), !1;
              if (e.length < 1) return (s.errors = [{ params: {} }]), !1;
            }
            var p = t === l;
          } else p = !0;
          if (p)
            if (void 0 !== r.shared) {
              const t = l;
              a(r.shared, {
                instancePath: e + '/shared',
                parentData: r,
                parentDataProperty: 'shared',
                rootData: o,
              }) ||
                ((i = null === i ? a.errors : i.concat(a.errors)),
                (l = i.length)),
                (p = t === l);
            } else p = !0;
        }
      }
    }
  }
  return (s.errors = i), 0 === l;
}
