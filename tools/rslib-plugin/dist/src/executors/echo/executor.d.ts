import { ExecutorContext } from "@nx/devkit";

//#region src/executors/echo/executor.d.ts
interface EchoExecutorOptions {
  message?: string;
}
declare function echoExecutor(options: EchoExecutorOptions, context: ExecutorContext): Promise<{
  success: boolean;
}>;
//#endregion
export { EchoExecutorOptions, echoExecutor as default };
//# sourceMappingURL=executor.d.ts.map