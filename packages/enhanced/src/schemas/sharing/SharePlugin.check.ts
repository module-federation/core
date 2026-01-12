// @ts-nocheck
/* eslint-disable */
/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 */
export const validate = a;
export default a;
const e = {
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
      treeShaking: {
        anyOf: [
          { type: 'boolean' },
          { $ref: '#/definitions/TreeShakingConfig' },
        ],
      },
      independentShareFileName: { type: 'string', minLength: 1 },
      version: { anyOf: [{ enum: [!1] }, { type: 'string' }] },
      request: { type: 'string', minLength: 1 },
      layer: { type: 'string', minLength: 1 },
      issuerLayer: { type: 'string', minLength: 1 },
      allowNodeModulesSuffixMatch: { type: 'boolean' },
    },
  },
  r = {
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
  t = {
    type: 'object',
    additionalProperties: !1,
    properties: {
      usedExports: { type: 'array', items: { type: 'string', minLength: 1 } },
      mode: { type: 'string', enum: ['server-calc', 'runtime-infer'] },
      filename: { type: 'string' },
    },
  },
  s = Object.prototype.hasOwnProperty;
function n(
  o,
  {
    instancePath: i = '',
    parentData: a,
    parentDataProperty: l,
    rootData: p = o,
  } = {},
) {
  let f = null,
    u = 0;
  if (0 === u) {
    if (!o || 'object' != typeof o || Array.isArray(o))
      return (n.errors = [{ params: { type: 'object' } }]), !1;
    {
      const i = u;
      for (const r in o)
        if (!s.call(e.properties, r))
          return (n.errors = [{ params: { additionalProperty: r } }]), !1;
      if (i === u) {
        if (void 0 !== o.eager) {
          const e = u;
          if ('boolean' != typeof o.eager)
            return (n.errors = [{ params: { type: 'boolean' } }]), !1;
          var c = e === u;
        } else c = !0;
        if (c) {
          if (void 0 !== o.exclude) {
            let e = o.exclude;
            const t = u,
              s = u,
              i = u;
            let a = !1;
            const l = u;
            if (e && 'object' == typeof e && !Array.isArray(e)) {
              let r;
              if (void 0 === e.request && (r = 'request')) {
                const e = { params: { missingProperty: r } };
                null === f ? (f = [e]) : f.push(e), u++;
              }
            }
            var y = l === u;
            if (((a = a || y), !a)) {
              const r = u;
              if (e && 'object' == typeof e && !Array.isArray(e)) {
                let r;
                if (void 0 === e.version && (r = 'version')) {
                  const e = { params: { missingProperty: r } };
                  null === f ? (f = [e]) : f.push(e), u++;
                }
              }
              if (((y = r === u), (a = a || y), !a)) {
                const r = u;
                if (e && 'object' == typeof e && !Array.isArray(e)) {
                  let r;
                  if (void 0 === e.fallbackVersion && (r = 'fallbackVersion')) {
                    const e = { params: { missingProperty: r } };
                    null === f ? (f = [e]) : f.push(e), u++;
                  }
                }
                (y = r === u), (a = a || y);
              }
            }
            if (!a) {
              const e = { params: {} };
              return (
                null === f ? (f = [e]) : f.push(e), u++, (n.errors = f), !1
              );
            }
            if (
              ((u = i),
              null !== f && (i ? (f.length = i) : (f = null)),
              u === s)
            ) {
              if (!e || 'object' != typeof e || Array.isArray(e))
                return (n.errors = [{ params: { type: 'object' } }]), !1;
              {
                const t = u;
                for (const r in e)
                  if (
                    'request' !== r &&
                    'version' !== r &&
                    'fallbackVersion' !== r
                  )
                    return (
                      (n.errors = [{ params: { additionalProperty: r } }]), !1
                    );
                if (t === u) {
                  if (void 0 !== e.request) {
                    let t = e.request;
                    const s = u;
                    if (
                      'string' != typeof t &&
                      (!t || 'object' != typeof t || Array.isArray(t))
                    )
                      return (
                        (n.errors = [
                          { params: { type: r.properties.request.type } },
                        ]),
                        !1
                      );
                    var g = s === u;
                  } else g = !0;
                  if (g) {
                    if (void 0 !== e.version) {
                      const r = u;
                      if ('string' != typeof e.version)
                        return (
                          (n.errors = [{ params: { type: 'string' } }]), !1
                        );
                      g = r === u;
                    } else g = !0;
                    if (g)
                      if (void 0 !== e.fallbackVersion) {
                        const r = u;
                        if ('string' != typeof e.fallbackVersion)
                          return (
                            (n.errors = [{ params: { type: 'string' } }]), !1
                          );
                        g = r === u;
                      } else g = !0;
                  }
                }
              }
            }
            c = t === u;
          } else c = !0;
          if (c) {
            if (void 0 !== o.include) {
              let e = o.include;
              const t = u,
                s = u,
                i = u;
              let a = !1;
              const l = u;
              if (e && 'object' == typeof e && !Array.isArray(e)) {
                let r;
                if (void 0 === e.request && (r = 'request')) {
                  const e = { params: { missingProperty: r } };
                  null === f ? (f = [e]) : f.push(e), u++;
                }
              }
              var h = l === u;
              if (((a = a || h), !a)) {
                const r = u;
                if (e && 'object' == typeof e && !Array.isArray(e)) {
                  let r;
                  if (void 0 === e.version && (r = 'version')) {
                    const e = { params: { missingProperty: r } };
                    null === f ? (f = [e]) : f.push(e), u++;
                  }
                }
                if (((h = r === u), (a = a || h), !a)) {
                  const r = u;
                  if (e && 'object' == typeof e && !Array.isArray(e)) {
                    let r;
                    if (
                      void 0 === e.fallbackVersion &&
                      (r = 'fallbackVersion')
                    ) {
                      const e = { params: { missingProperty: r } };
                      null === f ? (f = [e]) : f.push(e), u++;
                    }
                  }
                  (h = r === u), (a = a || h);
                }
              }
              if (!a) {
                const e = { params: {} };
                return (
                  null === f ? (f = [e]) : f.push(e), u++, (n.errors = f), !1
                );
              }
              if (
                ((u = i),
                null !== f && (i ? (f.length = i) : (f = null)),
                u === s)
              ) {
                if (!e || 'object' != typeof e || Array.isArray(e))
                  return (n.errors = [{ params: { type: 'object' } }]), !1;
                {
                  const t = u;
                  for (const r in e)
                    if (
                      'request' !== r &&
                      'version' !== r &&
                      'fallbackVersion' !== r
                    )
                      return (
                        (n.errors = [{ params: { additionalProperty: r } }]), !1
                      );
                  if (t === u) {
                    if (void 0 !== e.request) {
                      let t = e.request;
                      const s = u;
                      if (
                        'string' != typeof t &&
                        (!t || 'object' != typeof t || Array.isArray(t))
                      )
                        return (
                          (n.errors = [
                            { params: { type: r.properties.request.type } },
                          ]),
                          !1
                        );
                      var m = s === u;
                    } else m = !0;
                    if (m) {
                      if (void 0 !== e.version) {
                        const r = u;
                        if ('string' != typeof e.version)
                          return (
                            (n.errors = [{ params: { type: 'string' } }]), !1
                          );
                        m = r === u;
                      } else m = !0;
                      if (m)
                        if (void 0 !== e.fallbackVersion) {
                          const r = u;
                          if ('string' != typeof e.fallbackVersion)
                            return (
                              (n.errors = [{ params: { type: 'string' } }]), !1
                            );
                          m = r === u;
                        } else m = !0;
                    }
                  }
                }
              }
              c = t === u;
            } else c = !0;
            if (c) {
              if (void 0 !== o.import) {
                let r = o.import;
                const t = u,
                  s = u;
                let i = !1;
                const a = u;
                if (!1 !== r) {
                  const r = {
                    params: {
                      allowedValues: e.properties.import.anyOf[0].enum,
                    },
                  };
                  null === f ? (f = [r]) : f.push(r), u++;
                }
                var d = a === u;
                if (((i = i || d), !i)) {
                  const e = u;
                  if (u == u)
                    if ('string' == typeof r) {
                      if (r.length < 1) {
                        const e = { params: {} };
                        null === f ? (f = [e]) : f.push(e), u++;
                      }
                    } else {
                      const e = { params: { type: 'string' } };
                      null === f ? (f = [e]) : f.push(e), u++;
                    }
                  (d = e === u), (i = i || d);
                }
                if (!i) {
                  const e = { params: {} };
                  return (
                    null === f ? (f = [e]) : f.push(e), u++, (n.errors = f), !1
                  );
                }
                (u = s),
                  null !== f && (s ? (f.length = s) : (f = null)),
                  (c = t === u);
              } else c = !0;
              if (c) {
                if (void 0 !== o.packageName) {
                  let e = o.packageName;
                  const r = u;
                  if (u === r) {
                    if ('string' != typeof e)
                      return (n.errors = [{ params: { type: 'string' } }]), !1;
                    if (e.length < 1) return (n.errors = [{ params: {} }]), !1;
                  }
                  c = r === u;
                } else c = !0;
                if (c) {
                  if (void 0 !== o.requiredVersion) {
                    let r = o.requiredVersion;
                    const t = u,
                      s = u;
                    let i = !1;
                    const a = u;
                    if (!1 !== r) {
                      const r = {
                        params: {
                          allowedValues:
                            e.properties.requiredVersion.anyOf[0].enum,
                        },
                      };
                      null === f ? (f = [r]) : f.push(r), u++;
                    }
                    var v = a === u;
                    if (((i = i || v), !i)) {
                      const e = u;
                      if ('string' != typeof r) {
                        const e = { params: { type: 'string' } };
                        null === f ? (f = [e]) : f.push(e), u++;
                      }
                      (v = e === u), (i = i || v);
                    }
                    if (!i) {
                      const e = { params: {} };
                      return (
                        null === f ? (f = [e]) : f.push(e),
                        u++,
                        (n.errors = f),
                        !1
                      );
                    }
                    (u = s),
                      null !== f && (s ? (f.length = s) : (f = null)),
                      (c = t === u);
                  } else c = !0;
                  if (c) {
                    if (void 0 !== o.shareKey) {
                      let e = o.shareKey;
                      const r = u;
                      if (u === r) {
                        if ('string' != typeof e)
                          return (
                            (n.errors = [{ params: { type: 'string' } }]), !1
                          );
                        if (e.length < 1)
                          return (n.errors = [{ params: {} }]), !1;
                      }
                      c = r === u;
                    } else c = !0;
                    if (c) {
                      if (void 0 !== o.shareScope) {
                        let e = o.shareScope;
                        const r = u,
                          t = u;
                        let s = !1;
                        const i = u;
                        if (u === i)
                          if ('string' == typeof e) {
                            if (e.length < 1) {
                              const e = { params: {} };
                              null === f ? (f = [e]) : f.push(e), u++;
                            }
                          } else {
                            const e = { params: { type: 'string' } };
                            null === f ? (f = [e]) : f.push(e), u++;
                          }
                        var b = i === u;
                        if (((s = s || b), !s)) {
                          const r = u;
                          if (u === r)
                            if (Array.isArray(e)) {
                              const r = e.length;
                              for (let t = 0; t < r; t++) {
                                let r = e[t];
                                const s = u;
                                if (u === s)
                                  if ('string' == typeof r) {
                                    if (r.length < 1) {
                                      const e = { params: {} };
                                      null === f ? (f = [e]) : f.push(e), u++;
                                    }
                                  } else {
                                    const e = { params: { type: 'string' } };
                                    null === f ? (f = [e]) : f.push(e), u++;
                                  }
                                if (s !== u) break;
                              }
                            } else {
                              const e = { params: { type: 'array' } };
                              null === f ? (f = [e]) : f.push(e), u++;
                            }
                          (b = r === u), (s = s || b);
                        }
                        if (!s) {
                          const e = { params: {} };
                          return (
                            null === f ? (f = [e]) : f.push(e),
                            u++,
                            (n.errors = f),
                            !1
                          );
                        }
                        (u = t),
                          null !== f && (t ? (f.length = t) : (f = null)),
                          (c = r === u);
                      } else c = !0;
                      if (c) {
                        if (void 0 !== o.singleton) {
                          const e = u;
                          if ('boolean' != typeof o.singleton)
                            return (
                              (n.errors = [{ params: { type: 'boolean' } }]), !1
                            );
                          c = e === u;
                        } else c = !0;
                        if (c) {
                          if (void 0 !== o.strictVersion) {
                            const e = u;
                            if ('boolean' != typeof o.strictVersion)
                              return (
                                (n.errors = [{ params: { type: 'boolean' } }]),
                                !1
                              );
                            c = e === u;
                          } else c = !0;
                          if (c) {
                            if (void 0 !== o.treeShaking) {
                              let e = o.treeShaking;
                              const r = u,
                                s = u;
                              let i = !1;
                              const a = u;
                              if ('boolean' != typeof e) {
                                const e = { params: { type: 'boolean' } };
                                null === f ? (f = [e]) : f.push(e), u++;
                              }
                              var A = a === u;
                              if (((i = i || A), !i)) {
                                const r = u;
                                if (u == u)
                                  if (
                                    e &&
                                    'object' == typeof e &&
                                    !Array.isArray(e)
                                  ) {
                                    const r = u;
                                    for (const r in e)
                                      if (
                                        'usedExports' !== r &&
                                        'strategy' !== r &&
                                        'filename' !== r
                                      ) {
                                        const e = {
                                          params: { additionalProperty: r },
                                        };
                                        null === f ? (f = [e]) : f.push(e), u++;
                                        break;
                                      }
                                    if (r === u) {
                                      if (void 0 !== e.usedExports) {
                                        let r = e.usedExports;
                                        const t = u;
                                        if (u === t)
                                          if (Array.isArray(r)) {
                                            const e = r.length;
                                            for (let t = 0; t < e; t++) {
                                              let e = r[t];
                                              const s = u;
                                              if (u === s)
                                                if ('string' == typeof e) {
                                                  if (e.length < 1) {
                                                    const e = { params: {} };
                                                    null === f
                                                      ? (f = [e])
                                                      : f.push(e),
                                                      u++;
                                                  }
                                                } else {
                                                  const e = {
                                                    params: { type: 'string' },
                                                  };
                                                  null === f
                                                    ? (f = [e])
                                                    : f.push(e),
                                                    u++;
                                                }
                                              if (s !== u) break;
                                            }
                                          } else {
                                            const e = {
                                              params: { type: 'array' },
                                            };
                                            null === f ? (f = [e]) : f.push(e),
                                              u++;
                                          }
                                        var P = t === u;
                                      } else P = !0;
                                      if (P) {
                                        if (void 0 !== e.strategy) {
                                          let r = e.strategy;
                                          const s = u;
                                          if ('string' != typeof r) {
                                            const e = {
                                              params: { type: 'string' },
                                            };
                                            null === f ? (f = [e]) : f.push(e),
                                              u++;
                                          }
                                          if ('server' !== r && 'infer' !== r) {
                                            const e = {
                                              params: {
                                                allowedValues:
                                                  t.properties.strategy.enum,
                                              },
                                            };
                                            null === f ? (f = [e]) : f.push(e),
                                              u++;
                                          }
                                          P = s === u;
                                        } else P = !0;
                                        if (P)
                                          if (void 0 !== e.filename) {
                                            const r = u;
                                            if ('string' != typeof e.filename) {
                                              const e = {
                                                params: { type: 'string' },
                                              };
                                              null === f
                                                ? (f = [e])
                                                : f.push(e),
                                                u++;
                                            }
                                            P = r === u;
                                          } else P = !0;
                                      }
                                    }
                                  } else {
                                    const e = { params: { type: 'object' } };
                                    null === f ? (f = [e]) : f.push(e), u++;
                                  }
                                (A = r === u), (i = i || A);
                              }
                              if (!i) {
                                const e = { params: {} };
                                return (
                                  null === f ? (f = [e]) : f.push(e),
                                  u++,
                                  (n.errors = f),
                                  !1
                                );
                              }
                              (u = s),
                                null !== f && (s ? (f.length = s) : (f = null)),
                                (c = r === u);
                            } else c = !0;
                            if (c) {
                              if (void 0 !== o.independentShareFileName) {
                                let e = o.independentShareFileName;
                                const r = u;
                                if (u === r) {
                                  if ('string' != typeof e)
                                    return (
                                      (n.errors = [
                                        { params: { type: 'string' } },
                                      ]),
                                      !1
                                    );
                                  if (e.length < 1)
                                    return (n.errors = [{ params: {} }]), !1;
                                }
                                c = r === u;
                              } else c = !0;
                              if (c) {
                                if (void 0 !== o.version) {
                                  let r = o.version;
                                  const t = u,
                                    s = u;
                                  let i = !1;
                                  const a = u;
                                  if (!1 !== r) {
                                    const r = {
                                      params: {
                                        allowedValues:
                                          e.properties.version.anyOf[0].enum,
                                      },
                                    };
                                    null === f ? (f = [r]) : f.push(r), u++;
                                  }
                                  var j = a === u;
                                  if (((i = i || j), !i)) {
                                    const e = u;
                                    if ('string' != typeof r) {
                                      const e = { params: { type: 'string' } };
                                      null === f ? (f = [e]) : f.push(e), u++;
                                    }
                                    (j = e === u), (i = i || j);
                                  }
                                  if (!i) {
                                    const e = { params: {} };
                                    return (
                                      null === f ? (f = [e]) : f.push(e),
                                      u++,
                                      (n.errors = f),
                                      !1
                                    );
                                  }
                                  (u = s),
                                    null !== f &&
                                      (s ? (f.length = s) : (f = null)),
                                    (c = t === u);
                                } else c = !0;
                                if (c) {
                                  if (void 0 !== o.request) {
                                    let e = o.request;
                                    const r = u;
                                    if (u === r) {
                                      if ('string' != typeof e)
                                        return (
                                          (n.errors = [
                                            { params: { type: 'string' } },
                                          ]),
                                          !1
                                        );
                                      if (e.length < 1)
                                        return (
                                          (n.errors = [{ params: {} }]), !1
                                        );
                                    }
                                    c = r === u;
                                  } else c = !0;
                                  if (c) {
                                    if (void 0 !== o.layer) {
                                      let e = o.layer;
                                      const r = u;
                                      if (u === r) {
                                        if ('string' != typeof e)
                                          return (
                                            (n.errors = [
                                              { params: { type: 'string' } },
                                            ]),
                                            !1
                                          );
                                        if (e.length < 1)
                                          return (
                                            (n.errors = [{ params: {} }]), !1
                                          );
                                      }
                                      c = r === u;
                                    } else c = !0;
                                    if (c) {
                                      if (void 0 !== o.issuerLayer) {
                                        let e = o.issuerLayer;
                                        const r = u;
                                        if (u === r) {
                                          if ('string' != typeof e)
                                            return (
                                              (n.errors = [
                                                { params: { type: 'string' } },
                                              ]),
                                              !1
                                            );
                                          if (e.length < 1)
                                            return (
                                              (n.errors = [{ params: {} }]), !1
                                            );
                                        }
                                        c = r === u;
                                      } else c = !0;
                                      if (c)
                                        if (
                                          void 0 !==
                                          o.allowNodeModulesSuffixMatch
                                        ) {
                                          const e = u;
                                          if (
                                            'boolean' !=
                                            typeof o.allowNodeModulesSuffixMatch
                                          )
                                            return (
                                              (n.errors = [
                                                { params: { type: 'boolean' } },
                                              ]),
                                              !1
                                            );
                                          c = e === u;
                                        } else c = !0;
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
    }
  }
  return (n.errors = f), 0 === u;
}
function o(
  e,
  {
    instancePath: r = '',
    parentData: t,
    parentDataProperty: s,
    rootData: i = e,
  } = {},
) {
  let a = null,
    l = 0;
  if (0 === l) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (o.errors = [{ params: { type: 'object' } }]), !1;
    for (const t in e) {
      let s = e[t];
      const f = l,
        u = l;
      let c = !1;
      const y = l;
      n(s, {
        instancePath: r + '/' + t.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: e,
        parentDataProperty: t,
        rootData: i,
      }) || ((a = null === a ? n.errors : a.concat(n.errors)), (l = a.length));
      var p = y === l;
      if (((c = c || p), !c)) {
        const e = l;
        if (l == l)
          if ('string' == typeof s) {
            if (s.length < 1) {
              const e = { params: {} };
              null === a ? (a = [e]) : a.push(e), l++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === a ? (a = [e]) : a.push(e), l++;
          }
        (p = e === l), (c = c || p);
      }
      if (!c) {
        const e = { params: {} };
        return null === a ? (a = [e]) : a.push(e), l++, (o.errors = a), !1;
      }
      if (((l = u), null !== a && (u ? (a.length = u) : (a = null)), f !== l))
        break;
    }
  }
  return (o.errors = a), 0 === l;
}
function i(
  e,
  {
    instancePath: r = '',
    parentData: t,
    parentDataProperty: s,
    rootData: n = e,
  } = {},
) {
  let a = null,
    l = 0;
  const p = l;
  let f = !1;
  const u = l;
  if (l === u)
    if (Array.isArray(e)) {
      const t = e.length;
      for (let s = 0; s < t; s++) {
        let t = e[s];
        const i = l,
          p = l;
        let f = !1;
        const u = l;
        if (l == l)
          if ('string' == typeof t) {
            if (t.length < 1) {
              const e = { params: {} };
              null === a ? (a = [e]) : a.push(e), l++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === a ? (a = [e]) : a.push(e), l++;
          }
        var c = u === l;
        if (((f = f || c), !f)) {
          const i = l;
          o(t, {
            instancePath: r + '/' + s,
            parentData: e,
            parentDataProperty: s,
            rootData: n,
          }) ||
            ((a = null === a ? o.errors : a.concat(o.errors)), (l = a.length)),
            (c = i === l),
            (f = f || c);
        }
        if (f) (l = p), null !== a && (p ? (a.length = p) : (a = null));
        else {
          const e = { params: {} };
          null === a ? (a = [e]) : a.push(e), l++;
        }
        if (i !== l) break;
      }
    } else {
      const e = { params: { type: 'array' } };
      null === a ? (a = [e]) : a.push(e), l++;
    }
  var y = u === l;
  if (((f = f || y), !f)) {
    const i = l;
    o(e, {
      instancePath: r,
      parentData: t,
      parentDataProperty: s,
      rootData: n,
    }) || ((a = null === a ? o.errors : a.concat(o.errors)), (l = a.length)),
      (y = i === l),
      (f = f || y);
  }
  if (!f) {
    const e = { params: {} };
    return null === a ? (a = [e]) : a.push(e), l++, (i.errors = a), !1;
  }
  return (
    (l = p),
    null !== a && (p ? (a.length = p) : (a = null)),
    (i.errors = a),
    0 === l
  );
}
function a(
  e,
  {
    instancePath: r = '',
    parentData: t,
    parentDataProperty: s,
    rootData: n = e,
  } = {},
) {
  let o = null,
    l = 0;
  if (0 === l) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (a.errors = [{ params: { type: 'object' } }]), !1;
    {
      let t;
      if (void 0 === e.shared && (t = 'shared'))
        return (a.errors = [{ params: { missingProperty: t } }]), !1;
      {
        const t = l;
        for (const r in e)
          if (
            'async' !== r &&
            'shareScope' !== r &&
            'shared' !== r &&
            'experiments' !== r
          )
            return (a.errors = [{ params: { additionalProperty: r } }]), !1;
        if (t === l) {
          if (void 0 !== e.async) {
            const r = l;
            if ('boolean' != typeof e.async)
              return (a.errors = [{ params: { type: 'boolean' } }]), !1;
            var p = r === l;
          } else p = !0;
          if (p) {
            if (void 0 !== e.shareScope) {
              let r = e.shareScope;
              const t = l,
                s = l;
              let n = !1;
              const i = l;
              if (l === i)
                if ('string' == typeof r) {
                  if (r.length < 1) {
                    const e = { params: {} };
                    null === o ? (o = [e]) : o.push(e), l++;
                  }
                } else {
                  const e = { params: { type: 'string' } };
                  null === o ? (o = [e]) : o.push(e), l++;
                }
              var f = i === l;
              if (((n = n || f), !n)) {
                const e = l;
                if (l === e)
                  if (Array.isArray(r)) {
                    const e = r.length;
                    for (let t = 0; t < e; t++) {
                      let e = r[t];
                      const s = l;
                      if (l === s)
                        if ('string' == typeof e) {
                          if (e.length < 1) {
                            const e = { params: {} };
                            null === o ? (o = [e]) : o.push(e), l++;
                          }
                        } else {
                          const e = { params: { type: 'string' } };
                          null === o ? (o = [e]) : o.push(e), l++;
                        }
                      if (s !== l) break;
                    }
                  } else {
                    const e = { params: { type: 'array' } };
                    null === o ? (o = [e]) : o.push(e), l++;
                  }
                (f = e === l), (n = n || f);
              }
              if (!n) {
                const e = { params: {} };
                return (
                  null === o ? (o = [e]) : o.push(e), l++, (a.errors = o), !1
                );
              }
              (l = s),
                null !== o && (s ? (o.length = s) : (o = null)),
                (p = t === l);
            } else p = !0;
            if (p) {
              if (void 0 !== e.shared) {
                const t = l;
                i(e.shared, {
                  instancePath: r + '/shared',
                  parentData: e,
                  parentDataProperty: 'shared',
                  rootData: n,
                }) ||
                  ((o = null === o ? i.errors : o.concat(i.errors)),
                  (l = o.length)),
                  (p = t === l);
              } else p = !0;
              if (p)
                if (void 0 !== e.experiments) {
                  let r = e.experiments;
                  const t = l;
                  if (l === t) {
                    if (!r || 'object' != typeof r || Array.isArray(r))
                      return (a.errors = [{ params: { type: 'object' } }]), !1;
                    {
                      const e = l;
                      for (const e in r)
                        if ('allowNodeModulesSuffixMatch' !== e)
                          return (
                            (a.errors = [
                              { params: { additionalProperty: e } },
                            ]),
                            !1
                          );
                      if (
                        e === l &&
                        void 0 !== r.allowNodeModulesSuffixMatch &&
                        'boolean' != typeof r.allowNodeModulesSuffixMatch
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
  return (a.errors = o), 0 === l;
}
