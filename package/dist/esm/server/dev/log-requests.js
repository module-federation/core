import { blue, bold, gray, green, red, white, yellow } from '../../lib/picocolors';
import { stripNextRscUnionQuery } from '../../lib/url';
import { getRequestMeta } from '../request-meta';
/**
 * Returns true if the incoming request should be ignored for logging.
 */ export function ignoreLoggingIncomingRequests(request, loggingConfig) {
    var _loggingConfig_incomingRequests;
    // If it's boolean use the boolean value
    if (typeof (loggingConfig == null ? void 0 : loggingConfig.incomingRequests) === 'boolean') {
        return !loggingConfig.incomingRequests;
    }
    // Any of the value on the chain is falsy, will not ignore the request.
    const ignore = loggingConfig == null ? void 0 : (_loggingConfig_incomingRequests = loggingConfig.incomingRequests) == null ? void 0 : _loggingConfig_incomingRequests.ignore;
    // If ignore is not set, don't ignore anything
    if (!ignore) {
        return false;
    }
    // If array of RegExp, ignore if any pattern matches
    return ignore.some((pattern)=>pattern.test(request.url));
}
export function logRequests(options) {
    const { request, response, loggingConfig, requestDurationInMs } = options;
    if (!ignoreLoggingIncomingRequests(request, loggingConfig)) {
        logIncomingRequests({
            request,
            requestDurationInMs,
            statusCode: response.statusCode
        });
    }
    if (request.fetchMetrics) {
        for (const fetchMetric of request.fetchMetrics){
            logFetchMetric(fetchMetric, loggingConfig);
        }
    }
}
function logIncomingRequests(options) {
    const { request, requestDurationInMs, statusCode } = options;
    const isRSC = getRequestMeta(request, 'isRSCRequest');
    const url = isRSC ? stripNextRscUnionQuery(request.url) : request.url;
    const statusCodeColor = statusCode < 200 ? white : statusCode < 300 ? green : statusCode < 400 ? blue : statusCode < 500 ? yellow : red;
    const coloredStatus = statusCodeColor(statusCode.toString());
    return writeLine(`${request.method} ${url} ${coloredStatus} in ${requestDurationInMs}ms`);
}
function logFetchMetric(fetchMetric, loggingConfig) {
    var _loggingConfig_fetches;
    let { cacheReason, cacheStatus, cacheWarning, end, method, start, status, url } = fetchMetric;
    if (cacheStatus === 'hmr' && !(loggingConfig == null ? void 0 : (_loggingConfig_fetches = loggingConfig.fetches) == null ? void 0 : _loggingConfig_fetches.hmrRefreshes)) {
        // Cache hits during HMR refreshes are intentionally not logged, unless
        // explicitly enabled in the logging config.
        return;
    }
    if (loggingConfig == null ? void 0 : loggingConfig.fetches) {
        if (url.length > 48 && !loggingConfig.fetches.fullUrl) {
            url = truncateUrl(url);
        }
        writeLine(white(`${method} ${url} ${status} in ${Math.round(end - start)}ms ${formatCacheStatus(cacheStatus)}`), 1);
        if (cacheStatus === 'skip' || cacheStatus === 'miss') {
            writeLine(gray(`Cache ${cacheStatus === 'skip' ? 'skipped' : 'missed'} reason: (${white(cacheReason)})`), 2);
        }
    } else if (cacheWarning) {
        // When logging for fetches is not enabled, we still want to print any
        // associated warnings, so we print the request first to provide context.
        writeLine(white(`${method} ${url}`), 1);
    }
    if (cacheWarning) {
        writeLine(`${yellow(bold('⚠'))} ${white(cacheWarning)}`, 2);
    }
}
function writeLine(text, indentationLevel = 0) {
    process.stdout.write(` ${'│ '.repeat(indentationLevel)}${text}\n`);
}
function truncate(text, maxLength) {
    return maxLength !== undefined && text.length > maxLength ? text.substring(0, maxLength) + '..' : text;
}
function truncateUrl(url) {
    const { protocol, host, pathname, search } = new URL(url);
    return protocol + '//' + truncate(host, 16) + truncate(pathname, 24) + truncate(search, 16);
}
function formatCacheStatus(cacheStatus) {
    switch(cacheStatus){
        case 'hmr':
            return green('(HMR cache)');
        case 'hit':
            return green('(cache hit)');
        default:
            return yellow(`(cache ${cacheStatus})`);
    }
}

//# sourceMappingURL=log-requests.js.map