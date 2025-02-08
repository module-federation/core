// @ts-nocheck
/* eslint-disable */
/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 */
export const validate = n;
export default n;
const r = {
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
  t,
  {
    instancePath: n = '',
    parentData: s,
    parentDataProperty: a,
    rootData: o = t,
  } = {},
) {
  let l = null,
    i = 0;
  if (0 === i) {
    if (!t || 'object' != typeof t || Array.isArray(t))
      return (e.errors = [{ params: { type: 'object' } }]), !1;
    for (const n in t) {
      let s = t[n];
      const a = i,
        o = i;
      let u = !1;
      const h = i;
      if (i == i)
        if (s && 'object' == typeof s && !Array.isArray(s)) {
          const e = i;
          for (const r in s)
            if (
              'eager' !== r &&
              'shareKey' !== r &&
              'shareScope' !== r &&
              'version' !== r
            ) {
              const e = { params: { additionalProperty: r } };
              null === l ? (l = [e]) : l.push(e), i++;
              break;
            }
          if (e === i) {
            if (void 0 !== s.eager) {
              const r = i;
              if ('boolean' != typeof s.eager) {
                const r = { params: { type: 'boolean' } };
                null === l ? (l = [r]) : l.push(r), i++;
              }
              var p = r === i;
            } else p = !0;
            if (p) {
              if (void 0 !== s.shareKey) {
                let r = s.shareKey;
                const e = i;
                if (i === e)
                  if ('string' == typeof r) {
                    if (r.length < 1) {
                      const r = { params: {} };
                      null === l ? (l = [r]) : l.push(r), i++;
                    }
                  } else {
                    const r = { params: { type: 'string' } };
                    null === l ? (l = [r]) : l.push(r), i++;
                  }
                p = e === i;
              } else p = !0;
              if (p) {
                if (void 0 !== s.shareScope) {
                  let r = s.shareScope;
                  const e = i;
                  if (i === e)
                    if ('string' == typeof r) {
                      if (r.length < 1) {
                        const r = { params: {} };
                        null === l ? (l = [r]) : l.push(r), i++;
                      }
                    } else {
                      const r = { params: { type: 'string' } };
                      null === l ? (l = [r]) : l.push(r), i++;
                    }
                  p = e === i;
                } else p = !0;
                if (p)
                  if (void 0 !== s.version) {
                    let e = s.version;
                    const t = i,
                      n = i;
                    let a = !1;
                    const o = i;
                    if (!1 !== e) {
                      const e = {
                        params: {
                          allowedValues: r.properties.version.anyOf[0].enum,
                        },
                      };
                      null === l ? (l = [e]) : l.push(e), i++;
                    }
                    var c = o === i;
                    if (((a = a || c), !a)) {
                      const r = i;
                      if ('string' != typeof e) {
                        const r = { params: { type: 'string' } };
                        null === l ? (l = [r]) : l.push(r), i++;
                      }
                      (c = r === i), (a = a || c);
                    }
                    if (a)
                      (i = n), null !== l && (n ? (l.length = n) : (l = null));
                    else {
                      const r = { params: {} };
                      null === l ? (l = [r]) : l.push(r), i++;
                    }
                    p = t === i;
                  } else p = !0;
              }
            }
          }
        } else {
          const r = { params: { type: 'object' } };
          null === l ? (l = [r]) : l.push(r), i++;
        }
      var f = h === i;
      if (((u = u || f), !u)) {
        const r = i;
        if (i == i)
          if ('string' == typeof s) {
            if (s.length < 1) {
              const r = { params: {} };
              null === l ? (l = [r]) : l.push(r), i++;
            }
          } else {
            const r = { params: { type: 'string' } };
            null === l ? (l = [r]) : l.push(r), i++;
          }
        (f = r === i), (u = u || f);
      }
      if (!u) {
        const r = { params: {} };
        return null === l ? (l = [r]) : l.push(r), i++, (e.errors = l), !1;
      }
      if (((i = o), null !== l && (o ? (l.length = o) : (l = null)), a !== i))
        break;
    }
  }
  return (e.errors = l), 0 === i;
}
function t(
  r,
  {
    instancePath: n = '',
    parentData: s,
    parentDataProperty: a,
    rootData: o = r,
  } = {},
) {
  let l = null,
    i = 0;
  const p = i;
  let c = !1;
  const f = i;
  if (i === f)
    if (Array.isArray(r)) {
      const t = r.length;
      for (let s = 0; s < t; s++) {
        let t = r[s];
        const a = i,
          p = i;
        let c = !1;
        const f = i;
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
        var u = f === i;
        if (((c = c || u), !c)) {
          const a = i;
          e(t, {
            instancePath: n + '/' + s,
            parentData: r,
            parentDataProperty: s,
            rootData: o,
          }) ||
            ((l = null === l ? e.errors : l.concat(e.errors)), (i = l.length)),
            (u = a === i),
            (c = c || u);
        }
        if (c) (i = p), null !== l && (p ? (l.length = p) : (l = null));
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
  var h = f === i;
  if (((c = c || h), !c)) {
    const t = i;
    e(r, {
      instancePath: n,
      parentData: s,
      parentDataProperty: a,
      rootData: o,
    }) || ((l = null === l ? e.errors : l.concat(e.errors)), (i = l.length)),
      (h = t === i),
      (c = c || h);
  }
  if (!c) {
    const r = { params: {} };
    return null === l ? (l = [r]) : l.push(r), i++, (t.errors = l), !1;
  }
  return (
    (i = p),
    null !== l && (p ? (l.length = p) : (l = null)),
    (t.errors = l),
    0 === i
  );
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
    {
      let s;
      if (void 0 === r.provides && (s = 'provides'))
        return (n.errors = [{ params: { missingProperty: s } }]), !1;
      {
        const s = i;
        for (const e in r)
          if ('provides' !== e && 'shareScope' !== e)
            return (n.errors = [{ params: { additionalProperty: e } }]), !1;
        if (s === i) {
          if (void 0 !== r.provides) {
            const n = i;
            t(r.provides, {
              instancePath: e + '/provides',
              parentData: r,
              parentDataProperty: 'provides',
              rootData: o,
            }) ||
              ((l = null === l ? t.errors : l.concat(t.errors)),
              (i = l.length));
            var p = n === i;
          } else p = !0;
          if (p)
            if (void 0 !== r.shareScope) {
              let e = r.shareScope;
              const t = i;
              if (i === t) {
                if ('string' != typeof e)
                  return (n.errors = [{ params: { type: 'string' } }]), !1;
                if (e.length < 1) return (n.errors = [{ params: {} }]), !1;
              }
              p = t === i;
            } else p = !0;
        }
      }
    }
  }
  return (n.errors = l), 0 === i;
}
