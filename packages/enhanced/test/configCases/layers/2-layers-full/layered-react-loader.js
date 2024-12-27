module.exports = function (source) {
  const transformed = source.replace(
    '__PLACEHOLDER__',
    'This is layered react',
  );
  return transformed;
};
