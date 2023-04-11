export default function (content) {
  this.cacheable && this.cacheable(true);
  if (content.indexOf('global.usedChunks.add(exports.id)') !== -1) {
    return content;
  }

  const joined = [
    'if(global.usedChunks && exports.id) global.usedChunks.add(exports.id);',
    content,
  ].join('\n');

  return joined;
}
