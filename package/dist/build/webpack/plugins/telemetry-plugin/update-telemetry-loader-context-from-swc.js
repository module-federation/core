"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "updateTelemetryLoaderCtxFromTransformOutput", {
    enumerable: true,
    get: function() {
        return updateTelemetryLoaderCtxFromTransformOutput;
    }
});
function updateTelemetryLoaderCtxFromTransformOutput(ctx, output) {
    if (output.eliminatedPackages && ctx.eliminatedPackages) {
        for (const pkg of JSON.parse(output.eliminatedPackages)){
            ctx.eliminatedPackages.add(pkg);
        }
    }
    if (output.useCacheTelemetryTracker && ctx.useCacheTracker) {
        for (const [key, value] of JSON.parse(output.useCacheTelemetryTracker)){
            const prefixedKey = `useCache/${key}`;
            const numericValue = Number(value);
            if (!isNaN(numericValue)) {
                ctx.useCacheTracker.set(prefixedKey, (ctx.useCacheTracker.get(prefixedKey) || 0) + numericValue);
            }
        }
    }
}

//# sourceMappingURL=update-telemetry-loader-context-from-swc.js.map