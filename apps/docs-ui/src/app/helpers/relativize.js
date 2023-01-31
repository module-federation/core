'use strict';

const { posix: path } = require('path');

module.exports = (to, from, ctx) => {
  if (!to) return '#';
  // NOTE only legacy invocation provides both to and from
  if (!ctx) from = (ctx = from).data.root.page.url;
  if (to.charAt() !== '/') return to;
  if (!from) return (ctx.data.root.site.path || '') + to;
  let hash = '';
  const hashIdx = to.indexOf('#');
  if (~hashIdx) {
    hash = to.substr(hashIdx);
    to = to.substr(0, hashIdx);
  }
  return to === from
    ? hash || (isDir(to) ? './' : path.basename(to))
    : (path.relative(path.dirname(from + '.'), to) || '.') +
        (isDir(to) ? '/' + hash : hash);
};

function isDir(str) {
  return str.charAt(str.length - 1) === '/';
}
