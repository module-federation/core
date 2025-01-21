// @ts-nocheck
/* eslint-disable */
/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 */
export const validate = n;
export default n;
const r = require('ajv/dist/runtime/ucs2length').default,
  t = {
    type: 'object',
    additionalProperties: !1,
    properties: {
      eager: { type: 'boolean' },
      shareKey: { type: 'string', minLength: 1 },
      shareScope: { type: 'string', minLength: 1 },
      version: { anyOf: [{ enum: [!1] }, { type: 'string' }] },
    },
  };
function e(
  s,
  {
    instancePath: n = '',
    parentData: a,
    parentDataProperty: o,
    rootData: i = s,
  } = {},
) {
  let l = null,
    p = 0;
  if (0 === p) {
    if (!s || 'object' != typeof s || Array.isArray(s))
      return (e.errors = [{ params: { type: 'object' } }]), !1;
    for (const n in s) {
      let a = s[n];
      const o = p,
        i = p;
      let y = !1;
      const h = p;
      if (p == p)
        if (a && 'object' == typeof a && !Array.isArray(a)) {
          const e = p;
          for (const r in a)
            if (
              'eager' !== r &&
              'shareKey' !== r &&
              'shareScope' !== r &&
              'version' !== r
            ) {
              const t = { params: { additionalProperty: r } };
              null === l ? (l = [t]) : l.push(t), p++;
              break;
            }
          if (e === p) {
            if (void 0 !== a.eager) {
              const r = p;
              if ('boolean' != typeof a.eager) {
                const r = { params: { type: 'boolean' } };
                null === l ? (l = [r]) : l.push(r), p++;
              }
              var c = r === p;
            } else c = !0;
            if (c) {
              if (void 0 !== a.shareKey) {
                let t = a.shareKey;
                const e = p;
                if (p === e)
                  if ('string' == typeof t) {
                    if (r(t) < 1) {
                      const r = { params: { limit: 1 } };
                      null === l ? (l = [r]) : l.push(r), p++;
                    }
                  } else {
                    const r = { params: { type: 'string' } };
                    null === l ? (l = [r]) : l.push(r), p++;
                  }
                c = e === p;
              } else c = !0;
              if (c) {
                if (void 0 !== a.shareScope) {
                  let t = a.shareScope;
                  const e = p;
                  if (p === e)
                    if ('string' == typeof t) {
                      if (r(t) < 1) {
                        const r = { params: { limit: 1 } };
                        null === l ? (l = [r]) : l.push(r), p++;
                      }
                    } else {
                      const r = { params: { type: 'string' } };
                      null === l ? (l = [r]) : l.push(r), p++;
                    }
                  c = e === p;
                } else c = !0;
                if (c)
                  if (void 0 !== a.version) {
                    let r = a.version;
                    const e = p,
                      s = p;
                    let n = !1;
                    const o = p;
                    if (!1 !== r) {
                      const r = {
                        params: {
                          allowedValues: t.properties.version.anyOf[0].enum,
                        },
                      };
                      null === l ? (l = [r]) : l.push(r), p++;
                    }
                    var f = o === p;
                    if (((n = n || f), !n)) {
                      const t = p;
                      if ('string' != typeof r) {
                        const r = { params: { type: 'string' } };
                        null === l ? (l = [r]) : l.push(r), p++;
                      }
                      (f = t === p), (n = n || f);
                    }
                    if (n)
                      (p = s), null !== l && (s ? (l.length = s) : (l = null));
                    else {
                      const r = { params: {} };
                      null === l ? (l = [r]) : l.push(r), p++;
                    }
                    c = e === p;
                  } else c = !0;
              }
            }
          }
        } else {
          const r = { params: { type: 'object' } };
          null === l ? (l = [r]) : l.push(r), p++;
        }
      var u = h === p;
      if (((y = y || u), !y)) {
        const t = p;
        if (p == p)
          if ('string' == typeof a) {
            if (r(a) < 1) {
              const r = { params: { limit: 1 } };
              null === l ? (l = [r]) : l.push(r), p++;
            }
          } else {
            const r = { params: { type: 'string' } };
            null === l ? (l = [r]) : l.push(r), p++;
          }
        (u = t === p), (y = y || u);
      }
      if (!y) {
        const r = { params: {} };
        return null === l ? (l = [r]) : l.push(r), p++, (e.errors = l), !1;
      }
      if (((p = i), null !== l && (i ? (l.length = i) : (l = null)), o !== p))
        break;
    }
  }
  return (e.errors = l), 0 === p;
}
function s(
  t,
  {
    instancePath: n = '',
    parentData: a,
    parentDataProperty: o,
    rootData: i = t,
  } = {},
) {
  let l = null,
    p = 0;
  const c = p;
  let f = !1;
  const u = p;
  if (p === u)
    if (Array.isArray(t)) {
      const s = t.length;
      for (let a = 0; a < s; a++) {
        let s = t[a];
        const o = p,
          c = p;
        let f = !1;
        const u = p;
        if (p == p)
          if ('string' == typeof s) {
            if (r(s) < 1) {
              const r = { params: { limit: 1 } };
              null === l ? (l = [r]) : l.push(r), p++;
            }
          } else {
            const r = { params: { type: 'string' } };
            null === l ? (l = [r]) : l.push(r), p++;
          }
        var y = u === p;
        if (((f = f || y), !f)) {
          const r = p;
          e(s, {
            instancePath: n + '/' + a,
            parentData: t,
            parentDataProperty: a,
            rootData: i,
          }) ||
            ((l = null === l ? e.errors : l.concat(e.errors)), (p = l.length)),
            (y = r === p),
            (f = f || y);
        }
        if (f) (p = c), null !== l && (c ? (l.length = c) : (l = null));
        else {
          const r = { params: {} };
          null === l ? (l = [r]) : l.push(r), p++;
        }
        if (o !== p) break;
      }
    } else {
      const r = { params: { type: 'array' } };
      null === l ? (l = [r]) : l.push(r), p++;
    }
  var h = u === p;
  if (((f = f || h), !f)) {
    const r = p;
    e(t, {
      instancePath: n,
      parentData: a,
      parentDataProperty: o,
      rootData: i,
    }) || ((l = null === l ? e.errors : l.concat(e.errors)), (p = l.length)),
      (h = r === p),
      (f = f || h);
  }
  if (!f) {
    const r = { params: {} };
    return null === l ? (l = [r]) : l.push(r), p++, (s.errors = l), !1;
  }
  return (
    (p = c),
    null !== l && (c ? (l.length = c) : (l = null)),
    (s.errors = l),
    0 === p
  );
}
function n(
  t,
  {
    instancePath: e = '',
    parentData: a,
    parentDataProperty: o,
    rootData: i = t,
  } = {},
) {
  let l = null,
    p = 0;
  if (0 === p) {
    if (!t || 'object' != typeof t || Array.isArray(t))
      return (n.errors = [{ params: { type: 'object' } }]), !1;
    {
      let a;
      if (void 0 === t.provides && (a = 'provides'))
        return (n.errors = [{ params: { missingProperty: a } }]), !1;
      {
        const a = p;
        for (const r in t)
          if ('provides' !== r && 'shareScope' !== r)
            return (n.errors = [{ params: { additionalProperty: r } }]), !1;
        if (a === p) {
          if (void 0 !== t.provides) {
            const r = p;
            s(t.provides, {
              instancePath: e + '/provides',
              parentData: t,
              parentDataProperty: 'provides',
              rootData: i,
            }) ||
              ((l = null === l ? s.errors : l.concat(s.errors)),
              (p = l.length));
            var c = r === p;
          } else c = !0;
          if (c)
            if (void 0 !== t.shareScope) {
              let e = t.shareScope;
              const s = p;
              if (p === s) {
                if ('string' != typeof e)
                  return (n.errors = [{ params: { type: 'string' } }]), !1;
                if (r(e) < 1)
                  return (n.errors = [{ params: { limit: 1 } }]), !1;
              }
              c = s === p;
            } else c = !0;
        }
      }
    }
  }
  return (n.errors = l), 0 === p;
}
