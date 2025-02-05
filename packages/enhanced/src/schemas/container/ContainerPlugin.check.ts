// @ts-nocheck
/* eslint-disable */
/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 */
const e = /^(?:[A-Za-z]:[\\/]|\\\\|\/)/;
export const validate = m;
export default m;
const t = {
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
  r = { anyOf: [{ enum: [!1] }, { type: 'string', minLength: 1 }] };
function n(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: s,
    rootData: o = e,
  } = {},
) {
  if (!Array.isArray(e))
    return (n.errors = [{ params: { type: 'array' } }]), !1;
  {
    const t = e.length;
    for (let r = 0; r < t; r++) {
      let t = e[r];
      const s = 0;
      if ('string' != typeof t)
        return (n.errors = [{ params: { type: 'string' } }]), !1;
      if (t.length < 1) return (n.errors = [{ params: {} }]), !1;
      if (0 !== s) break;
    }
  }
  return (n.errors = null), !0;
}
function s(
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
      return (s.errors = [{ params: { type: 'object' } }]), !1;
    {
      let r;
      if (void 0 === e.import && (r = 'import'))
        return (s.errors = [{ params: { missingProperty: r } }]), !1;
      {
        const r = l;
        for (const t in e)
          if ('import' !== t && 'name' !== t)
            return (s.errors = [{ params: { additionalProperty: t } }]), !1;
        if (r === l) {
          if (void 0 !== e.import) {
            let r = e.import;
            const o = l,
              m = l;
            let u = !1;
            const c = l;
            if (l == l)
              if ('string' == typeof r) {
                if (r.length < 1) {
                  const e = { params: {} };
                  null === i ? (i = [e]) : i.push(e), l++;
                }
              } else {
                const e = { params: { type: 'string' } };
                null === i ? (i = [e]) : i.push(e), l++;
              }
            var p = c === l;
            if (((u = u || p), !u)) {
              const s = l;
              n(r, {
                instancePath: t + '/import',
                parentData: e,
                parentDataProperty: 'import',
                rootData: a,
              }) ||
                ((i = null === i ? n.errors : i.concat(n.errors)),
                (l = i.length)),
                (p = s === l),
                (u = u || p);
            }
            if (!u) {
              const e = { params: {} };
              return (
                null === i ? (i = [e]) : i.push(e), l++, (s.errors = i), !1
              );
            }
            (l = m), null !== i && (m ? (i.length = m) : (i = null));
            var f = o === l;
          } else f = !0;
          if (f)
            if (void 0 !== e.name) {
              const t = l;
              if ('string' != typeof e.name)
                return (s.errors = [{ params: { type: 'string' } }]), !1;
              f = t === l;
            } else f = !0;
        }
      }
    }
  }
  return (s.errors = i), 0 === l;
}
function o(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: a,
    rootData: i = e,
  } = {},
) {
  let l = null,
    p = 0;
  if (0 === p) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (o.errors = [{ params: { type: 'object' } }]), !1;
    for (const r in e) {
      let a = e[r];
      const m = p,
        u = p;
      let c = !1;
      const y = p;
      s(a, {
        instancePath: t + '/' + r.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: e,
        parentDataProperty: r,
        rootData: i,
      }) || ((l = null === l ? s.errors : l.concat(s.errors)), (p = l.length));
      var f = y === p;
      if (((c = c || f), !c)) {
        const s = p;
        if (p == p)
          if ('string' == typeof a) {
            if (a.length < 1) {
              const e = { params: {} };
              null === l ? (l = [e]) : l.push(e), p++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === l ? (l = [e]) : l.push(e), p++;
          }
        if (((f = s === p), (c = c || f), !c)) {
          const s = p;
          n(a, {
            instancePath: t + '/' + r.replace(/~/g, '~0').replace(/\//g, '~1'),
            parentData: e,
            parentDataProperty: r,
            rootData: i,
          }) ||
            ((l = null === l ? n.errors : l.concat(n.errors)), (p = l.length)),
            (f = s === p),
            (c = c || f);
        }
      }
      if (!c) {
        const e = { params: {} };
        return null === l ? (l = [e]) : l.push(e), p++, (o.errors = l), !1;
      }
      if (((p = u), null !== l && (u ? (l.length = u) : (l = null)), m !== p))
        break;
    }
  }
  return (o.errors = l), 0 === p;
}
function a(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  let i = null,
    l = 0;
  const p = l;
  let f = !1;
  const m = l;
  if (l === m)
    if (Array.isArray(e)) {
      const r = e.length;
      for (let n = 0; n < r; n++) {
        let r = e[n];
        const a = l,
          p = l;
        let f = !1;
        const m = l;
        if (l == l)
          if ('string' == typeof r) {
            if (r.length < 1) {
              const e = { params: {} };
              null === i ? (i = [e]) : i.push(e), l++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === i ? (i = [e]) : i.push(e), l++;
          }
        var u = m === l;
        if (((f = f || u), !f)) {
          const a = l;
          o(r, {
            instancePath: t + '/' + n,
            parentData: e,
            parentDataProperty: n,
            rootData: s,
          }) ||
            ((i = null === i ? o.errors : i.concat(o.errors)), (l = i.length)),
            (u = a === l),
            (f = f || u);
        }
        if (f) (l = p), null !== i && (p ? (i.length = p) : (i = null));
        else {
          const e = { params: {} };
          null === i ? (i = [e]) : i.push(e), l++;
        }
        if (a !== l) break;
      }
    } else {
      const e = { params: { type: 'array' } };
      null === i ? (i = [e]) : i.push(e), l++;
    }
  var c = m === l;
  if (((f = f || c), !f)) {
    const a = l;
    o(e, {
      instancePath: t,
      parentData: r,
      parentDataProperty: n,
      rootData: s,
    }) || ((i = null === i ? o.errors : i.concat(o.errors)), (l = i.length)),
      (c = a === l),
      (f = f || c);
  }
  if (!f) {
    const e = { params: {} };
    return null === i ? (i = [e]) : i.push(e), l++, (a.errors = i), !1;
  }
  return (
    (l = p),
    null !== i && (p ? (i.length = p) : (i = null)),
    (a.errors = i),
    0 === l
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
function l(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  let o = null,
    a = 0;
  const i = a;
  let p = !1;
  const f = a;
  if ('string' != typeof e) {
    const e = { params: { type: 'string' } };
    null === o ? (o = [e]) : o.push(e), a++;
  }
  var m = f === a;
  if (((p = p || m), !p)) {
    const t = a;
    if (a == a)
      if (e && 'object' == typeof e && !Array.isArray(e)) {
        const t = a;
        for (const t in e)
          if (
            'amd' !== t &&
            'commonjs' !== t &&
            'commonjs2' !== t &&
            'root' !== t
          ) {
            const e = { params: { additionalProperty: t } };
            null === o ? (o = [e]) : o.push(e), a++;
            break;
          }
        if (t === a) {
          if (void 0 !== e.amd) {
            const t = a;
            if ('string' != typeof e.amd) {
              const e = { params: { type: 'string' } };
              null === o ? (o = [e]) : o.push(e), a++;
            }
            var u = t === a;
          } else u = !0;
          if (u) {
            if (void 0 !== e.commonjs) {
              const t = a;
              if ('string' != typeof e.commonjs) {
                const e = { params: { type: 'string' } };
                null === o ? (o = [e]) : o.push(e), a++;
              }
              u = t === a;
            } else u = !0;
            if (u) {
              if (void 0 !== e.commonjs2) {
                const t = a;
                if ('string' != typeof e.commonjs2) {
                  const e = { params: { type: 'string' } };
                  null === o ? (o = [e]) : o.push(e), a++;
                }
                u = t === a;
              } else u = !0;
              if (u)
                if (void 0 !== e.root) {
                  const t = a;
                  if ('string' != typeof e.root) {
                    const e = { params: { type: 'string' } };
                    null === o ? (o = [e]) : o.push(e), a++;
                  }
                  u = t === a;
                } else u = !0;
            }
          }
        }
      } else {
        const e = { params: { type: 'object' } };
        null === o ? (o = [e]) : o.push(e), a++;
      }
    (m = t === a), (p = p || m);
  }
  if (!p) {
    const e = { params: {} };
    return null === o ? (o = [e]) : o.push(e), a++, (l.errors = o), !1;
  }
  return (
    (a = i),
    null !== o && (i ? (o.length = i) : (o = null)),
    (l.errors = o),
    0 === a
  );
}
function p(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  let o = null,
    a = 0;
  const i = a;
  let l = !1;
  const f = a;
  if (a === f)
    if (Array.isArray(e))
      if (e.length < 1) {
        const e = { params: { limit: 1 } };
        null === o ? (o = [e]) : o.push(e), a++;
      } else {
        const t = e.length;
        for (let r = 0; r < t; r++) {
          let t = e[r];
          const n = a;
          if (a === n)
            if ('string' == typeof t) {
              if (t.length < 1) {
                const e = { params: {} };
                null === o ? (o = [e]) : o.push(e), a++;
              }
            } else {
              const e = { params: { type: 'string' } };
              null === o ? (o = [e]) : o.push(e), a++;
            }
          if (n !== a) break;
        }
      }
    else {
      const e = { params: { type: 'array' } };
      null === o ? (o = [e]) : o.push(e), a++;
    }
  var m = f === a;
  if (((l = l || m), !l)) {
    const t = a;
    if (a === t)
      if ('string' == typeof e) {
        if (e.length < 1) {
          const e = { params: {} };
          null === o ? (o = [e]) : o.push(e), a++;
        }
      } else {
        const e = { params: { type: 'string' } };
        null === o ? (o = [e]) : o.push(e), a++;
      }
    if (((m = t === a), (l = l || m), !l)) {
      const t = a;
      if (a == a)
        if (e && 'object' == typeof e && !Array.isArray(e)) {
          const t = a;
          for (const t in e)
            if ('amd' !== t && 'commonjs' !== t && 'root' !== t) {
              const e = { params: { additionalProperty: t } };
              null === o ? (o = [e]) : o.push(e), a++;
              break;
            }
          if (t === a) {
            if (void 0 !== e.amd) {
              let t = e.amd;
              const r = a;
              if (a === r)
                if ('string' == typeof t) {
                  if (t.length < 1) {
                    const e = { params: {} };
                    null === o ? (o = [e]) : o.push(e), a++;
                  }
                } else {
                  const e = { params: { type: 'string' } };
                  null === o ? (o = [e]) : o.push(e), a++;
                }
              var u = r === a;
            } else u = !0;
            if (u) {
              if (void 0 !== e.commonjs) {
                let t = e.commonjs;
                const r = a;
                if (a === r)
                  if ('string' == typeof t) {
                    if (t.length < 1) {
                      const e = { params: {} };
                      null === o ? (o = [e]) : o.push(e), a++;
                    }
                  } else {
                    const e = { params: { type: 'string' } };
                    null === o ? (o = [e]) : o.push(e), a++;
                  }
                u = r === a;
              } else u = !0;
              if (u)
                if (void 0 !== e.root) {
                  let t = e.root;
                  const r = a,
                    n = a;
                  let s = !1;
                  const i = a;
                  if (a === i)
                    if (Array.isArray(t)) {
                      const e = t.length;
                      for (let r = 0; r < e; r++) {
                        let e = t[r];
                        const n = a;
                        if (a === n)
                          if ('string' == typeof e) {
                            if (e.length < 1) {
                              const e = { params: {} };
                              null === o ? (o = [e]) : o.push(e), a++;
                            }
                          } else {
                            const e = { params: { type: 'string' } };
                            null === o ? (o = [e]) : o.push(e), a++;
                          }
                        if (n !== a) break;
                      }
                    } else {
                      const e = { params: { type: 'array' } };
                      null === o ? (o = [e]) : o.push(e), a++;
                    }
                  var c = i === a;
                  if (((s = s || c), !s)) {
                    const e = a;
                    if (a === e)
                      if ('string' == typeof t) {
                        if (t.length < 1) {
                          const e = { params: {} };
                          null === o ? (o = [e]) : o.push(e), a++;
                        }
                      } else {
                        const e = { params: { type: 'string' } };
                        null === o ? (o = [e]) : o.push(e), a++;
                      }
                    (c = e === a), (s = s || c);
                  }
                  if (s)
                    (a = n), null !== o && (n ? (o.length = n) : (o = null));
                  else {
                    const e = { params: {} };
                    null === o ? (o = [e]) : o.push(e), a++;
                  }
                  u = r === a;
                } else u = !0;
            }
          }
        } else {
          const e = { params: { type: 'object' } };
          null === o ? (o = [e]) : o.push(e), a++;
        }
      (m = t === a), (l = l || m);
    }
  }
  if (!l) {
    const e = { params: {} };
    return null === o ? (o = [e]) : o.push(e), a++, (p.errors = o), !1;
  }
  return (
    (a = i),
    null !== o && (i ? (o.length = i) : (o = null)),
    (p.errors = o),
    0 === a
  );
}
function f(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  let o = null,
    a = 0;
  if (0 === a) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (f.errors = [{ params: { type: 'object' } }]), !1;
    {
      let r;
      if (void 0 === e.type && (r = 'type'))
        return (f.errors = [{ params: { missingProperty: r } }]), !1;
      {
        const r = a;
        for (const t in e)
          if (
            'amdContainer' !== t &&
            'auxiliaryComment' !== t &&
            'export' !== t &&
            'name' !== t &&
            'type' !== t &&
            'umdNamedDefine' !== t
          )
            return (f.errors = [{ params: { additionalProperty: t } }]), !1;
        if (r === a) {
          if (void 0 !== e.amdContainer) {
            let t = e.amdContainer;
            const r = a;
            if (a == a) {
              if ('string' != typeof t)
                return (f.errors = [{ params: { type: 'string' } }]), !1;
              if (t.length < 1) return (f.errors = [{ params: {} }]), !1;
            }
            var m = r === a;
          } else m = !0;
          if (m) {
            if (void 0 !== e.auxiliaryComment) {
              const r = a;
              l(e.auxiliaryComment, {
                instancePath: t + '/auxiliaryComment',
                parentData: e,
                parentDataProperty: 'auxiliaryComment',
                rootData: s,
              }) ||
                ((o = null === o ? l.errors : o.concat(l.errors)),
                (a = o.length)),
                (m = r === a);
            } else m = !0;
            if (m) {
              if (void 0 !== e.export) {
                let t = e.export;
                const r = a,
                  n = a;
                let s = !1;
                const i = a;
                if (a === i)
                  if (Array.isArray(t)) {
                    const e = t.length;
                    for (let r = 0; r < e; r++) {
                      let e = t[r];
                      const n = a;
                      if (a === n)
                        if ('string' == typeof e) {
                          if (e.length < 1) {
                            const e = { params: {} };
                            null === o ? (o = [e]) : o.push(e), a++;
                          }
                        } else {
                          const e = { params: { type: 'string' } };
                          null === o ? (o = [e]) : o.push(e), a++;
                        }
                      if (n !== a) break;
                    }
                  } else {
                    const e = { params: { type: 'array' } };
                    null === o ? (o = [e]) : o.push(e), a++;
                  }
                var u = i === a;
                if (((s = s || u), !s)) {
                  const e = a;
                  if (a === e)
                    if ('string' == typeof t) {
                      if (t.length < 1) {
                        const e = { params: {} };
                        null === o ? (o = [e]) : o.push(e), a++;
                      }
                    } else {
                      const e = { params: { type: 'string' } };
                      null === o ? (o = [e]) : o.push(e), a++;
                    }
                  (u = e === a), (s = s || u);
                }
                if (!s) {
                  const e = { params: {} };
                  return (
                    null === o ? (o = [e]) : o.push(e), a++, (f.errors = o), !1
                  );
                }
                (a = n),
                  null !== o && (n ? (o.length = n) : (o = null)),
                  (m = r === a);
              } else m = !0;
              if (m) {
                if (void 0 !== e.name) {
                  const r = a;
                  p(e.name, {
                    instancePath: t + '/name',
                    parentData: e,
                    parentDataProperty: 'name',
                    rootData: s,
                  }) ||
                    ((o = null === o ? p.errors : o.concat(p.errors)),
                    (a = o.length)),
                    (m = r === a);
                } else m = !0;
                if (m) {
                  if (void 0 !== e.type) {
                    let t = e.type;
                    const r = a,
                      n = a;
                    let s = !1;
                    const l = a;
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
                      const e = { params: { allowedValues: i.anyOf[0].enum } };
                      null === o ? (o = [e]) : o.push(e), a++;
                    }
                    var c = l === a;
                    if (((s = s || c), !s)) {
                      const e = a;
                      if ('string' != typeof t) {
                        const e = { params: { type: 'string' } };
                        null === o ? (o = [e]) : o.push(e), a++;
                      }
                      (c = e === a), (s = s || c);
                    }
                    if (!s) {
                      const e = { params: {} };
                      return (
                        null === o ? (o = [e]) : o.push(e),
                        a++,
                        (f.errors = o),
                        !1
                      );
                    }
                    (a = n),
                      null !== o && (n ? (o.length = n) : (o = null)),
                      (m = r === a);
                  } else m = !0;
                  if (m)
                    if (void 0 !== e.umdNamedDefine) {
                      const t = a;
                      if ('boolean' != typeof e.umdNamedDefine)
                        return (
                          (f.errors = [{ params: { type: 'boolean' } }]), !1
                        );
                      m = t === a;
                    } else m = !0;
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
function m(
  n,
  {
    instancePath: s = '',
    parentData: o,
    parentDataProperty: i,
    rootData: l = n,
  } = {},
) {
  let p = null,
    u = 0;
  if (0 === u) {
    if (!n || 'object' != typeof n || Array.isArray(n))
      return (m.errors = [{ params: { type: 'object' } }]), !1;
    {
      let o;
      if (
        (void 0 === n.name && (o = 'name')) ||
        (void 0 === n.exposes && (o = 'exposes'))
      )
        return (m.errors = [{ params: { missingProperty: o } }]), !1;
      {
        const o = u;
        for (const e in n)
          if (
            'exposes' !== e &&
            'filename' !== e &&
            'library' !== e &&
            'name' !== e &&
            'runtime' !== e &&
            'runtimePlugins' !== e &&
            'shareScope' !== e &&
            'experiments' !== e
          )
            return (m.errors = [{ params: { additionalProperty: e } }]), !1;
        if (o === u) {
          if (void 0 !== n.exposes) {
            const e = u;
            a(n.exposes, {
              instancePath: s + '/exposes',
              parentData: n,
              parentDataProperty: 'exposes',
              rootData: l,
            }) ||
              ((p = null === p ? a.errors : p.concat(a.errors)),
              (u = p.length));
            var c = e === u;
          } else c = !0;
          if (c) {
            if (void 0 !== n.filename) {
              let t = n.filename;
              const r = u;
              if (u === r) {
                if ('string' != typeof t)
                  return (m.errors = [{ params: { type: 'string' } }]), !1;
                if (t.length < 1) return (m.errors = [{ params: {} }]), !1;
                if (t.includes('!') || !1 !== e.test(t))
                  return (m.errors = [{ params: {} }]), !1;
              }
              c = r === u;
            } else c = !0;
            if (c) {
              if (void 0 !== n.library) {
                const e = u;
                f(n.library, {
                  instancePath: s + '/library',
                  parentData: n,
                  parentDataProperty: 'library',
                  rootData: l,
                }) ||
                  ((p = null === p ? f.errors : p.concat(f.errors)),
                  (u = p.length)),
                  (c = e === u);
              } else c = !0;
              if (c) {
                if (void 0 !== n.name) {
                  let e = n.name;
                  const t = u;
                  if (u === t) {
                    if ('string' != typeof e)
                      return (m.errors = [{ params: { type: 'string' } }]), !1;
                    if (e.length < 1) return (m.errors = [{ params: {} }]), !1;
                  }
                  c = t === u;
                } else c = !0;
                if (c) {
                  if (void 0 !== n.runtime) {
                    let e = n.runtime;
                    const t = u,
                      s = u;
                    let o = !1;
                    const a = u;
                    if (!1 !== e) {
                      const e = { params: { allowedValues: r.anyOf[0].enum } };
                      null === p ? (p = [e]) : p.push(e), u++;
                    }
                    var y = a === u;
                    if (((o = o || y), !o)) {
                      const t = u;
                      if (u === t)
                        if ('string' == typeof e) {
                          if (e.length < 1) {
                            const e = { params: {} };
                            null === p ? (p = [e]) : p.push(e), u++;
                          }
                        } else {
                          const e = { params: { type: 'string' } };
                          null === p ? (p = [e]) : p.push(e), u++;
                        }
                      (y = t === u), (o = o || y);
                    }
                    if (!o) {
                      const e = { params: {} };
                      return (
                        null === p ? (p = [e]) : p.push(e),
                        u++,
                        (m.errors = p),
                        !1
                      );
                    }
                    (u = s),
                      null !== p && (s ? (p.length = s) : (p = null)),
                      (c = t === u);
                  } else c = !0;
                  if (c) {
                    if (void 0 !== n.runtimePlugins) {
                      let e = n.runtimePlugins;
                      const t = u;
                      if (u == u) {
                        if (!Array.isArray(e))
                          return (
                            (m.errors = [{ params: { type: 'array' } }]), !1
                          );
                        {
                          const t = e.length;
                          for (let r = 0; r < t; r++) {
                            const t = u;
                            if ('string' != typeof e[r])
                              return (
                                (m.errors = [{ params: { type: 'string' } }]),
                                !1
                              );
                            if (t !== u) break;
                          }
                        }
                      }
                      c = t === u;
                    } else c = !0;
                    if (c) {
                      if (void 0 !== n.shareScope) {
                        let e = n.shareScope;
                        const t = u;
                        if (u === t) {
                          if ('string' != typeof e)
                            return (
                              (m.errors = [{ params: { type: 'string' } }]), !1
                            );
                          if (e.length < 1)
                            return (m.errors = [{ params: {} }]), !1;
                        }
                        c = t === u;
                      } else c = !0;
                      if (c)
                        if (void 0 !== n.experiments) {
                          let e = n.experiments;
                          const r = u;
                          if (u === r) {
                            if (!e || 'object' != typeof e || Array.isArray(e))
                              return (
                                (m.errors = [{ params: { type: 'object' } }]),
                                !1
                              );
                            {
                              const r = u;
                              for (const t in e)
                                if (
                                  'federationRuntime' !== t &&
                                  'externalRuntime' !== t
                                )
                                  return (
                                    (m.errors = [
                                      { params: { additionalProperty: t } },
                                    ]),
                                    !1
                                  );
                              if (r === u) {
                                if (void 0 !== e.federationRuntime) {
                                  let r = e.federationRuntime;
                                  const n = u,
                                    s = u;
                                  let o = !1;
                                  const a = u;
                                  if ('boolean' != typeof r) {
                                    const e = { params: { type: 'boolean' } };
                                    null === p ? (p = [e]) : p.push(e), u++;
                                  }
                                  var g = a === u;
                                  if (((o = o || g), !o)) {
                                    const e = u;
                                    if ('hoisted' !== r) {
                                      const e = {
                                        params: {
                                          allowedValues:
                                            t.properties.experiments.properties
                                              .federationRuntime.anyOf[1].enum,
                                        },
                                      };
                                      null === p ? (p = [e]) : p.push(e), u++;
                                    }
                                    (g = e === u), (o = o || g);
                                  }
                                  if (!o) {
                                    const e = { params: {} };
                                    return (
                                      null === p ? (p = [e]) : p.push(e),
                                      u++,
                                      (m.errors = p),
                                      !1
                                    );
                                  }
                                  (u = s),
                                    null !== p &&
                                      (s ? (p.length = s) : (p = null));
                                  var d = n === u;
                                } else d = !0;
                                if (d)
                                  if (void 0 !== e.externalRuntime) {
                                    let r = e.externalRuntime;
                                    const n = u,
                                      s = u;
                                    let o = !1;
                                    const a = u;
                                    if ('boolean' != typeof r) {
                                      const e = { params: { type: 'boolean' } };
                                      null === p ? (p = [e]) : p.push(e), u++;
                                    }
                                    var h = a === u;
                                    if (((o = o || h), !o)) {
                                      const e = u;
                                      if ('provide' !== r) {
                                        const e = {
                                          params: {
                                            allowedValues:
                                              t.properties.experiments
                                                .properties.externalRuntime
                                                .anyOf[1].enum,
                                          },
                                        };
                                        null === p ? (p = [e]) : p.push(e), u++;
                                      }
                                      (h = e === u), (o = o || h);
                                    }
                                    if (!o) {
                                      const e = { params: {} };
                                      return (
                                        null === p ? (p = [e]) : p.push(e),
                                        u++,
                                        (m.errors = p),
                                        !1
                                      );
                                    }
                                    (u = s),
                                      null !== p &&
                                        (s ? (p.length = s) : (p = null)),
                                      (d = n === u);
                                  } else d = !0;
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
  return (m.errors = p), 0 === u;
}
