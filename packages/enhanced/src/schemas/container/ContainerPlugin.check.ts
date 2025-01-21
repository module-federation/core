// @ts-nocheck
/* eslint-disable */
/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 */
const t = /^(?:[A-Za-z]:[\\/]|\\\\|\/)/;
export const validate = u;
export default u;
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
          federationRuntime: {
            anyOf: [{ type: 'boolean' }, { enum: ['hoisted'] }],
          },
          externalRuntime: {
            anyOf: [{ type: 'boolean' }, { enum: ['provide'] }],
          },
        },
        additionalProperties: !1,
      },
    },
    required: ['name', 'exposes'],
  },
  r = { anyOf: [{ enum: [!1] }, { type: 'string', minLength: 1 }] },
  n = require('ajv/dist/runtime/ucs2length').default;
function s(
  t,
  {
    instancePath: e = '',
    parentData: r,
    parentDataProperty: i,
    rootData: o = t,
  } = {},
) {
  if (!Array.isArray(t))
    return (s.errors = [{ params: { type: 'array' } }]), !1;
  {
    const e = t.length;
    for (let r = 0; r < e; r++) {
      let e = t[r];
      const i = 0;
      if ('string' != typeof e)
        return (s.errors = [{ params: { type: 'string' } }]), !1;
      if (n(e) < 1) return (s.errors = [{ params: { limit: 1 } }]), !1;
      if (0 !== i) break;
    }
  }
  return (s.errors = null), !0;
}
function i(
  t,
  {
    instancePath: e = '',
    parentData: r,
    parentDataProperty: o,
    rootData: a = t,
  } = {},
) {
  let l = null,
    p = 0;
  if (0 === p) {
    if (!t || 'object' != typeof t || Array.isArray(t))
      return (i.errors = [{ params: { type: 'object' } }]), !1;
    {
      let r;
      if (void 0 === t.import && (r = 'import'))
        return (i.errors = [{ params: { missingProperty: r } }]), !1;
      {
        const r = p;
        for (const e in t)
          if ('import' !== e && 'name' !== e)
            return (i.errors = [{ params: { additionalProperty: e } }]), !1;
        if (r === p) {
          if (void 0 !== t.import) {
            let r = t.import;
            const o = p,
              u = p;
            let c = !1;
            const y = p;
            if (p == p)
              if ('string' == typeof r) {
                if (n(r) < 1) {
                  const t = { params: { limit: 1 } };
                  null === l ? (l = [t]) : l.push(t), p++;
                }
              } else {
                const t = { params: { type: 'string' } };
                null === l ? (l = [t]) : l.push(t), p++;
              }
            var m = y === p;
            if (((c = c || m), !c)) {
              const n = p;
              s(r, {
                instancePath: e + '/import',
                parentData: t,
                parentDataProperty: 'import',
                rootData: a,
              }) ||
                ((l = null === l ? s.errors : l.concat(s.errors)),
                (p = l.length)),
                (m = n === p),
                (c = c || m);
            }
            if (!c) {
              const t = { params: {} };
              return (
                null === l ? (l = [t]) : l.push(t), p++, (i.errors = l), !1
              );
            }
            (p = u), null !== l && (u ? (l.length = u) : (l = null));
            var f = o === p;
          } else f = !0;
          if (f)
            if (void 0 !== t.name) {
              const e = p;
              if ('string' != typeof t.name)
                return (i.errors = [{ params: { type: 'string' } }]), !1;
              f = e === p;
            } else f = !0;
        }
      }
    }
  }
  return (i.errors = l), 0 === p;
}
function o(
  t,
  {
    instancePath: e = '',
    parentData: r,
    parentDataProperty: a,
    rootData: l = t,
  } = {},
) {
  let p = null,
    m = 0;
  if (0 === m) {
    if (!t || 'object' != typeof t || Array.isArray(t))
      return (o.errors = [{ params: { type: 'object' } }]), !1;
    for (const r in t) {
      let a = t[r];
      const u = m,
        c = m;
      let y = !1;
      const d = m;
      i(a, {
        instancePath: e + '/' + r.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: t,
        parentDataProperty: r,
        rootData: l,
      }) || ((p = null === p ? i.errors : p.concat(i.errors)), (m = p.length));
      var f = d === m;
      if (((y = y || f), !y)) {
        const i = m;
        if (m == m)
          if ('string' == typeof a) {
            if (n(a) < 1) {
              const t = { params: { limit: 1 } };
              null === p ? (p = [t]) : p.push(t), m++;
            }
          } else {
            const t = { params: { type: 'string' } };
            null === p ? (p = [t]) : p.push(t), m++;
          }
        if (((f = i === m), (y = y || f), !y)) {
          const n = m;
          s(a, {
            instancePath: e + '/' + r.replace(/~/g, '~0').replace(/\//g, '~1'),
            parentData: t,
            parentDataProperty: r,
            rootData: l,
          }) ||
            ((p = null === p ? s.errors : p.concat(s.errors)), (m = p.length)),
            (f = n === m),
            (y = y || f);
        }
      }
      if (!y) {
        const t = { params: {} };
        return null === p ? (p = [t]) : p.push(t), m++, (o.errors = p), !1;
      }
      if (((m = c), null !== p && (c ? (p.length = c) : (p = null)), u !== m))
        break;
    }
  }
  return (o.errors = p), 0 === m;
}
function a(
  t,
  {
    instancePath: e = '',
    parentData: r,
    parentDataProperty: s,
    rootData: i = t,
  } = {},
) {
  let l = null,
    p = 0;
  const m = p;
  let f = !1;
  const u = p;
  if (p === u)
    if (Array.isArray(t)) {
      const r = t.length;
      for (let s = 0; s < r; s++) {
        let r = t[s];
        const a = p,
          m = p;
        let f = !1;
        const u = p;
        if (p == p)
          if ('string' == typeof r) {
            if (n(r) < 1) {
              const t = { params: { limit: 1 } };
              null === l ? (l = [t]) : l.push(t), p++;
            }
          } else {
            const t = { params: { type: 'string' } };
            null === l ? (l = [t]) : l.push(t), p++;
          }
        var c = u === p;
        if (((f = f || c), !f)) {
          const n = p;
          o(r, {
            instancePath: e + '/' + s,
            parentData: t,
            parentDataProperty: s,
            rootData: i,
          }) ||
            ((l = null === l ? o.errors : l.concat(o.errors)), (p = l.length)),
            (c = n === p),
            (f = f || c);
        }
        if (f) (p = m), null !== l && (m ? (l.length = m) : (l = null));
        else {
          const t = { params: {} };
          null === l ? (l = [t]) : l.push(t), p++;
        }
        if (a !== p) break;
      }
    } else {
      const t = { params: { type: 'array' } };
      null === l ? (l = [t]) : l.push(t), p++;
    }
  var y = u === p;
  if (((f = f || y), !f)) {
    const n = p;
    o(t, {
      instancePath: e,
      parentData: r,
      parentDataProperty: s,
      rootData: i,
    }) || ((l = null === l ? o.errors : l.concat(o.errors)), (p = l.length)),
      (y = n === p),
      (f = f || y);
  }
  if (!f) {
    const t = { params: {} };
    return null === l ? (l = [t]) : l.push(t), p++, (a.errors = l), !1;
  }
  return (
    (p = m),
    null !== l && (m ? (l.length = m) : (l = null)),
    (a.errors = l),
    0 === p
  );
}
const l = {
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
  let i = null,
    o = 0;
  const a = o;
  let l = !1;
  const m = o;
  if ('string' != typeof t) {
    const t = { params: { type: 'string' } };
    null === i ? (i = [t]) : i.push(t), o++;
  }
  var f = m === o;
  if (((l = l || f), !l)) {
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
            null === i ? (i = [t]) : i.push(t), o++;
            break;
          }
        if (e === o) {
          if (void 0 !== t.amd) {
            const e = o;
            if ('string' != typeof t.amd) {
              const t = { params: { type: 'string' } };
              null === i ? (i = [t]) : i.push(t), o++;
            }
            var u = e === o;
          } else u = !0;
          if (u) {
            if (void 0 !== t.commonjs) {
              const e = o;
              if ('string' != typeof t.commonjs) {
                const t = { params: { type: 'string' } };
                null === i ? (i = [t]) : i.push(t), o++;
              }
              u = e === o;
            } else u = !0;
            if (u) {
              if (void 0 !== t.commonjs2) {
                const e = o;
                if ('string' != typeof t.commonjs2) {
                  const t = { params: { type: 'string' } };
                  null === i ? (i = [t]) : i.push(t), o++;
                }
                u = e === o;
              } else u = !0;
              if (u)
                if (void 0 !== t.root) {
                  const e = o;
                  if ('string' != typeof t.root) {
                    const t = { params: { type: 'string' } };
                    null === i ? (i = [t]) : i.push(t), o++;
                  }
                  u = e === o;
                } else u = !0;
            }
          }
        }
      } else {
        const t = { params: { type: 'object' } };
        null === i ? (i = [t]) : i.push(t), o++;
      }
    (f = e === o), (l = l || f);
  }
  if (!l) {
    const t = { params: {} };
    return null === i ? (i = [t]) : i.push(t), o++, (p.errors = i), !1;
  }
  return (
    (o = a),
    null !== i && (a ? (i.length = a) : (i = null)),
    (p.errors = i),
    0 === o
  );
}
function m(
  t,
  {
    instancePath: e = '',
    parentData: r,
    parentDataProperty: s,
    rootData: i = t,
  } = {},
) {
  let o = null,
    a = 0;
  const l = a;
  let p = !1;
  const f = a;
  if (a === f)
    if (Array.isArray(t))
      if (t.length < 1) {
        const t = { params: { limit: 1 } };
        null === o ? (o = [t]) : o.push(t), a++;
      } else {
        const e = t.length;
        for (let r = 0; r < e; r++) {
          let e = t[r];
          const s = a;
          if (a === s)
            if ('string' == typeof e) {
              if (n(e) < 1) {
                const t = { params: { limit: 1 } };
                null === o ? (o = [t]) : o.push(t), a++;
              }
            } else {
              const t = { params: { type: 'string' } };
              null === o ? (o = [t]) : o.push(t), a++;
            }
          if (s !== a) break;
        }
      }
    else {
      const t = { params: { type: 'array' } };
      null === o ? (o = [t]) : o.push(t), a++;
    }
  var u = f === a;
  if (((p = p || u), !p)) {
    const e = a;
    if (a === e)
      if ('string' == typeof t) {
        if (n(t) < 1) {
          const t = { params: { limit: 1 } };
          null === o ? (o = [t]) : o.push(t), a++;
        }
      } else {
        const t = { params: { type: 'string' } };
        null === o ? (o = [t]) : o.push(t), a++;
      }
    if (((u = e === a), (p = p || u), !p)) {
      const e = a;
      if (a == a)
        if (t && 'object' == typeof t && !Array.isArray(t)) {
          const e = a;
          for (const e in t)
            if ('amd' !== e && 'commonjs' !== e && 'root' !== e) {
              const t = { params: { additionalProperty: e } };
              null === o ? (o = [t]) : o.push(t), a++;
              break;
            }
          if (e === a) {
            if (void 0 !== t.amd) {
              let e = t.amd;
              const r = a;
              if (a === r)
                if ('string' == typeof e) {
                  if (n(e) < 1) {
                    const t = { params: { limit: 1 } };
                    null === o ? (o = [t]) : o.push(t), a++;
                  }
                } else {
                  const t = { params: { type: 'string' } };
                  null === o ? (o = [t]) : o.push(t), a++;
                }
              var c = r === a;
            } else c = !0;
            if (c) {
              if (void 0 !== t.commonjs) {
                let e = t.commonjs;
                const r = a;
                if (a === r)
                  if ('string' == typeof e) {
                    if (n(e) < 1) {
                      const t = { params: { limit: 1 } };
                      null === o ? (o = [t]) : o.push(t), a++;
                    }
                  } else {
                    const t = { params: { type: 'string' } };
                    null === o ? (o = [t]) : o.push(t), a++;
                  }
                c = r === a;
              } else c = !0;
              if (c)
                if (void 0 !== t.root) {
                  let e = t.root;
                  const r = a,
                    s = a;
                  let i = !1;
                  const l = a;
                  if (a === l)
                    if (Array.isArray(e)) {
                      const t = e.length;
                      for (let r = 0; r < t; r++) {
                        let t = e[r];
                        const s = a;
                        if (a === s)
                          if ('string' == typeof t) {
                            if (n(t) < 1) {
                              const t = { params: { limit: 1 } };
                              null === o ? (o = [t]) : o.push(t), a++;
                            }
                          } else {
                            const t = { params: { type: 'string' } };
                            null === o ? (o = [t]) : o.push(t), a++;
                          }
                        if (s !== a) break;
                      }
                    } else {
                      const t = { params: { type: 'array' } };
                      null === o ? (o = [t]) : o.push(t), a++;
                    }
                  var y = l === a;
                  if (((i = i || y), !i)) {
                    const t = a;
                    if (a === t)
                      if ('string' == typeof e) {
                        if (n(e) < 1) {
                          const t = { params: { limit: 1 } };
                          null === o ? (o = [t]) : o.push(t), a++;
                        }
                      } else {
                        const t = { params: { type: 'string' } };
                        null === o ? (o = [t]) : o.push(t), a++;
                      }
                    (y = t === a), (i = i || y);
                  }
                  if (i)
                    (a = s), null !== o && (s ? (o.length = s) : (o = null));
                  else {
                    const t = { params: {} };
                    null === o ? (o = [t]) : o.push(t), a++;
                  }
                  c = r === a;
                } else c = !0;
            }
          }
        } else {
          const t = { params: { type: 'object' } };
          null === o ? (o = [t]) : o.push(t), a++;
        }
      (u = e === a), (p = p || u);
    }
  }
  if (!p) {
    const t = { params: {} };
    return null === o ? (o = [t]) : o.push(t), a++, (m.errors = o), !1;
  }
  return (
    (a = l),
    null !== o && (l ? (o.length = l) : (o = null)),
    (m.errors = o),
    0 === a
  );
}
function f(
  t,
  {
    instancePath: e = '',
    parentData: r,
    parentDataProperty: s,
    rootData: i = t,
  } = {},
) {
  let o = null,
    a = 0;
  if (0 === a) {
    if (!t || 'object' != typeof t || Array.isArray(t))
      return (f.errors = [{ params: { type: 'object' } }]), !1;
    {
      let r;
      if (void 0 === t.type && (r = 'type'))
        return (f.errors = [{ params: { missingProperty: r } }]), !1;
      {
        const r = a;
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
        if (r === a) {
          if (void 0 !== t.amdContainer) {
            let e = t.amdContainer;
            const r = a;
            if (a == a) {
              if ('string' != typeof e)
                return (f.errors = [{ params: { type: 'string' } }]), !1;
              if (n(e) < 1) return (f.errors = [{ params: { limit: 1 } }]), !1;
            }
            var u = r === a;
          } else u = !0;
          if (u) {
            if (void 0 !== t.auxiliaryComment) {
              const r = a;
              p(t.auxiliaryComment, {
                instancePath: e + '/auxiliaryComment',
                parentData: t,
                parentDataProperty: 'auxiliaryComment',
                rootData: i,
              }) ||
                ((o = null === o ? p.errors : o.concat(p.errors)),
                (a = o.length)),
                (u = r === a);
            } else u = !0;
            if (u) {
              if (void 0 !== t.export) {
                let e = t.export;
                const r = a,
                  s = a;
                let i = !1;
                const l = a;
                if (a === l)
                  if (Array.isArray(e)) {
                    const t = e.length;
                    for (let r = 0; r < t; r++) {
                      let t = e[r];
                      const s = a;
                      if (a === s)
                        if ('string' == typeof t) {
                          if (n(t) < 1) {
                            const t = { params: { limit: 1 } };
                            null === o ? (o = [t]) : o.push(t), a++;
                          }
                        } else {
                          const t = { params: { type: 'string' } };
                          null === o ? (o = [t]) : o.push(t), a++;
                        }
                      if (s !== a) break;
                    }
                  } else {
                    const t = { params: { type: 'array' } };
                    null === o ? (o = [t]) : o.push(t), a++;
                  }
                var c = l === a;
                if (((i = i || c), !i)) {
                  const t = a;
                  if (a === t)
                    if ('string' == typeof e) {
                      if (n(e) < 1) {
                        const t = { params: { limit: 1 } };
                        null === o ? (o = [t]) : o.push(t), a++;
                      }
                    } else {
                      const t = { params: { type: 'string' } };
                      null === o ? (o = [t]) : o.push(t), a++;
                    }
                  (c = t === a), (i = i || c);
                }
                if (!i) {
                  const t = { params: {} };
                  return (
                    null === o ? (o = [t]) : o.push(t), a++, (f.errors = o), !1
                  );
                }
                (a = s),
                  null !== o && (s ? (o.length = s) : (o = null)),
                  (u = r === a);
              } else u = !0;
              if (u) {
                if (void 0 !== t.name) {
                  const r = a;
                  m(t.name, {
                    instancePath: e + '/name',
                    parentData: t,
                    parentDataProperty: 'name',
                    rootData: i,
                  }) ||
                    ((o = null === o ? m.errors : o.concat(m.errors)),
                    (a = o.length)),
                    (u = r === a);
                } else u = !0;
                if (u) {
                  if (void 0 !== t.type) {
                    let e = t.type;
                    const r = a,
                      n = a;
                    let s = !1;
                    const i = a;
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
                      const t = { params: { allowedValues: l.anyOf[0].enum } };
                      null === o ? (o = [t]) : o.push(t), a++;
                    }
                    var y = i === a;
                    if (((s = s || y), !s)) {
                      const t = a;
                      if ('string' != typeof e) {
                        const t = { params: { type: 'string' } };
                        null === o ? (o = [t]) : o.push(t), a++;
                      }
                      (y = t === a), (s = s || y);
                    }
                    if (!s) {
                      const t = { params: {} };
                      return (
                        null === o ? (o = [t]) : o.push(t),
                        a++,
                        (f.errors = o),
                        !1
                      );
                    }
                    (a = n),
                      null !== o && (n ? (o.length = n) : (o = null)),
                      (u = r === a);
                  } else u = !0;
                  if (u)
                    if (void 0 !== t.umdNamedDefine) {
                      const e = a;
                      if ('boolean' != typeof t.umdNamedDefine)
                        return (
                          (f.errors = [{ params: { type: 'boolean' } }]), !1
                        );
                      u = e === a;
                    } else u = !0;
                }
              }
            }
          }
        }
      }
    }
  }
  return (f.errors = o), 0 === a;
}
function u(
  s,
  {
    instancePath: i = '',
    parentData: o,
    parentDataProperty: l,
    rootData: p = s,
  } = {},
) {
  let m = null,
    c = 0;
  if (0 === c) {
    if (!s || 'object' != typeof s || Array.isArray(s))
      return (u.errors = [{ params: { type: 'object' } }]), !1;
    {
      let o;
      if (
        (void 0 === s.name && (o = 'name')) ||
        (void 0 === s.exposes && (o = 'exposes'))
      )
        return (u.errors = [{ params: { missingProperty: o } }]), !1;
      {
        const o = c;
        for (const t in s)
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
            return (u.errors = [{ params: { additionalProperty: t } }]), !1;
        if (o === c) {
          if (void 0 !== s.exposes) {
            const t = c;
            a(s.exposes, {
              instancePath: i + '/exposes',
              parentData: s,
              parentDataProperty: 'exposes',
              rootData: p,
            }) ||
              ((m = null === m ? a.errors : m.concat(a.errors)),
              (c = m.length));
            var y = t === c;
          } else y = !0;
          if (y) {
            if (void 0 !== s.filename) {
              let e = s.filename;
              const r = c;
              if (c === r) {
                if ('string' != typeof e)
                  return (u.errors = [{ params: { type: 'string' } }]), !1;
                if (n(e) < 1)
                  return (u.errors = [{ params: { limit: 1 } }]), !1;
                if (e.includes('!') || !1 !== t.test(e))
                  return (u.errors = [{ params: {} }]), !1;
              }
              y = r === c;
            } else y = !0;
            if (y) {
              if (void 0 !== s.library) {
                const t = c;
                f(s.library, {
                  instancePath: i + '/library',
                  parentData: s,
                  parentDataProperty: 'library',
                  rootData: p,
                }) ||
                  ((m = null === m ? f.errors : m.concat(f.errors)),
                  (c = m.length)),
                  (y = t === c);
              } else y = !0;
              if (y) {
                if (void 0 !== s.name) {
                  let t = s.name;
                  const e = c;
                  if (c === e) {
                    if ('string' != typeof t)
                      return (u.errors = [{ params: { type: 'string' } }]), !1;
                    if (n(t) < 1)
                      return (u.errors = [{ params: { limit: 1 } }]), !1;
                  }
                  y = e === c;
                } else y = !0;
                if (y) {
                  if (void 0 !== s.runtime) {
                    let t = s.runtime;
                    const e = c,
                      i = c;
                    let o = !1;
                    const a = c;
                    if (!1 !== t) {
                      const t = { params: { allowedValues: r.anyOf[0].enum } };
                      null === m ? (m = [t]) : m.push(t), c++;
                    }
                    var d = a === c;
                    if (((o = o || d), !o)) {
                      const e = c;
                      if (c === e)
                        if ('string' == typeof t) {
                          if (n(t) < 1) {
                            const t = { params: { limit: 1 } };
                            null === m ? (m = [t]) : m.push(t), c++;
                          }
                        } else {
                          const t = { params: { type: 'string' } };
                          null === m ? (m = [t]) : m.push(t), c++;
                        }
                      (d = e === c), (o = o || d);
                    }
                    if (!o) {
                      const t = { params: {} };
                      return (
                        null === m ? (m = [t]) : m.push(t),
                        c++,
                        (u.errors = m),
                        !1
                      );
                    }
                    (c = i),
                      null !== m && (i ? (m.length = i) : (m = null)),
                      (y = e === c);
                  } else y = !0;
                  if (y) {
                    if (void 0 !== s.runtimePlugins) {
                      let t = s.runtimePlugins;
                      const e = c;
                      if (c == c) {
                        if (!Array.isArray(t))
                          return (
                            (u.errors = [{ params: { type: 'array' } }]), !1
                          );
                        {
                          const e = t.length;
                          for (let r = 0; r < e; r++) {
                            const e = c;
                            if ('string' != typeof t[r])
                              return (
                                (u.errors = [{ params: { type: 'string' } }]),
                                !1
                              );
                            if (e !== c) break;
                          }
                        }
                      }
                      y = e === c;
                    } else y = !0;
                    if (y) {
                      if (void 0 !== s.shareScope) {
                        let t = s.shareScope;
                        const e = c;
                        if (c === e) {
                          if ('string' != typeof t)
                            return (
                              (u.errors = [{ params: { type: 'string' } }]), !1
                            );
                          if (n(t) < 1)
                            return (u.errors = [{ params: { limit: 1 } }]), !1;
                        }
                        y = e === c;
                      } else y = !0;
                      if (y)
                        if (void 0 !== s.experiments) {
                          let t = s.experiments;
                          const r = c;
                          if (c === r) {
                            if (!t || 'object' != typeof t || Array.isArray(t))
                              return (
                                (u.errors = [{ params: { type: 'object' } }]),
                                !1
                              );
                            {
                              const r = c;
                              for (const e in t)
                                if (
                                  'federationRuntime' !== e &&
                                  'externalRuntime' !== e
                                )
                                  return (
                                    (u.errors = [
                                      { params: { additionalProperty: e } },
                                    ]),
                                    !1
                                  );
                              if (r === c) {
                                if (void 0 !== t.federationRuntime) {
                                  let r = t.federationRuntime;
                                  const n = c,
                                    s = c;
                                  let i = !1;
                                  const o = c;
                                  if ('boolean' != typeof r) {
                                    const t = { params: { type: 'boolean' } };
                                    null === m ? (m = [t]) : m.push(t), c++;
                                  }
                                  var g = o === c;
                                  if (((i = i || g), !i)) {
                                    const t = c;
                                    if ('hoisted' !== r) {
                                      const t = {
                                        params: {
                                          allowedValues:
                                            e.properties.experiments.properties
                                              .federationRuntime.anyOf[1].enum,
                                        },
                                      };
                                      null === m ? (m = [t]) : m.push(t), c++;
                                    }
                                    (g = t === c), (i = i || g);
                                  }
                                  if (!i) {
                                    const t = { params: {} };
                                    return (
                                      null === m ? (m = [t]) : m.push(t),
                                      c++,
                                      (u.errors = m),
                                      !1
                                    );
                                  }
                                  (c = s),
                                    null !== m &&
                                      (s ? (m.length = s) : (m = null));
                                  var h = n === c;
                                } else h = !0;
                                if (h)
                                  if (void 0 !== t.externalRuntime) {
                                    let r = t.externalRuntime;
                                    const n = c,
                                      s = c;
                                    let i = !1;
                                    const o = c;
                                    if ('boolean' != typeof r) {
                                      const t = { params: { type: 'boolean' } };
                                      null === m ? (m = [t]) : m.push(t), c++;
                                    }
                                    var b = o === c;
                                    if (((i = i || b), !i)) {
                                      const t = c;
                                      if ('provide' !== r) {
                                        const t = {
                                          params: {
                                            allowedValues:
                                              e.properties.experiments
                                                .properties.externalRuntime
                                                .anyOf[1].enum,
                                          },
                                        };
                                        null === m ? (m = [t]) : m.push(t), c++;
                                      }
                                      (b = t === c), (i = i || b);
                                    }
                                    if (!i) {
                                      const t = { params: {} };
                                      return (
                                        null === m ? (m = [t]) : m.push(t),
                                        c++,
                                        (u.errors = m),
                                        !1
                                      );
                                    }
                                    (c = s),
                                      null !== m &&
                                        (s ? (m.length = s) : (m = null)),
                                      (h = n === c);
                                  } else h = !0;
                              }
                            }
                          }
                          y = r === c;
                        } else y = !0;
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
  return (u.errors = m), 0 === c;
}
