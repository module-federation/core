(function () {
  'use strict';

  const hljs = require('highlight.js/lib');
  hljs.registerLanguage(
    'asciidoc',
    require('highlight.js/lib/languages/asciidoc'),
  );
  hljs.registerLanguage('bash', require('highlight.js/lib/languages/bash'));
  hljs.registerLanguage(
    'clojure',
    require('highlight.js/lib/languages/clojure'),
  );
  hljs.registerLanguage('cpp', require('highlight.js/lib/languages/cpp'));
  hljs.registerLanguage('css', require('highlight.js/lib/languages/css'));
  hljs.registerLanguage('diff', require('highlight.js/lib/languages/diff'));
  hljs.registerLanguage(
    'dockerfile',
    require('highlight.js/lib/languages/dockerfile'),
  );
  hljs.registerLanguage('elixir', require('highlight.js/lib/languages/elixir'));
  hljs.registerLanguage('go', require('highlight.js/lib/languages/go'));
  hljs.registerLanguage('groovy', require('highlight.js/lib/languages/groovy'));
  hljs.registerLanguage(
    'haskell',
    require('highlight.js/lib/languages/haskell'),
  );
  hljs.registerLanguage('java', require('highlight.js/lib/languages/java'));
  hljs.registerLanguage(
    'javascript',
    require('highlight.js/lib/languages/javascript'),
  );
  hljs.registerLanguage('json', require('highlight.js/lib/languages/json'));
  hljs.registerLanguage('kotlin', require('highlight.js/lib/languages/kotlin'));
  hljs.registerLanguage('lua', require('highlight.js/lib/languages/lua'));
  hljs.registerLanguage(
    'markdown',
    require('highlight.js/lib/languages/markdown'),
  );
  hljs.registerLanguage('nix', require('highlight.js/lib/languages/nix'));
  hljs.registerLanguage(
    'none',
    require('highlight.js/lib/languages/plaintext'),
  );
  hljs.registerLanguage(
    'objectivec',
    require('highlight.js/lib/languages/objectivec'),
  );
  hljs.registerLanguage('perl', require('highlight.js/lib/languages/perl'));
  hljs.registerLanguage('php', require('highlight.js/lib/languages/php'));
  hljs.registerLanguage(
    'properties',
    require('highlight.js/lib/languages/properties'),
  );
  hljs.registerLanguage('puppet', require('highlight.js/lib/languages/puppet'));
  hljs.registerLanguage('python', require('highlight.js/lib/languages/python'));
  hljs.registerLanguage('ruby', require('highlight.js/lib/languages/ruby'));
  hljs.registerLanguage('rust', require('highlight.js/lib/languages/rust'));
  hljs.registerLanguage('scala', require('highlight.js/lib/languages/scala'));
  hljs.registerLanguage('shell', require('highlight.js/lib/languages/shell'));
  hljs.registerLanguage('sql', require('highlight.js/lib/languages/sql'));
  hljs.registerLanguage('swift', require('highlight.js/lib/languages/swift'));
  hljs.registerLanguage('xml', require('highlight.js/lib/languages/xml'));
  hljs.registerLanguage('yaml', require('highlight.js/lib/languages/yaml'));
  [].slice
    .call(document.querySelectorAll('pre code.hljs[data-lang]'))
    .forEach((node) => {
      hljs.highlightBlock(node);
    });
})();
