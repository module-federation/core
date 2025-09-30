/**
 * Takes OpenTelemetry client trace data and the `clientTraceMetadata` option configured in the Next.js config (currently
 * experimental) and returns a filtered/allowed list of client trace data entries.
 */ export function getTracedMetadata(traceData, clientTraceMetadata) {
    if (!clientTraceMetadata) return undefined;
    return traceData.filter(({ key })=>clientTraceMetadata.includes(key));
}

//# sourceMappingURL=utils.js.map