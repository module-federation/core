const { RuntimeModule, RuntimeGlobals, Template } = require('webpack');

class HttpStrategyRuntimeModule extends RuntimeModule {
  constructor() {
    super('http-strategy', 10);
  }

  generate() {
    return Template.asString([
      '// HttpStrategy',
      'var http = require("http");',
      'var https = require("https");',
      'var vm = require("vm");',

      'async function loadChunkHttp(chunkId,rootOutputDir, remotes, callback) {',

      Template.indent([
        'console.log("loadChunkHttp", {chunkId,rootOutputDir, remotes, callback});',
        'var url = new URL(remotes[chunkId]);',
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
            `vm.runInThisContext('(function(exports, require, __dirname, __filename) {' + data + '\\n})', chunkId)(chunk, require, '.', chunkId);`,
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

module.exports = HttpStrategyRuntimeModule;
