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
      shareScope: { type: 'string', minLength: 1 },
      requiredVersion: { anyOf: [{ enum: [!1] }, { type: 'string' }] },
      strictVersion: { type: 'boolean' },
      singleton: { type: 'boolean' },
      layer: { type: 'string', minLength: 1 },
      issuerLayer: { type: 'string', minLength: 1 },
      version: { anyOf: [{ enum: [!1] }, { type: 'string' }] },
    },
  },
  t = Object.prototype.hasOwnProperty;
function r(
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
      return (r.errors = [{ params: { type: 'object' } }]), !1;
    for (const n in s) {
      let o = s[n];
      const a = p,
        i = p;
      let h = !1;
      const g = p;
      if (p == p)
        if (o && 'object' == typeof o && !Array.isArray(o)) {
          const r = p;
          for (const r in o)
            if (!t.call(e.properties, r)) {
              const e = { params: { additionalProperty: r } };
              null === l ? (l = [e]) : l.push(e), p++;
              break;
            }
          if (r === p) {
            if (void 0 !== o.eager) {
              const e = p;
              if ('boolean' != typeof o.eager) {
                const e = { params: { type: 'boolean' } };
                null === l ? (l = [e]) : l.push(e), p++;
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
                      null === l ? (l = [e]) : l.push(e), p++;
                    }
                  } else {
                    const e = { params: { type: 'string' } };
                    null === l ? (l = [e]) : l.push(e), p++;
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
                        null === l ? (l = [e]) : l.push(e), p++;
                      }
                    } else {
                      const e = { params: { type: 'string' } };
                      null === l ? (l = [e]) : l.push(e), p++;
                    }
                  f = t === p;
                } else f = !0;
                if (f) {
                  if (void 0 !== o.shareScope) {
                    let e = o.shareScope;
                    const t = p;
                    if (p === t)
                      if ('string' == typeof e) {
                        if (e.length < 1) {
                          const e = { params: {} };
                          null === l ? (l = [e]) : l.push(e), p++;
                        }
                      } else {
                        const e = { params: { type: 'string' } };
                        null === l ? (l = [e]) : l.push(e), p++;
                      }
                    f = t === p;
                  } else f = !0;
                  if (f) {
                    if (void 0 !== o.requiredVersion) {
                      let t = o.requiredVersion;
                      const r = p,
                        s = p;
                      let n = !1;
                      const a = p;
                      if (!1 !== t) {
                        const t = {
                          params: {
                            allowedValues:
                              e.properties.requiredVersion.anyOf[0].enum,
                          },
                        };
                        null === l ? (l = [t]) : l.push(t), p++;
                      }
                      var u = a === p;
                      if (((n = n || u), !n)) {
                        const e = p;
                        if ('string' != typeof t) {
                          const e = { params: { type: 'string' } };
                          null === l ? (l = [e]) : l.push(e), p++;
                        }
                        (u = e === p), (n = n || u);
                      }
                      if (n)
                        (p = s),
                          null !== l && (s ? (l.length = s) : (l = null));
                      else {
                        const e = { params: {} };
                        null === l ? (l = [e]) : l.push(e), p++;
                      }
                      f = r === p;
                    } else f = !0;
                    if (f) {
                      if (void 0 !== o.strictVersion) {
                        const e = p;
                        if ('boolean' != typeof o.strictVersion) {
                          const e = { params: { type: 'boolean' } };
                          null === l ? (l = [e]) : l.push(e), p++;
                        }
                        f = e === p;
                      } else f = !0;
                      if (f) {
                        if (void 0 !== o.singleton) {
                          const e = p;
                          if ('boolean' != typeof o.singleton) {
                            const e = { params: { type: 'boolean' } };
                            null === l ? (l = [e]) : l.push(e), p++;
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
                                  null === l ? (l = [e]) : l.push(e), p++;
                                }
                              } else {
                                const e = { params: { type: 'string' } };
                                null === l ? (l = [e]) : l.push(e), p++;
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
                                    null === l ? (l = [e]) : l.push(e), p++;
                                  }
                                } else {
                                  const e = { params: { type: 'string' } };
                                  null === l ? (l = [e]) : l.push(e), p++;
                                }
                              f = t === p;
                            } else f = !0;
                            if (f)
                              if (void 0 !== o.version) {
                                let t = o.version;
                                const r = p,
                                  s = p;
                                let n = !1;
                                const a = p;
                                if (!1 !== t) {
                                  const t = {
                                    params: {
                                      allowedValues:
                                        e.properties.version.anyOf[0].enum,
                                    },
                                  };
                                  null === l ? (l = [t]) : l.push(t), p++;
                                }
                                var c = a === p;
                                if (((n = n || c), !n)) {
                                  const e = p;
                                  if ('string' != typeof t) {
                                    const e = { params: { type: 'string' } };
                                    null === l ? (l = [e]) : l.push(e), p++;
                                  }
                                  (c = e === p), (n = n || c);
                                }
                                if (n)
                                  (p = s),
                                    null !== l &&
                                      (s ? (l.length = s) : (l = null));
                                else {
                                  const e = { params: {} };
                                  null === l ? (l = [e]) : l.push(e), p++;
                                }
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
        } else {
          const e = { params: { type: 'object' } };
          null === l ? (l = [e]) : l.push(e), p++;
        }
      var y = g === p;
      if (((h = h || y), !h)) {
        const e = p;
        if (p == p)
          if ('string' == typeof o) {
            if (o.length < 1) {
              const e = { params: {} };
              null === l ? (l = [e]) : l.push(e), p++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === l ? (l = [e]) : l.push(e), p++;
          }
        (y = e === p), (h = h || y);
      }
      if (!h) {
        const e = { params: {} };
        return null === l ? (l = [e]) : l.push(e), p++, (r.errors = l), !1;
      }
      if (((p = i), null !== l && (i ? (l.length = i) : (l = null)), a !== p))
        break;
    }
  }
  return (r.errors = l), 0 === p;
}
function s(
  e,
  {
    instancePath: t = '',
    parentData: n,
    parentDataProperty: o,
    rootData: a = e,
  } = {},
) {
  let i = null,
    l = 0;
  const p = l;
  let f = !1;
  const u = l;
  if (l === u)
    if (Array.isArray(e)) {
      const s = e.length;
      for (let n = 0; n < s; n++) {
        let s = e[n];
        const o = l,
          p = l;
        let f = !1;
        const u = l;
        if (l == l)
          if ('string' == typeof s) {
            if (s.length < 1) {
              const e = { params: {} };
              null === i ? (i = [e]) : i.push(e), l++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === i ? (i = [e]) : i.push(e), l++;
          }
        var c = u === l;
        if (((f = f || c), !f)) {
          const o = l;
          r(s, {
            instancePath: t + '/' + n,
            parentData: e,
            parentDataProperty: n,
            rootData: a,
          }) ||
            ((i = null === i ? r.errors : i.concat(r.errors)), (l = i.length)),
            (c = o === l),
            (f = f || c);
        }
        if (f) (l = p), null !== i && (p ? (i.length = p) : (i = null));
        else {
          const e = { params: {} };
          null === i ? (i = [e]) : i.push(e), l++;
        }
        if (o !== l) break;
      }
    } else {
      const e = { params: { type: 'array' } };
      null === i ? (i = [e]) : i.push(e), l++;
    }
  var y = u === l;
  if (((f = f || y), !f)) {
    const s = l;
    r(e, {
      instancePath: t,
      parentData: n,
      parentDataProperty: o,
      rootData: a,
    }) || ((i = null === i ? r.errors : i.concat(r.errors)), (l = i.length)),
      (y = s === l),
      (f = f || y);
  }
  if (!f) {
    const e = { params: {} };
    return null === i ? (i = [e]) : i.push(e), l++, (s.errors = i), !1;
  }
  return (
    (l = p),
    null !== i && (p ? (i.length = p) : (i = null)),
    (s.errors = i),
    0 === l
  );
}
function n(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: o,
    rootData: a = e,
  } = {},
) {
  let i = null,
    l = 0;
  if (0 === l) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (n.errors = [{ params: { type: 'object' } }]), !1;
    {
      let r;
      if (void 0 === e.provides && (r = 'provides'))
        return (n.errors = [{ params: { missingProperty: r } }]), !1;
      {
        const r = l;
        for (const t in e)
          if ('provides' !== t && 'shareScope' !== t)
            return (n.errors = [{ params: { additionalProperty: t } }]), !1;
        if (r === l) {
          if (void 0 !== e.provides) {
            const r = l;
            s(e.provides, {
              instancePath: t + '/provides',
              parentData: e,
              parentDataProperty: 'provides',
              rootData: a,
            }) ||
              ((i = null === i ? s.errors : i.concat(s.errors)),
              (l = i.length));
            var p = r === l;
          } else p = !0;
          if (p)
            if (void 0 !== e.shareScope) {
              let t = e.shareScope;
              const r = l;
              if (l === r) {
                if ('string' != typeof t)
                  return (n.errors = [{ params: { type: 'string' } }]), !1;
                if (t.length < 1) return (n.errors = [{ params: {} }]), !1;
              }
              p = r === l;
            } else p = !0;
        }
      }
    }
  }
  return (n.errors = i), 0 === l;
}
