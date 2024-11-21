module.exports = function loader(source) {
  // Return the transformed source
  return ['console.log("LOADER HERE")', source].join('\n\n');
};
