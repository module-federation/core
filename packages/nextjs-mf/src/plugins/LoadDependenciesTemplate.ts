//@ts-ignore
import Template from '../../utils/Template';

export const loadDependenciesTemplate = (RuntimeGlobals: any) => {
  return Template.asString([
    'function loadDependencies(libKeys, cnn) {',
    "console.log('loadDependencies', libKeys, cnn);",
    Template.indent([
      'libKeys.map(function (libKey) {',
      Template.indent([
        // Extract the share key and share version from the libKey array.
        'var shareKey = libKey[0];',
        'var shareVersion = libKey[1];',

        // Get the default share scope map.
        `var shareScopeMap = ${RuntimeGlobals.shareScopeMap}.default;`,

        // Determine the alternative version of the shared module.
        'var alternativeVersion = Object.keys(shareScopeMap[shareKey])[0];',

        // Get the shared module based on the preferred version or the alternative version.
        'var lib = (preferredModules.includes(shareKey) && shareScopeMap[shareKey][shareVersion]) ? shareScopeMap[shareKey][shareVersion] : shareScopeMap[shareKey][alternativeVersion];',
        // 'console.info("lib", {lib, shareKey, preferredModules, shareVersion,shareScopeMap });',
        Template.indent([
          'if (!lib.loaded) {',
          Template.indent([
            'lib.loaded = 1;',
            "console.log('loading', shareKey, shareVersion);",
            'asyncQueue.push(lib.get().then(function (f) {',
            Template.indent([
              "console.log('loaded', shareKey, shareVersion);",
              'lib.get = function () { return f; };',
              'lib.loaded = 1;',
            ]),
            '}));',
          ]),
          '}',
        ]),
      ]),
      '});',
      'return Promise.all(asyncQueue);',
    ]),
    '}',
  ]);
};
