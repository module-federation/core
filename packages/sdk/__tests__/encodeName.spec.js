"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constant_1 = require("./resources/constant");
var src_1 = require("../src");
describe('encodeName', function () {
    it('should correct transform name', function () {
        Object.keys(constant_1.nameMap).forEach(function (name) {
            expect((0, src_1.encodeName)(name)).toBe(constant_1.nameMap[name]);
        });
    });
});
