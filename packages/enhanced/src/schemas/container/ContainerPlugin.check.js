/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 */
'use strict';
(module.exports = f), (module.exports.default = f);
const t = {
    definitions: {
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
      experiments: {
        type: 'object',
        additionalProperties: !1,
        properties: {
          asyncStartup: { type: 'boolean' },
          externalRuntime: {
            anyOf: [{ enum: ['provide'] }, { type: 'boolean' }],
          },
        },
      },
      exposes: { $ref: '#/definitions/Exposes' },
      filename: { type: 'string', minLength: 1 },
      library: { $ref: '#/definitions/LibraryOptions' },
      name: { type: 'string', minLength: 1 },
      runtime: { $ref: '#/definitions/EntryRuntime' },
      runtimePlugins: { type: 'array', items: { type: 'string' } },
      shareScope: { type: 'string', minLength: 1 },
    },
    required: ['name', 'exposes'],
  },
  r = { anyOf: [{ enum: [!1] }, { type: 'string', minLength: 1 }] },
  e = require('ajv/dist/runtime/ucs2length').default;
function n(
  t,
  {
    instancePath: r = '',
    parentData: s,
    parentDataProperty: i,
    rootData: a = t,
  } = {},
) {
  if (!Array.isArray(t))
    return (n.errors = [{ params: { type: 'array' } }]), !1;
  {
    const r = t.length;
    for (let s = 0; s < r; s++) {
      let r = t[s];
      const i = 0;
      if ('string' != typeof r)
        return (n.errors = [{ params: { type: 'string' } }]), !1;
      if (e(r) < 1) return (n.errors = [{ params: { limit: 1 } }]), !1;
      if (0 !== i) break;
    }
  }
  return (n.errors = null), !0;
}
function s(
  t,
  {
    instancePath: r = '',
    parentData: i,
    parentDataProperty: a,
    rootData: o = t,
  } = {},
) {
  let p = null,
    l = 0;
  if (0 === l) {
    if (!t || 'object' != typeof t || Array.isArray(t))
      return (s.errors = [{ params: { type: 'object' } }]), !1;
    {
      let i;
      if (void 0 === t.import && (i = 'import'))
        return (s.errors = [{ params: { missingProperty: i } }]), !1;
      {
        const i = l;
        for (const r in t)
          if ('import' !== r && 'name' !== r)
            return (s.errors = [{ params: { additionalProperty: r } }]), !1;
        if (i === l) {
          if (void 0 !== t.import) {
            let i = t.import;
            const a = l,
              u = l;
            let c = !1;
            const y = l;
            if (l == l)
              if ('string' == typeof i) {
                if (e(i) < 1) {
                  const t = { params: { limit: 1 } };
                  null === p ? (p = [t]) : p.push(t), l++;
                }
              } else {
                const t = { params: { type: 'string' } };
                null === p ? (p = [t]) : p.push(t), l++;
              }
            var m = y === l;
            if (((c = c || m), !c)) {
              const e = l;
              n(i, {
                instancePath: r + '/import',
                parentData: t,
                parentDataProperty: 'import',
                rootData: o,
              }) ||
                ((p = null === p ? n.errors : p.concat(n.errors)),
                (l = p.length)),
                (m = e === l),
                (c = c || m);
            }
            if (!c) {
              const t = { params: {} };
              return (
                null === p ? (p = [t]) : p.push(t), l++, (s.errors = p), !1
              );
            }
            (l = u), null !== p && (u ? (p.length = u) : (p = null));
            var f = a === l;
          } else f = !0;
          if (f)
            if (void 0 !== t.name) {
              const r = l;
              if ('string' != typeof t.name)
                return (s.errors = [{ params: { type: 'string' } }]), !1;
              f = r === l;
            } else f = !0;
        }
      }
    }
  }
  return (s.errors = p), 0 === l;
}
function i(
  t,
  {
    instancePath: r = '',
    parentData: a,
    parentDataProperty: o,
    rootData: p = t,
  } = {},
) {
  let l = null,
    m = 0;
  if (0 === m) {
    if (!t || 'object' != typeof t || Array.isArray(t))
      return (i.errors = [{ params: { type: 'object' } }]), !1;
    for (const a in t) {
      let o = t[a];
      const u = m,
        c = m;
      let y = !1;
      const d = m;
      s(o, {
        instancePath: r + '/' + a.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: t,
        parentDataProperty: a,
        rootData: p,
      }) || ((l = null === l ? s.errors : l.concat(s.errors)), (m = l.length));
      var f = d === m;
      if (((y = y || f), !y)) {
        const s = m;
        if (m == m)
          if ('string' == typeof o) {
            if (e(o) < 1) {
              const t = { params: { limit: 1 } };
              null === l ? (l = [t]) : l.push(t), m++;
            }
          } else {
            const t = { params: { type: 'string' } };
            null === l ? (l = [t]) : l.push(t), m++;
          }
        if (((f = s === m), (y = y || f), !y)) {
          const e = m;
          n(o, {
            instancePath: r + '/' + a.replace(/~/g, '~0').replace(/\//g, '~1'),
            parentData: t,
            parentDataProperty: a,
            rootData: p,
          }) ||
            ((l = null === l ? n.errors : l.concat(n.errors)), (m = l.length)),
            (f = e === m),
            (y = y || f);
        }
      }
      if (!y) {
        const t = { params: {} };
        return null === l ? (l = [t]) : l.push(t), m++, (i.errors = l), !1;
      }
      if (((m = c), null !== l && (c ? (l.length = c) : (l = null)), u !== m))
        break;
    }
  }
  return (i.errors = l), 0 === m;
}
function a(
  t,
  {
    instancePath: r = '',
    parentData: n,
    parentDataProperty: s,
    rootData: o = t,
  } = {},
) {
  let p = null,
    l = 0;
  const m = l;
  let f = !1;
  const u = l;
  if (l === u)
    if (Array.isArray(t)) {
      const n = t.length;
      for (let s = 0; s < n; s++) {
        let n = t[s];
        const a = l,
          m = l;
        let f = !1;
        const u = l;
        if (l == l)
          if ('string' == typeof n) {
            if (e(n) < 1) {
              const t = { params: { limit: 1 } };
              null === p ? (p = [t]) : p.push(t), l++;
            }
          } else {
            const t = { params: { type: 'string' } };
            null === p ? (p = [t]) : p.push(t), l++;
          }
        var c = u === l;
        if (((f = f || c), !f)) {
          const e = l;
          i(n, {
            instancePath: r + '/' + s,
            parentData: t,
            parentDataProperty: s,
            rootData: o,
          }) ||
            ((p = null === p ? i.errors : p.concat(i.errors)), (l = p.length)),
            (c = e === l),
            (f = f || c);
        }
        if (f) (l = m), null !== p && (m ? (p.length = m) : (p = null));
        else {
          const t = { params: {} };
          null === p ? (p = [t]) : p.push(t), l++;
        }
        if (a !== l) break;
      }
    } else {
      const t = { params: { type: 'array' } };
      null === p ? (p = [t]) : p.push(t), l++;
    }
  var y = u === l;
  if (((f = f || y), !f)) {
    const e = l;
    i(t, {
      instancePath: r,
      parentData: n,
      parentDataProperty: s,
      rootData: o,
    }) || ((p = null === p ? i.errors : p.concat(i.errors)), (l = p.length)),
      (y = e === l),
      (f = f || y);
  }
  if (!f) {
    const t = { params: {} };
    return null === p ? (p = [t]) : p.push(t), l++, (a.errors = p), !1;
  }
  return (
    (l = m),
    null !== p && (m ? (p.length = m) : (p = null)),
    (a.errors = p),
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
function p(
  t,
  {
    instancePath: r = '',
    parentData: e,
    parentDataProperty: n,
    rootData: s = t,
  } = {},
) {
  let i = null,
    a = 0;
  const o = a;
  let l = !1;
  const m = a;
  if ('string' != typeof t) {
    const t = { params: { type: 'string' } };
    null === i ? (i = [t]) : i.push(t), a++;
  }
  var f = m === a;
  if (((l = l || f), !l)) {
    const r = a;
    if (a == a)
      if (t && 'object' == typeof t && !Array.isArray(t)) {
        const r = a;
        for (const r in t)
          if (
            'amd' !== r &&
            'commonjs' !== r &&
            'commonjs2' !== r &&
            'root' !== r
          ) {
            const t = { params: { additionalProperty: r } };
            null === i ? (i = [t]) : i.push(t), a++;
            break;
          }
        if (r === a) {
          if (void 0 !== t.amd) {
            const r = a;
            if ('string' != typeof t.amd) {
              const t = { params: { type: 'string' } };
              null === i ? (i = [t]) : i.push(t), a++;
            }
            var u = r === a;
          } else u = !0;
          if (u) {
            if (void 0 !== t.commonjs) {
              const r = a;
              if ('string' != typeof t.commonjs) {
                const t = { params: { type: 'string' } };
                null === i ? (i = [t]) : i.push(t), a++;
              }
              u = r === a;
            } else u = !0;
            if (u) {
              if (void 0 !== t.commonjs2) {
                const r = a;
                if ('string' != typeof t.commonjs2) {
                  const t = { params: { type: 'string' } };
                  null === i ? (i = [t]) : i.push(t), a++;
                }
                u = r === a;
              } else u = !0;
              if (u)
                if (void 0 !== t.root) {
                  const r = a;
                  if ('string' != typeof t.root) {
                    const t = { params: { type: 'string' } };
                    null === i ? (i = [t]) : i.push(t), a++;
                  }
                  u = r === a;
                } else u = !0;
            }
          }
        }
      } else {
        const t = { params: { type: 'object' } };
        null === i ? (i = [t]) : i.push(t), a++;
      }
    (f = r === a), (l = l || f);
  }
  if (!l) {
    const t = { params: {} };
    return null === i ? (i = [t]) : i.push(t), a++, (p.errors = i), !1;
  }
  return (
    (a = o),
    null !== i && (o ? (i.length = o) : (i = null)),
    (p.errors = i),
    0 === a
  );
}
function l(
  t,
  {
    instancePath: r = '',
    parentData: n,
    parentDataProperty: s,
    rootData: i = t,
  } = {},
) {
  let a = null,
    o = 0;
  const p = o;
  let m = !1;
  const f = o;
  if (o === f)
    if (Array.isArray(t))
      if (t.length < 1) {
        const t = { params: { limit: 1 } };
        null === a ? (a = [t]) : a.push(t), o++;
      } else {
        const r = t.length;
        for (let n = 0; n < r; n++) {
          let r = t[n];
          const s = o;
          if (o === s)
            if ('string' == typeof r) {
              if (e(r) < 1) {
                const t = { params: { limit: 1 } };
                null === a ? (a = [t]) : a.push(t), o++;
              }
            } else {
              const t = { params: { type: 'string' } };
              null === a ? (a = [t]) : a.push(t), o++;
            }
          if (s !== o) break;
        }
      }
    else {
      const t = { params: { type: 'array' } };
      null === a ? (a = [t]) : a.push(t), o++;
    }
  var u = f === o;
  if (((m = m || u), !m)) {
    const r = o;
    if (o === r)
      if ('string' == typeof t) {
        if (e(t) < 1) {
          const t = { params: { limit: 1 } };
          null === a ? (a = [t]) : a.push(t), o++;
        }
      } else {
        const t = { params: { type: 'string' } };
        null === a ? (a = [t]) : a.push(t), o++;
      }
    if (((u = r === o), (m = m || u), !m)) {
      const r = o;
      if (o == o)
        if (t && 'object' == typeof t && !Array.isArray(t)) {
          const r = o;
          for (const r in t)
            if ('amd' !== r && 'commonjs' !== r && 'root' !== r) {
              const t = { params: { additionalProperty: r } };
              null === a ? (a = [t]) : a.push(t), o++;
              break;
            }
          if (r === o) {
            if (void 0 !== t.amd) {
              let r = t.amd;
              const n = o;
              if (o === n)
                if ('string' == typeof r) {
                  if (e(r) < 1) {
                    const t = { params: { limit: 1 } };
                    null === a ? (a = [t]) : a.push(t), o++;
                  }
                } else {
                  const t = { params: { type: 'string' } };
                  null === a ? (a = [t]) : a.push(t), o++;
                }
              var c = n === o;
            } else c = !0;
            if (c) {
              if (void 0 !== t.commonjs) {
                let r = t.commonjs;
                const n = o;
                if (o === n)
                  if ('string' == typeof r) {
                    if (e(r) < 1) {
                      const t = { params: { limit: 1 } };
                      null === a ? (a = [t]) : a.push(t), o++;
                    }
                  } else {
                    const t = { params: { type: 'string' } };
                    null === a ? (a = [t]) : a.push(t), o++;
                  }
                c = n === o;
              } else c = !0;
              if (c)
                if (void 0 !== t.root) {
                  let r = t.root;
                  const n = o,
                    s = o;
                  let i = !1;
                  const p = o;
                  if (o === p)
                    if (Array.isArray(r)) {
                      const t = r.length;
                      for (let n = 0; n < t; n++) {
                        let t = r[n];
                        const s = o;
                        if (o === s)
                          if ('string' == typeof t) {
                            if (e(t) < 1) {
                              const t = { params: { limit: 1 } };
                              null === a ? (a = [t]) : a.push(t), o++;
                            }
                          } else {
                            const t = { params: { type: 'string' } };
                            null === a ? (a = [t]) : a.push(t), o++;
                          }
                        if (s !== o) break;
                      }
                    } else {
                      const t = { params: { type: 'array' } };
                      null === a ? (a = [t]) : a.push(t), o++;
                    }
                  var y = p === o;
                  if (((i = i || y), !i)) {
                    const t = o;
                    if (o === t)
                      if ('string' == typeof r) {
                        if (e(r) < 1) {
                          const t = { params: { limit: 1 } };
                          null === a ? (a = [t]) : a.push(t), o++;
                        }
                      } else {
                        const t = { params: { type: 'string' } };
                        null === a ? (a = [t]) : a.push(t), o++;
                      }
                    (y = t === o), (i = i || y);
                  }
                  if (i)
                    (o = s), null !== a && (s ? (a.length = s) : (a = null));
                  else {
                    const t = { params: {} };
                    null === a ? (a = [t]) : a.push(t), o++;
                  }
                  c = n === o;
                } else c = !0;
            }
          }
        } else {
          const t = { params: { type: 'object' } };
          null === a ? (a = [t]) : a.push(t), o++;
        }
      (u = r === o), (m = m || u);
    }
  }
  if (!m) {
    const t = { params: {} };
    return null === a ? (a = [t]) : a.push(t), o++, (l.errors = a), !1;
  }
  return (
    (o = p),
    null !== a && (p ? (a.length = p) : (a = null)),
    (l.errors = a),
    0 === o
  );
}
function m(
  t,
  {
    instancePath: r = '',
    parentData: n,
    parentDataProperty: s,
    rootData: i = t,
  } = {},
) {
  let a = null,
    f = 0;
  if (0 === f) {
    if (!t || 'object' != typeof t || Array.isArray(t))
      return (m.errors = [{ params: { type: 'object' } }]), !1;
    {
      let n;
      if (void 0 === t.type && (n = 'type'))
        return (m.errors = [{ params: { missingProperty: n } }]), !1;
      {
        const n = f;
        for (const r in t)
          if (
            'amdContainer' !== r &&
            'auxiliaryComment' !== r &&
            'export' !== r &&
            'name' !== r &&
            'type' !== r &&
            'umdNamedDefine' !== r
          )
            return (m.errors = [{ params: { additionalProperty: r } }]), !1;
        if (n === f) {
          if (void 0 !== t.amdContainer) {
            let r = t.amdContainer;
            const n = f;
            if (f == f) {
              if ('string' != typeof r)
                return (m.errors = [{ params: { type: 'string' } }]), !1;
              if (e(r) < 1) return (m.errors = [{ params: { limit: 1 } }]), !1;
            }
            var u = n === f;
          } else u = !0;
          if (u) {
            if (void 0 !== t.auxiliaryComment) {
              const e = f;
              p(t.auxiliaryComment, {
                instancePath: r + '/auxiliaryComment',
                parentData: t,
                parentDataProperty: 'auxiliaryComment',
                rootData: i,
              }) ||
                ((a = null === a ? p.errors : a.concat(p.errors)),
                (f = a.length)),
                (u = e === f);
            } else u = !0;
            if (u) {
              if (void 0 !== t.export) {
                let r = t.export;
                const n = f,
                  s = f;
                let i = !1;
                const o = f;
                if (f === o)
                  if (Array.isArray(r)) {
                    const t = r.length;
                    for (let n = 0; n < t; n++) {
                      let t = r[n];
                      const s = f;
                      if (f === s)
                        if ('string' == typeof t) {
                          if (e(t) < 1) {
                            const t = { params: { limit: 1 } };
                            null === a ? (a = [t]) : a.push(t), f++;
                          }
                        } else {
                          const t = { params: { type: 'string' } };
                          null === a ? (a = [t]) : a.push(t), f++;
                        }
                      if (s !== f) break;
                    }
                  } else {
                    const t = { params: { type: 'array' } };
                    null === a ? (a = [t]) : a.push(t), f++;
                  }
                var c = o === f;
                if (((i = i || c), !i)) {
                  const t = f;
                  if (f === t)
                    if ('string' == typeof r) {
                      if (e(r) < 1) {
                        const t = { params: { limit: 1 } };
                        null === a ? (a = [t]) : a.push(t), f++;
                      }
                    } else {
                      const t = { params: { type: 'string' } };
                      null === a ? (a = [t]) : a.push(t), f++;
                    }
                  (c = t === f), (i = i || c);
                }
                if (!i) {
                  const t = { params: {} };
                  return (
                    null === a ? (a = [t]) : a.push(t), f++, (m.errors = a), !1
                  );
                }
                (f = s),
                  null !== a && (s ? (a.length = s) : (a = null)),
                  (u = n === f);
              } else u = !0;
              if (u) {
                if (void 0 !== t.name) {
                  const e = f;
                  l(t.name, {
                    instancePath: r + '/name',
                    parentData: t,
                    parentDataProperty: 'name',
                    rootData: i,
                  }) ||
                    ((a = null === a ? l.errors : a.concat(l.errors)),
                    (f = a.length)),
                    (u = e === f);
                } else u = !0;
                if (u) {
                  if (void 0 !== t.type) {
                    let r = t.type;
                    const e = f,
                      n = f;
                    let s = !1;
                    const i = f;
                    if (
                      'var' !== r &&
                      'module' !== r &&
                      'assign' !== r &&
                      'assign-properties' !== r &&
                      'this' !== r &&
                      'window' !== r &&
                      'self' !== r &&
                      'global' !== r &&
                      'commonjs' !== r &&
                      'commonjs2' !== r &&
                      'commonjs-module' !== r &&
                      'commonjs-static' !== r &&
                      'amd' !== r &&
                      'amd-require' !== r &&
                      'umd' !== r &&
                      'umd2' !== r &&
                      'jsonp' !== r &&
                      'system' !== r
                    ) {
                      const t = { params: { allowedValues: o.anyOf[0].enum } };
                      null === a ? (a = [t]) : a.push(t), f++;
                    }
                    var y = i === f;
                    if (((s = s || y), !s)) {
                      const t = f;
                      if ('string' != typeof r) {
                        const t = { params: { type: 'string' } };
                        null === a ? (a = [t]) : a.push(t), f++;
                      }
                      (y = t === f), (s = s || y);
                    }
                    if (!s) {
                      const t = { params: {} };
                      return (
                        null === a ? (a = [t]) : a.push(t),
                        f++,
                        (m.errors = a),
                        !1
                      );
                    }
                    (f = n),
                      null !== a && (n ? (a.length = n) : (a = null)),
                      (u = e === f);
                  } else u = !0;
                  if (u)
                    if (void 0 !== t.umdNamedDefine) {
                      const r = f;
                      if ('boolean' != typeof t.umdNamedDefine)
                        return (
                          (m.errors = [{ params: { type: 'boolean' } }]), !1
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
  return (m.errors = a), 0 === f;
}
function f(
  n,
  {
    instancePath: s = '',
    parentData: i,
    parentDataProperty: o,
    rootData: p = n,
  } = {},
) {
  let l = null,
    u = 0;
  if (0 === u) {
    if (!n || 'object' != typeof n || Array.isArray(n))
      return (f.errors = [{ params: { type: 'object' } }]), !1;
    {
      let i;
      if (
        (void 0 === n.name && (i = 'name')) ||
        (void 0 === n.exposes && (i = 'exposes'))
      )
        return (f.errors = [{ params: { missingProperty: i } }]), !1;
      {
        const i = u;
        for (const t in n)
          if (
            'experiments' !== t &&
            'exposes' !== t &&
            'filename' !== t &&
            'library' !== t &&
            'name' !== t &&
            'runtime' !== t &&
            'runtimePlugins' !== t &&
            'shareScope' !== t
          )
            return (f.errors = [{ params: { additionalProperty: t } }]), !1;
        if (i === u) {
          if (void 0 !== n.experiments) {
            let r = n.experiments;
            const e = u;
            if (u === e) {
              if (!r || 'object' != typeof r || Array.isArray(r))
                return (f.errors = [{ params: { type: 'object' } }]), !1;
              {
                const e = u;
                for (const t in r)
                  if ('asyncStartup' !== t && 'externalRuntime' !== t)
                    return (
                      (f.errors = [{ params: { additionalProperty: t } }]), !1
                    );
                if (e === u) {
                  if (void 0 !== r.asyncStartup) {
                    const t = u;
                    if ('boolean' != typeof r.asyncStartup)
                      return (f.errors = [{ params: { type: 'boolean' } }]), !1;
                    var c = t === u;
                  } else c = !0;
                  if (c)
                    if (void 0 !== r.externalRuntime) {
                      let e = r.externalRuntime;
                      const n = u,
                        s = u;
                      let i = !1;
                      const a = u;
                      if ('provide' !== e) {
                        const r = {
                          params: {
                            allowedValues:
                              t.properties.experiments.properties
                                .externalRuntime.anyOf[0].enum,
                          },
                        };
                        null === l ? (l = [r]) : l.push(r), u++;
                      }
                      var y = a === u;
                      if (((i = i || y), !i)) {
                        const t = u;
                        if ('boolean' != typeof e) {
                          const t = { params: { type: 'boolean' } };
                          null === l ? (l = [t]) : l.push(t), u++;
                        }
                        (y = t === u), (i = i || y);
                      }
                      if (!i) {
                        const t = { params: {} };
                        return (
                          null === l ? (l = [t]) : l.push(t),
                          u++,
                          (f.errors = l),
                          !1
                        );
                      }
                      (u = s),
                        null !== l && (s ? (l.length = s) : (l = null)),
                        (c = n === u);
                    } else c = !0;
                }
              }
            }
            var d = e === u;
          } else d = !0;
          if (d) {
            if (void 0 !== n.exposes) {
              const t = u;
              a(n.exposes, {
                instancePath: s + '/exposes',
                parentData: n,
                parentDataProperty: 'exposes',
                rootData: p,
              }) ||
                ((l = null === l ? a.errors : l.concat(a.errors)),
                (u = l.length)),
                (d = t === u);
            } else d = !0;
            if (d) {
              if (void 0 !== n.filename) {
                let t = n.filename;
                const r = u;
                if (u === r) {
                  if ('string' != typeof t)
                    return (f.errors = [{ params: { type: 'string' } }]), !1;
                  if (e(t) < 1)
                    return (f.errors = [{ params: { limit: 1 } }]), !1;
                }
                d = r === u;
              } else d = !0;
              if (d) {
                if (void 0 !== n.library) {
                  const t = u;
                  m(n.library, {
                    instancePath: s + '/library',
                    parentData: n,
                    parentDataProperty: 'library',
                    rootData: p,
                  }) ||
                    ((l = null === l ? m.errors : l.concat(m.errors)),
                    (u = l.length)),
                    (d = t === u);
                } else d = !0;
                if (d) {
                  if (void 0 !== n.name) {
                    let t = n.name;
                    const r = u;
                    if (u === r) {
                      if ('string' != typeof t)
                        return (
                          (f.errors = [{ params: { type: 'string' } }]), !1
                        );
                      if (e(t) < 1)
                        return (f.errors = [{ params: { limit: 1 } }]), !1;
                    }
                    d = r === u;
                  } else d = !0;
                  if (d) {
                    if (void 0 !== n.runtime) {
                      let t = n.runtime;
                      const s = u,
                        i = u;
                      let a = !1;
                      const o = u;
                      if (!1 !== t) {
                        const t = {
                          params: { allowedValues: r.anyOf[0].enum },
                        };
                        null === l ? (l = [t]) : l.push(t), u++;
                      }
                      var g = o === u;
                      if (((a = a || g), !a)) {
                        const r = u;
                        if (u === r)
                          if ('string' == typeof t) {
                            if (e(t) < 1) {
                              const t = { params: { limit: 1 } };
                              null === l ? (l = [t]) : l.push(t), u++;
                            }
                          } else {
                            const t = { params: { type: 'string' } };
                            null === l ? (l = [t]) : l.push(t), u++;
                          }
                        (g = r === u), (a = a || g);
                      }
                      if (!a) {
                        const t = { params: {} };
                        return (
                          null === l ? (l = [t]) : l.push(t),
                          u++,
                          (f.errors = l),
                          !1
                        );
                      }
                      (u = i),
                        null !== l && (i ? (l.length = i) : (l = null)),
                        (d = s === u);
                    } else d = !0;
                    if (d) {
                      if (void 0 !== n.runtimePlugins) {
                        let t = n.runtimePlugins;
                        const r = u;
                        if (u === r) {
                          if (!Array.isArray(t))
                            return (
                              (f.errors = [{ params: { type: 'array' } }]), !1
                            );
                          {
                            const r = t.length;
                            for (let e = 0; e < r; e++) {
                              const r = u;
                              if ('string' != typeof t[e])
                                return (
                                  (f.errors = [{ params: { type: 'string' } }]),
                                  !1
                                );
                              if (r !== u) break;
                            }
                          }
                        }
                        d = r === u;
                      } else d = !0;
                      if (d)
                        if (void 0 !== n.shareScope) {
                          let t = n.shareScope;
                          const r = u;
                          if (u === r) {
                            if ('string' != typeof t)
                              return (
                                (f.errors = [{ params: { type: 'string' } }]),
                                !1
                              );
                            if (e(t) < 1)
                              return (
                                (f.errors = [{ params: { limit: 1 } }]), !1
                              );
                          }
                          d = r === u;
                        } else d = !0;
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
  return (f.errors = l), 0 === u;
}
