// @ts-nocheck
/* eslint-disable */
/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 */
export const validate = n;
export default n;
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
    },
  },
  t = Object.prototype.hasOwnProperty;
function s(
  r,
  {
    instancePath: n = '',
    parentData: a,
    parentDataProperty: o,
    rootData: l = r,
  } = {},
) {
  let i = null,
    p = 0;
  if (0 === p) {
    if (!r || 'object' != typeof r || Array.isArray(r))
      return (s.errors = [{ params: { type: 'object' } }]), !1;
    for (const n in r) {
      let a = r[n];
      const o = p,
        l = p;
      let g = !1;
      const m = p;
      if (p == p)
        if (a && 'object' == typeof a && !Array.isArray(a)) {
          const s = p;
          for (const s in a)
            if (!t.call(e.properties, s)) {
              const e = { params: { additionalProperty: s } };
              null === i ? (i = [e]) : i.push(e), p++;
              break;
            }
          if (s === p) {
            if (void 0 !== a.eager) {
              const e = p;
              if ('boolean' != typeof a.eager) {
                const e = { params: { type: 'boolean' } };
                null === i ? (i = [e]) : i.push(e), p++;
              }
              var u = e === p;
            } else u = !0;
            if (u) {
              if (void 0 !== a.shareKey) {
                let e = a.shareKey;
                const t = p;
                if (p === t)
                  if ('string' == typeof e) {
                    if (e.length < 1) {
                      const e = { params: {} };
                      null === i ? (i = [e]) : i.push(e), p++;
                    }
                  } else {
                    const e = { params: { type: 'string' } };
                    null === i ? (i = [e]) : i.push(e), p++;
                  }
                u = t === p;
              } else u = !0;
              if (u) {
                if (void 0 !== a.request) {
                  let e = a.request;
                  const t = p;
                  if (p === t)
                    if ('string' == typeof e) {
                      if (e.length < 1) {
                        const e = { params: {} };
                        null === i ? (i = [e]) : i.push(e), p++;
                      }
                    } else {
                      const e = { params: { type: 'string' } };
                      null === i ? (i = [e]) : i.push(e), p++;
                    }
                  u = t === p;
                } else u = !0;
                if (u) {
                  if (void 0 !== a.shareScope) {
                    let e = a.shareScope;
                    const t = p,
                      s = p;
                    let r = !1;
                    const n = p;
                    if (p === n)
                      if ('string' == typeof e) {
                        if (e.length < 1) {
                          const e = { params: {} };
                          null === i ? (i = [e]) : i.push(e), p++;
                        }
                      } else {
                        const e = { params: { type: 'string' } };
                        null === i ? (i = [e]) : i.push(e), p++;
                      }
                    var f = n === p;
                    if (((r = r || f), !r)) {
                      const t = p;
                      if (p === t)
                        if (Array.isArray(e)) {
                          const t = e.length;
                          for (let s = 0; s < t; s++) {
                            let t = e[s];
                            const r = p;
                            if (p === r)
                              if ('string' == typeof t) {
                                if (t.length < 1) {
                                  const e = { params: {} };
                                  null === i ? (i = [e]) : i.push(e), p++;
                                }
                              } else {
                                const e = { params: { type: 'string' } };
                                null === i ? (i = [e]) : i.push(e), p++;
                              }
                            if (r !== p) break;
                          }
                        } else {
                          const e = { params: { type: 'array' } };
                          null === i ? (i = [e]) : i.push(e), p++;
                        }
                      (f = t === p), (r = r || f);
                    }
                    if (r)
                      (p = s), null !== i && (s ? (i.length = s) : (i = null));
                    else {
                      const e = { params: {} };
                      null === i ? (i = [e]) : i.push(e), p++;
                    }
                    u = t === p;
                  } else u = !0;
                  if (u) {
                    if (void 0 !== a.requiredVersion) {
                      let t = a.requiredVersion;
                      const s = p,
                        r = p;
                      let n = !1;
                      const o = p;
                      if (!1 !== t) {
                        const t = {
                          params: {
                            allowedValues:
                              e.properties.requiredVersion.anyOf[0].enum,
                          },
                        };
                        null === i ? (i = [t]) : i.push(t), p++;
                      }
                      var c = o === p;
                      if (((n = n || c), !n)) {
                        const e = p;
                        if ('string' != typeof t) {
                          const e = { params: { type: 'string' } };
                          null === i ? (i = [e]) : i.push(e), p++;
                        }
                        (c = e === p), (n = n || c);
                      }
                      if (n)
                        (p = r),
                          null !== i && (r ? (i.length = r) : (i = null));
                      else {
                        const e = { params: {} };
                        null === i ? (i = [e]) : i.push(e), p++;
                      }
                      u = s === p;
                    } else u = !0;
                    if (u) {
                      if (void 0 !== a.strictVersion) {
                        const e = p;
                        if ('boolean' != typeof a.strictVersion) {
                          const e = { params: { type: 'boolean' } };
                          null === i ? (i = [e]) : i.push(e), p++;
                        }
                        u = e === p;
                      } else u = !0;
                      if (u) {
                        if (void 0 !== a.singleton) {
                          const e = p;
                          if ('boolean' != typeof a.singleton) {
                            const e = { params: { type: 'boolean' } };
                            null === i ? (i = [e]) : i.push(e), p++;
                          }
                          u = e === p;
                        } else u = !0;
                        if (u) {
                          if (void 0 !== a.layer) {
                            let e = a.layer;
                            const t = p;
                            if (p === t)
                              if ('string' == typeof e) {
                                if (e.length < 1) {
                                  const e = { params: {} };
                                  null === i ? (i = [e]) : i.push(e), p++;
                                }
                              } else {
                                const e = { params: { type: 'string' } };
                                null === i ? (i = [e]) : i.push(e), p++;
                              }
                            u = t === p;
                          } else u = !0;
                          if (u) {
                            if (void 0 !== a.issuerLayer) {
                              let e = a.issuerLayer;
                              const t = p;
                              if (p === t)
                                if ('string' == typeof e) {
                                  if (e.length < 1) {
                                    const e = { params: {} };
                                    null === i ? (i = [e]) : i.push(e), p++;
                                  }
                                } else {
                                  const e = { params: { type: 'string' } };
                                  null === i ? (i = [e]) : i.push(e), p++;
                                }
                              u = t === p;
                            } else u = !0;
                            if (u)
                              if (void 0 !== a.version) {
                                let t = a.version;
                                const s = p,
                                  r = p;
                                let n = !1;
                                const o = p;
                                if (!1 !== t) {
                                  const t = {
                                    params: {
                                      allowedValues:
                                        e.properties.version.anyOf[0].enum,
                                    },
                                  };
                                  null === i ? (i = [t]) : i.push(t), p++;
                                }
                                var y = o === p;
                                if (((n = n || y), !n)) {
                                  const e = p;
                                  if ('string' != typeof t) {
                                    const e = { params: { type: 'string' } };
                                    null === i ? (i = [e]) : i.push(e), p++;
                                  }
                                  (y = e === p), (n = n || y);
                                }
                                if (n)
                                  (p = r),
                                    null !== i &&
                                      (r ? (i.length = r) : (i = null));
                                else {
                                  const e = { params: {} };
                                  null === i ? (i = [e]) : i.push(e), p++;
                                }
                                u = s === p;
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
        } else {
          const e = { params: { type: 'object' } };
          null === i ? (i = [e]) : i.push(e), p++;
        }
      var h = m === p;
      if (((g = g || h), !g)) {
        const e = p;
        if (p == p)
          if ('string' == typeof a) {
            if (a.length < 1) {
              const e = { params: {} };
              null === i ? (i = [e]) : i.push(e), p++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === i ? (i = [e]) : i.push(e), p++;
          }
        (h = e === p), (g = g || h);
      }
      if (!g) {
        const e = { params: {} };
        return null === i ? (i = [e]) : i.push(e), p++, (s.errors = i), !1;
      }
      if (((p = l), null !== i && (l ? (i.length = l) : (i = null)), o !== p))
        break;
    }
  }
  return (s.errors = i), 0 === p;
}
function r(
  e,
  {
    instancePath: t = '',
    parentData: n,
    parentDataProperty: a,
    rootData: o = e,
  } = {},
) {
  let l = null,
    i = 0;
  const p = i;
  let u = !1;
  const f = i;
  if (i === f)
    if (Array.isArray(e)) {
      const r = e.length;
      for (let n = 0; n < r; n++) {
        let r = e[n];
        const a = i,
          p = i;
        let u = !1;
        const f = i;
        if (i == i)
          if ('string' == typeof r) {
            if (r.length < 1) {
              const e = { params: {} };
              null === l ? (l = [e]) : l.push(e), i++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === l ? (l = [e]) : l.push(e), i++;
          }
        var c = f === i;
        if (((u = u || c), !u)) {
          const a = i;
          s(r, {
            instancePath: t + '/' + n,
            parentData: e,
            parentDataProperty: n,
            rootData: o,
          }) ||
            ((l = null === l ? s.errors : l.concat(s.errors)), (i = l.length)),
            (c = a === i),
            (u = u || c);
        }
        if (u) (i = p), null !== l && (p ? (l.length = p) : (l = null));
        else {
          const e = { params: {} };
          null === l ? (l = [e]) : l.push(e), i++;
        }
        if (a !== i) break;
      }
    } else {
      const e = { params: { type: 'array' } };
      null === l ? (l = [e]) : l.push(e), i++;
    }
  var y = f === i;
  if (((u = u || y), !u)) {
    const r = i;
    s(e, {
      instancePath: t,
      parentData: n,
      parentDataProperty: a,
      rootData: o,
    }) || ((l = null === l ? s.errors : l.concat(s.errors)), (i = l.length)),
      (y = r === i),
      (u = u || y);
  }
  if (!u) {
    const e = { params: {} };
    return null === l ? (l = [e]) : l.push(e), i++, (r.errors = l), !1;
  }
  return (
    (i = p),
    null !== l && (p ? (l.length = p) : (l = null)),
    (r.errors = l),
    0 === i
  );
}
function n(
  e,
  {
    instancePath: t = '',
    parentData: s,
    parentDataProperty: a,
    rootData: o = e,
  } = {},
) {
  let l = null,
    i = 0;
  if (0 === i) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (n.errors = [{ params: { type: 'object' } }]), !1;
    {
      let s;
      if (void 0 === e.provides && (s = 'provides'))
        return (n.errors = [{ params: { missingProperty: s } }]), !1;
      {
        const s = i;
        for (const t in e)
          if ('provides' !== t && 'shareScope' !== t)
            return (n.errors = [{ params: { additionalProperty: t } }]), !1;
        if (s === i) {
          if (void 0 !== e.provides) {
            const s = i;
            r(e.provides, {
              instancePath: t + '/provides',
              parentData: e,
              parentDataProperty: 'provides',
              rootData: o,
            }) ||
              ((l = null === l ? r.errors : l.concat(r.errors)),
              (i = l.length));
            var p = s === i;
          } else p = !0;
          if (p)
            if (void 0 !== e.shareScope) {
              let t = e.shareScope;
              const s = i,
                r = i;
              let a = !1;
              const o = i;
              if (i === o)
                if ('string' == typeof t) {
                  if (t.length < 1) {
                    const e = { params: {} };
                    null === l ? (l = [e]) : l.push(e), i++;
                  }
                } else {
                  const e = { params: { type: 'string' } };
                  null === l ? (l = [e]) : l.push(e), i++;
                }
              var u = o === i;
              if (((a = a || u), !a)) {
                const e = i;
                if (i === e)
                  if (Array.isArray(t)) {
                    const e = t.length;
                    for (let s = 0; s < e; s++) {
                      let e = t[s];
                      const r = i;
                      if (i === r)
                        if ('string' == typeof e) {
                          if (e.length < 1) {
                            const e = { params: {} };
                            null === l ? (l = [e]) : l.push(e), i++;
                          }
                        } else {
                          const e = { params: { type: 'string' } };
                          null === l ? (l = [e]) : l.push(e), i++;
                        }
                      if (r !== i) break;
                    }
                  } else {
                    const e = { params: { type: 'array' } };
                    null === l ? (l = [e]) : l.push(e), i++;
                  }
                (u = e === i), (a = a || u);
              }
              if (!a) {
                const e = { params: {} };
                return (
                  null === l ? (l = [e]) : l.push(e), i++, (n.errors = l), !1
                );
              }
              (i = r),
                null !== l && (r ? (l.length = r) : (l = null)),
                (p = s === i);
            } else p = !0;
        }
      }
    }
  }
  return (n.errors = l), 0 === i;
}
