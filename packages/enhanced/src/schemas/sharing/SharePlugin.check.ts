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
      exclude: { $ref: '#/definitions/IncludeExcludeOptions' },
      include: { $ref: '#/definitions/IncludeExcludeOptions' },
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
      allowNodeModulesSuffixMatch: { type: 'boolean' },
    },
  },
  e = {
    type: 'object',
    properties: {
      request: { type: ['string', 'object'] },
      version: { type: 'string' },
      fallbackVersion: { type: 'string' },
    },
    additionalProperties: !1,
    anyOf: [
      { required: ['request'] },
      { required: ['version'] },
      { required: ['fallbackVersion'] },
    ],
  },
  t = Object.prototype.hasOwnProperty;
function s(
  n,
  {
    instancePath: o = '',
    parentData: a,
    parentDataProperty: i,
    rootData: l = n,
  } = {},
) {
  let p = null,
    f = 0;
  if (0 === f) {
    if (!n || 'object' != typeof n || Array.isArray(n))
      return (s.errors = [{ params: { type: 'object' } }]), !1;
    {
      const o = f;
      for (const e in n)
        if (!t.call(r.properties, e))
          return (s.errors = [{ params: { additionalProperty: e } }]), !1;
      if (o === f) {
        if (void 0 !== n.eager) {
          const r = f;
          if ('boolean' != typeof n.eager)
            return (s.errors = [{ params: { type: 'boolean' } }]), !1;
          var u = r === f;
        } else u = !0;
        if (u) {
          if (void 0 !== n.exclude) {
            let r = n.exclude;
            const t = f,
              o = f,
              a = f;
            let i = !1;
            const l = f;
            if (r && 'object' == typeof r && !Array.isArray(r)) {
              let e;
              if (void 0 === r.request && (e = 'request')) {
                const r = { params: { missingProperty: e } };
                null === p ? (p = [r]) : p.push(r), f++;
              }
            }
            var c = l === f;
            if (((i = i || c), !i)) {
              const e = f;
              if (r && 'object' == typeof r && !Array.isArray(r)) {
                let e;
                if (void 0 === r.version && (e = 'version')) {
                  const r = { params: { missingProperty: e } };
                  null === p ? (p = [r]) : p.push(r), f++;
                }
              }
              if (((c = e === f), (i = i || c), !i)) {
                const e = f;
                if (r && 'object' == typeof r && !Array.isArray(r)) {
                  let e;
                  if (void 0 === r.fallbackVersion && (e = 'fallbackVersion')) {
                    const r = { params: { missingProperty: e } };
                    null === p ? (p = [r]) : p.push(r), f++;
                  }
                }
                (c = e === f), (i = i || c);
              }
            }
            if (!i) {
              const r = { params: {} };
              return (
                null === p ? (p = [r]) : p.push(r), f++, (s.errors = p), !1
              );
            }
            if (
              ((f = a),
              null !== p && (a ? (p.length = a) : (p = null)),
              f === o)
            ) {
              if (!r || 'object' != typeof r || Array.isArray(r))
                return (s.errors = [{ params: { type: 'object' } }]), !1;
              {
                const t = f;
                for (const e in r)
                  if (
                    'request' !== e &&
                    'version' !== e &&
                    'fallbackVersion' !== e
                  )
                    return (
                      (s.errors = [{ params: { additionalProperty: e } }]), !1
                    );
                if (t === f) {
                  if (void 0 !== r.request) {
                    let t = r.request;
                    const n = f;
                    if (
                      'string' != typeof t &&
                      (!t || 'object' != typeof t || Array.isArray(t))
                    )
                      return (
                        (s.errors = [
                          { params: { type: e.properties.request.type } },
                        ]),
                        !1
                      );
                    var y = n === f;
                  } else y = !0;
                  if (y) {
                    if (void 0 !== r.version) {
                      const e = f;
                      if ('string' != typeof r.version)
                        return (
                          (s.errors = [{ params: { type: 'string' } }]), !1
                        );
                      y = e === f;
                    } else y = !0;
                    if (y)
                      if (void 0 !== r.fallbackVersion) {
                        const e = f;
                        if ('string' != typeof r.fallbackVersion)
                          return (
                            (s.errors = [{ params: { type: 'string' } }]), !1
                          );
                        y = e === f;
                      } else y = !0;
                  }
                }
              }
            }
            u = t === f;
          } else u = !0;
          if (u) {
            if (void 0 !== n.include) {
              let r = n.include;
              const t = f,
                o = f,
                a = f;
              let i = !1;
              const l = f;
              if (r && 'object' == typeof r && !Array.isArray(r)) {
                let e;
                if (void 0 === r.request && (e = 'request')) {
                  const r = { params: { missingProperty: e } };
                  null === p ? (p = [r]) : p.push(r), f++;
                }
              }
              var h = l === f;
              if (((i = i || h), !i)) {
                const e = f;
                if (r && 'object' == typeof r && !Array.isArray(r)) {
                  let e;
                  if (void 0 === r.version && (e = 'version')) {
                    const r = { params: { missingProperty: e } };
                    null === p ? (p = [r]) : p.push(r), f++;
                  }
                }
                if (((h = e === f), (i = i || h), !i)) {
                  const e = f;
                  if (r && 'object' == typeof r && !Array.isArray(r)) {
                    let e;
                    if (
                      void 0 === r.fallbackVersion &&
                      (e = 'fallbackVersion')
                    ) {
                      const r = { params: { missingProperty: e } };
                      null === p ? (p = [r]) : p.push(r), f++;
                    }
                  }
                  (h = e === f), (i = i || h);
                }
              }
              if (!i) {
                const r = { params: {} };
                return (
                  null === p ? (p = [r]) : p.push(r), f++, (s.errors = p), !1
                );
              }
              if (
                ((f = a),
                null !== p && (a ? (p.length = a) : (p = null)),
                f === o)
              ) {
                if (!r || 'object' != typeof r || Array.isArray(r))
                  return (s.errors = [{ params: { type: 'object' } }]), !1;
                {
                  const t = f;
                  for (const e in r)
                    if (
                      'request' !== e &&
                      'version' !== e &&
                      'fallbackVersion' !== e
                    )
                      return (
                        (s.errors = [{ params: { additionalProperty: e } }]), !1
                      );
                  if (t === f) {
                    if (void 0 !== r.request) {
                      let t = r.request;
                      const n = f;
                      if (
                        'string' != typeof t &&
                        (!t || 'object' != typeof t || Array.isArray(t))
                      )
                        return (
                          (s.errors = [
                            { params: { type: e.properties.request.type } },
                          ]),
                          !1
                        );
                      var g = n === f;
                    } else g = !0;
                    if (g) {
                      if (void 0 !== r.version) {
                        const e = f;
                        if ('string' != typeof r.version)
                          return (
                            (s.errors = [{ params: { type: 'string' } }]), !1
                          );
                        g = e === f;
                      } else g = !0;
                      if (g)
                        if (void 0 !== r.fallbackVersion) {
                          const e = f;
                          if ('string' != typeof r.fallbackVersion)
                            return (
                              (s.errors = [{ params: { type: 'string' } }]), !1
                            );
                          g = e === f;
                        } else g = !0;
                    }
                  }
                }
              }
              u = t === f;
            } else u = !0;
            if (u) {
              if (void 0 !== n.import) {
                let e = n.import;
                const t = f,
                  o = f;
                let a = !1;
                const i = f;
                if (!1 !== e) {
                  const e = {
                    params: {
                      allowedValues: r.properties.import.anyOf[0].enum,
                    },
                  };
                  null === p ? (p = [e]) : p.push(e), f++;
                }
                var m = i === f;
                if (((a = a || m), !a)) {
                  const r = f;
                  if (f == f)
                    if ('string' == typeof e) {
                      if (e.length < 1) {
                        const r = { params: {} };
                        null === p ? (p = [r]) : p.push(r), f++;
                      }
                    } else {
                      const r = { params: { type: 'string' } };
                      null === p ? (p = [r]) : p.push(r), f++;
                    }
                  (m = r === f), (a = a || m);
                }
                if (!a) {
                  const r = { params: {} };
                  return (
                    null === p ? (p = [r]) : p.push(r), f++, (s.errors = p), !1
                  );
                }
                (f = o),
                  null !== p && (o ? (p.length = o) : (p = null)),
                  (u = t === f);
              } else u = !0;
              if (u) {
                if (void 0 !== n.packageName) {
                  let r = n.packageName;
                  const e = f;
                  if (f === e) {
                    if ('string' != typeof r)
                      return (s.errors = [{ params: { type: 'string' } }]), !1;
                    if (r.length < 1) return (s.errors = [{ params: {} }]), !1;
                  }
                  u = e === f;
                } else u = !0;
                if (u) {
                  if (void 0 !== n.requiredVersion) {
                    let e = n.requiredVersion;
                    const t = f,
                      o = f;
                    let a = !1;
                    const i = f;
                    if (!1 !== e) {
                      const e = {
                        params: {
                          allowedValues:
                            r.properties.requiredVersion.anyOf[0].enum,
                        },
                      };
                      null === p ? (p = [e]) : p.push(e), f++;
                    }
                    var d = i === f;
                    if (((a = a || d), !a)) {
                      const r = f;
                      if ('string' != typeof e) {
                        const r = { params: { type: 'string' } };
                        null === p ? (p = [r]) : p.push(r), f++;
                      }
                      (d = r === f), (a = a || d);
                    }
                    if (!a) {
                      const r = { params: {} };
                      return (
                        null === p ? (p = [r]) : p.push(r),
                        f++,
                        (s.errors = p),
                        !1
                      );
                    }
                    (f = o),
                      null !== p && (o ? (p.length = o) : (p = null)),
                      (u = t === f);
                  } else u = !0;
                  if (u) {
                    if (void 0 !== n.shareKey) {
                      let r = n.shareKey;
                      const e = f;
                      if (f === e) {
                        if ('string' != typeof r)
                          return (
                            (s.errors = [{ params: { type: 'string' } }]), !1
                          );
                        if (r.length < 1)
                          return (s.errors = [{ params: {} }]), !1;
                      }
                      u = e === f;
                    } else u = !0;
                    if (u) {
                      if (void 0 !== n.shareScope) {
                        let r = n.shareScope;
                        const e = f,
                          t = f;
                        let o = !1;
                        const a = f;
                        if (f === a)
                          if ('string' == typeof r) {
                            if (r.length < 1) {
                              const r = { params: {} };
                              null === p ? (p = [r]) : p.push(r), f++;
                            }
                          } else {
                            const r = { params: { type: 'string' } };
                            null === p ? (p = [r]) : p.push(r), f++;
                          }
                        var v = a === f;
                        if (((o = o || v), !o)) {
                          const e = f;
                          if (f === e)
                            if (Array.isArray(r)) {
                              const e = r.length;
                              for (let t = 0; t < e; t++) {
                                let e = r[t];
                                const s = f;
                                if (f === s)
                                  if ('string' == typeof e) {
                                    if (e.length < 1) {
                                      const r = { params: {} };
                                      null === p ? (p = [r]) : p.push(r), f++;
                                    }
                                  } else {
                                    const r = { params: { type: 'string' } };
                                    null === p ? (p = [r]) : p.push(r), f++;
                                  }
                                if (s !== f) break;
                              }
                            } else {
                              const r = { params: { type: 'array' } };
                              null === p ? (p = [r]) : p.push(r), f++;
                            }
                          (v = e === f), (o = o || v);
                        }
                        if (!o) {
                          const r = { params: {} };
                          return (
                            null === p ? (p = [r]) : p.push(r),
                            f++,
                            (s.errors = p),
                            !1
                          );
                        }
                        (f = t),
                          null !== p && (t ? (p.length = t) : (p = null)),
                          (u = e === f);
                      } else u = !0;
                      if (u) {
                        if (void 0 !== n.singleton) {
                          const r = f;
                          if ('boolean' != typeof n.singleton)
                            return (
                              (s.errors = [{ params: { type: 'boolean' } }]), !1
                            );
                          u = r === f;
                        } else u = !0;
                        if (u) {
                          if (void 0 !== n.strictVersion) {
                            const r = f;
                            if ('boolean' != typeof n.strictVersion)
                              return (
                                (s.errors = [{ params: { type: 'boolean' } }]),
                                !1
                              );
                            u = r === f;
                          } else u = !0;
                          if (u) {
                            if (void 0 !== n.version) {
                              let e = n.version;
                              const t = f,
                                o = f;
                              let a = !1;
                              const i = f;
                              if (!1 !== e) {
                                const e = {
                                  params: {
                                    allowedValues:
                                      r.properties.version.anyOf[0].enum,
                                  },
                                };
                                null === p ? (p = [e]) : p.push(e), f++;
                              }
                              var b = i === f;
                              if (((a = a || b), !a)) {
                                const r = f;
                                if ('string' != typeof e) {
                                  const r = { params: { type: 'string' } };
                                  null === p ? (p = [r]) : p.push(r), f++;
                                }
                                (b = r === f), (a = a || b);
                              }
                              if (!a) {
                                const r = { params: {} };
                                return (
                                  null === p ? (p = [r]) : p.push(r),
                                  f++,
                                  (s.errors = p),
                                  !1
                                );
                              }
                              (f = o),
                                null !== p && (o ? (p.length = o) : (p = null)),
                                (u = t === f);
                            } else u = !0;
                            if (u) {
                              if (void 0 !== n.request) {
                                let r = n.request;
                                const e = f;
                                if (f === e) {
                                  if ('string' != typeof r)
                                    return (
                                      (s.errors = [
                                        { params: { type: 'string' } },
                                      ]),
                                      !1
                                    );
                                  if (r.length < 1)
                                    return (s.errors = [{ params: {} }]), !1;
                                }
                                u = e === f;
                              } else u = !0;
                              if (u) {
                                if (void 0 !== n.layer) {
                                  let r = n.layer;
                                  const e = f;
                                  if (f === e) {
                                    if ('string' != typeof r)
                                      return (
                                        (s.errors = [
                                          { params: { type: 'string' } },
                                        ]),
                                        !1
                                      );
                                    if (r.length < 1)
                                      return (s.errors = [{ params: {} }]), !1;
                                  }
                                  u = e === f;
                                } else u = !0;
                                if (u) {
                                  if (void 0 !== n.issuerLayer) {
                                    let r = n.issuerLayer;
                                    const e = f;
                                    if (f === e) {
                                      if ('string' != typeof r)
                                        return (
                                          (s.errors = [
                                            { params: { type: 'string' } },
                                          ]),
                                          !1
                                        );
                                      if (r.length < 1)
                                        return (
                                          (s.errors = [{ params: {} }]), !1
                                        );
                                    }
                                    u = e === f;
                                  } else u = !0;
                                  if (u)
                                    if (
                                      void 0 !== n.allowNodeModulesSuffixMatch
                                    ) {
                                      const r = f;
                                      if (
                                        'boolean' !=
                                        typeof n.allowNodeModulesSuffixMatch
                                      )
                                        return (
                                          (s.errors = [
                                            { params: { type: 'boolean' } },
                                          ]),
                                          !1
                                        );
                                      u = r === f;
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
            }
          }
        }
      }
    }
  }
  return (s.errors = p), 0 === f;
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
  if (0 === l) {
    if (!r || 'object' != typeof r || Array.isArray(r))
      return (n.errors = [{ params: { type: 'object' } }]), !1;
    for (const t in r) {
      let o = r[t];
      const f = l,
        u = l;
      let c = !1;
      const y = l;
      s(o, {
        instancePath: e + '/' + t.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: r,
        parentDataProperty: t,
        rootData: a,
      }) || ((i = null === i ? s.errors : i.concat(s.errors)), (l = i.length));
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
        return null === i ? (i = [r]) : i.push(r), l++, (n.errors = i), !1;
      }
      if (((l = u), null !== i && (u ? (i.length = u) : (i = null)), f !== l))
        break;
    }
  }
  return (n.errors = i), 0 === l;
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
  const p = l;
  let f = !1;
  const u = l;
  if (l === u)
    if (Array.isArray(r)) {
      const t = r.length;
      for (let s = 0; s < t; s++) {
        let t = r[s];
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
          n(t, {
            instancePath: e + '/' + s,
            parentData: r,
            parentDataProperty: s,
            rootData: a,
          }) ||
            ((i = null === i ? n.errors : i.concat(n.errors)), (l = i.length)),
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
    const o = l;
    n(r, {
      instancePath: e,
      parentData: t,
      parentDataProperty: s,
      rootData: a,
    }) || ((i = null === i ? n.errors : i.concat(n.errors)), (l = i.length)),
      (y = o === l),
      (f = f || y);
  }
  if (!f) {
    const r = { params: {} };
    return null === i ? (i = [r]) : i.push(r), l++, (o.errors = i), !1;
  }
  return (
    (l = p),
    null !== i && (p ? (i.length = p) : (i = null)),
    (o.errors = i),
    0 === l
  );
}
function a(
  r,
  {
    instancePath: e = '',
    parentData: t,
    parentDataProperty: s,
    rootData: n = r,
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
          if (
            'async' !== e &&
            'shareScope' !== e &&
            'shared' !== e &&
            'experiments' !== e
          )
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
            if (p) {
              if (void 0 !== r.shared) {
                const t = l;
                o(r.shared, {
                  instancePath: e + '/shared',
                  parentData: r,
                  parentDataProperty: 'shared',
                  rootData: n,
                }) ||
                  ((i = null === i ? o.errors : i.concat(o.errors)),
                  (l = i.length)),
                  (p = t === l);
              } else p = !0;
              if (p)
                if (void 0 !== r.experiments) {
                  let e = r.experiments;
                  const t = l;
                  if (l === t) {
                    if (!e || 'object' != typeof e || Array.isArray(e))
                      return (a.errors = [{ params: { type: 'object' } }]), !1;
                    {
                      const r = l;
                      for (const r in e)
                        if ('allowNodeModulesSuffixMatch' !== r)
                          return (
                            (a.errors = [
                              { params: { additionalProperty: r } },
                            ]),
                            !1
                          );
                      if (
                        r === l &&
                        void 0 !== e.allowNodeModulesSuffixMatch &&
                        'boolean' != typeof e.allowNodeModulesSuffixMatch
                      )
                        return (
                          (a.errors = [{ params: { type: 'boolean' } }]), !1
                        );
                    }
                  }
                  p = t === l;
                } else p = !0;
            }
          }
        }
      }
    }
  }
  return (a.errors = i), 0 === l;
}
