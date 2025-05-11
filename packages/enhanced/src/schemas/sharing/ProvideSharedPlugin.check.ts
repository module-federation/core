// @ts-nocheck
/* eslint-disable */
/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 */
export const validate = o;
export default o;
const r = {
    type: 'object',
    additionalProperties: !1,
    properties: {
      eager: { type: 'boolean' },
      shareKey: { type: 'string', minLength: 1 },
      request: { type: 'string', minLength: 1 },
      shareScope: {
        anyOf: [
          { type: 'string', minLength: 1 },
          { type: 'array', items: { type: 'string', minLength: 1 } },
        ],
      },
      requiredVersion: { anyOf: [{ enum: [!1] }, { type: 'string' }] },
      strictVersion: { type: 'boolean' },
      singleton: { type: 'boolean' },
      layer: { type: 'string', minLength: 1 },
      issuerLayer: { type: 'string', minLength: 1 },
      version: { anyOf: [{ enum: [!1] }, { type: 'string' }] },
      exclude: { $ref: '#/definitions/Exclude' },
      include: { $ref: '#/definitions/IncludeExcludeOptions' },
    },
  },
  e = Object.prototype.hasOwnProperty;
function t(
  s,
  {
    instancePath: n = '',
    parentData: o,
    parentDataProperty: a,
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
          if (void 0 !== s.shareKey) {
            let r = s.shareKey;
            const e = p;
            if (p === e) {
              if ('string' != typeof r)
                return (t.errors = [{ params: { type: 'string' } }]), !1;
              if (r.length < 1) return (t.errors = [{ params: {} }]), !1;
            }
            f = e === p;
          } else f = !0;
          if (f) {
            if (void 0 !== s.request) {
              let r = s.request;
              const e = p;
              if (p === e) {
                if ('string' != typeof r)
                  return (t.errors = [{ params: { type: 'string' } }]), !1;
                if (r.length < 1) return (t.errors = [{ params: {} }]), !1;
              }
              f = e === p;
            } else f = !0;
            if (f) {
              if (void 0 !== s.shareScope) {
                let r = s.shareScope;
                const e = p,
                  n = p;
                let o = !1;
                const a = p;
                if (p === a)
                  if ('string' == typeof r) {
                    if (r.length < 1) {
                      const r = { params: {} };
                      null === l ? (l = [r]) : l.push(r), p++;
                    }
                  } else {
                    const r = { params: { type: 'string' } };
                    null === l ? (l = [r]) : l.push(r), p++;
                  }
                var u = a === p;
                if (((o = o || u), !o)) {
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
                  (u = e === p), (o = o || u);
                }
                if (!o) {
                  const r = { params: {} };
                  return (
                    null === l ? (l = [r]) : l.push(r), p++, (t.errors = l), !1
                  );
                }
                (p = n),
                  null !== l && (n ? (l.length = n) : (l = null)),
                  (f = e === p);
              } else f = !0;
              if (f) {
                if (void 0 !== s.requiredVersion) {
                  let e = s.requiredVersion;
                  const n = p,
                    o = p;
                  let a = !1;
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
                  var c = i === p;
                  if (((a = a || c), !a)) {
                    const r = p;
                    if ('string' != typeof e) {
                      const r = { params: { type: 'string' } };
                      null === l ? (l = [r]) : l.push(r), p++;
                    }
                    (c = r === p), (a = a || c);
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
                  (p = o),
                    null !== l && (o ? (l.length = o) : (l = null)),
                    (f = n === p);
                } else f = !0;
                if (f) {
                  if (void 0 !== s.strictVersion) {
                    const r = p;
                    if ('boolean' != typeof s.strictVersion)
                      return (t.errors = [{ params: { type: 'boolean' } }]), !1;
                    f = r === p;
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
                      if (void 0 !== s.layer) {
                        let r = s.layer;
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
                        if (void 0 !== s.issuerLayer) {
                          let r = s.issuerLayer;
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
                          if (void 0 !== s.version) {
                            let e = s.version;
                            const n = p,
                              o = p;
                            let a = !1;
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
                            if (((a = a || y), !a)) {
                              const r = p;
                              if ('string' != typeof e) {
                                const r = { params: { type: 'string' } };
                                null === l ? (l = [r]) : l.push(r), p++;
                              }
                              (y = r === p), (a = a || y);
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
                            (p = o),
                              null !== l && (o ? (l.length = o) : (l = null)),
                              (f = n === p);
                          } else f = !0;
                          if (f) {
                            if (void 0 !== s.exclude) {
                              let r = s.exclude;
                              const e = p;
                              if (p == p) {
                                if (
                                  !r ||
                                  'object' != typeof r ||
                                  Array.isArray(r)
                                )
                                  return (
                                    (t.errors = [
                                      { params: { type: 'object' } },
                                    ]),
                                    !1
                                  );
                                {
                                  const e = p;
                                  for (const e in r)
                                    if (
                                      'request' !== e &&
                                      'version' !== e &&
                                      'fallbackVersion' !== e
                                    )
                                      return (
                                        (t.errors = [
                                          { params: { additionalProperty: e } },
                                        ]),
                                        !1
                                      );
                                  if (e === p) {
                                    if (void 0 !== r.request) {
                                      const e = p;
                                      if (!(r.request instanceof RegExp))
                                        return (
                                          (t.errors = [{ params: {} }]), !1
                                        );
                                      var g = e === p;
                                    } else g = !0;
                                    if (g) {
                                      if (void 0 !== r.version) {
                                        const e = p;
                                        if ('string' != typeof r.version)
                                          return (
                                            (t.errors = [
                                              { params: { type: 'string' } },
                                            ]),
                                            !1
                                          );
                                        g = e === p;
                                      } else g = !0;
                                      if (g)
                                        if (void 0 !== r.fallbackVersion) {
                                          const e = p;
                                          if (
                                            'string' != typeof r.fallbackVersion
                                          )
                                            return (
                                              (t.errors = [
                                                { params: { type: 'string' } },
                                              ]),
                                              !1
                                            );
                                          g = e === p;
                                        } else g = !0;
                                    }
                                  }
                                }
                              }
                              f = e === p;
                            } else f = !0;
                            if (f)
                              if (void 0 !== s.include) {
                                let r = s.include;
                                const e = p,
                                  n = p,
                                  o = p;
                                let a = !1;
                                const i = p;
                                if (
                                  r &&
                                  'object' == typeof r &&
                                  !Array.isArray(r)
                                ) {
                                  let e;
                                  if (void 0 === r.request && (e = 'request')) {
                                    const r = {
                                      params: { missingProperty: e },
                                    };
                                    null === l ? (l = [r]) : l.push(r), p++;
                                  }
                                }
                                var h = i === p;
                                if (((a = a || h), !a)) {
                                  const e = p;
                                  if (
                                    r &&
                                    'object' == typeof r &&
                                    !Array.isArray(r)
                                  ) {
                                    let e;
                                    if (
                                      void 0 === r.version &&
                                      (e = 'version')
                                    ) {
                                      const r = {
                                        params: { missingProperty: e },
                                      };
                                      null === l ? (l = [r]) : l.push(r), p++;
                                    }
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
                                if (
                                  ((p = o),
                                  null !== l &&
                                    (o ? (l.length = o) : (l = null)),
                                  p === n)
                                ) {
                                  if (
                                    !r ||
                                    'object' != typeof r ||
                                    Array.isArray(r)
                                  )
                                    return (
                                      (t.errors = [
                                        { params: { type: 'object' } },
                                      ]),
                                      !1
                                    );
                                  {
                                    const e = p;
                                    for (const e in r)
                                      if (
                                        'request' !== e &&
                                        'version' !== e &&
                                        'fallbackVersion' !== e
                                      )
                                        return (
                                          (t.errors = [
                                            {
                                              params: { additionalProperty: e },
                                            },
                                          ]),
                                          !1
                                        );
                                    if (e === p) {
                                      if (void 0 !== r.request) {
                                        let e = r.request;
                                        const s = p,
                                          n = p;
                                        let o = !1;
                                        const a = p;
                                        if ('string' != typeof e) {
                                          const r = {
                                            params: { type: 'string' },
                                          };
                                          null === l ? (l = [r]) : l.push(r),
                                            p++;
                                        }
                                        var m = a === p;
                                        if (((o = o || m), !o)) {
                                          const r = p;
                                          if (!(e instanceof RegExp)) {
                                            const r = { params: {} };
                                            null === l ? (l = [r]) : l.push(r),
                                              p++;
                                          }
                                          (m = r === p), (o = o || m);
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
                                        (p = n),
                                          null !== l &&
                                            (n ? (l.length = n) : (l = null));
                                        var d = s === p;
                                      } else d = !0;
                                      if (d) {
                                        if (void 0 !== r.version) {
                                          const e = p;
                                          if ('string' != typeof r.version)
                                            return (
                                              (t.errors = [
                                                { params: { type: 'string' } },
                                              ]),
                                              !1
                                            );
                                          d = e === p;
                                        } else d = !0;
                                        if (d)
                                          if (void 0 !== r.fallbackVersion) {
                                            const e = p;
                                            if (
                                              'string' !=
                                              typeof r.fallbackVersion
                                            )
                                              return (
                                                (t.errors = [
                                                  {
                                                    params: { type: 'string' },
                                                  },
                                                ]),
                                                !1
                                              );
                                            d = e === p;
                                          } else d = !0;
                                      }
                                    }
                                  }
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
  return (t.errors = l), 0 === p;
}
function s(
  r,
  {
    instancePath: e = '',
    parentData: n,
    parentDataProperty: o,
    rootData: a = r,
  } = {},
) {
  let i = null,
    l = 0;
  if (0 === l) {
    if (!r || 'object' != typeof r || Array.isArray(r))
      return (s.errors = [{ params: { type: 'object' } }]), !1;
    for (const n in r) {
      let o = r[n];
      const f = l,
        u = l;
      let c = !1;
      const y = l;
      t(o, {
        instancePath: e + '/' + n.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: r,
        parentDataProperty: n,
        rootData: a,
      }) || ((i = null === i ? t.errors : i.concat(t.errors)), (l = i.length));
      var p = y === l;
      if (((c = c || p), !c)) {
        const r = l;
        if (l == l)
          if ('string' == typeof o) {
            if (o.length < 1) {
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
    parentDataProperty: o,
    rootData: a = r,
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
        const o = l,
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
          const o = l;
          s(t, {
            instancePath: e + '/' + n,
            parentData: r,
            parentDataProperty: n,
            rootData: a,
          }) ||
            ((i = null === i ? s.errors : i.concat(s.errors)), (l = i.length)),
            (c = o === l),
            (f = f || c);
        }
        if (f) (l = p), null !== i && (p ? (i.length = p) : (i = null));
        else {
          const r = { params: {} };
          null === i ? (i = [r]) : i.push(r), l++;
        }
        if (o !== l) break;
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
      parentDataProperty: o,
      rootData: a,
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
function o(
  r,
  {
    instancePath: e = '',
    parentData: t,
    parentDataProperty: s,
    rootData: a = r,
  } = {},
) {
  let i = null,
    l = 0;
  if (0 === l) {
    if (!r || 'object' != typeof r || Array.isArray(r))
      return (o.errors = [{ params: { type: 'object' } }]), !1;
    {
      let t;
      if (void 0 === r.provides && (t = 'provides'))
        return (o.errors = [{ params: { missingProperty: t } }]), !1;
      {
        const t = l;
        for (const e in r)
          if ('provides' !== e && 'shareScope' !== e)
            return (o.errors = [{ params: { additionalProperty: e } }]), !1;
        if (t === l) {
          if (void 0 !== r.provides) {
            const t = l;
            n(r.provides, {
              instancePath: e + '/provides',
              parentData: r,
              parentDataProperty: 'provides',
              rootData: a,
            }) ||
              ((i = null === i ? n.errors : i.concat(n.errors)),
              (l = i.length));
            var p = t === l;
          } else p = !0;
          if (p)
            if (void 0 !== r.shareScope) {
              let e = r.shareScope;
              const t = l,
                s = l;
              let n = !1;
              const a = l;
              if (l === a)
                if ('string' == typeof e) {
                  if (e.length < 1) {
                    const r = { params: {} };
                    null === i ? (i = [r]) : i.push(r), l++;
                  }
                } else {
                  const r = { params: { type: 'string' } };
                  null === i ? (i = [r]) : i.push(r), l++;
                }
              var f = a === l;
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
                  null === i ? (i = [r]) : i.push(r), l++, (o.errors = i), !1
                );
              }
              (l = s),
                null !== i && (s ? (i.length = s) : (i = null)),
                (p = t === l);
            } else p = !0;
        }
      }
    }
  }
  return (o.errors = i), 0 === l;
}
