module.exports = function (source) {
  console.log('Layered React Loader - Source:', source);
  const transformed = source.replace(
    '__PLACEHOLDER__',
    'This is layered react',
  );
  console.log('Layered React Loader - Transformed:', transformed);
  return transformed;
};
