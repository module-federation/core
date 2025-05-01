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
      filter: { $ref: '#/definitions/Filter' },
      import: { anyOf: [{ enum: [!1] }, { $ref: '#/definitions/SharedItem' }] },
      packageName: { type: 'string', minLength: 1 },
      requiredVersion: { anyOf: [{ enum: [!1] }, { type: 'string' }] },
      shareKey: { type: 'string', minLength: 1 },
      shareScope: {
        anyOf: [
          { type: 'string', minLength: 1 },
          { type: 'array', items: { type: 'string', minLength: 1 } },
        ],
      },
      singleton: { type: 'boolean' },
      strictVersion: { type: 'boolean' },
      version: { anyOf: [{ enum: [!1] }, { type: 'string' }] },
      request: { type: 'string', minLength: 1 },
      layer: { type: 'string', minLength: 1 },
      issuerLayer: { type: 'string', minLength: 1 },
    },
  },
  e = Object.prototype.hasOwnProperty;
function t(
  s,
  {
    instancePath: n = '',
    parentData: a,
    parentDataProperty: o,
    rootData: i = s,
  } = {},
) {
  let l = null,
    p = 0;
  if (0 === p) {
    if (!s || 'object' != typeof s || Array.isArray(s))
      return (t.errors = [{ params: { type: 'object' } }]), !1;
    {
      const n = p;
      for (const n in s)
        if (!e.call(r.properties, n))
          return (t.errors = [{ params: { additionalProperty: n } }]), !1;
      if (n === p) {
        if (void 0 !== s.eager) {
          const r = p;
          if ('boolean' != typeof s.eager)
            return (t.errors = [{ params: { type: 'boolean' } }]), !1;
          var f = r === p;
        } else f = !0;
        if (f) {
          if (void 0 !== s.filter) {
            let r = s.filter;
            const e = p;
            if (p == p) {
              if (!r || 'object' != typeof r || Array.isArray(r))
                return (t.errors = [{ params: { type: 'object' } }]), !1;
              {
                const e = p;
                for (const e in r)
                  if (
                    'request' !== e &&
                    'version' !== e &&
                    'fallbackVersion' !== e
                  )
                    return (
                      (t.errors = [{ params: { additionalProperty: e } }]), !1
                    );
                if (e === p) {
                  if (void 0 !== r.request) {
                    const e = p;
                    if (!(r.request instanceof RegExp))
                      return (t.errors = [{ params: {} }]), !1;
                    var u = e === p;
                  } else u = !0;
                  if (u) {
                    if (void 0 !== r.version) {
                      const e = p;
                      if ('string' != typeof r.version)
                        return (
                          (t.errors = [{ params: { type: 'string' } }]), !1
                        );
                      u = e === p;
                    } else u = !0;
                    if (u)
                      if (void 0 !== r.fallbackVersion) {
                        const e = p;
                        if ('string' != typeof r.fallbackVersion)
                          return (
                            (t.errors = [{ params: { type: 'string' } }]), !1
                          );
                        u = e === p;
                      } else u = !0;
                  }
                }
              }
            }
            f = e === p;
          } else f = !0;
          if (f) {
            if (void 0 !== s.import) {
              let e = s.import;
              const n = p,
                a = p;
              let o = !1;
              const i = p;
              if (!1 !== e) {
                const e = {
                  params: { allowedValues: r.properties.import.anyOf[0].enum },
                };
                null === l ? (l = [e]) : l.push(e), p++;
              }
              var c = i === p;
              if (((o = o || c), !o)) {
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
                (f = n === p);
            } else f = !0;
            if (f) {
              if (void 0 !== s.packageName) {
                let r = s.packageName;
                const e = p;
                if (p === e) {
                  if ('string' != typeof r)
                    return (t.errors = [{ params: { type: 'string' } }]), !1;
                  if (r.length < 1) return (t.errors = [{ params: {} }]), !1;
                }
                f = e === p;
              } else f = !0;
              if (f) {
                if (void 0 !== s.requiredVersion) {
                  let e = s.requiredVersion;
                  const n = p,
                    a = p;
                  let o = !1;
                  const i = p;
                  if (!1 !== e) {
                    const e = {
                      params: {
                        allowedValues:
                          r.properties.requiredVersion.anyOf[0].enum,
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
                  (p = a),
                    null !== l && (a ? (l.length = a) : (l = null)),
                    (f = n === p);
                } else f = !0;
                if (f) {
                  if (void 0 !== s.shareKey) {
                    let r = s.shareKey;
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
                    if (void 0 !== s.shareScope) {
                      let r = s.shareScope;
                      const e = p,
                        n = p;
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
                      var h = o === p;
                      if (((a = a || h), !a)) {
                        const e = p;
                        if (p === e)
                          if (Array.isArray(r)) {
                            const e = r.length;
                            for (let t = 0; t < e; t++) {
                              let e = r[t];
                              const s = p;
                              if (p === s)
                                if ('string' == typeof e) {
                                  if (e.length < 1) {
                                    const r = { params: {} };
                                    null === l ? (l = [r]) : l.push(r), p++;
                                  }
                                } else {
                                  const r = { params: { type: 'string' } };
                                  null === l ? (l = [r]) : l.push(r), p++;
                                }
                              if (s !== p) break;
                            }
                          } else {
                            const r = { params: { type: 'array' } };
                            null === l ? (l = [r]) : l.push(r), p++;
                          }
                        (h = e === p), (a = a || h);
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
                      (p = n),
                        null !== l && (n ? (l.length = n) : (l = null)),
                        (f = e === p);
                    } else f = !0;
                    if (f) {
                      if (void 0 !== s.singleton) {
                        const r = p;
                        if ('boolean' != typeof s.singleton)
                          return (
                            (t.errors = [{ params: { type: 'boolean' } }]), !1
                          );
                        f = r === p;
                      } else f = !0;
                      if (f) {
                        if (void 0 !== s.strictVersion) {
                          const r = p;
                          if ('boolean' != typeof s.strictVersion)
                            return (
                              (t.errors = [{ params: { type: 'boolean' } }]), !1
                            );
                          f = r === p;
                        } else f = !0;
                        if (f) {
                          if (void 0 !== s.version) {
                            let e = s.version;
                            const n = p,
                              a = p;
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
                            var g = i === p;
                            if (((o = o || g), !o)) {
                              const r = p;
                              if ('string' != typeof e) {
                                const r = { params: { type: 'string' } };
                                null === l ? (l = [r]) : l.push(r), p++;
                              }
                              (g = r === p), (o = o || g);
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
                            (p = a),
                              null !== l && (a ? (l.length = a) : (l = null)),
                              (f = n === p);
                          } else f = !0;
                          if (f) {
                            if (void 0 !== s.request) {
                              let r = s.request;
                              const e = p;
                              if (p === e) {
                                if ('string' != typeof r)
                                  return (
                                    (t.errors = [
                                      { params: { type: 'string' } },
                                    ]),
                                    !1
                                  );
                                if (r.length < 1)
                                  return (t.errors = [{ params: {} }]), !1;
                              }
                              f = e === p;
                            } else f = !0;
                            if (f) {
                              if (void 0 !== s.layer) {
                                let r = s.layer;
                                const e = p;
                                if (p === e) {
                                  if ('string' != typeof r)
                                    return (
                                      (t.errors = [
                                        { params: { type: 'string' } },
                                      ]),
                                      !1
                                    );
                                  if (r.length < 1)
                                    return (t.errors = [{ params: {} }]), !1;
                                }
                                f = e === p;
                              } else f = !0;
                              if (f)
                                if (void 0 !== s.issuerLayer) {
                                  let r = s.issuerLayer;
                                  const e = p;
                                  if (p === e) {
                                    if ('string' != typeof r)
                                      return (
                                        (t.errors = [
                                          { params: { type: 'string' } },
                                        ]),
                                        !1
                                      );
                                    if (r.length < 1)
                                      return (t.errors = [{ params: {} }]), !1;
                                  }
                                  f = e === p;
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
    }
  }
  return (t.errors = l), 0 === p;
}
function s(
  r,
  {
    instancePath: e = '',
    parentData: n,
    parentDataProperty: a,
    rootData: o = r,
  } = {},
) {
  let i = null,
    l = 0;
  if (0 === l) {
    if (!r || 'object' != typeof r || Array.isArray(r))
      return (s.errors = [{ params: { type: 'object' } }]), !1;
    for (const n in r) {
      let a = r[n];
      const f = l,
        u = l;
      let c = !1;
      const y = l;
      t(a, {
        instancePath: e + '/' + n.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: r,
        parentDataProperty: n,
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
        return null === i ? (i = [r]) : i.push(r), l++, (s.errors = i), !1;
      }
      if (((l = u), null !== i && (u ? (i.length = u) : (i = null)), f !== l))
        break;
    }
  }
  return (s.errors = i), 0 === l;
}
function n(
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
      for (let n = 0; n < t; n++) {
        let t = r[n];
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
          s(t, {
            instancePath: e + '/' + n,
            parentData: r,
            parentDataProperty: n,
            rootData: o,
          }) ||
            ((i = null === i ? s.errors : i.concat(s.errors)), (l = i.length)),
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
    const n = l;
    s(r, {
      instancePath: e,
      parentData: t,
      parentDataProperty: a,
      rootData: o,
    }) || ((i = null === i ? s.errors : i.concat(s.errors)), (l = i.length)),
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
  if (0 === l) {
    if (!r || 'object' != typeof r || Array.isArray(r))
      return (a.errors = [{ params: { type: 'object' } }]), !1;
    {
      let t;
      if (void 0 === r.shared && (t = 'shared'))
        return (a.errors = [{ params: { missingProperty: t } }]), !1;
      {
        const t = l;
        for (const e in r)
          if ('async' !== e && 'shareScope' !== e && 'shared' !== e)
            return (a.errors = [{ params: { additionalProperty: e } }]), !1;
        if (t === l) {
          if (void 0 !== r.async) {
            const e = l;
            if ('boolean' != typeof r.async)
              return (a.errors = [{ params: { type: 'boolean' } }]), !1;
            var p = e === l;
          } else p = !0;
          if (p) {
            if (void 0 !== r.shareScope) {
              let e = r.shareScope;
              const t = l,
                s = l;
              let n = !1;
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
              if (((n = n || f), !n)) {
                const r = l;
                if (l === r)
                  if (Array.isArray(e)) {
                    const r = e.length;
                    for (let t = 0; t < r; t++) {
                      let r = e[t];
                      const s = l;
                      if (l === s)
                        if ('string' == typeof r) {
                          if (r.length < 1) {
                            const r = { params: {} };
                            null === i ? (i = [r]) : i.push(r), l++;
                          }
                        } else {
                          const r = { params: { type: 'string' } };
                          null === i ? (i = [r]) : i.push(r), l++;
                        }
                      if (s !== l) break;
                    }
                  } else {
                    const r = { params: { type: 'array' } };
                    null === i ? (i = [r]) : i.push(r), l++;
                  }
                (f = r === l), (n = n || f);
              }
              if (!n) {
                const r = { params: {} };
                return (
                  null === i ? (i = [r]) : i.push(r), l++, (a.errors = i), !1
                );
              }
              (l = s),
                null !== i && (s ? (i.length = s) : (i = null)),
                (p = t === l);
            } else p = !0;
            if (p)
              if (void 0 !== r.shared) {
                const t = l;
                n(r.shared, {
                  instancePath: e + '/shared',
                  parentData: r,
                  parentDataProperty: 'shared',
                  rootData: o,
                }) ||
                  ((i = null === i ? n.errors : i.concat(n.errors)),
                  (l = i.length)),
                  (p = t === l);
              } else p = !0;
          }
        }
      }
    }
  }
  return (a.errors = i), 0 === l;
}
