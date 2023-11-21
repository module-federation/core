'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var constant_1 = require('./resources/constant');
var src_1 = require('../src');
describe('decodeName', function () {
  it('should correct decode transformed name', function () {
    Object.keys(constant_1.nameMap).forEach(function (name) {
      var transformedName = constant_1.nameMap[name];
      expect((0, src_1.decodeName)(transformedName)).toBe(name);
    });
  });
});
