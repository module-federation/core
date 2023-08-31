"use strict";
import { RuntimeModule, RuntimeGlobals, Template } from 'webpack'

class HttpStrategyRuntimeModule extends RuntimeModule {
  constructor() {
    super('http-strategy', 10);
  }
  generate() {
    return Template.asString([
      '// HttpStrategy',
      'async function loadChunkHttp(chunkName,remoteName, remotes, callback) {',
      'var http = require("http");',
      'var https = require("https");',
      'var vm = require("vm");',
      Template.indent([
        'console.log("loadChunkHttp", {chunkName,remoteName, remotes, callback});',
        'var url = new URL(remotes[remoteName]);',
        "var fileToReplace = require('path').basename(url.pathname)",
        "url.pathname = url.pathname.replace(fileToReplace, chunkName);",
        'var protocol = url.protocol === "https:" ? https : http;',
        'protocol.get(url, (res) => {',
        Template.indent([
          'let data = "";',
          'res.on("data", (chunk) => {',
          Template.indent([
            'data += chunk;'
          ]),
          '});',
          'res.on("end", () => {',
          Template.indent([
            'var chunk = {};',
            `vm.runInThisContext('(function(exports, require, __dirname, __filename) {' + data + '\\n})', chunkName)(chunk, require, '.', chunkName);`,
            'callback(null, chunk);'
          ]),
          '});',
          'res.on("error", (err) => {',
          Template.indent([
            'callback(err, null);'
          ]),
          '});'
        ]),
        '});'
      ]),
      '};'
    ]);
  }
}

export default HttpStrategyRuntimeModule;
