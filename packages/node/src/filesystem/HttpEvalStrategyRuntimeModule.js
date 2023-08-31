const { RuntimeModule, RuntimeGlobals, Template } = require('webpack');

class HttpEvalStrategyRuntimeModule extends RuntimeModule {
  constructor() {
    super('http-eval-strategy', 10);
  }

  generate() {
    return Template.asString([
      '// HttpEvalStrategy',
      'async function loadChunkHttpEval(chunkName,remoteName, remotes, callback) {',
      Template.indent([
        'var url = new URL(remotes[remoteName]);',

        'var getBasenameFromUrl = (url) => {',
        Template.indent([
          "const urlParts = url.split('/');",
          'return urlParts[urlParts.length - 1];',
        ]),
        '};',
        'var fileToReplace = getBasenameFromUrl(url.pathname)',
        'url.pathname = url.pathname.replace(fileToReplace, chunkName);',
        'const data = await fetch(url).then((res)=>res.text());',
        Template.indent([
          'var chunk = {};',
          'try {',
          Template.indent([
            `eval('(function(exports, require, __dirname, __filename) {' + data + '\\n})', chunkName)(chunk, require, '.', chunkName);`,
            'callback(null, chunk);',
          ]),
          '} catch(e) {',
          Template.indent(['callback(e, null);']),
          '}',
        ]),
      ]),
      '};',
    ]);
  }
}

export default HttpEvalStrategyRuntimeModule;
