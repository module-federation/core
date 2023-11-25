"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var src_1 = require("../src");
describe('parseEntry', function () {
    it('get correct entryInfo by parsing normal entry', function () {
        var entry = '@byted/app1:1.2.0';
        var entryInfo = (0, src_1.parseEntry)(entry);
        expect(entryInfo).toMatchObject({
            version: '1.2.0',
            name: '@byted/app1',
        });
    });
    it('get correct entryInfo by parsing none version entry', function () {
        var entry = '@byted/app1';
        var entryInfo = (0, src_1.parseEntry)(entry);
        expect(entryInfo).toMatchObject({
            version: '*',
            name: '@byted/app1',
        });
    });
    it('get correct entryInfo by parsing local version entry', function () {
        var entry = '@byted/app1:http://localhost:8080/vmok-manifest.json';
        var entryInfo = (0, src_1.parseEntry)(entry);
        expect(entryInfo).toMatchObject({
            name: '@byted/app1',
            entry: 'http://localhost:8080/vmok-manifest.json',
        });
    });
});
