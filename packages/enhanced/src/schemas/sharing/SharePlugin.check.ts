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
    },
  },
  e = Object.prototype.hasOwnProperty;
function t(
  n,
  {
    instancePath: s = '',
    parentData: a,
    parentDataProperty: o,
    rootData: l = n,
  } = {},
) {
  let i = null,
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
            const l = p;
            if (!1 !== e) {
              const e = {
                params: { allowedValues: r.properties.import.anyOf[0].enum },
              };
              null === i ? (i = [e]) : i.push(e), p++;
            }
            var u = l === p;
            if (((o = o || u), !o)) {
              const r = p;
              if (p == p)
                if ('string' == typeof e) {
                  if (e.length < 1) {
                    const r = { params: {} };
                    null === i ? (i = [r]) : i.push(r), p++;
                  }
                } else {
                  const r = { params: { type: 'string' } };
                  null === i ? (i = [r]) : i.push(r), p++;
                }
              (u = r === p), (o = o || u);
            }
            if (!o) {
              const r = { params: {} };
              return (
                null === i ? (i = [r]) : i.push(r), p++, (t.errors = i), !1
              );
            }
            (p = a),
              null !== i && (a ? (i.length = a) : (i = null)),
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
                const l = p;
                if (!1 !== e) {
                  const e = {
                    params: {
                      allowedValues: r.properties.requiredVersion.anyOf[0].enum,
                    },
                  };
                  null === i ? (i = [e]) : i.push(e), p++;
                }
                var c = l === p;
                if (((o = o || c), !o)) {
                  const r = p;
                  if ('string' != typeof e) {
                    const r = { params: { type: 'string' } };
                    null === i ? (i = [r]) : i.push(r), p++;
                  }
                  (c = r === p), (o = o || c);
                }
                if (!o) {
                  const r = { params: {} };
                  return (
                    null === i ? (i = [r]) : i.push(r), p++, (t.errors = i), !1
                  );
                }
                (p = a),
                  null !== i && (a ? (i.length = a) : (i = null)),
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
                          null === i ? (i = [r]) : i.push(r), p++;
                        }
                      } else {
                        const r = { params: { type: 'string' } };
                        null === i ? (i = [r]) : i.push(r), p++;
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
                                  null === i ? (i = [r]) : i.push(r), p++;
                                }
                              } else {
                                const r = { params: { type: 'string' } };
                                null === i ? (i = [r]) : i.push(r), p++;
                              }
                            if (n !== p) break;
                          }
                        } else {
                          const r = { params: { type: 'array' } };
                          null === i ? (i = [r]) : i.push(r), p++;
                        }
                      (y = e === p), (a = a || y);
                    }
                    if (!a) {
                      const r = { params: {} };
                      return (
                        null === i ? (i = [r]) : i.push(r),
                        p++,
                        (t.errors = i),
                        !1
                      );
                    }
                    (p = s),
                      null !== i && (s ? (i.length = s) : (i = null)),
                      (f = e === p);
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
                          const s = p,
                            a = p;
                          let o = !1;
                          const l = p;
                          if (!1 !== e) {
                            const e = {
                              params: {
                                allowedValues:
                                  r.properties.version.anyOf[0].enum,
                              },
                            };
                            null === i ? (i = [e]) : i.push(e), p++;
                          }
                          var h = l === p;
                          if (((o = o || h), !o)) {
                            const r = p;
                            if ('string' != typeof e) {
                              const r = { params: { type: 'string' } };
                              null === i ? (i = [r]) : i.push(r), p++;
                            }
                            (h = r === p), (o = o || h);
                          }
                          if (!o) {
                            const r = { params: {} };
                            return (
                              null === i ? (i = [r]) : i.push(r),
                              p++,
                              (t.errors = i),
                              !1
                            );
                          }
                          (p = a),
                            null !== i && (a ? (i.length = a) : (i = null)),
                            (f = s === p);
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
  return (t.errors = i), 0 === p;
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
  let l = null,
    i = 0;
  if (0 === i) {
    if (!r || 'object' != typeof r || Array.isArray(r))
      return (n.errors = [{ params: { type: 'object' } }]), !1;
    for (const s in r) {
      let a = r[s];
      const f = i,
        u = i;
      let c = !1;
      const y = i;
      t(a, {
        instancePath: e + '/' + s.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: r,
        parentDataProperty: s,
        rootData: o,
      }) || ((l = null === l ? t.errors : l.concat(t.errors)), (i = l.length));
      var p = y === i;
      if (((c = c || p), !c)) {
        const r = i;
        if (i == i)
          if ('string' == typeof a) {
            if (a.length < 1) {
              const r = { params: {} };
              null === l ? (l = [r]) : l.push(r), i++;
            }
          } else {
            const r = { params: { type: 'string' } };
            null === l ? (l = [r]) : l.push(r), i++;
          }
        (p = r === i), (c = c || p);
      }
      if (!c) {
        const r = { params: {} };
        return null === l ? (l = [r]) : l.push(r), i++, (n.errors = l), !1;
      }
      if (((i = u), null !== l && (u ? (l.length = u) : (l = null)), f !== i))
        break;
    }
  }
  return (n.errors = l), 0 === i;
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
  let l = null,
    i = 0;
  const p = i;
  let f = !1;
  const u = i;
  if (i === u)
    if (Array.isArray(r)) {
      const t = r.length;
      for (let s = 0; s < t; s++) {
        let t = r[s];
        const a = i,
          p = i;
        let f = !1;
        const u = i;
        if (i == i)
          if ('string' == typeof t) {
            if (t.length < 1) {
              const r = { params: {} };
              null === l ? (l = [r]) : l.push(r), i++;
            }
          } else {
            const r = { params: { type: 'string' } };
            null === l ? (l = [r]) : l.push(r), i++;
          }
        var c = u === i;
        if (((f = f || c), !f)) {
          const a = i;
          n(t, {
            instancePath: e + '/' + s,
            parentData: r,
            parentDataProperty: s,
            rootData: o,
          }) ||
            ((l = null === l ? n.errors : l.concat(n.errors)), (i = l.length)),
            (c = a === i),
            (f = f || c);
        }
        if (f) (i = p), null !== l && (p ? (l.length = p) : (l = null));
        else {
          const r = { params: {} };
          null === l ? (l = [r]) : l.push(r), i++;
        }
        if (a !== i) break;
      }
    } else {
      const r = { params: { type: 'array' } };
      null === l ? (l = [r]) : l.push(r), i++;
    }
  var y = u === i;
  if (((f = f || y), !f)) {
    const s = i;
    n(r, {
      instancePath: e,
      parentData: t,
      parentDataProperty: a,
      rootData: o,
    }) || ((l = null === l ? n.errors : l.concat(n.errors)), (i = l.length)),
      (y = s === i),
      (f = f || y);
  }
  if (!f) {
    const r = { params: {} };
    return null === l ? (l = [r]) : l.push(r), i++, (s.errors = l), !1;
  }
  return (
    (i = p),
    null !== l && (p ? (l.length = p) : (l = null)),
    (s.errors = l),
    0 === i
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
  let l = null,
    i = 0;
  if (0 === i) {
    if (!r || 'object' != typeof r || Array.isArray(r))
      return (a.errors = [{ params: { type: 'object' } }]), !1;
    {
      let t;
      if (void 0 === r.shared && (t = 'shared'))
        return (a.errors = [{ params: { missingProperty: t } }]), !1;
      {
        const t = i;
        for (const e in r)
          if ('async' !== e && 'shareScope' !== e && 'shared' !== e)
            return (a.errors = [{ params: { additionalProperty: e } }]), !1;
        if (t === i) {
          if (void 0 !== r.async) {
            const e = i;
            if ('boolean' != typeof r.async)
              return (a.errors = [{ params: { type: 'boolean' } }]), !1;
            var p = e === i;
          } else p = !0;
          if (p) {
            if (void 0 !== r.shareScope) {
              let e = r.shareScope;
              const t = i,
                n = i;
              let s = !1;
              const o = i;
              if (i === o)
                if ('string' == typeof e) {
                  if (e.length < 1) {
                    const r = { params: {} };
                    null === l ? (l = [r]) : l.push(r), i++;
                  }
                } else {
                  const r = { params: { type: 'string' } };
                  null === l ? (l = [r]) : l.push(r), i++;
                }
              var f = o === i;
              if (((s = s || f), !s)) {
                const r = i;
                if (i === r)
                  if (Array.isArray(e)) {
                    const r = e.length;
                    for (let t = 0; t < r; t++) {
                      let r = e[t];
                      const n = i;
                      if (i === n)
                        if ('string' == typeof r) {
                          if (r.length < 1) {
                            const r = { params: {} };
                            null === l ? (l = [r]) : l.push(r), i++;
                          }
                        } else {
                          const r = { params: { type: 'string' } };
                          null === l ? (l = [r]) : l.push(r), i++;
                        }
                      if (n !== i) break;
                    }
                  } else {
                    const r = { params: { type: 'array' } };
                    null === l ? (l = [r]) : l.push(r), i++;
                  }
                (f = r === i), (s = s || f);
              }
              if (!s) {
                const r = { params: {} };
                return (
                  null === l ? (l = [r]) : l.push(r), i++, (a.errors = l), !1
                );
              }
              (i = n),
                null !== l && (n ? (l.length = n) : (l = null)),
                (p = t === i);
            } else p = !0;
            if (p)
              if (void 0 !== r.shared) {
                const t = i;
                s(r.shared, {
                  instancePath: e + '/shared',
                  parentData: r,
                  parentDataProperty: 'shared',
                  rootData: o,
                }) ||
                  ((l = null === l ? s.errors : l.concat(s.errors)),
                  (i = l.length)),
                  (p = t === i);
              } else p = !0;
          }
        }
      }
    }
  }
  return (a.errors = l), 0 === i;
}
