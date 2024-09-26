import type { Message, Plugin } from 'esbuild';
import { promises } from 'fs';
import { Lexer } from './lexer';
import { cachedReduce, makeLegalIdentifier, orderedUniq } from './utils';
import { resolve } from './collect-exports';

export interface CommonJSOptions {
  /**
   * The regexp passed to onLoad() to match commonjs files.
   *
   * @default /\.c?js$/
   */
  filter?: RegExp;

  /**
   * _Experimental_: Transform commonjs to es modules. You have to install
   * `cjs-module-lexer` to let it work.
   *
   * When `true`, the plugin tries to wrap the commonjs module into:
   *
   * ```js
   * var exports = {}, module = { exports };
   * {
   *   // ... original content ...
   * }
   * exports = module.exports;
   * // the exported names are extracted by cjs-module-lexer
   * export default exports;
   * var { something, "a-b" as a_b } = exports;
   * export { something, a_b as "a-b" };
   * ```
   *
   * @default false
   */
  transform?:
    | boolean
    | ((path: string) => boolean | TransformConfig | null | void);

  /**
   * _Experimental_: This options acts as a fallback of the `transform` option above.
   */
  transformConfig?: Pick<TransformConfig, 'behavior' | 'sideEffects'>;

  /**
   * Controls which style of import should be used. By default, it transforms:
   *
   * ```js
   * // input
   * const foo = require("foo")
   * // output
   * import foo from "foo"
   * ```
   *
   * The above case is often correct when 'foo' is also a commonjs module.
   * But if 'foo' has es module exports, it is better to use:
   *
   * ```js
   * // output
   * import * as foo from "foo"
   * ```
   *
   * In which case you can set `requireReturnsDefault` to `false` to get the above output.
   * Or use the callback style to control the behavior for each module.
   *
   * @default true
   */
  requireReturnsDefault?: boolean | ((path: string) => boolean);

  /**
   * Don't replace require("ignored-modules"). Note that this will cause
   * esbuild generates the __require() wrapper which throw error at runtime.
   */
  ignore?: string[] | ((path: string) => boolean);
}

export interface TransformConfig {
  /**
   * If `"babel"`, it will check if there be `exports.__esModule`,
   * then export `exports.default`. i.e. The wrapper code becomes:
   *
   * ```js
   * export default exports.__esModule ? exports.default : exports;
   * ```
   *
   * @default "node"
   */
  behavior?: 'babel' | 'node';

  /**
   * Also include these named exports if they aren't recognized automatically.
   *
   * @example ["something"]
   */
  exports?: string[];

  /**
   * If `false`, slightly change the result to make it side-effect free.
   * But it doesn't actually remove many code. So you maybe not need this.
   *
   * ```js
   * var mod;
   * var exports = /\*#__PURE__*\/ ((exports, module) => {
   *   // ... original content ...
   *   return module.exports;
   * })((mod = { exports: {} }).exports, mod);
   * export default exports;
   * var a_b = /\*#__PURE__*\/ (() => exports['a-b'])();
   * var something = /\*#__PURE__*\/ (() => exports.something)();
   * export { a_b as "a-b", something };
   * ```
   */
  sideEffects?: boolean;
}

export function commonjs({
  filter = /\.c?js$/,
  transform = true,
  transformConfig,
  requireReturnsDefault = true,
  ignore,
}: CommonJSOptions = {}): Plugin {
  const init_cjs_module_lexer = transform
    ? import('cjs-module-lexer')
    : undefined;

  const use_default_export =
    typeof requireReturnsDefault === 'function'
      ? requireReturnsDefault
      : (_path: string) => requireReturnsDefault;

  const is_ignored =
    typeof ignore === 'function'
      ? ignore
      : Array.isArray(ignore)
        ? (path: string) => ignore.includes(path)
        : () => false;

  return {
    name: 'commonjs',
    setup({ onLoad, esbuild, initialOptions }) {
      let esbuild_shim: typeof import('esbuild') | undefined;
      const require_esbuild = () =>
        esbuild || (esbuild_shim ||= require('esbuild'));
      const read = promises.readFile;
      const lexer = new Lexer();

      //@ts-ignore
      onLoad({ filter: filter }, async (args) => {
        let parseCJS: typeof import('cjs-module-lexer').parse | undefined;
        if (init_cjs_module_lexer) {
          const { init, parse } = await init_cjs_module_lexer;
          await init();
          parseCJS = parse;
        }
        let contents: string;
        try {
          //@ts-ignore
          contents = await read(args.path, 'utf8');
        } catch {
          return null;
        }
        const willTransform =
          transform === true ||
          (typeof transform === 'function' && transform(args.path));
        let cjsExports: ReturnType<NonNullable<typeof parseCJS>> | undefined;
        try {
          if (parseCJS && willTransform) {
            // move sourcemap to the end of the transformed file
            const sourcemapIndex = contents.lastIndexOf(
              '//# sourceMappingURL=',
            );
            let sourcemap: string | undefined;
            if (sourcemapIndex !== -1) {
              sourcemap = contents.slice(sourcemapIndex);
              const sourcemapEnd = sourcemap.indexOf('\n');
              if (
                sourcemapEnd !== -1 &&
                sourcemap.slice(sourcemapEnd + 1).trimStart().length > 0
              ) {
                // if there's code after sourcemap, it is invalid, don't do this.
                sourcemap = undefined;
              } else {
                contents = contents.slice(0, sourcemapIndex);
              }
            }
            // transform commonjs to es modules, easy mode
            cjsExports = parseCJS(contents);
            let { behavior, exports, sideEffects } =
              typeof willTransform === 'object'
                ? willTransform
                : ({} as TransformConfig);
            behavior ??= transformConfig?.behavior ?? 'node';
            exports = orderedUniq(cjsExports.exports.concat(exports ?? []));
            sideEffects ??= transformConfig?.sideEffects ?? true;
            let exportDefault =
              behavior === 'node'
                ? 'export default exports;'
                : 'export default exports.__esModule ? exports.default : exports;';
            let exportsMap = exports.map((e) => [e, makeLegalIdentifier(e)]);
            if (exportsMap.some(([e]) => e === 'default')) {
              if (behavior === 'node') {
                exportsMap = exportsMap.filter(([e]) => e !== 'default');
              } else {
                exportDefault = '';
              }
            }
            const reexports = cjsExports.reexports
              .map((e) => `export * from ${JSON.stringify(e)};`)
              .join('');
            let transformed: string[];
            if (sideEffects === false) {
              transformed = [
                // make sure we don't manipulate the first line so that sourcemap is fine
                reexports +
                  'var mod, exports = /* @__PURE__ */ ((exports, module) => {' +
                  contents,
                'return module.exports})((mod = { exports: {} }).exports, mod); ' +
                  exportDefault,
              ];
              if (exportsMap.length > 0) {
                for (const [e, name] of exportsMap) {
                  transformed.push(
                    `var ${name} = /* @__PURE__ */ (() => exports[${JSON.stringify(
                      e,
                    )}])();`,
                  );
                }
                transformed.push(
                  `export { ${exportsMap
                    .map(([e, name]) =>
                      e === name ? e : `${name} as ${JSON.stringify(e)}`,
                    )
                    .join(', ')} };`,
                );
              }
            } else {
              transformed = [
                reexports +
                  'var exports = {}, module = { exports }; {' +
                  contents,
                '}; exports = module.exports; ' + exportDefault,
              ];
              if (exportsMap.length > 0) {
                transformed.push(
                  `var { ${exportsMap
                    .map(([e, name]) =>
                      e === name ? e : `${JSON.stringify(e)}: ${name}`,
                    )
                    .join(', ')} } = exports;`,
                  `export { ${exportsMap
                    .map(([e, name]) =>
                      e === name ? e : `${name} as ${JSON.stringify(e)}`,
                    )
                    .join(', ')} };`,
                );
              }
            }
            contents =
              transformed.join('\n') + (sourcemap ? '\n' + sourcemap : '');
          }
        } catch (e) {
          return null;
        }

        function makeName(path: string) {
          let name = `__import_${makeLegalIdentifier(path)}`;

          if (contents.includes(name)) {
            let suffix = 2;
            while (contents.includes(`${name}${suffix}`)) suffix++;
            name = `${name}${suffix}`;
          }

          return name;
        }

        let warnings: Message[];
        try {
          ({ warnings } = await require_esbuild().transform(contents, {
            format: 'esm',
            logLevel: 'silent',
          }));
        } catch (err) {
          ({ warnings } = err as any);
        }

        const lines = contents.split('\n');
        const getOffset = cachedReduce(lines, (a, b) => a + 1 + b.length, 0);

        if (
          warnings &&
          (warnings = warnings.filter((e) =>
            e.text.includes('"require" to "esm"'),
          )).length
        ) {
          const edits: [start: number, end: number, replace: string][] = [];
          let imports: string[] = [];

          for (const { location } of warnings) {
            if (location === null) continue;

            const { line, lineText, column, length } = location;

            const leftBrace = column + length + 1;
            const path = lexer.readString(lineText, leftBrace);
            if (path === null || is_ignored(path)) continue;
            const rightBrace =
              lineText.indexOf(')', leftBrace + 2 + path.length) + 1;

            const name = makeName(path);
            let import_statement: string;
            if (use_default_export(path)) {
              import_statement = `import ${name} from ${JSON.stringify(path)};`;
            } else {
              import_statement = `import * as ${name} from ${JSON.stringify(
                path,
              )};`;
            }

            const offset = getOffset(line - 1);
            edits.push([offset + column, offset + rightBrace, name]);
            imports.push(import_statement);
          }

          if (imports.length === 0) return null;

          imports = orderedUniq(imports);

          let offset = 0;
          for (const [start, end, name] of edits) {
            contents =
              contents.slice(0, start + offset) +
              name +
              contents.slice(end + offset);
            offset += name.length - (end - start);
          }

          // if we have transformed this module (i.e. having `cjsExports`), don't make the file commonjs
          contents = [...imports, cjsExports ? 'exports;' : '', contents].join(
            '',
          );
          return { contents };
        }
      });
    },
  };
}

export default commonjs;
