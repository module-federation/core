import { bold, red, underline, yellow } from '../../../../../lib/picocolors';
import { findConfig } from '../../../../../lib/find-config';
const genericErrorText = 'Malformed PostCSS Configuration';
function getError_NullConfig(pluginName) {
    return `${red(bold('Error'))}: Your PostCSS configuration for '${pluginName}' cannot have ${bold('null')} configuration.\nTo disable '${pluginName}', pass ${bold('false')}, otherwise, pass ${bold('true')} or a configuration object.`;
}
function isIgnoredPlugin(pluginPath) {
    const ignoredRegex = /(?:^|[\\/])(postcss-modules-values|postcss-modules-scope|postcss-modules-extract-imports|postcss-modules-local-by-default|postcss-modules)(?:[\\/]|$)/i;
    const match = ignoredRegex.exec(pluginPath);
    if (match == null) {
        return false;
    }
    const plugin = match.pop();
    console.warn(`${yellow(bold('Warning'))}: Please remove the ${underline(plugin)} plugin from your PostCSS configuration. ` + `This plugin is automatically configured by Next.js.\n` + 'Read more: https://nextjs.org/docs/messages/postcss-ignored-plugin');
    return true;
}
const createLazyPostCssPlugin = (fn)=>{
    let result = undefined;
    const plugin = (...args)=>{
        if (result === undefined) result = fn();
        if (result.postcss === true) {
            return result(...args);
        } else if (result.postcss) {
            return result.postcss;
        }
        return result;
    };
    plugin.postcss = true;
    return plugin;
};
async function loadPlugin(dir, pluginName, options) {
    if (options === false || isIgnoredPlugin(pluginName)) {
        return false;
    }
    if (options == null) {
        console.error(getError_NullConfig(pluginName));
        throw Object.defineProperty(new Error(genericErrorText), "__NEXT_ERROR_CODE", {
            value: "E394",
            enumerable: false,
            configurable: true
        });
    }
    const pluginPath = require.resolve(pluginName, {
        paths: [
            dir
        ]
    });
    if (isIgnoredPlugin(pluginPath)) {
        return false;
    } else if (options === true) {
        return createLazyPostCssPlugin(()=>require(pluginPath));
    } else {
        if (typeof options === 'object' && Object.keys(options).length === 0) {
            return createLazyPostCssPlugin(()=>require(pluginPath));
        }
        return createLazyPostCssPlugin(()=>require(pluginPath)(options));
    }
}
function getDefaultPlugins(supportedBrowsers, disablePostcssPresetEnv) {
    return [
        require.resolve('next/dist/compiled/postcss-flexbugs-fixes'),
        disablePostcssPresetEnv ? false : [
            require.resolve('next/dist/compiled/postcss-preset-env'),
            {
                browsers: supportedBrowsers ?? [
                    'defaults'
                ],
                autoprefixer: {
                    // Disable legacy flexbox support
                    flexbox: 'no-2009'
                },
                // Enable CSS features that have shipped to the
                // web platform, i.e. in 2+ browsers unflagged.
                stage: 3,
                features: {
                    'custom-properties': false
                }
            }
        ]
    ].filter(Boolean);
}
export async function getPostCssPlugins(dir, supportedBrowsers, disablePostcssPresetEnv = false, useLightningcss = false) {
    let config = await findConfig(dir, 'postcss');
    if (config == null) {
        config = {
            plugins: useLightningcss ? [] : getDefaultPlugins(supportedBrowsers, disablePostcssPresetEnv)
        };
    }
    if (typeof config === 'function') {
        throw Object.defineProperty(new Error(`Your custom PostCSS configuration may not export a function. Please export a plain object instead.\n` + 'Read more: https://nextjs.org/docs/messages/postcss-function'), "__NEXT_ERROR_CODE", {
            value: "E323",
            enumerable: false,
            configurable: true
        });
    }
    // Warn user about configuration keys which are not respected
    const invalidKey = Object.keys(config).find((key)=>key !== 'plugins');
    if (invalidKey) {
        console.warn(`${yellow(bold('Warning'))}: Your PostCSS configuration defines a field which is not supported (\`${invalidKey}\`). ` + `Please remove this configuration value.`);
    }
    // Enforce the user provided plugins if the configuration file is present
    let plugins = config.plugins;
    if (plugins == null || typeof plugins !== 'object') {
        throw Object.defineProperty(new Error(`Your custom PostCSS configuration must export a \`plugins\` key.`), "__NEXT_ERROR_CODE", {
            value: "E347",
            enumerable: false,
            configurable: true
        });
    }
    if (!Array.isArray(plugins)) {
        // Capture variable so TypeScript is happy
        const pc = plugins;
        plugins = Object.keys(plugins).reduce((acc, curr)=>{
            const p = pc[curr];
            if (typeof p === 'undefined') {
                console.error(getError_NullConfig(curr));
                throw Object.defineProperty(new Error(genericErrorText), "__NEXT_ERROR_CODE", {
                    value: "E394",
                    enumerable: false,
                    configurable: true
                });
            }
            acc.push([
                curr,
                p
            ]);
            return acc;
        }, []);
    }
    const parsed = [];
    plugins.forEach((plugin)=>{
        if (plugin == null) {
            console.warn(`${yellow(bold('Warning'))}: A ${bold('null')} PostCSS plugin was provided. This entry will be ignored.`);
        } else if (typeof plugin === 'string') {
            parsed.push([
                plugin,
                true
            ]);
        } else if (Array.isArray(plugin)) {
            const pluginName = plugin[0];
            const pluginConfig = plugin[1];
            if (typeof pluginName === 'string' && (typeof pluginConfig === 'boolean' || typeof pluginConfig === 'object' || typeof pluginConfig === 'string')) {
                parsed.push([
                    pluginName,
                    pluginConfig
                ]);
            } else {
                if (typeof pluginName !== 'string') {
                    console.error(`${red(bold('Error'))}: A PostCSS Plugin must be provided as a ${bold('string')}. Instead, we got: '${pluginName}'.\n` + 'Read more: https://nextjs.org/docs/messages/postcss-shape');
                } else {
                    console.error(`${red(bold('Error'))}: A PostCSS Plugin was passed as an array but did not provide its configuration ('${pluginName}').\n` + 'Read more: https://nextjs.org/docs/messages/postcss-shape');
                }
                throw Object.defineProperty(new Error(genericErrorText), "__NEXT_ERROR_CODE", {
                    value: "E394",
                    enumerable: false,
                    configurable: true
                });
            }
        } else if (typeof plugin === 'function') {
            console.error(`${red(bold('Error'))}: A PostCSS Plugin was passed as a function using require(), but it must be provided as a ${bold('string')}.\nRead more: https://nextjs.org/docs/messages/postcss-shape`);
            throw Object.defineProperty(new Error(genericErrorText), "__NEXT_ERROR_CODE", {
                value: "E394",
                enumerable: false,
                configurable: true
            });
        } else {
            console.error(`${red(bold('Error'))}: An unknown PostCSS plugin was provided (${plugin}).\n` + 'Read more: https://nextjs.org/docs/messages/postcss-shape');
            throw Object.defineProperty(new Error(genericErrorText), "__NEXT_ERROR_CODE", {
                value: "E394",
                enumerable: false,
                configurable: true
            });
        }
    });
    const resolved = await Promise.all(parsed.map((p)=>loadPlugin(dir, p[0], p[1])));
    const filtered = resolved.filter(Boolean);
    return filtered;
}

//# sourceMappingURL=plugins.js.map