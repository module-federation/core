// @ts-nocheck
/* eslint-disable */
/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 */
const t = /^(?:[A-Za-z]:[\\/]|\\\\|\/)/;
export const validate = m;
export default m;
const e = {
    definitions: {
      RuntimePlugin: { type: 'array', items: { type: 'string' } },
      AmdContainer: { type: 'string', minLength: 1 },
      AuxiliaryComment: {
        anyOf: [
          { type: 'string' },
          { $ref: '#/definitions/LibraryCustomUmdCommentObject' },
        ],
      },
      EntryRuntime: {
        anyOf: [{ enum: [!1] }, { type: 'string', minLength: 1 }],
      },
      Exposes: {
        anyOf: [
          {
            type: 'array',
            items: {
              anyOf: [
                { $ref: '#/definitions/ExposesItem' },
                { $ref: '#/definitions/ExposesObject' },
              ],
            },
          },
          { $ref: '#/definitions/ExposesObject' },
        ],
      },
      ExposesConfig: {
        type: 'object',
        additionalProperties: !1,
        properties: {
          import: {
            anyOf: [
              { $ref: '#/definitions/ExposesItem' },
              { $ref: '#/definitions/ExposesItems' },
            ],
          },
          name: { type: 'string' },
        },
        required: ['import'],
      },
      ExposesItem: { type: 'string', minLength: 1 },
      ExposesItems: {
        type: 'array',
        items: { $ref: '#/definitions/ExposesItem' },
      },
      ExposesObject: {
        type: 'object',
        additionalProperties: {
          anyOf: [
            { $ref: '#/definitions/ExposesConfig' },
            { $ref: '#/definitions/ExposesItem' },
            { $ref: '#/definitions/ExposesItems' },
          ],
        },
      },
      LibraryCustomUmdCommentObject: {
        type: 'object',
        additionalProperties: !1,
        properties: {
          amd: { type: 'string' },
          commonjs: { type: 'string' },
          commonjs2: { type: 'string' },
          root: { type: 'string' },
        },
      },
      LibraryCustomUmdObject: {
        type: 'object',
        additionalProperties: !1,
        properties: {
          amd: { type: 'string', minLength: 1 },
          commonjs: { type: 'string', minLength: 1 },
          root: {
            anyOf: [
              { type: 'array', items: { type: 'string', minLength: 1 } },
              { type: 'string', minLength: 1 },
            ],
          },
        },
      },
      LibraryExport: {
        anyOf: [
          { type: 'array', items: { type: 'string', minLength: 1 } },
          { type: 'string', minLength: 1 },
        ],
      },
      LibraryName: {
        anyOf: [
          {
            type: 'array',
            items: { type: 'string', minLength: 1 },
            minItems: 1,
          },
          { type: 'string', minLength: 1 },
          { $ref: '#/definitions/LibraryCustomUmdObject' },
        ],
      },
      LibraryOptions: {
        type: 'object',
        additionalProperties: !1,
        properties: {
          amdContainer: { $ref: '#/definitions/AmdContainer' },
          auxiliaryComment: { $ref: '#/definitions/AuxiliaryComment' },
          export: { $ref: '#/definitions/LibraryExport' },
          name: { $ref: '#/definitions/LibraryName' },
          type: { $ref: '#/definitions/LibraryType' },
          umdNamedDefine: { $ref: '#/definitions/UmdNamedDefine' },
        },
        required: ['type'],
      },
      LibraryType: {
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
      },
      UmdNamedDefine: { type: 'boolean' },
    },
    type: 'object',
    additionalProperties: !1,
    properties: {
      exposes: { $ref: '#/definitions/Exposes' },
      filename: { type: 'string', absolutePath: !1, minLength: 1 },
      library: { $ref: '#/definitions/LibraryOptions' },
      name: { type: 'string', minLength: 1 },
      runtime: { $ref: '#/definitions/EntryRuntime' },
      runtimePlugins: { $ref: '#/definitions/RuntimePlugin' },
      shareScope: { type: 'string', minLength: 1 },
      experiments: {
        type: 'object',
        properties: {
          asyncStartup: { type: 'boolean' },
          externalRuntime: {
            anyOf: [{ type: 'boolean' }, { enum: ['provide'] }],
          },
        },
        additionalProperties: !1,
      },
    },
    required: ['name', 'exposes'],
  },
  r = { anyOf: [{ enum: [!1] }, { type: 'string', minLength: 1 }] };
function n(
  t,
  {
    instancePath: e = '',
    parentData: r,
    parentDataProperty: s,
    rootData: a = t,
  } = {},
) {
  if (!Array.isArray(t))
    return (n.errors = [{ params: { type: 'array' } }]), !1;
  {
    const e = t.length;
    for (let r = 0; r < e; r++) {
      let e = t[r];
      const s = 0;
      if ('string' != typeof e)
        return (n.errors = [{ params: { type: 'string' } }]), !1;
      if (e.length < 1) return (n.errors = [{ params: {} }]), !1;
      if (0 !== s) break;
    }
  }
  return (n.errors = null), !0;
}
function s(
  t,
  {
    instancePath: e = '',
    parentData: r,
    parentDataProperty: a,
    rootData: o = t,
  } = {},
) {
  let i = null,
    p = 0;
  if (0 === p) {
    if (!t || 'object' != typeof t || Array.isArray(t))
      return (s.errors = [{ params: { type: 'object' } }]), !1;
    {
      let r;
      if (void 0 === t.import && (r = 'import'))
        return (s.errors = [{ params: { missingProperty: r } }]), !1;
      {
        const r = p;
        for (const e in t)
          if ('import' !== e && 'name' !== e)
            return (s.errors = [{ params: { additionalProperty: e } }]), !1;
        if (r === p) {
          if (void 0 !== t.import) {
            let r = t.import;
            const a = p,
              m = p;
            let u = !1;
            const c = p;
            if (p == p)
              if ('string' == typeof r) {
                if (r.length < 1) {
                  const t = { params: {} };
                  null === i ? (i = [t]) : i.push(t), p++;
                }
              } else {
                const t = { params: { type: 'string' } };
                null === i ? (i = [t]) : i.push(t), p++;
              }
            var l = c === p;
            if (((u = u || l), !u)) {
              const s = p;
              n(r, {
                instancePath: e + '/import',
                parentData: t,
                parentDataProperty: 'import',
                rootData: o,
              }) ||
                ((i = null === i ? n.errors : i.concat(n.errors)),
                (p = i.length)),
                (l = s === p),
                (u = u || l);
            }
            if (!u) {
              const t = { params: {} };
              return (
                null === i ? (i = [t]) : i.push(t), p++, (s.errors = i), !1
              );
            }
            (p = m), null !== i && (m ? (i.length = m) : (i = null));
            var f = a === p;
          } else f = !0;
          if (f)
            if (void 0 !== t.name) {
              const e = p;
              if ('string' != typeof t.name)
                return (s.errors = [{ params: { type: 'string' } }]), !1;
              f = e === p;
            } else f = !0;
        }
      }
    }
  }
  return (s.errors = i), 0 === p;
}
function a(
  t,
  {
    instancePath: e = '',
    parentData: r,
    parentDataProperty: o,
    rootData: i = t,
  } = {},
) {
  let p = null,
    l = 0;
  if (0 === l) {
    if (!t || 'object' != typeof t || Array.isArray(t))
      return (a.errors = [{ params: { type: 'object' } }]), !1;
    for (const r in t) {
      let o = t[r];
      const m = l,
        u = l;
      let c = !1;
      const y = l;
      s(o, {
        instancePath: e + '/' + r.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: t,
        parentDataProperty: r,
        rootData: i,
      }) || ((p = null === p ? s.errors : p.concat(s.errors)), (l = p.length));
      var f = y === l;
      if (((c = c || f), !c)) {
        const s = l;
        if (l == l)
          if ('string' == typeof o) {
            if (o.length < 1) {
              const t = { params: {} };
              null === p ? (p = [t]) : p.push(t), l++;
            }
          } else {
            const t = { params: { type: 'string' } };
            null === p ? (p = [t]) : p.push(t), l++;
          }
        if (((f = s === l), (c = c || f), !c)) {
          const s = l;
          n(o, {
            instancePath: e + '/' + r.replace(/~/g, '~0').replace(/\//g, '~1'),
            parentData: t,
            parentDataProperty: r,
            rootData: i,
          }) ||
            ((p = null === p ? n.errors : p.concat(n.errors)), (l = p.length)),
            (f = s === l),
            (c = c || f);
        }
      }
      if (!c) {
        const t = { params: {} };
        return null === p ? (p = [t]) : p.push(t), l++, (a.errors = p), !1;
      }
      if (((l = u), null !== p && (u ? (p.length = u) : (p = null)), m !== l))
        break;
    }
  }
  return (a.errors = p), 0 === l;
}
function o(
  t,
  {
    instancePath: e = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = t,
  } = {},
) {
  let i = null,
    p = 0;
  const l = p;
  let f = !1;
  const m = p;
  if (p === m)
    if (Array.isArray(t)) {
      const r = t.length;
      for (let n = 0; n < r; n++) {
        let r = t[n];
        const o = p,
          l = p;
        let f = !1;
        const m = p;
        if (p == p)
          if ('string' == typeof r) {
            if (r.length < 1) {
              const t = { params: {} };
              null === i ? (i = [t]) : i.push(t), p++;
            }
          } else {
            const t = { params: { type: 'string' } };
            null === i ? (i = [t]) : i.push(t), p++;
          }
        var u = m === p;
        if (((f = f || u), !f)) {
          const o = p;
          a(r, {
            instancePath: e + '/' + n,
            parentData: t,
            parentDataProperty: n,
            rootData: s,
          }) ||
            ((i = null === i ? a.errors : i.concat(a.errors)), (p = i.length)),
            (u = o === p),
            (f = f || u);
        }
        if (f) (p = l), null !== i && (l ? (i.length = l) : (i = null));
        else {
          const t = { params: {} };
          null === i ? (i = [t]) : i.push(t), p++;
        }
        if (o !== p) break;
      }
    } else {
      const t = { params: { type: 'array' } };
      null === i ? (i = [t]) : i.push(t), p++;
    }
  var c = m === p;
  if (((f = f || c), !f)) {
    const o = p;
    a(t, {
      instancePath: e,
      parentData: r,
      parentDataProperty: n,
      rootData: s,
    }) || ((i = null === i ? a.errors : i.concat(a.errors)), (p = i.length)),
      (c = o === p),
      (f = f || c);
  }
  if (!f) {
    const t = { params: {} };
    return null === i ? (i = [t]) : i.push(t), p++, (o.errors = i), !1;
  }
  return (
    (p = l),
    null !== i && (l ? (i.length = l) : (i = null)),
    (o.errors = i),
    0 === p
  );
}
const i = {
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
function p(
  t,
  {
    instancePath: e = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = t,
  } = {},
) {
  let a = null,
    o = 0;
  const i = o;
  let l = !1;
  const f = o;
  if ('string' != typeof t) {
    const t = { params: { type: 'string' } };
    null === a ? (a = [t]) : a.push(t), o++;
  }
  var m = f === o;
  if (((l = l || m), !l)) {
    const e = o;
    if (o == o)
      if (t && 'object' == typeof t && !Array.isArray(t)) {
        const e = o;
        for (const e in t)
          if (
            'amd' !== e &&
            'commonjs' !== e &&
            'commonjs2' !== e &&
            'root' !== e
          ) {
            const t = { params: { additionalProperty: e } };
            null === a ? (a = [t]) : a.push(t), o++;
            break;
          }
        if (e === o) {
          if (void 0 !== t.amd) {
            const e = o;
            if ('string' != typeof t.amd) {
              const t = { params: { type: 'string' } };
              null === a ? (a = [t]) : a.push(t), o++;
            }
            var u = e === o;
          } else u = !0;
          if (u) {
            if (void 0 !== t.commonjs) {
              const e = o;
              if ('string' != typeof t.commonjs) {
                const t = { params: { type: 'string' } };
                null === a ? (a = [t]) : a.push(t), o++;
              }
              u = e === o;
            } else u = !0;
            if (u) {
              if (void 0 !== t.commonjs2) {
                const e = o;
                if ('string' != typeof t.commonjs2) {
                  const t = { params: { type: 'string' } };
                  null === a ? (a = [t]) : a.push(t), o++;
                }
                u = e === o;
              } else u = !0;
              if (u)
                if (void 0 !== t.root) {
                  const e = o;
                  if ('string' != typeof t.root) {
                    const t = { params: { type: 'string' } };
                    null === a ? (a = [t]) : a.push(t), o++;
                  }
                  u = e === o;
                } else u = !0;
            }
          }
        }
      } else {
        const t = { params: { type: 'object' } };
        null === a ? (a = [t]) : a.push(t), o++;
      }
    (m = e === o), (l = l || m);
  }
  if (!l) {
    const t = { params: {} };
    return null === a ? (a = [t]) : a.push(t), o++, (p.errors = a), !1;
  }
  return (
    (o = i),
    null !== a && (i ? (a.length = i) : (a = null)),
    (p.errors = a),
    0 === o
  );
}
function l(
  t,
  {
    instancePath: e = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = t,
  } = {},
) {
  let a = null,
    o = 0;
  const i = o;
  let p = !1;
  const f = o;
  if (o === f)
    if (Array.isArray(t))
      if (t.length < 1) {
        const t = { params: { limit: 1 } };
        null === a ? (a = [t]) : a.push(t), o++;
      } else {
        const e = t.length;
        for (let r = 0; r < e; r++) {
          let e = t[r];
          const n = o;
          if (o === n)
            if ('string' == typeof e) {
              if (e.length < 1) {
                const t = { params: {} };
                null === a ? (a = [t]) : a.push(t), o++;
              }
            } else {
              const t = { params: { type: 'string' } };
              null === a ? (a = [t]) : a.push(t), o++;
            }
          if (n !== o) break;
        }
      }
    else {
      const t = { params: { type: 'array' } };
      null === a ? (a = [t]) : a.push(t), o++;
    }
  var m = f === o;
  if (((p = p || m), !p)) {
    const e = o;
    if (o === e)
      if ('string' == typeof t) {
        if (t.length < 1) {
          const t = { params: {} };
          null === a ? (a = [t]) : a.push(t), o++;
        }
      } else {
        const t = { params: { type: 'string' } };
        null === a ? (a = [t]) : a.push(t), o++;
      }
    if (((m = e === o), (p = p || m), !p)) {
      const e = o;
      if (o == o)
        if (t && 'object' == typeof t && !Array.isArray(t)) {
          const e = o;
          for (const e in t)
            if ('amd' !== e && 'commonjs' !== e && 'root' !== e) {
              const t = { params: { additionalProperty: e } };
              null === a ? (a = [t]) : a.push(t), o++;
              break;
            }
          if (e === o) {
            if (void 0 !== t.amd) {
              let e = t.amd;
              const r = o;
              if (o === r)
                if ('string' == typeof e) {
                  if (e.length < 1) {
                    const t = { params: {} };
                    null === a ? (a = [t]) : a.push(t), o++;
                  }
                } else {
                  const t = { params: { type: 'string' } };
                  null === a ? (a = [t]) : a.push(t), o++;
                }
              var u = r === o;
            } else u = !0;
            if (u) {
              if (void 0 !== t.commonjs) {
                let e = t.commonjs;
                const r = o;
                if (o === r)
                  if ('string' == typeof e) {
                    if (e.length < 1) {
                      const t = { params: {} };
                      null === a ? (a = [t]) : a.push(t), o++;
                    }
                  } else {
                    const t = { params: { type: 'string' } };
                    null === a ? (a = [t]) : a.push(t), o++;
                  }
                u = r === o;
              } else u = !0;
              if (u)
                if (void 0 !== t.root) {
                  let e = t.root;
                  const r = o,
                    n = o;
                  let s = !1;
                  const i = o;
                  if (o === i)
                    if (Array.isArray(e)) {
                      const t = e.length;
                      for (let r = 0; r < t; r++) {
                        let t = e[r];
                        const n = o;
                        if (o === n)
                          if ('string' == typeof t) {
                            if (t.length < 1) {
                              const t = { params: {} };
                              null === a ? (a = [t]) : a.push(t), o++;
                            }
                          } else {
                            const t = { params: { type: 'string' } };
                            null === a ? (a = [t]) : a.push(t), o++;
                          }
                        if (n !== o) break;
                      }
                    } else {
                      const t = { params: { type: 'array' } };
                      null === a ? (a = [t]) : a.push(t), o++;
                    }
                  var c = i === o;
                  if (((s = s || c), !s)) {
                    const t = o;
                    if (o === t)
                      if ('string' == typeof e) {
                        if (e.length < 1) {
                          const t = { params: {} };
                          null === a ? (a = [t]) : a.push(t), o++;
                        }
                      } else {
                        const t = { params: { type: 'string' } };
                        null === a ? (a = [t]) : a.push(t), o++;
                      }
                    (c = t === o), (s = s || c);
                  }
                  if (s)
                    (o = n), null !== a && (n ? (a.length = n) : (a = null));
                  else {
                    const t = { params: {} };
                    null === a ? (a = [t]) : a.push(t), o++;
                  }
                  u = r === o;
                } else u = !0;
            }
          }
        } else {
          const t = { params: { type: 'object' } };
          null === a ? (a = [t]) : a.push(t), o++;
        }
      (m = e === o), (p = p || m);
    }
  }
  if (!p) {
    const t = { params: {} };
    return null === a ? (a = [t]) : a.push(t), o++, (l.errors = a), !1;
  }
  return (
    (o = i),
    null !== a && (i ? (a.length = i) : (a = null)),
    (l.errors = a),
    0 === o
  );
}
function f(
  t,
  {
    instancePath: e = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = t,
  } = {},
) {
  let a = null,
    o = 0;
  if (0 === o) {
    if (!t || 'object' != typeof t || Array.isArray(t))
      return (f.errors = [{ params: { type: 'object' } }]), !1;
    {
      let r;
      if (void 0 === t.type && (r = 'type'))
        return (f.errors = [{ params: { missingProperty: r } }]), !1;
      {
        const r = o;
        for (const e in t)
          if (
            'amdContainer' !== e &&
            'auxiliaryComment' !== e &&
            'export' !== e &&
            'name' !== e &&
            'type' !== e &&
            'umdNamedDefine' !== e
          )
            return (f.errors = [{ params: { additionalProperty: e } }]), !1;
        if (r === o) {
          if (void 0 !== t.amdContainer) {
            let e = t.amdContainer;
            const r = o;
            if (o == o) {
              if ('string' != typeof e)
                return (f.errors = [{ params: { type: 'string' } }]), !1;
              if (e.length < 1) return (f.errors = [{ params: {} }]), !1;
            }
            var m = r === o;
          } else m = !0;
          if (m) {
            if (void 0 !== t.auxiliaryComment) {
              const r = o;
              p(t.auxiliaryComment, {
                instancePath: e + '/auxiliaryComment',
                parentData: t,
                parentDataProperty: 'auxiliaryComment',
                rootData: s,
              }) ||
                ((a = null === a ? p.errors : a.concat(p.errors)),
                (o = a.length)),
                (m = r === o);
            } else m = !0;
            if (m) {
              if (void 0 !== t.export) {
                let e = t.export;
                const r = o,
                  n = o;
                let s = !1;
                const i = o;
                if (o === i)
                  if (Array.isArray(e)) {
                    const t = e.length;
                    for (let r = 0; r < t; r++) {
                      let t = e[r];
                      const n = o;
                      if (o === n)
                        if ('string' == typeof t) {
                          if (t.length < 1) {
                            const t = { params: {} };
                            null === a ? (a = [t]) : a.push(t), o++;
                          }
                        } else {
                          const t = { params: { type: 'string' } };
                          null === a ? (a = [t]) : a.push(t), o++;
                        }
                      if (n !== o) break;
                    }
                  } else {
                    const t = { params: { type: 'array' } };
                    null === a ? (a = [t]) : a.push(t), o++;
                  }
                var u = i === o;
                if (((s = s || u), !s)) {
                  const t = o;
                  if (o === t)
                    if ('string' == typeof e) {
                      if (e.length < 1) {
                        const t = { params: {} };
                        null === a ? (a = [t]) : a.push(t), o++;
                      }
                    } else {
                      const t = { params: { type: 'string' } };
                      null === a ? (a = [t]) : a.push(t), o++;
                    }
                  (u = t === o), (s = s || u);
                }
                if (!s) {
                  const t = { params: {} };
                  return (
                    null === a ? (a = [t]) : a.push(t), o++, (f.errors = a), !1
                  );
                }
                (o = n),
                  null !== a && (n ? (a.length = n) : (a = null)),
                  (m = r === o);
              } else m = !0;
              if (m) {
                if (void 0 !== t.name) {
                  const r = o;
                  l(t.name, {
                    instancePath: e + '/name',
                    parentData: t,
                    parentDataProperty: 'name',
                    rootData: s,
                  }) ||
                    ((a = null === a ? l.errors : a.concat(l.errors)),
                    (o = a.length)),
                    (m = r === o);
                } else m = !0;
                if (m) {
                  if (void 0 !== t.type) {
                    let e = t.type;
                    const r = o,
                      n = o;
                    let s = !1;
                    const p = o;
                    if (
                      'var' !== e &&
                      'module' !== e &&
                      'assign' !== e &&
                      'assign-properties' !== e &&
                      'this' !== e &&
                      'window' !== e &&
                      'self' !== e &&
                      'global' !== e &&
                      'commonjs' !== e &&
                      'commonjs2' !== e &&
                      'commonjs-module' !== e &&
                      'commonjs-static' !== e &&
                      'amd' !== e &&
                      'amd-require' !== e &&
                      'umd' !== e &&
                      'umd2' !== e &&
                      'jsonp' !== e &&
                      'system' !== e
                    ) {
                      const t = { params: { allowedValues: i.anyOf[0].enum } };
                      null === a ? (a = [t]) : a.push(t), o++;
                    }
                    var c = p === o;
                    if (((s = s || c), !s)) {
                      const t = o;
                      if ('string' != typeof e) {
                        const t = { params: { type: 'string' } };
                        null === a ? (a = [t]) : a.push(t), o++;
                      }
                      (c = t === o), (s = s || c);
                    }
                    if (!s) {
                      const t = { params: {} };
                      return (
                        null === a ? (a = [t]) : a.push(t),
                        o++,
                        (f.errors = a),
                        !1
                      );
                    }
                    (o = n),
                      null !== a && (n ? (a.length = n) : (a = null)),
                      (m = r === o);
                  } else m = !0;
                  if (m)
                    if (void 0 !== t.umdNamedDefine) {
                      const e = o;
                      if ('boolean' != typeof t.umdNamedDefine)
                        return (
                          (f.errors = [{ params: { type: 'boolean' } }]), !1
                        );
                      m = e === o;
                    } else m = !0;
                }
              }
            }
          }
        }
      }
    }
  }
  return (f.errors = a), 0 === o;
}
function m(
  n,
  {
    instancePath: s = '',
    parentData: a,
    parentDataProperty: i,
    rootData: p = n,
  } = {},
) {
  let l = null,
    u = 0;
  if (0 === u) {
    if (!n || 'object' != typeof n || Array.isArray(n))
      return (m.errors = [{ params: { type: 'object' } }]), !1;
    {
      let a;
      if (
        (void 0 === n.name && (a = 'name')) ||
        (void 0 === n.exposes && (a = 'exposes'))
      )
        return (m.errors = [{ params: { missingProperty: a } }]), !1;
      {
        const a = u;
        for (const t in n)
          if (
            'exposes' !== t &&
            'filename' !== t &&
            'library' !== t &&
            'name' !== t &&
            'runtime' !== t &&
            'runtimePlugins' !== t &&
            'shareScope' !== t &&
            'experiments' !== t
          )
            return (m.errors = [{ params: { additionalProperty: t } }]), !1;
        if (a === u) {
          if (void 0 !== n.exposes) {
            const t = u;
            o(n.exposes, {
              instancePath: s + '/exposes',
              parentData: n,
              parentDataProperty: 'exposes',
              rootData: p,
            }) ||
              ((l = null === l ? o.errors : l.concat(o.errors)),
              (u = l.length));
            var c = t === u;
          } else c = !0;
          if (c) {
            if (void 0 !== n.filename) {
              let e = n.filename;
              const r = u;
              if (u === r) {
                if ('string' != typeof e)
                  return (m.errors = [{ params: { type: 'string' } }]), !1;
                if (e.length < 1) return (m.errors = [{ params: {} }]), !1;
                if (e.includes('!') || !1 !== t.test(e))
                  return (m.errors = [{ params: {} }]), !1;
              }
              c = r === u;
            } else c = !0;
            if (c) {
              if (void 0 !== n.library) {
                const t = u;
                f(n.library, {
                  instancePath: s + '/library',
                  parentData: n,
                  parentDataProperty: 'library',
                  rootData: p,
                }) ||
                  ((l = null === l ? f.errors : l.concat(f.errors)),
                  (u = l.length)),
                  (c = t === u);
              } else c = !0;
              if (c) {
                if (void 0 !== n.name) {
                  let t = n.name;
                  const e = u;
                  if (u === e) {
                    if ('string' != typeof t)
                      return (m.errors = [{ params: { type: 'string' } }]), !1;
                    if (t.length < 1) return (m.errors = [{ params: {} }]), !1;
                  }
                  c = e === u;
                } else c = !0;
                if (c) {
                  if (void 0 !== n.runtime) {
                    let t = n.runtime;
                    const e = u,
                      s = u;
                    let a = !1;
                    const o = u;
                    if (!1 !== t) {
                      const t = { params: { allowedValues: r.anyOf[0].enum } };
                      null === l ? (l = [t]) : l.push(t), u++;
                    }
                    var y = o === u;
                    if (((a = a || y), !a)) {
                      const e = u;
                      if (u === e)
                        if ('string' == typeof t) {
                          if (t.length < 1) {
                            const t = { params: {} };
                            null === l ? (l = [t]) : l.push(t), u++;
                          }
                        } else {
                          const t = { params: { type: 'string' } };
                          null === l ? (l = [t]) : l.push(t), u++;
                        }
                      (y = e === u), (a = a || y);
                    }
                    if (!a) {
                      const t = { params: {} };
                      return (
                        null === l ? (l = [t]) : l.push(t),
                        u++,
                        (m.errors = l),
                        !1
                      );
                    }
                    (u = s),
                      null !== l && (s ? (l.length = s) : (l = null)),
                      (c = e === u);
                  } else c = !0;
                  if (c) {
                    if (void 0 !== n.runtimePlugins) {
                      let t = n.runtimePlugins;
                      const e = u;
                      if (u == u) {
                        if (!Array.isArray(t))
                          return (
                            (m.errors = [{ params: { type: 'array' } }]), !1
                          );
                        {
                          const e = t.length;
                          for (let r = 0; r < e; r++) {
                            const e = u;
                            if ('string' != typeof t[r])
                              return (
                                (m.errors = [{ params: { type: 'string' } }]),
                                !1
                              );
                            if (e !== u) break;
                          }
                        }
                      }
                      c = e === u;
                    } else c = !0;
                    if (c) {
                      if (void 0 !== n.shareScope) {
                        let t = n.shareScope;
                        const e = u;
                        if (u === e) {
                          if ('string' != typeof t)
                            return (
                              (m.errors = [{ params: { type: 'string' } }]), !1
                            );
                          if (t.length < 1)
                            return (m.errors = [{ params: {} }]), !1;
                        }
                        c = e === u;
                      } else c = !0;
                      if (c)
                        if (void 0 !== n.experiments) {
                          let t = n.experiments;
                          const r = u;
                          if (u === r) {
                            if (!t || 'object' != typeof t || Array.isArray(t))
                              return (
                                (m.errors = [{ params: { type: 'object' } }]),
                                !1
                              );
                            {
                              const r = u;
                              for (const e in t)
                                if (
                                  'asyncStartup' !== e &&
                                  'externalRuntime' !== e
                                )
                                  return (
                                    (m.errors = [
                                      { params: { additionalProperty: e } },
                                    ]),
                                    !1
                                  );
                              if (r === u) {
                                if (void 0 !== t.asyncStartup) {
                                  const e = u;
                                  if ('boolean' != typeof t.asyncStartup)
                                    return (
                                      (m.errors = [
                                        { params: { type: 'boolean' } },
                                      ]),
                                      !1
                                    );
                                  var g = e === u;
                                } else g = !0;
                                if (g)
                                  if (void 0 !== t.externalRuntime) {
                                    let r = t.externalRuntime;
                                    const n = u,
                                      s = u;
                                    let a = !1;
                                    const o = u;
                                    if ('boolean' != typeof r) {
                                      const t = { params: { type: 'boolean' } };
                                      null === l ? (l = [t]) : l.push(t), u++;
                                    }
                                    var d = o === u;
                                    if (((a = a || d), !a)) {
                                      const t = u;
                                      if ('provide' !== r) {
                                        const t = {
                                          params: {
                                            allowedValues:
                                              e.properties.experiments
                                                .properties.externalRuntime
                                                .anyOf[1].enum,
                                          },
                                        };
                                        null === l ? (l = [t]) : l.push(t), u++;
                                      }
                                      (d = t === u), (a = a || d);
                                    }
                                    if (!a) {
                                      const t = { params: {} };
                                      return (
                                        null === l ? (l = [t]) : l.push(t),
                                        u++,
                                        (m.errors = l),
                                        !1
                                      );
                                    }
                                    (u = s),
                                      null !== l &&
                                        (s ? (l.length = s) : (l = null)),
                                      (g = n === u);
                                  } else g = !0;
                              }
                            }
                          }
                          c = r === u;
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
  return (m.errors = l), 0 === u;
}
