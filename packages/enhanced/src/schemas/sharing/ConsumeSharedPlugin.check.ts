// @ts-nocheck
/* eslint-disable */
/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 */
export const validate = a;
export default a;
const r = {
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
      shareScope: {
        anyOf: [
          { type: 'string', minLength: 1 },
          { type: 'array', items: { type: 'string', minLength: 1 } },
        ],
      },
      layer: { type: 'string', minLength: 1 },
      issuerLayer: { type: 'string', minLength: 1 },
      request: { type: 'string', minLength: 1 },
      singleton: { type: 'boolean' },
      strictVersion: { type: 'boolean' },
    },
  },
  e = Object.prototype.hasOwnProperty;
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
      for (const s in n)
        if (!e.call(r.properties, s))
          return (t.errors = [{ params: { additionalProperty: s } }]), !1;
      if (s === p) {
        if (void 0 !== n.eager) {
          const r = p;
          if ('boolean' != typeof n.eager)
            return (t.errors = [{ params: { type: 'boolean' } }]), !1;
          var f = r === p;
        } else f = !0;
        if (f) {
          if (void 0 !== n.import) {
            let e = n.import;
            const s = p,
              a = p;
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
            (p = a),
              null !== l && (a ? (l.length = a) : (l = null)),
              (f = s === p);
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
                const s = p,
                  a = p;
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
                (p = a),
                  null !== l && (a ? (l.length = a) : (l = null)),
                  (f = s === p);
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
                    const e = p,
                      s = p;
                    let a = !1;
                    const o = p;
                    if (p === o)
                      if ('string' == typeof r) {
                        if (r.length < 1) {
                          const r = { params: {} };
                          null === l ? (l = [r]) : l.push(r), p++;
                        }
                      } else {
                        const r = { params: { type: 'string' } };
                        null === l ? (l = [r]) : l.push(r), p++;
                      }
                    var y = o === p;
                    if (((a = a || y), !a)) {
                      const e = p;
                      if (p === e)
                        if (Array.isArray(r)) {
                          const e = r.length;
                          for (let t = 0; t < e; t++) {
                            let e = r[t];
                            const n = p;
                            if (p === n)
                              if ('string' == typeof e) {
                                if (e.length < 1) {
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
                      (y = e === p), (a = a || y);
                    }
                    if (!a) {
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
                      (f = e === p);
                  } else f = !0;
                  if (f) {
                    if (void 0 !== n.layer) {
                      let r = n.layer;
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
                      if (void 0 !== n.issuerLayer) {
                        let r = n.issuerLayer;
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
                        if (void 0 !== n.request) {
                          let r = n.request;
                          const e = p;
                          if (p === e) {
                            if ('string' != typeof r)
                              return (
                                (t.errors = [{ params: { type: 'string' } }]),
                                !1
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
                                (t.errors = [{ params: { type: 'boolean' } }]),
                                !1
                              );
                            f = r === p;
                          } else f = !0;
                          if (f)
                            if (void 0 !== n.strictVersion) {
                              const r = p;
                              if ('boolean' != typeof n.strictVersion)
                                return (
                                  (t.errors = [
                                    { params: { type: 'boolean' } },
                                  ]),
                                  !1
                                );
                              f = r === p;
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
    }
  }
  return (t.errors = l), 0 === p;
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
  if (0 === l) {
    if (!r || 'object' != typeof r || Array.isArray(r))
      return (n.errors = [{ params: { type: 'object' } }]), !1;
    for (const s in r) {
      let a = r[s];
      const f = l,
        u = l;
      let c = !1;
      const y = l;
      t(a, {
        instancePath: e + '/' + s.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: r,
        parentDataProperty: s,
        rootData: o,
      }) || ((i = null === i ? t.errors : i.concat(t.errors)), (l = i.length));
      var p = y === l;
      if (((c = c || p), !c)) {
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
  const p = l;
  let f = !1;
  const u = l;
  if (l === u)
    if (Array.isArray(r)) {
      const t = r.length;
      for (let s = 0; s < t; s++) {
        let t = r[s];
        const a = l,
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
          const a = l;
          n(t, {
            instancePath: e + '/' + s,
            parentData: r,
            parentDataProperty: s,
            rootData: o,
          }) ||
            ((i = null === i ? n.errors : i.concat(n.errors)), (l = i.length)),
            (c = a === l),
            (f = f || c);
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
  var y = u === l;
  if (((f = f || y), !f)) {
    const s = l;
    n(r, {
      instancePath: e,
      parentData: t,
      parentDataProperty: a,
      rootData: o,
    }) || ((i = null === i ? n.errors : i.concat(n.errors)), (l = i.length)),
      (y = s === l),
      (f = f || y);
  }
  if (!f) {
    const r = { params: {} };
    return null === i ? (i = [r]) : i.push(r), l++, (s.errors = i), !1;
  }
  return (
    (l = p),
    null !== i && (p ? (i.length = p) : (i = null)),
    (s.errors = i),
    0 === l
  );
}
function a(
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
      return (a.errors = [{ params: { type: 'object' } }]), !1;
    {
      let t;
      if (void 0 === r.consumes && (t = 'consumes'))
        return (a.errors = [{ params: { missingProperty: t } }]), !1;
      {
        const t = l;
        for (const e in r)
          if ('consumes' !== e && 'shareScope' !== e)
            return (a.errors = [{ params: { additionalProperty: e } }]), !1;
        if (t === l) {
          if (void 0 !== r.consumes) {
            const t = l;
            s(r.consumes, {
              instancePath: e + '/consumes',
              parentData: r,
              parentDataProperty: 'consumes',
              rootData: o,
            }) ||
              ((i = null === i ? s.errors : i.concat(s.errors)),
              (l = i.length));
            var p = t === l;
          } else p = !0;
          if (p)
            if (void 0 !== r.shareScope) {
              let e = r.shareScope;
              const t = l,
                n = l;
              let s = !1;
              const o = l;
              if (l === o)
                if ('string' == typeof e) {
                  if (e.length < 1) {
                    const r = { params: {} };
                    null === i ? (i = [r]) : i.push(r), l++;
                  }
                } else {
                  const r = { params: { type: 'string' } };
                  null === i ? (i = [r]) : i.push(r), l++;
                }
              var f = o === l;
              if (((s = s || f), !s)) {
                const r = l;
                if (l === r)
                  if (Array.isArray(e)) {
                    const r = e.length;
                    for (let t = 0; t < r; t++) {
                      let r = e[t];
                      const n = l;
                      if (l === n)
                        if ('string' == typeof r) {
                          if (r.length < 1) {
                            const r = { params: {} };
                            null === i ? (i = [r]) : i.push(r), l++;
                          }
                        } else {
                          const r = { params: { type: 'string' } };
                          null === i ? (i = [r]) : i.push(r), l++;
                        }
                      if (n !== l) break;
                    }
                  } else {
                    const r = { params: { type: 'array' } };
                    null === i ? (i = [r]) : i.push(r), l++;
                  }
                (f = r === l), (s = s || f);
              }
              if (!s) {
                const r = { params: {} };
                return (
                  null === i ? (i = [r]) : i.push(r), l++, (a.errors = i), !1
                );
              }
              (l = n),
                null !== i && (n ? (i.length = n) : (i = null)),
                (p = t === l);
            } else p = !0;
        }
      }
    }
  }
  return (a.errors = i), 0 === l;
}
