import { ExecutorContext } from "@nx/devkit";

//#region src/executors/build/executor.d.ts
interface RslibBuildExecutorOptions {
  configFile?: string;
  outputPath?: string;
  watch?: boolean;
  mode?: 'development' | 'production';
  verbose?: boolean;
  main?: string;
  additionalEntryPoints?: string[];
  external?: string[];
  format?: ('cjs' | 'esm' | 'umd' | 'iife')[];
  tsConfig?: string;
  assets?: (string | {
    glob: string;
    input: string;
    output: string;
    ignore?: string[];
  })[];
  project?: string;
}
declare function rslibBuildExecutor(options: RslibBuildExecutorOptions, context: ExecutorContext): Promise<{
  success: boolean;
}>;
//#endregion
export { RslibBuildExecutorOptions, rslibBuildExecutor as default };
//# sourceMappingURL=executor.d.ts.map