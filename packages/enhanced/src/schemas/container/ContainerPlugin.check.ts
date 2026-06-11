// @ts-nocheck
/* eslint-disable */
/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 */
const r = /^(?:[A-Za-z]:[\\/]|\\\\|\/)/;
export const validate = f;
export default f;
const t = { anyOf: [{ enum: [!1] }, { type: 'string', minLength: 1 }] };
function e(
  r,
  {
    instancePath: t = '',
    parentData: n,
    parentDataProperty: s,
    rootData: a = r,
  } = {},
) {
  if (!Array.isArray(r))
    return ((e.errors = [{ params: { type: 'array' } }]), !1);
  {
    const t = r.length;
    for (let n = 0; n < t; n++) {
      let t = r[n];
      const s = 0;
      if ('string' != typeof t)
        return ((e.errors = [{ params: { type: 'string' } }]), !1);
      if (t.length < 1) return ((e.errors = [{ params: {} }]), !1);
      if (0 !== s) break;
    }
  }
  return ((e.errors = null), !0);
}
function n(
  r,
  {
    instancePath: t = '',
    parentData: s,
    parentDataProperty: a,
    rootData: o = r,
  } = {},
) {
  let i = null,
    l = 0;
  if (0 === l) {
    if (!r || 'object' != typeof r || Array.isArray(r))
      return ((n.errors = [{ params: { type: 'object' } }]), !1);
    {
      let s;
      if (void 0 === r.import && (s = 'import'))
        return ((n.errors = [{ params: { missingProperty: s } }]), !1);
      {
        const s = l;
        for (const t in r)
          if ('import' !== t && 'name' !== t)
            return ((n.errors = [{ params: { additionalProperty: t } }]), !1);
        if (s === l) {
          if (void 0 !== r.import) {
            let s = r.import;
            const a = l,
              u = l;
            let c = !1;
            const m = l;
            if (l == l)
              if ('string' == typeof s) {
                if (s.length < 1) {
                  const r = { params: {} };
                  (null === i ? (i = [r]) : i.push(r), l++);
                }
              } else {
                const r = { params: { type: 'string' } };
                (null === i ? (i = [r]) : i.push(r), l++);
              }
            var p = m === l;
            if (((c = c || p), !c)) {
              const n = l;
              (e(s, {
                instancePath: t + '/import',
                parentData: r,
                parentDataProperty: 'import',
                rootData: o,
              }) ||
                ((i = null === i ? e.errors : i.concat(e.errors)),
                (l = i.length)),
                (p = n === l),
                (c = c || p));
            }
            if (!c) {
              const r = { params: {} };
              return (
                null === i ? (i = [r]) : i.push(r),
                l++,
                (n.errors = i),
                !1
              );
            }
            ((l = u), null !== i && (u ? (i.length = u) : (i = null)));
            var f = a === l;
          } else f = !0;
          if (f)
            if (void 0 !== r.name) {
              const t = l;
              if ('string' != typeof r.name)
                return ((n.errors = [{ params: { type: 'string' } }]), !1);
              f = t === l;
            } else f = !0;
        }
      }
    }
  }
  return ((n.errors = i), 0 === l);
}
function s(
  r,
  {
    instancePath: t = '',
    parentData: a,
    parentDataProperty: o,
    rootData: i = r,
  } = {},
) {
  let l = null,
    p = 0;
  if (0 === p) {
    if (!r || 'object' != typeof r || Array.isArray(r))
      return ((s.errors = [{ params: { type: 'object' } }]), !1);
    for (const a in r) {
      let o = r[a];
      const u = p,
        c = p;
      let m = !1;
      const y = p;
      n(o, {
        instancePath: t + '/' + a.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: r,
        parentDataProperty: a,
        rootData: i,
      }) || ((l = null === l ? n.errors : l.concat(n.errors)), (p = l.length));
      var f = y === p;
      if (((m = m || f), !m)) {
        const n = p;
        if (p == p)
          if ('string' == typeof o) {
            if (o.length < 1) {
              const r = { params: {} };
              (null === l ? (l = [r]) : l.push(r), p++);
            }
          } else {
            const r = { params: { type: 'string' } };
            (null === l ? (l = [r]) : l.push(r), p++);
          }
        if (((f = n === p), (m = m || f), !m)) {
          const n = p;
          (e(o, {
            instancePath: t + '/' + a.replace(/~/g, '~0').replace(/\//g, '~1'),
            parentData: r,
            parentDataProperty: a,
            rootData: i,
          }) ||
            ((l = null === l ? e.errors : l.concat(e.errors)), (p = l.length)),
            (f = n === p),
            (m = m || f));
        }
      }
      if (!m) {
        const r = { params: {} };
        return (null === l ? (l = [r]) : l.push(r), p++, (s.errors = l), !1);
      }
      if (((p = c), null !== l && (c ? (l.length = c) : (l = null)), u !== p))
        break;
    }
  }
  return ((s.errors = l), 0 === p);
}
function a(
  r,
  {
    instancePath: t = '',
    parentData: e,
    parentDataProperty: n,
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
      const e = r.length;
      for (let n = 0; n < e; n++) {
        let e = r[n];
        const a = l,
          p = l;
        let f = !1;
        const u = l;
        if (l == l)
          if ('string' == typeof e) {
            if (e.length < 1) {
              const r = { params: {} };
              (null === i ? (i = [r]) : i.push(r), l++);
            }
          } else {
            const r = { params: { type: 'string' } };
            (null === i ? (i = [r]) : i.push(r), l++);
          }
        var c = u === l;
        if (((f = f || c), !f)) {
          const a = l;
          (s(e, {
            instancePath: t + '/' + n,
            parentData: r,
            parentDataProperty: n,
            rootData: o,
          }) ||
            ((i = null === i ? s.errors : i.concat(s.errors)), (l = i.length)),
            (c = a === l),
            (f = f || c));
        }
        if (f) ((l = p), null !== i && (p ? (i.length = p) : (i = null)));
        else {
          const r = { params: {} };
          (null === i ? (i = [r]) : i.push(r), l++);
        }
        if (a !== l) break;
      }
    } else {
      const r = { params: { type: 'array' } };
      (null === i ? (i = [r]) : i.push(r), l++);
    }
  var m = u === l;
  if (((f = f || m), !f)) {
    const a = l;
    (s(r, {
      instancePath: t,
      parentData: e,
      parentDataProperty: n,
      rootData: o,
    }) || ((i = null === i ? s.errors : i.concat(s.errors)), (l = i.length)),
      (m = a === l),
      (f = f || m));
  }
  if (!f) {
    const r = { params: {} };
    return (null === i ? (i = [r]) : i.push(r), l++, (a.errors = i), !1);
  }
  return (
    (l = p),
    null !== i && (p ? (i.length = p) : (i = null)),
    (a.errors = i),
    0 === l
  );
}
const o = {
  anyOf: [
    {
      enum: [
        'var',
        'module',
        'assign',
        'assign-properties',
        'this',
        'window',
        'self',
        'global',
        'commonjs',
        'commonjs2',
        'commonjs-module',
        'commonjs-static',
        'amd',
        'amd-require',
        'umd',
        'umd2',
        'jsonp',
        'system',
      ],
    },
    { type: 'string' },
  ],
};
function i(
  r,
  {
    instancePath: t = '',
    parentData: e,
    parentDataProperty: n,
    rootData: s = r,
  } = {},
) {
  let a = null,
    o = 0;
  const l = o;
  let p = !1;
  const f = o;
  if ('string' != typeof r) {
    const r = { params: { type: 'string' } };
    (null === a ? (a = [r]) : a.push(r), o++);
  }
  var u = f === o;
  if (((p = p || u), !p)) {
    const t = o;
    if (o == o)
      if (r && 'object' == typeof r && !Array.isArray(r)) {
        const t = o;
        for (const t in r)
          if (
            'amd' !== t &&
            'commonjs' !== t &&
            'commonjs2' !== t &&
            'root' !== t
          ) {
            const r = { params: { additionalProperty: t } };
            (null === a ? (a = [r]) : a.push(r), o++);
            break;
          }
        if (t === o) {
          if (void 0 !== r.amd) {
            const t = o;
            if ('string' != typeof r.amd) {
              const r = { params: { type: 'string' } };
              (null === a ? (a = [r]) : a.push(r), o++);
            }
            var c = t === o;
          } else c = !0;
          if (c) {
            if (void 0 !== r.commonjs) {
              const t = o;
              if ('string' != typeof r.commonjs) {
                const r = { params: { type: 'string' } };
                (null === a ? (a = [r]) : a.push(r), o++);
              }
              c = t === o;
            } else c = !0;
            if (c) {
              if (void 0 !== r.commonjs2) {
                const t = o;
                if ('string' != typeof r.commonjs2) {
                  const r = { params: { type: 'string' } };
                  (null === a ? (a = [r]) : a.push(r), o++);
                }
                c = t === o;
              } else c = !0;
              if (c)
                if (void 0 !== r.root) {
                  const t = o;
                  if ('string' != typeof r.root) {
                    const r = { params: { type: 'string' } };
                    (null === a ? (a = [r]) : a.push(r), o++);
                  }
                  c = t === o;
                } else c = !0;
            }
          }
        }
      } else {
        const r = { params: { type: 'object' } };
        (null === a ? (a = [r]) : a.push(r), o++);
      }
    ((u = t === o), (p = p || u));
  }
  if (!p) {
    const r = { params: {} };
    return (null === a ? (a = [r]) : a.push(r), o++, (i.errors = a), !1);
  }
  return (
    (o = l),
    null !== a && (l ? (a.length = l) : (a = null)),
    (i.errors = a),
    0 === o
  );
}
function l(
  r,
  {
    instancePath: t = '',
    parentData: e,
    parentDataProperty: n,
    rootData: s = r,
  } = {},
) {
  let a = null,
    o = 0;
  const i = o;
  let p = !1;
  const f = o;
  if (o === f)
    if (Array.isArray(r))
      if (r.length < 1) {
        const r = { params: { limit: 1 } };
        (null === a ? (a = [r]) : a.push(r), o++);
      } else {
        const t = r.length;
        for (let e = 0; e < t; e++) {
          let t = r[e];
          const n = o;
          if (o === n)
            if ('string' == typeof t) {
              if (t.length < 1) {
                const r = { params: {} };
                (null === a ? (a = [r]) : a.push(r), o++);
              }
            } else {
              const r = { params: { type: 'string' } };
              (null === a ? (a = [r]) : a.push(r), o++);
            }
          if (n !== o) break;
        }
      }
    else {
      const r = { params: { type: 'array' } };
      (null === a ? (a = [r]) : a.push(r), o++);
    }
  var u = f === o;
  if (((p = p || u), !p)) {
    const t = o;
    if (o === t)
      if ('string' == typeof r) {
        if (r.length < 1) {
          const r = { params: {} };
          (null === a ? (a = [r]) : a.push(r), o++);
        }
      } else {
        const r = { params: { type: 'string' } };
        (null === a ? (a = [r]) : a.push(r), o++);
      }
    if (((u = t === o), (p = p || u), !p)) {
      const t = o;
      if (o == o)
        if (r && 'object' == typeof r && !Array.isArray(r)) {
          const t = o;
          for (const t in r)
            if ('amd' !== t && 'commonjs' !== t && 'root' !== t) {
              const r = { params: { additionalProperty: t } };
              (null === a ? (a = [r]) : a.push(r), o++);
              break;
            }
          if (t === o) {
            if (void 0 !== r.amd) {
              let t = r.amd;
              const e = o;
              if (o === e)
                if ('string' == typeof t) {
                  if (t.length < 1) {
                    const r = { params: {} };
                    (null === a ? (a = [r]) : a.push(r), o++);
                  }
                } else {
                  const r = { params: { type: 'string' } };
                  (null === a ? (a = [r]) : a.push(r), o++);
                }
              var c = e === o;
            } else c = !0;
            if (c) {
              if (void 0 !== r.commonjs) {
                let t = r.commonjs;
                const e = o;
                if (o === e)
                  if ('string' == typeof t) {
                    if (t.length < 1) {
                      const r = { params: {} };
                      (null === a ? (a = [r]) : a.push(r), o++);
                    }
                  } else {
                    const r = { params: { type: 'string' } };
                    (null === a ? (a = [r]) : a.push(r), o++);
                  }
                c = e === o;
              } else c = !0;
              if (c)
                if (void 0 !== r.root) {
                  let t = r.root;
                  const e = o,
                    n = o;
                  let s = !1;
                  const i = o;
                  if (o === i)
                    if (Array.isArray(t)) {
                      const r = t.length;
                      for (let e = 0; e < r; e++) {
                        let r = t[e];
                        const n = o;
                        if (o === n)
                          if ('string' == typeof r) {
                            if (r.length < 1) {
                              const r = { params: {} };
                              (null === a ? (a = [r]) : a.push(r), o++);
                            }
                          } else {
                            const r = { params: { type: 'string' } };
                            (null === a ? (a = [r]) : a.push(r), o++);
                          }
                        if (n !== o) break;
                      }
                    } else {
                      const r = { params: { type: 'array' } };
                      (null === a ? (a = [r]) : a.push(r), o++);
                    }
                  var m = i === o;
                  if (((s = s || m), !s)) {
                    const r = o;
                    if (o === r)
                      if ('string' == typeof t) {
                        if (t.length < 1) {
                          const r = { params: {} };
                          (null === a ? (a = [r]) : a.push(r), o++);
                        }
                      } else {
                        const r = { params: { type: 'string' } };
                        (null === a ? (a = [r]) : a.push(r), o++);
                      }
                    ((m = r === o), (s = s || m));
                  }
                  if (s)
                    ((o = n), null !== a && (n ? (a.length = n) : (a = null)));
                  else {
                    const r = { params: {} };
                    (null === a ? (a = [r]) : a.push(r), o++);
                  }
                  c = e === o;
                } else c = !0;
            }
          }
        } else {
          const r = { params: { type: 'object' } };
          (null === a ? (a = [r]) : a.push(r), o++);
        }
      ((u = t === o), (p = p || u));
    }
  }
  if (!p) {
    const r = { params: {} };
    return (null === a ? (a = [r]) : a.push(r), o++, (l.errors = a), !1);
  }
  return (
    (o = i),
    null !== a && (i ? (a.length = i) : (a = null)),
    (l.errors = a),
    0 === o
  );
}
function p(
  r,
  {
    instancePath: t = '',
    parentData: e,
    parentDataProperty: n,
    rootData: s = r,
  } = {},
) {
  let a = null,
    f = 0;
  if (0 === f) {
    if (!r || 'object' != typeof r || Array.isArray(r))
      return ((p.errors = [{ params: { type: 'object' } }]), !1);
    {
      let e;
      if (void 0 === r.type && (e = 'type'))
        return ((p.errors = [{ params: { missingProperty: e } }]), !1);
      {
        const e = f;
        for (const t in r)
          if (
            'amdContainer' !== t &&
            'auxiliaryComment' !== t &&
            'export' !== t &&
            'name' !== t &&
            'type' !== t &&
            'umdNamedDefine' !== t
          )
            return ((p.errors = [{ params: { additionalProperty: t } }]), !1);
        if (e === f) {
          if (void 0 !== r.amdContainer) {
            let t = r.amdContainer;
            const e = f;
            if (f == f) {
              if ('string' != typeof t)
                return ((p.errors = [{ params: { type: 'string' } }]), !1);
              if (t.length < 1) return ((p.errors = [{ params: {} }]), !1);
            }
            var u = e === f;
          } else u = !0;
          if (u) {
            if (void 0 !== r.auxiliaryComment) {
              const e = f;
              (i(r.auxiliaryComment, {
                instancePath: t + '/auxiliaryComment',
                parentData: r,
                parentDataProperty: 'auxiliaryComment',
                rootData: s,
              }) ||
                ((a = null === a ? i.errors : a.concat(i.errors)),
                (f = a.length)),
                (u = e === f));
            } else u = !0;
            if (u) {
              if (void 0 !== r.export) {
                let t = r.export;
                const e = f,
                  n = f;
                let s = !1;
                const o = f;
                if (f === o)
                  if (Array.isArray(t)) {
                    const r = t.length;
                    for (let e = 0; e < r; e++) {
                      let r = t[e];
                      const n = f;
                      if (f === n)
                        if ('string' == typeof r) {
                          if (r.length < 1) {
                            const r = { params: {} };
                            (null === a ? (a = [r]) : a.push(r), f++);
                          }
                        } else {
                          const r = { params: { type: 'string' } };
                          (null === a ? (a = [r]) : a.push(r), f++);
                        }
                      if (n !== f) break;
                    }
                  } else {
                    const r = { params: { type: 'array' } };
                    (null === a ? (a = [r]) : a.push(r), f++);
                  }
                var c = o === f;
                if (((s = s || c), !s)) {
                  const r = f;
                  if (f === r)
                    if ('string' == typeof t) {
                      if (t.length < 1) {
                        const r = { params: {} };
                        (null === a ? (a = [r]) : a.push(r), f++);
                      }
                    } else {
                      const r = { params: { type: 'string' } };
                      (null === a ? (a = [r]) : a.push(r), f++);
                    }
                  ((c = r === f), (s = s || c));
                }
                if (!s) {
                  const r = { params: {} };
                  return (
                    null === a ? (a = [r]) : a.push(r),
                    f++,
                    (p.errors = a),
                    !1
                  );
                }
                ((f = n),
                  null !== a && (n ? (a.length = n) : (a = null)),
                  (u = e === f));
              } else u = !0;
              if (u) {
                if (void 0 !== r.name) {
                  const e = f;
                  (l(r.name, {
                    instancePath: t + '/name',
                    parentData: r,
                    parentDataProperty: 'name',
                    rootData: s,
                  }) ||
                    ((a = null === a ? l.errors : a.concat(l.errors)),
                    (f = a.length)),
                    (u = e === f));
                } else u = !0;
                if (u) {
                  if (void 0 !== r.type) {
                    let t = r.type;
                    const e = f,
                      n = f;
                    let s = !1;
                    const i = f;
                    if (
                      'var' !== t &&
                      'module' !== t &&
                      'assign' !== t &&
                      'assign-properties' !== t &&
                      'this' !== t &&
                      'window' !== t &&
                      'self' !== t &&
                      'global' !== t &&
                      'commonjs' !== t &&
                      'commonjs2' !== t &&
                      'commonjs-module' !== t &&
                      'commonjs-static' !== t &&
                      'amd' !== t &&
                      'amd-require' !== t &&
                      'umd' !== t &&
                      'umd2' !== t &&
                      'jsonp' !== t &&
                      'system' !== t
                    ) {
                      const r = { params: { allowedValues: o.anyOf[0].enum } };
                      (null === a ? (a = [r]) : a.push(r), f++);
                    }
                    var m = i === f;
                    if (((s = s || m), !s)) {
                      const r = f;
                      if ('string' != typeof t) {
                        const r = { params: { type: 'string' } };
                        (null === a ? (a = [r]) : a.push(r), f++);
                      }
                      ((m = r === f), (s = s || m));
                    }
                    if (!s) {
                      const r = { params: {} };
                      return (
                        null === a ? (a = [r]) : a.push(r),
                        f++,
                        (p.errors = a),
                        !1
                      );
                    }
                    ((f = n),
                      null !== a && (n ? (a.length = n) : (a = null)),
                      (u = e === f));
                  } else u = !0;
                  if (u)
                    if (void 0 !== r.umdNamedDefine) {
                      const t = f;
                      if ('boolean' != typeof r.umdNamedDefine)
                        return (
                          (p.errors = [{ params: { type: 'boolean' } }]),
                          !1
                        );
                      u = t === f;
                    } else u = !0;
                }
              }
            }
          }
        }
      }
    }
  }
  return ((p.errors = a), 0 === f);
}
function f(
  e,
  {
    instancePath: n = '',
    parentData: s,
    parentDataProperty: o,
    rootData: i = e,
  } = {},
) {
  let l = null,
    u = 0;
  if (0 === u) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return ((f.errors = [{ params: { type: 'object' } }]), !1);
    {
      let s;
      if (
        (void 0 === e.name && (s = 'name')) ||
        (void 0 === e.exposes && (s = 'exposes'))
      )
        return ((f.errors = [{ params: { missingProperty: s } }]), !1);
      {
        const s = u;
        for (const r in e)
          if (
            'exposes' !== r &&
            'filename' !== r &&
            'library' !== r &&
            'name' !== r &&
            'runtime' !== r &&
            'shareScope' !== r &&
            'experiments' !== r &&
            'runtimePlugins' !== r
          )
            return ((f.errors = [{ params: { additionalProperty: r } }]), !1);
        if (s === u) {
          if (void 0 !== e.exposes) {
            const r = u;
            a(e.exposes, {
              instancePath: n + '/exposes',
              parentData: e,
              parentDataProperty: 'exposes',
              rootData: i,
            }) ||
              ((l = null === l ? a.errors : l.concat(a.errors)),
              (u = l.length));
            var c = r === u;
          } else c = !0;
          if (c) {
            if (void 0 !== e.filename) {
              let t = e.filename;
              const n = u;
              if (u === n) {
                if ('string' != typeof t)
                  return ((f.errors = [{ params: { type: 'string' } }]), !1);
                if (t.length < 1) return ((f.errors = [{ params: {} }]), !1);
                if (t.includes('!') || !1 !== r.test(t))
                  return ((f.errors = [{ params: {} }]), !1);
              }
              c = n === u;
            } else c = !0;
            if (c) {
              if (void 0 !== e.library) {
                const r = u;
                (p(e.library, {
                  instancePath: n + '/library',
                  parentData: e,
                  parentDataProperty: 'library',
                  rootData: i,
                }) ||
                  ((l = null === l ? p.errors : l.concat(p.errors)),
                  (u = l.length)),
                  (c = r === u));
              } else c = !0;
              if (c) {
                if (void 0 !== e.name) {
                  let r = e.name;
                  const t = u;
                  if (u === t) {
                    if ('string' != typeof r)
                      return (
                        (f.errors = [{ params: { type: 'string' } }]),
                        !1
                      );
                    if (r.length < 1)
                      return ((f.errors = [{ params: {} }]), !1);
                  }
                  c = t === u;
                } else c = !0;
                if (c) {
                  if (void 0 !== e.runtime) {
                    let r = e.runtime;
                    const n = u,
                      s = u;
                    let a = !1;
                    const o = u;
                    if (!1 !== r) {
                      const r = { params: { allowedValues: t.anyOf[0].enum } };
                      (null === l ? (l = [r]) : l.push(r), u++);
                    }
                    var m = o === u;
                    if (((a = a || m), !a)) {
                      const t = u;
                      if (u === t)
                        if ('string' == typeof r) {
                          if (r.length < 1) {
                            const r = { params: {} };
                            (null === l ? (l = [r]) : l.push(r), u++);
                          }
                        } else {
                          const r = { params: { type: 'string' } };
                          (null === l ? (l = [r]) : l.push(r), u++);
                        }
                      ((m = t === u), (a = a || m));
                    }
                    if (!a) {
                      const r = { params: {} };
                      return (
                        null === l ? (l = [r]) : l.push(r),
                        u++,
                        (f.errors = l),
                        !1
                      );
                    }
                    ((u = s),
                      null !== l && (s ? (l.length = s) : (l = null)),
                      (c = n === u));
                  } else c = !0;
                  if (c) {
                    if (void 0 !== e.shareScope) {
                      let r = e.shareScope;
                      const t = u,
                        n = u;
                      let s = !1;
                      const a = u;
                      if (u === a)
                        if ('string' == typeof r) {
                          if (r.length < 1) {
                            const r = { params: {} };
                            (null === l ? (l = [r]) : l.push(r), u++);
                          }
                        } else {
                          const r = { params: { type: 'string' } };
                          (null === l ? (l = [r]) : l.push(r), u++);
                        }
                      var y = a === u;
                      if (((s = s || y), !s)) {
                        const t = u;
                        if (u === t)
                          if (Array.isArray(r)) {
                            const t = r.length;
                            for (let e = 0; e < t; e++) {
                              let t = r[e];
                              const n = u;
                              if (u === n)
                                if ('string' == typeof t) {
                                  if (t.length < 1) {
                                    const r = { params: {} };
                                    (null === l ? (l = [r]) : l.push(r), u++);
                                  }
                                } else {
                                  const r = { params: { type: 'string' } };
                                  (null === l ? (l = [r]) : l.push(r), u++);
                                }
                              if (n !== u) break;
                            }
                          } else {
                            const r = { params: { type: 'array' } };
                            (null === l ? (l = [r]) : l.push(r), u++);
                          }
                        ((y = t === u), (s = s || y));
                      }
                      if (!s) {
                        const r = { params: {} };
                        return (
                          null === l ? (l = [r]) : l.push(r),
                          u++,
                          (f.errors = l),
                          !1
                        );
                      }
                      ((u = n),
                        null !== l && (n ? (l.length = n) : (l = null)),
                        (c = t === u));
                    } else c = !0;
                    if (c) {
                      if (void 0 !== e.experiments) {
                        let r = e.experiments;
                        const t = u;
                        if (u === t) {
                          if (!r || 'object' != typeof r || Array.isArray(r))
                            return (
                              (f.errors = [{ params: { type: 'object' } }]),
                              !1
                            );
                          {
                            const t = u;
                            for (const t in r)
                              if (
                                'asyncStartup' !== t &&
                                'externalRuntime' !== t &&
                                'provideExternalRuntime' !== t
                              )
                                return (
                                  (f.errors = [
                                    { params: { additionalProperty: t } },
                                  ]),
                                  !1
                                );
                            if (t === u) {
                              if (void 0 !== r.asyncStartup) {
                                const t = u;
                                if ('boolean' != typeof r.asyncStartup)
                                  return (
                                    (f.errors = [
                                      { params: { type: 'boolean' } },
                                    ]),
                                    !1
                                  );
                                var h = t === u;
                              } else h = !0;
                              if (h) {
                                if (void 0 !== r.externalRuntime) {
                                  const t = u;
                                  if ('boolean' != typeof r.externalRuntime)
                                    return (
                                      (f.errors = [
                                        { params: { type: 'boolean' } },
                                      ]),
                                      !1
                                    );
                                  h = t === u;
                                } else h = !0;
                                if (h)
                                  if (void 0 !== r.provideExternalRuntime) {
                                    const t = u;
                                    if (
                                      'boolean' !=
                                      typeof r.provideExternalRuntime
                                    )
                                      return (
                                        (f.errors = [
                                          { params: { type: 'boolean' } },
                                        ]),
                                        !1
                                      );
                                    h = t === u;
                                  } else h = !0;
                              }
                            }
                          }
                        }
                        c = t === u;
                      } else c = !0;
                      if (c)
                        if (void 0 !== e.runtimePlugins) {
                          let r = e.runtimePlugins;
                          const t = u;
                          if (u === t) {
                            if (!Array.isArray(r))
                              return (
                                (f.errors = [{ params: { type: 'array' } }]),
                                !1
                              );
                            {
                              const t = r.length;
                              for (let e = 0; e < t; e++) {
                                let t = r[e];
                                const n = u,
                                  s = u;
                                let a = !1;
                                const o = u;
                                if ('string' != typeof t) {
                                  const r = { params: { type: 'string' } };
                                  (null === l ? (l = [r]) : l.push(r), u++);
                                }
                                var g = o === u;
                                if (((a = a || g), !a)) {
                                  const r = u;
                                  if (u === r)
                                    if (Array.isArray(t))
                                      if (t.length > 2) {
                                        const r = { params: { limit: 2 } };
                                        (null === l ? (l = [r]) : l.push(r),
                                          u++);
                                      } else if (t.length < 2) {
                                        const r = { params: { limit: 2 } };
                                        (null === l ? (l = [r]) : l.push(r),
                                          u++);
                                      } else {
                                        const r = t.length;
                                        if (r > 0) {
                                          const r = u;
                                          if ('string' != typeof t[0]) {
                                            const r = {
                                              params: { type: 'string' },
                                            };
                                            (null === l ? (l = [r]) : l.push(r),
                                              u++);
                                          }
                                          var d = r === u;
                                        }
                                        if (d && r > 1) {
                                          let r = t[1];
                                          const e = u;
                                          if (
                                            !r ||
                                            'object' != typeof r ||
                                            Array.isArray(r)
                                          ) {
                                            const r = {
                                              params: { type: 'object' },
                                            };
                                            (null === l ? (l = [r]) : l.push(r),
                                              u++);
                                          }
                                          d = e === u;
                                        }
                                      }
                                    else {
                                      const r = { params: { type: 'array' } };
                                      (null === l ? (l = [r]) : l.push(r), u++);
                                    }
                                  ((g = r === u), (a = a || g));
                                }
                                if (!a) {
                                  const r = { params: {} };
                                  return (
                                    null === l ? (l = [r]) : l.push(r),
                                    u++,
                                    (f.errors = l),
                                    !1
                                  );
                                }
                                if (
                                  ((u = s),
                                  null !== l &&
                                    (s ? (l.length = s) : (l = null)),
                                  n !== u)
                                )
                                  break;
                              }
                            }
                          }
                          c = t === u;
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
  return ((f.errors = l), 0 === u);
}
