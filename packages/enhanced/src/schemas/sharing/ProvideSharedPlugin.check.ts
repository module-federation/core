// @ts-nocheck
/* eslint-disable */
/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 */
export const validate = r;
export default r;
const e = {
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
      include: {
        type: 'object',
        additionalProperties: !1,
        properties: {
          version: { type: 'string' },
          request: { anyOf: [{ type: 'string' }, { instanceof: 'RegExp' }] },
          fallbackVersion: { type: 'string' },
        },
      },
      exclude: {
        type: 'object',
        additionalProperties: !1,
        properties: {
          version: { type: 'string' },
          request: { anyOf: [{ type: 'string' }, { instanceof: 'RegExp' }] },
          fallbackVersion: { type: 'string' },
        },
      },
    },
  },
  t = Object.prototype.hasOwnProperty;
function s(
  n,
  {
    instancePath: r = '',
    parentData: o,
    parentDataProperty: i,
    rootData: l = n,
  } = {},
) {
  let a = null,
    p = 0;
  if (0 === p) {
    if (!n || 'object' != typeof n || Array.isArray(n))
      return (s.errors = [{ params: { type: 'object' } }]), !1;
    for (const r in n) {
      let o = n[r];
      const i = p,
        l = p;
      let b = !1;
      const P = p;
      if (p == p)
        if (o && 'object' == typeof o && !Array.isArray(o)) {
          const s = p;
          for (const s in o)
            if (!t.call(e.properties, s)) {
              const e = { params: { additionalProperty: s } };
              null === a ? (a = [e]) : a.push(e), p++;
              break;
            }
          if (s === p) {
            if (void 0 !== o.eager) {
              const e = p;
              if ('boolean' != typeof o.eager) {
                const e = { params: { type: 'boolean' } };
                null === a ? (a = [e]) : a.push(e), p++;
              }
              var f = e === p;
            } else f = !0;
            if (f) {
              if (void 0 !== o.shareKey) {
                let e = o.shareKey;
                const t = p;
                if (p === t)
                  if ('string' == typeof e) {
                    if (e.length < 1) {
                      const e = { params: {} };
                      null === a ? (a = [e]) : a.push(e), p++;
                    }
                  } else {
                    const e = { params: { type: 'string' } };
                    null === a ? (a = [e]) : a.push(e), p++;
                  }
                f = t === p;
              } else f = !0;
              if (f) {
                if (void 0 !== o.request) {
                  let e = o.request;
                  const t = p;
                  if (p === t)
                    if ('string' == typeof e) {
                      if (e.length < 1) {
                        const e = { params: {} };
                        null === a ? (a = [e]) : a.push(e), p++;
                      }
                    } else {
                      const e = { params: { type: 'string' } };
                      null === a ? (a = [e]) : a.push(e), p++;
                    }
                  f = t === p;
                } else f = !0;
                if (f) {
                  if (void 0 !== o.shareScope) {
                    let e = o.shareScope;
                    const t = p,
                      s = p;
                    let n = !1;
                    const r = p;
                    if (p === r)
                      if ('string' == typeof e) {
                        if (e.length < 1) {
                          const e = { params: {} };
                          null === a ? (a = [e]) : a.push(e), p++;
                        }
                      } else {
                        const e = { params: { type: 'string' } };
                        null === a ? (a = [e]) : a.push(e), p++;
                      }
                    var u = r === p;
                    if (((n = n || u), !n)) {
                      const t = p;
                      if (p === t)
                        if (Array.isArray(e)) {
                          const t = e.length;
                          for (let s = 0; s < t; s++) {
                            let t = e[s];
                            const n = p;
                            if (p === n)
                              if ('string' == typeof t) {
                                if (t.length < 1) {
                                  const e = { params: {} };
                                  null === a ? (a = [e]) : a.push(e), p++;
                                }
                              } else {
                                const e = { params: { type: 'string' } };
                                null === a ? (a = [e]) : a.push(e), p++;
                              }
                            if (n !== p) break;
                          }
                        } else {
                          const e = { params: { type: 'array' } };
                          null === a ? (a = [e]) : a.push(e), p++;
                        }
                      (u = t === p), (n = n || u);
                    }
                    if (n)
                      (p = s), null !== a && (s ? (a.length = s) : (a = null));
                    else {
                      const e = { params: {} };
                      null === a ? (a = [e]) : a.push(e), p++;
                    }
                    f = t === p;
                  } else f = !0;
                  if (f) {
                    if (void 0 !== o.requiredVersion) {
                      let t = o.requiredVersion;
                      const s = p,
                        n = p;
                      let r = !1;
                      const i = p;
                      if (!1 !== t) {
                        const t = {
                          params: {
                            allowedValues:
                              e.properties.requiredVersion.anyOf[0].enum,
                          },
                        };
                        null === a ? (a = [t]) : a.push(t), p++;
                      }
                      var c = i === p;
                      if (((r = r || c), !r)) {
                        const e = p;
                        if ('string' != typeof t) {
                          const e = { params: { type: 'string' } };
                          null === a ? (a = [e]) : a.push(e), p++;
                        }
                        (c = e === p), (r = r || c);
                      }
                      if (r)
                        (p = n),
                          null !== a && (n ? (a.length = n) : (a = null));
                      else {
                        const e = { params: {} };
                        null === a ? (a = [e]) : a.push(e), p++;
                      }
                      f = s === p;
                    } else f = !0;
                    if (f) {
                      if (void 0 !== o.strictVersion) {
                        const e = p;
                        if ('boolean' != typeof o.strictVersion) {
                          const e = { params: { type: 'boolean' } };
                          null === a ? (a = [e]) : a.push(e), p++;
                        }
                        f = e === p;
                      } else f = !0;
                      if (f) {
                        if (void 0 !== o.singleton) {
                          const e = p;
                          if ('boolean' != typeof o.singleton) {
                            const e = { params: { type: 'boolean' } };
                            null === a ? (a = [e]) : a.push(e), p++;
                          }
                          f = e === p;
                        } else f = !0;
                        if (f) {
                          if (void 0 !== o.layer) {
                            let e = o.layer;
                            const t = p;
                            if (p === t)
                              if ('string' == typeof e) {
                                if (e.length < 1) {
                                  const e = { params: {} };
                                  null === a ? (a = [e]) : a.push(e), p++;
                                }
                              } else {
                                const e = { params: { type: 'string' } };
                                null === a ? (a = [e]) : a.push(e), p++;
                              }
                            f = t === p;
                          } else f = !0;
                          if (f) {
                            if (void 0 !== o.issuerLayer) {
                              let e = o.issuerLayer;
                              const t = p;
                              if (p === t)
                                if ('string' == typeof e) {
                                  if (e.length < 1) {
                                    const e = { params: {} };
                                    null === a ? (a = [e]) : a.push(e), p++;
                                  }
                                } else {
                                  const e = { params: { type: 'string' } };
                                  null === a ? (a = [e]) : a.push(e), p++;
                                }
                              f = t === p;
                            } else f = !0;
                            if (f) {
                              if (void 0 !== o.version) {
                                let t = o.version;
                                const s = p,
                                  n = p;
                                let r = !1;
                                const i = p;
                                if (!1 !== t) {
                                  const t = {
                                    params: {
                                      allowedValues:
                                        e.properties.version.anyOf[0].enum,
                                    },
                                  };
                                  null === a ? (a = [t]) : a.push(t), p++;
                                }
                                var y = i === p;
                                if (((r = r || y), !r)) {
                                  const e = p;
                                  if ('string' != typeof t) {
                                    const e = { params: { type: 'string' } };
                                    null === a ? (a = [e]) : a.push(e), p++;
                                  }
                                  (y = e === p), (r = r || y);
                                }
                                if (r)
                                  (p = n),
                                    null !== a &&
                                      (n ? (a.length = n) : (a = null));
                                else {
                                  const e = { params: {} };
                                  null === a ? (a = [e]) : a.push(e), p++;
                                }
                                f = s === p;
                              } else f = !0;
                              if (f) {
                                if (void 0 !== o.include) {
                                  let e = o.include;
                                  const t = p;
                                  if (p === t)
                                    if (
                                      e &&
                                      'object' == typeof e &&
                                      !Array.isArray(e)
                                    ) {
                                      const t = p;
                                      for (const t in e)
                                        if (
                                          'version' !== t &&
                                          'request' !== t &&
                                          'fallbackVersion' !== t
                                        ) {
                                          const e = {
                                            params: { additionalProperty: t },
                                          };
                                          null === a ? (a = [e]) : a.push(e),
                                            p++;
                                          break;
                                        }
                                      if (t === p) {
                                        if (void 0 !== e.version) {
                                          const t = p;
                                          if ('string' != typeof e.version) {
                                            const e = {
                                              params: { type: 'string' },
                                            };
                                            null === a ? (a = [e]) : a.push(e),
                                              p++;
                                          }
                                          var h = t === p;
                                        } else h = !0;
                                        if (h) {
                                          if (void 0 !== e.request) {
                                            let t = e.request;
                                            const s = p,
                                              n = p;
                                            let r = !1;
                                            const o = p;
                                            if ('string' != typeof t) {
                                              const e = {
                                                params: { type: 'string' },
                                              };
                                              null === a
                                                ? (a = [e])
                                                : a.push(e),
                                                p++;
                                            }
                                            var g = o === p;
                                            if (((r = r || g), !r)) {
                                              const e = p;
                                              if (!(t instanceof RegExp)) {
                                                const e = { params: {} };
                                                null === a
                                                  ? (a = [e])
                                                  : a.push(e),
                                                  p++;
                                              }
                                              (g = e === p), (r = r || g);
                                            }
                                            if (r)
                                              (p = n),
                                                null !== a &&
                                                  (n
                                                    ? (a.length = n)
                                                    : (a = null));
                                            else {
                                              const e = { params: {} };
                                              null === a
                                                ? (a = [e])
                                                : a.push(e),
                                                p++;
                                            }
                                            h = s === p;
                                          } else h = !0;
                                          if (h)
                                            if (void 0 !== e.fallbackVersion) {
                                              const t = p;
                                              if (
                                                'string' !=
                                                typeof e.fallbackVersion
                                              ) {
                                                const e = {
                                                  params: { type: 'string' },
                                                };
                                                null === a
                                                  ? (a = [e])
                                                  : a.push(e),
                                                  p++;
                                              }
                                              h = t === p;
                                            } else h = !0;
                                        }
                                      }
                                    } else {
                                      const e = { params: { type: 'object' } };
                                      null === a ? (a = [e]) : a.push(e), p++;
                                    }
                                  f = t === p;
                                } else f = !0;
                                if (f)
                                  if (void 0 !== o.exclude) {
                                    let e = o.exclude;
                                    const t = p;
                                    if (p === t)
                                      if (
                                        e &&
                                        'object' == typeof e &&
                                        !Array.isArray(e)
                                      ) {
                                        const t = p;
                                        for (const t in e)
                                          if (
                                            'version' !== t &&
                                            'request' !== t &&
                                            'fallbackVersion' !== t
                                          ) {
                                            const e = {
                                              params: { additionalProperty: t },
                                            };
                                            null === a ? (a = [e]) : a.push(e),
                                              p++;
                                            break;
                                          }
                                        if (t === p) {
                                          if (void 0 !== e.version) {
                                            const t = p;
                                            if ('string' != typeof e.version) {
                                              const e = {
                                                params: { type: 'string' },
                                              };
                                              null === a
                                                ? (a = [e])
                                                : a.push(e),
                                                p++;
                                            }
                                            var m = t === p;
                                          } else m = !0;
                                          if (m) {
                                            if (void 0 !== e.request) {
                                              let t = e.request;
                                              const s = p,
                                                n = p;
                                              let r = !1;
                                              const o = p;
                                              if ('string' != typeof t) {
                                                const e = {
                                                  params: { type: 'string' },
                                                };
                                                null === a
                                                  ? (a = [e])
                                                  : a.push(e),
                                                  p++;
                                              }
                                              var d = o === p;
                                              if (((r = r || d), !r)) {
                                                const e = p;
                                                if (!(t instanceof RegExp)) {
                                                  const e = { params: {} };
                                                  null === a
                                                    ? (a = [e])
                                                    : a.push(e),
                                                    p++;
                                                }
                                                (d = e === p), (r = r || d);
                                              }
                                              if (r)
                                                (p = n),
                                                  null !== a &&
                                                    (n
                                                      ? (a.length = n)
                                                      : (a = null));
                                              else {
                                                const e = { params: {} };
                                                null === a
                                                  ? (a = [e])
                                                  : a.push(e),
                                                  p++;
                                              }
                                              m = s === p;
                                            } else m = !0;
                                            if (m)
                                              if (
                                                void 0 !== e.fallbackVersion
                                              ) {
                                                const t = p;
                                                if (
                                                  'string' !=
                                                  typeof e.fallbackVersion
                                                ) {
                                                  const e = {
                                                    params: { type: 'string' },
                                                  };
                                                  null === a
                                                    ? (a = [e])
                                                    : a.push(e),
                                                    p++;
                                                }
                                                m = t === p;
                                              } else m = !0;
                                          }
                                        }
                                      } else {
                                        const e = {
                                          params: { type: 'object' },
                                        };
                                        null === a ? (a = [e]) : a.push(e), p++;
                                      }
                                    f = t === p;
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
        } else {
          const e = { params: { type: 'object' } };
          null === a ? (a = [e]) : a.push(e), p++;
        }
      var v = P === p;
      if (((b = b || v), !b)) {
        const e = p;
        if (p == p)
          if ('string' == typeof o) {
            if (o.length < 1) {
              const e = { params: {} };
              null === a ? (a = [e]) : a.push(e), p++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === a ? (a = [e]) : a.push(e), p++;
          }
        (v = e === p), (b = b || v);
      }
      if (!b) {
        const e = { params: {} };
        return null === a ? (a = [e]) : a.push(e), p++, (s.errors = a), !1;
      }
      if (((p = l), null !== a && (l ? (a.length = l) : (a = null)), i !== p))
        break;
    }
  }
  return (s.errors = a), 0 === p;
}
function n(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: o,
    rootData: i = e,
  } = {},
) {
  let l = null,
    a = 0;
  const p = a;
  let f = !1;
  const u = a;
  if (a === u)
    if (Array.isArray(e)) {
      const n = e.length;
      for (let r = 0; r < n; r++) {
        let n = e[r];
        const o = a,
          p = a;
        let f = !1;
        const u = a;
        if (a == a)
          if ('string' == typeof n) {
            if (n.length < 1) {
              const e = { params: {} };
              null === l ? (l = [e]) : l.push(e), a++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === l ? (l = [e]) : l.push(e), a++;
          }
        var c = u === a;
        if (((f = f || c), !f)) {
          const o = a;
          s(n, {
            instancePath: t + '/' + r,
            parentData: e,
            parentDataProperty: r,
            rootData: i,
          }) ||
            ((l = null === l ? s.errors : l.concat(s.errors)), (a = l.length)),
            (c = o === a),
            (f = f || c);
        }
        if (f) (a = p), null !== l && (p ? (l.length = p) : (l = null));
        else {
          const e = { params: {} };
          null === l ? (l = [e]) : l.push(e), a++;
        }
        if (o !== a) break;
      }
    } else {
      const e = { params: { type: 'array' } };
      null === l ? (l = [e]) : l.push(e), a++;
    }
  var y = u === a;
  if (((f = f || y), !f)) {
    const n = a;
    s(e, {
      instancePath: t,
      parentData: r,
      parentDataProperty: o,
      rootData: i,
    }) || ((l = null === l ? s.errors : l.concat(s.errors)), (a = l.length)),
      (y = n === a),
      (f = f || y);
  }
  if (!f) {
    const e = { params: {} };
    return null === l ? (l = [e]) : l.push(e), a++, (n.errors = l), !1;
  }
  return (
    (a = p),
    null !== l && (p ? (l.length = p) : (l = null)),
    (n.errors = l),
    0 === a
  );
}
function r(
  e,
  {
    instancePath: t = '',
    parentData: s,
    parentDataProperty: o,
    rootData: i = e,
  } = {},
) {
  let l = null,
    a = 0;
  if (0 === a) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (r.errors = [{ params: { type: 'object' } }]), !1;
    {
      let s;
      if (void 0 === e.provides && (s = 'provides'))
        return (r.errors = [{ params: { missingProperty: s } }]), !1;
      {
        const s = a;
        for (const t in e)
          if ('provides' !== t && 'shareScope' !== t)
            return (r.errors = [{ params: { additionalProperty: t } }]), !1;
        if (s === a) {
          if (void 0 !== e.provides) {
            const s = a;
            n(e.provides, {
              instancePath: t + '/provides',
              parentData: e,
              parentDataProperty: 'provides',
              rootData: i,
            }) ||
              ((l = null === l ? n.errors : l.concat(n.errors)),
              (a = l.length));
            var p = s === a;
          } else p = !0;
          if (p)
            if (void 0 !== e.shareScope) {
              let t = e.shareScope;
              const s = a,
                n = a;
              let o = !1;
              const i = a;
              if (a === i)
                if ('string' == typeof t) {
                  if (t.length < 1) {
                    const e = { params: {} };
                    null === l ? (l = [e]) : l.push(e), a++;
                  }
                } else {
                  const e = { params: { type: 'string' } };
                  null === l ? (l = [e]) : l.push(e), a++;
                }
              var f = i === a;
              if (((o = o || f), !o)) {
                const e = a;
                if (a === e)
                  if (Array.isArray(t)) {
                    const e = t.length;
                    for (let s = 0; s < e; s++) {
                      let e = t[s];
                      const n = a;
                      if (a === n)
                        if ('string' == typeof e) {
                          if (e.length < 1) {
                            const e = { params: {} };
                            null === l ? (l = [e]) : l.push(e), a++;
                          }
                        } else {
                          const e = { params: { type: 'string' } };
                          null === l ? (l = [e]) : l.push(e), a++;
                        }
                      if (n !== a) break;
                    }
                  } else {
                    const e = { params: { type: 'array' } };
                    null === l ? (l = [e]) : l.push(e), a++;
                  }
                (f = e === a), (o = o || f);
              }
              if (!o) {
                const e = { params: {} };
                return (
                  null === l ? (l = [e]) : l.push(e), a++, (r.errors = l), !1
                );
              }
              (a = n),
                null !== l && (n ? (l.length = n) : (l = null)),
                (p = s === a);
            } else p = !0;
        }
      }
    }
  }
  return (r.errors = l), 0 === a;
}
