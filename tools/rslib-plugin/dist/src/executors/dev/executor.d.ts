import { ExecutorContext } from "@nx/devkit";

//#region src/executors/dev/executor.d.ts
interface RslibDevExecutorOptions {
  configFile?: string;
  port?: number;
  host?: string;
  open?: boolean;
  mode?: 'watch' | 'mf-dev';
  verbose?: boolean;
}
declare function rslibDevExecutor(options: RslibDevExecutorOptions, context: ExecutorContext): Promise<{
  success: boolean;
}>;
//#endregion
export { RslibDevExecutorOptions, rslibDevExecutor as default };
//# sourceMappingURL=executor.d.ts.map