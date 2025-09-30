"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "transpileConfig", {
    enumerable: true,
    get: function() {
        return transpileConfig;
    }
});
const _nodepath = require("node:path");
const _promises = require("node:fs/promises");
const _requirehook = require("./require-hook");
const _loadjsconfig = require("../load-jsconfig");
function resolveSWCOptions(cwd, compilerOptions) {
    const resolvedBaseUrl = (0, _nodepath.join)(cwd, compilerOptions.baseUrl ?? '.');
    return {
        jsc: {
            target: 'es5',
            parser: {
                syntax: 'typescript'
            },
            paths: compilerOptions.paths,
            baseUrl: resolvedBaseUrl
        },
        module: {
            type: 'commonjs'
        },
        isModule: 'unknown'
    };
}
async function lazilyGetTSConfig(cwd) {
    let tsConfig;
    try {
        tsConfig = (0, _loadjsconfig.parseJsonFile)((0, _nodepath.join)(cwd, 'tsconfig.json'));
    } catch (error) {
        // ignore if tsconfig.json does not exist
        if (error.code !== 'ENOENT') {
            throw error;
        }
        tsConfig = {
            compilerOptions: {}
        };
    }
    return tsConfig;
}
async function transpileConfig({ nextConfigPath, cwd }) {
    let hasRequire = false;
    try {
        const { compilerOptions } = await lazilyGetTSConfig(cwd);
        const swcOptions = resolveSWCOptions(cwd, compilerOptions);
        const nextConfigString = await (0, _promises.readFile)(nextConfigPath, 'utf8');
        // lazy require swc since it loads React before even setting NODE_ENV
        // resulting loading Development React on Production
        const { transform } = require('../swc');
        const { code } = await transform(nextConfigString, swcOptions);
        // register require hook only if require exists
        if (code.includes('require(')) {
            (0, _requirehook.registerHook)(swcOptions);
            hasRequire = true;
        }
        // filename & extension don't matter here
        return (0, _requirehook.requireFromString)(code, (0, _nodepath.join)(cwd, 'next.config.compiled.js'));
    } catch (error) {
        throw error;
    } finally{
        if (hasRequire) {
            (0, _requirehook.deregisterHook)();
        }
    }
}

//# sourceMappingURL=transpile-config.js.map