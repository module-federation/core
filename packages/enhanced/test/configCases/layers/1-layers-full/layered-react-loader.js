module.exports = function (source) {
  console.log(source);
  return source.replace('__PLACEHOLDER__', 'This is layered react');
};
