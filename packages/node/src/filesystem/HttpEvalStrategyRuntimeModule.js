const { RuntimeModule, RuntimeGlobals, Template } = require('webpack');

class HttpEvalStrategyRuntimeModule extends RuntimeModule {
  constructor() {
    super('http-eval-strategy', 10);
  }

  generate() {

    return Template.asString([
      '// HttpEvalStrategy',
      'var http = require("http");',
      'var https = require("https");',

      'async function loadChunkHttpEval(chunkId, chunkName, remotes, logger, callback) {',
      Template.indent([
        'var url = new URL(remotes[chunkName]);',
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
            'try {',
            Template.indent([
              'eval(`(function(exports, require, self) {${data}\\n})(chunk, require, self)`);',
              'callback(null, chunk);'
            ]),
            '} catch(e) {',
            Template.indent([
              'callback(e, null);'
            ]),
            '}',
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

export default HttpEvalStrategyRuntimeModule;
