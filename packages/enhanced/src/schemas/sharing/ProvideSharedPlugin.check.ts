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
      exclude: { $ref: '#/definitions/IncludeExcludeOptions' },
      include: { $ref: '#/definitions/IncludeExcludeOptions' },
      allowNodeModulesSuffixMatch: { type: 'boolean' },
      treeShakingMode: {
        type: 'string',
        enum: ['server-calc', 'runtime-infer'],
      },
    },
  },
  e = Object.prototype.hasOwnProperty;
function t(
  s,
  {
    instancePath: n = '',
    parentData: o,
    parentDataProperty: i,
    rootData: a = s,
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
                const i = p;
                if (p === i)
                  if ('string' == typeof r) {
                    if (r.length < 1) {
                      const r = { params: {} };
                      null === l ? (l = [r]) : l.push(r), p++;
                    }
                  } else {
                    const r = { params: { type: 'string' } };
                    null === l ? (l = [r]) : l.push(r), p++;
                  }
                var u = i === p;
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
                  let i = !1;
                  const a = p;
                  if (!1 !== e) {
                    const e = {
                      params: {
                        allowedValues:
                          r.properties.requiredVersion.anyOf[0].enum,
                      },
                    };
                    null === l ? (l = [e]) : l.push(e), p++;
                  }
                  var c = a === p;
                  if (((i = i || c), !i)) {
                    const r = p;
                    if ('string' != typeof e) {
                      const r = { params: { type: 'string' } };
                      null === l ? (l = [r]) : l.push(r), p++;
                    }
                    (c = r === p), (i = i || c);
                  }
                  if (!i) {
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
                            let i = !1;
                            const a = p;
                            if (!1 !== e) {
                              const e = {
                                params: {
                                  allowedValues:
                                    r.properties.version.anyOf[0].enum,
                                },
                              };
                              null === l ? (l = [e]) : l.push(e), p++;
                            }
                            var y = a === p;
                            if (((i = i || y), !i)) {
                              const r = p;
                              if ('string' != typeof e) {
                                const r = { params: { type: 'string' } };
                                null === l ? (l = [r]) : l.push(r), p++;
                              }
                              (y = r === p), (i = i || y);
                            }
                            if (!i) {
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
                              const e = p,
                                n = p,
                                o = p;
                              let i = !1;
                              const a = p;
                              if (
                                r &&
                                'object' == typeof r &&
                                !Array.isArray(r)
                              ) {
                                let e;
                                if (void 0 === r.request && (e = 'request')) {
                                  const r = { params: { missingProperty: e } };
                                  null === l ? (l = [r]) : l.push(r), p++;
                                }
                              }
                              var g = a === p;
                              if (((i = i || g), !i)) {
                                const e = p;
                                if (
                                  r &&
                                  'object' == typeof r &&
                                  !Array.isArray(r)
                                ) {
                                  let e;
                                  if (void 0 === r.version && (e = 'version')) {
                                    const r = {
                                      params: { missingProperty: e },
                                    };
                                    null === l ? (l = [r]) : l.push(r), p++;
                                  }
                                }
                                (g = e === p), (i = i || g);
                              }
                              if (!i) {
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
                                null !== l && (o ? (l.length = o) : (l = null)),
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
                                          { params: { additionalProperty: e } },
                                        ]),
                                        !1
                                      );
                                  if (e === p) {
                                    if (void 0 !== r.request) {
                                      let e = r.request;
                                      const s = p,
                                        n = p;
                                      let o = !1;
                                      const i = p;
                                      if ('string' != typeof e) {
                                        const r = {
                                          params: { type: 'string' },
                                        };
                                        null === l ? (l = [r]) : l.push(r), p++;
                                      }
                                      var h = i === p;
                                      if (((o = o || h), !o)) {
                                        const r = p;
                                        if (!(e instanceof RegExp)) {
                                          const r = { params: {} };
                                          null === l ? (l = [r]) : l.push(r),
                                            p++;
                                        }
                                        (h = r === p), (o = o || h);
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
                                      var m = s === p;
                                    } else m = !0;
                                    if (m) {
                                      if (void 0 !== r.version) {
                                        const e = p;
                                        if ('string' != typeof r.version)
                                          return (
                                            (t.errors = [
                                              { params: { type: 'string' } },
                                            ]),
                                            !1
                                          );
                                        m = e === p;
                                      } else m = !0;
                                      if (m)
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
                                          m = e === p;
                                        } else m = !0;
                                    }
                                  }
                                }
                              }
                              f = e === p;
                            } else f = !0;
                            if (f) {
                              if (void 0 !== s.include) {
                                let r = s.include;
                                const e = p,
                                  n = p,
                                  o = p;
                                let i = !1;
                                const a = p;
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
                                var d = a === p;
                                if (((i = i || d), !i)) {
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
                                  (d = e === p), (i = i || d);
                                }
                                if (!i) {
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
                                        const i = p;
                                        if ('string' != typeof e) {
                                          const r = {
                                            params: { type: 'string' },
                                          };
                                          null === l ? (l = [r]) : l.push(r),
                                            p++;
                                        }
                                        var v = i === p;
                                        if (((o = o || v), !o)) {
                                          const r = p;
                                          if (!(e instanceof RegExp)) {
                                            const r = { params: {} };
                                            null === l ? (l = [r]) : l.push(r),
                                              p++;
                                          }
                                          (v = r === p), (o = o || v);
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
                                        var b = s === p;
                                      } else b = !0;
                                      if (b) {
                                        if (void 0 !== r.version) {
                                          const e = p;
                                          if ('string' != typeof r.version)
                                            return (
                                              (t.errors = [
                                                { params: { type: 'string' } },
                                              ]),
                                              !1
                                            );
                                          b = e === p;
                                        } else b = !0;
                                        if (b)
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
                                            b = e === p;
                                          } else b = !0;
                                      }
                                    }
                                  }
                                }
                                f = e === p;
                              } else f = !0;
                              if (f) {
                                if (void 0 !== s.allowNodeModulesSuffixMatch) {
                                  const r = p;
                                  if (
                                    'boolean' !=
                                    typeof s.allowNodeModulesSuffixMatch
                                  )
                                    return (
                                      (t.errors = [
                                        { params: { type: 'boolean' } },
                                      ]),
                                      !1
                                    );
                                  f = r === p;
                                } else f = !0;
                                if (f)
                                  if (void 0 !== s.treeShakingMode) {
                                    let e = s.treeShakingMode;
                                    const n = p;
                                    if ('string' != typeof e)
                                      return (
                                        (t.errors = [
                                          { params: { type: 'string' } },
                                        ]),
                                        !1
                                      );
                                    if (
                                      'server-calc' !== e &&
                                      'runtime-infer' !== e
                                    )
                                      return (
                                        (t.errors = [
                                          {
                                            params: {
                                              allowedValues:
                                                r.properties.treeShakingMode
                                                  .enum,
                                            },
                                          },
                                        ]),
                                        !1
                                      );
                                    f = n === p;
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
  }
  return (t.errors = l), 0 === p;
}
function s(
  r,
  {
    instancePath: e = '',
    parentData: n,
    parentDataProperty: o,
    rootData: i = r,
  } = {},
) {
  let a = null,
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
        rootData: i,
      }) || ((a = null === a ? t.errors : a.concat(t.errors)), (l = a.length));
      var p = y === l;
      if (((c = c || p), !c)) {
        const r = l;
        if (l == l)
          if ('string' == typeof o) {
            if (o.length < 1) {
              const r = { params: {} };
              null === a ? (a = [r]) : a.push(r), l++;
            }
          } else {
            const r = { params: { type: 'string' } };
            null === a ? (a = [r]) : a.push(r), l++;
          }
        (p = r === l), (c = c || p);
      }
      if (!c) {
        const r = { params: {} };
        return null === a ? (a = [r]) : a.push(r), l++, (s.errors = a), !1;
      }
      if (((l = u), null !== a && (u ? (a.length = u) : (a = null)), f !== l))
        break;
    }
  }
  return (s.errors = a), 0 === l;
}
function n(
  r,
  {
    instancePath: e = '',
    parentData: t,
    parentDataProperty: o,
    rootData: i = r,
  } = {},
) {
  let a = null,
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
              null === a ? (a = [r]) : a.push(r), l++;
            }
          } else {
            const r = { params: { type: 'string' } };
            null === a ? (a = [r]) : a.push(r), l++;
          }
        var c = u === l;
        if (((f = f || c), !f)) {
          const o = l;
          s(t, {
            instancePath: e + '/' + n,
            parentData: r,
            parentDataProperty: n,
            rootData: i,
          }) ||
            ((a = null === a ? s.errors : a.concat(s.errors)), (l = a.length)),
            (c = o === l),
            (f = f || c);
        }
        if (f) (l = p), null !== a && (p ? (a.length = p) : (a = null));
        else {
          const r = { params: {} };
          null === a ? (a = [r]) : a.push(r), l++;
        }
        if (o !== l) break;
      }
    } else {
      const r = { params: { type: 'array' } };
      null === a ? (a = [r]) : a.push(r), l++;
    }
  var y = u === l;
  if (((f = f || y), !f)) {
    const n = l;
    s(r, {
      instancePath: e,
      parentData: t,
      parentDataProperty: o,
      rootData: i,
    }) || ((a = null === a ? s.errors : a.concat(s.errors)), (l = a.length)),
      (y = n === l),
      (f = f || y);
  }
  if (!f) {
    const r = { params: {} };
    return null === a ? (a = [r]) : a.push(r), l++, (n.errors = a), !1;
  }
  return (
    (l = p),
    null !== a && (p ? (a.length = p) : (a = null)),
    (n.errors = a),
    0 === l
  );
}
function o(
  r,
  {
    instancePath: e = '',
    parentData: t,
    parentDataProperty: s,
    rootData: i = r,
  } = {},
) {
  let a = null,
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
          if ('provides' !== e && 'shareScope' !== e && 'experiments' !== e)
            return (o.errors = [{ params: { additionalProperty: e } }]), !1;
        if (t === l) {
          if (void 0 !== r.provides) {
            const t = l;
            n(r.provides, {
              instancePath: e + '/provides',
              parentData: r,
              parentDataProperty: 'provides',
              rootData: i,
            }) ||
              ((a = null === a ? n.errors : a.concat(n.errors)),
              (l = a.length));
            var p = t === l;
          } else p = !0;
          if (p) {
            if (void 0 !== r.shareScope) {
              let e = r.shareScope;
              const t = l,
                s = l;
              let n = !1;
              const i = l;
              if (l === i)
                if ('string' == typeof e) {
                  if (e.length < 1) {
                    const r = { params: {} };
                    null === a ? (a = [r]) : a.push(r), l++;
                  }
                } else {
                  const r = { params: { type: 'string' } };
                  null === a ? (a = [r]) : a.push(r), l++;
                }
              var f = i === l;
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
                            null === a ? (a = [r]) : a.push(r), l++;
                          }
                        } else {
                          const r = { params: { type: 'string' } };
                          null === a ? (a = [r]) : a.push(r), l++;
                        }
                      if (s !== l) break;
                    }
                  } else {
                    const r = { params: { type: 'array' } };
                    null === a ? (a = [r]) : a.push(r), l++;
                  }
                (f = r === l), (n = n || f);
              }
              if (!n) {
                const r = { params: {} };
                return (
                  null === a ? (a = [r]) : a.push(r), l++, (o.errors = a), !1
                );
              }
              (l = s),
                null !== a && (s ? (a.length = s) : (a = null)),
                (p = t === l);
            } else p = !0;
            if (p)
              if (void 0 !== r.experiments) {
                let e = r.experiments;
                const t = l;
                if (l === t) {
                  if (!e || 'object' != typeof e || Array.isArray(e))
                    return (o.errors = [{ params: { type: 'object' } }]), !1;
                  {
                    const r = l;
                    for (const r in e)
                      if ('allowNodeModulesSuffixMatch' !== r)
                        return (
                          (o.errors = [{ params: { additionalProperty: r } }]),
                          !1
                        );
                    if (
                      r === l &&
                      void 0 !== e.allowNodeModulesSuffixMatch &&
                      'boolean' != typeof e.allowNodeModulesSuffixMatch
                    )
                      return (o.errors = [{ params: { type: 'boolean' } }]), !1;
                  }
                }
                p = t === l;
              } else p = !0;
          }
        }
      }
    }
  }
  return (o.errors = a), 0 === l;
}
