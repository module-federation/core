import type { TelemetryLoaderContext } from './telemetry-plugin';
export type SwcTransformTelemetryOutput = {
    eliminatedPackages?: string;
    useCacheTelemetryTracker?: string;
};
export declare function updateTelemetryLoaderCtxFromTransformOutput(ctx: TelemetryLoaderContext, output: SwcTransformTelemetryOutput): void;
