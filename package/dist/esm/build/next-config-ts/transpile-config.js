import { join } from 'node:path';
import { readFile } from 'node:fs/promises';
import { deregisterHook, registerHook, requireFromString } from './require-hook';
import { parseJsonFile } from '../load-jsconfig';
function resolveSWCOptions(cwd, compilerOptions) {
    const resolvedBaseUrl = join(cwd, compilerOptions.baseUrl ?? '.');
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
        tsConfig = parseJsonFile(join(cwd, 'tsconfig.json'));
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
export async function transpileConfig({ nextConfigPath, cwd }) {
    let hasRequire = false;
    try {
        const { compilerOptions } = await lazilyGetTSConfig(cwd);
        const swcOptions = resolveSWCOptions(cwd, compilerOptions);
        const nextConfigString = await readFile(nextConfigPath, 'utf8');
        // lazy require swc since it loads React before even setting NODE_ENV
        // resulting loading Development React on Production
        const { transform } = require('../swc');
        const { code } = await transform(nextConfigString, swcOptions);
        // register require hook only if require exists
        if (code.includes('require(')) {
            registerHook(swcOptions);
            hasRequire = true;
        }
        // filename & extension don't matter here
        return requireFromString(code, join(cwd, 'next.config.compiled.js'));
    } catch (error) {
        throw error;
    } finally{
        if (hasRequire) {
            deregisterHook();
        }
    }
}

//# sourceMappingURL=transpile-config.js.map