import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const { RuntimeGlobals, RuntimeModule, Template, javascript } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');
const { getUndoPath } = require(
  normalizeWebpackPath('webpack/lib/util/identifier'),
) as typeof import('webpack/lib/util/identifier');

class AutoPublicPathRuntimeModule extends RuntimeModule {
  private options: any;

  constructor(options: any) {
    super('publicPath', RuntimeModule.STAGE_BASIC + 1);
    this.options = options;
  }

  /**
   * @returns {string} runtime code
   */
  override generate() {
    const { compilation } = this;
    const {
      scriptType,
      path,
      publicPath,
      importMetaName,
      uniqueName,
      chunkLoading,
      //@ts-ignore
    } = compilation.outputOptions;

    const getPath = () =>
      compilation?.getPath(publicPath || '', {
        hash: compilation?.hash || 'XXXX',
      });
    // If publicPath is not "auto", return the static value
    // if (publicPath !== 'auto') {
    //   const path = getPath();
    //   return Template.asString([
    //     `${RuntimeGlobals.publicPath} = ${JSON.stringify(path)};`,
    //     'var addProtocol = (url)=> url.startsWith(\'//\') ? \'https:\' + url : url;',
    //     `globalThis.currentVmokPublicPath = addProtocol(${RuntimeGlobals.publicPath}) || '/';`,
    //   ]);
    // }
    const chunkName = compilation?.getPath(
      javascript.JavascriptModulesPlugin.getChunkFilenameTemplate(
        this.chunk,
        compilation?.outputOptions,
      ),
      {
        chunk: this.chunk,
        contentHashType: 'javascript',
      },
    );
    let undoPath;
    if (chunkName && path) {
      undoPath = getUndoPath(chunkName, path, false);
    }
    const ident = Template.toIdentifier(uniqueName || '');

    // Define potential lookup keys
    const potentialLookups = [this.chunk?.name, ident, uniqueName];

    // Generate lookup string using potential keys
    const lookupString = potentialLookups
      .filter(Boolean)
      .map((lookup) => {
        return `remoteReg[${JSON.stringify(lookup)}]`;
      })
      .join(' || ');

    const remotesFromFederation = Template.indent([
      'var result = {};',
      '// Assuming the federationController is already defined on globalThis',
      'const federationController = globalThis.__FEDERATION__;',
      '// Function to convert Map to Object',
      'function mapToObject(map) {',
      Template.indent([
        'const obj = {};',
        'map.forEach((value, key) => {',
        Template.indent('obj[key] = value;'),
        '});',
        'return obj;',
      ]),
      '}',
      "console.log('instance', __webpack_require__.federation.instance.name);",
      '// Iterate over each instance in federationController',
      'federationController.__INSTANCES__.forEach(instance => {',
      Template.indent([
        "// Check if the current instance has a moduleCache and it's a Map",
        'if (instance.moduleCache) {',
        Template.indent([
          '// Convert Map keys and values to an object and merge it with the result',
          'result = {...result, ...mapToObject(instance.moduleCache)};',
        ]),
        '}',
      ]),
      '});',
      "console.log('RESULTS', result);",
      '// Logic to determine the value of p, using result',
      `if(!result[${JSON.stringify(lookupString)}]) return false`,
      `return result[${JSON.stringify(lookupString)}]`,
    ]);

    const importMetaLookup = Template.indent([
      `scriptUrl = new Function('return typeof ${importMetaName}.url === "string" ? ${importMetaName}.url : undefined;')();`,
    ]);
    const federationLookup = Template.asString([
      'Object.defineProperty(__webpack_require__, "p", {',
      Template.indent([
        'get: function() {',
        Template.indent([
          'try {',
          importMetaLookup,
          '} catch(e) {',
          remotesFromFederation,
          '}',
        ]),
        '}',
      ]),
      '});',
    ]);

    return Template.asString([
      'var scriptUrl;',
      // its an esproxy so nesting into _config directly is not possible
      `
      let remoteContainerRegistry = {
        get url() {
          var remoteReg = globalThis.__remote_scope__ ? globalThis.__remote_scope__._config : {};
          return ${lookupString}
        }
      };
      `,

      ['module', 'node', 'async-node', 'require'].includes(scriptType || '') ||
      chunkLoading
        ? Template.asString([
            'try {',

            '} catch (e) {',
            Template.indent([
              'if (typeof remoteContainerRegistry.url === "string") {',
              Template.indent('scriptUrl = remoteContainerRegistry.url;'),
              '} else if(typeof __filename !== "undefined") {',
              Template.indent('scriptUrl = __filename;'),
              '} else {',
              Template.indent([
                `scriptUrl = ${
                  publicPath !== 'auto'
                    ? JSON.stringify(getPath())
                    : 'undefined'
                }`,
              ]),
              '}',
            ]),
            '}',
          ])
        : Template.asString([
            `if (${RuntimeGlobals.global}.importScripts) scriptUrl = ${RuntimeGlobals.global}.location + "";`,
            `var document = ${RuntimeGlobals.global}.document;`,
            'if (!scriptUrl && document) {',
            Template.indent([
              'if (document.currentScript)',
              Template.indent('scriptUrl = document.currentScript.src'),
              'if (!scriptUrl) {',
              Template.indent([
                'var scripts = document.getElementsByTagName("script");',
                'if(scripts.length) scriptUrl = scripts[scripts.length - 1].src',
              ]),
              '}',
            ]),
            '}',
          ]),
      '// When supporting server environments where an automatic publicPath is not supported, you must specify an output.publicPath manually via configuration',
      '// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.',
      'if (!scriptUrl) throw new Error("Unable to calculate automatic public path");',
      'scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\\?.*$/, "").replace(/\\/[^\\/]+$/, "/");',
      !undoPath
        ? `${RuntimeGlobals.publicPath} = scriptUrl;`
        : `${RuntimeGlobals.publicPath} = scriptUrl + ${JSON.stringify(
            undoPath,
          )};`,
      "var addProtocol = (url)=> url.startsWith('//') ? 'https:' + url : url;",
      `globalThis.currentVmokPublicPath = addProtocol(${RuntimeGlobals.publicPath}) || '/';`,
    ]);
  }
}

export default AutoPublicPathRuntimeModule;
