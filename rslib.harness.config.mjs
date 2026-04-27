/**
 * Rslib monorepo harness configuration.
 *
 * Supported project entry forms:
 * - string path / glob:
 *   - directory (auto-detect rslib.config.*)
 *   - explicit rslib.config.* file
 *   - nested rslib.harness.config.* file
 * - object:
 *   {
 *     name?: string;
 *     root?: string;
 *     config?: string;
 *     args?: string[];
 *     ignore?: string[];
 *     projects?: (string | object)[];
 *   }
 *
 * Notes:
 * - `<rootDir>` token is supported in path values.
 * - this root harness intentionally targets publishable package projects and
 *   app-level rslib projects in apps/.
 */
export default {
  ignore: ['**/dist/**', '**/.{idea,cache,output,temp}/**'],
  projects: [
    'packages/*/rslib.config.{mjs,ts,js,cjs,mts,cts}',
    'apps/**/rslib.config.{mjs,ts,js,cjs,mts,cts}',
  ],
};
