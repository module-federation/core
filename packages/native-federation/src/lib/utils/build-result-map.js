const path = require('path');
function createBuildResultMap(buildResult, isHashed) {
  const map = {};
  for (const item of buildResult) {
    const resultName = path.basename(item.fileName);
    let requestName = resultName;
    if (isHashed) {
      const start = resultName.lastIndexOf('-');
      const end = resultName.lastIndexOf('.');
      const part1 = resultName.substring(0, start);
      const part2 = resultName.substring(end);
      requestName = part1 + part2;
    }
    map[requestName] = resultName;
  }
  return map;
}
function lookupInResultMap(map, requestName) {
  const key = path.basename(requestName);
  return map[key];
}
module.exports = {
  createBuildResultMap: createBuildResultMap,
  lookupInResultMap: lookupInResultMap,
};
