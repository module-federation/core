import isError from "../../lib/is-error";
import * as Log from "../../build/output/log";
export function logAppDirError(err) {
    if (isError(err) && (err == null ? void 0 : err.stack)) {
        const cleanedStack = err.stack.split("\n").map((line)=>// Remove 'webpack-internal:' noise from the path
            line.replace(/(webpack-internal:\/\/\/|file:\/\/)(\(.*\)\/)?/, ""));
        const filteredStack = cleanedStack// Only display stack frames from the user's code
        .filter((line)=>!/next[\\/]dist[\\/]compiled/.test(line) && !/node_modules[\\/]/.test(line) && !/node:internal[\\/]/.test(line));
        if (filteredStack.length === 1) {
            // This is an error that happened outside of user code, keep full stack
            Log.error(`Internal error: ${cleanedStack.join("\n")}`);
        } else {
            Log.error(filteredStack.join("\n"));
        }
        if (typeof err.digest !== "undefined") {
            console.error(`digest: ${JSON.stringify(err.digest)}`);
        }
        if (err.cause) console.error("Cause:", err.cause);
    } else {
        Log.error(err);
    }
}

//# sourceMappingURL=log-app-dir-error.js.map