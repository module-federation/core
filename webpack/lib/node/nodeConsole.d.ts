declare namespace _exports {
    export { StatusMessageState };
}
declare function _exports({ colors, appendOnly, stream, compiler }: {
    colors?: boolean | undefined;
    appendOnly?: boolean | undefined;
    stream: InfrastructureLoggingNormalizedWithDefaults["stream"];
    compiler: Compiler;
}): LoggerConsole;
export = _exports;
type StatusMessageState = {
    /**
     * current status message
     */
    currentMessage: string[] | undefined;
    /**
     * current status message rows
     */
    currentLines: number;
};
import type { InfrastructureLoggingNormalizedWithDefaults } from "../config/defaults";
import type Compiler from "../Compiler";
import type { LoggerConsole } from "../logging/createConsoleLogger";
