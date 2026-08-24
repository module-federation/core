import type {
  LegacyObservabilityBridgeHookArgs,
  ObservabilityBridgeInfo,
} from '../type';
import { getErrorInfo } from '../report/error';
import { omitUndefinedFields, sanitizeText, sanitizeUrl } from '../utils';

export function normalizeBridgeInfo(
  bridge: LegacyObservabilityBridgeHookArgs | undefined,
  timing: {
    startedAt: number;
    endedAt?: number;
    duration?: number;
  },
): ObservabilityBridgeInfo | undefined {
  if (!bridge?.operationId || !bridge.bridgeId) {
    return undefined;
  }

  const moduleName = sanitizeText(bridge.moduleName, 160);
  const slashIndex = moduleName?.indexOf('/') ?? -1;
  const remote =
    sanitizeText(bridge.remote, 120) ||
    (moduleName
      ? slashIndex > 0
        ? moduleName.slice(0, slashIndex)
        : moduleName
      : undefined);
  const expose =
    sanitizeText(bridge.expose, 240) ||
    (moduleName && slashIndex > 0
      ? `./${moduleName.slice(slashIndex + 1).replace(/^\.\//, '')}`
      : undefined);
  const errorInfo = getErrorInfo(bridge.error);
  return omitUndefinedFields({
    operationId: sanitizeText(bridge.operationId, 120) || bridge.operationId,
    bridgeId: sanitizeText(bridge.bridgeId, 120) || bridge.bridgeId,
    side: bridge.side,
    framework: bridge.framework,
    operation: bridge.operation,
    moduleName,
    remote,
    expose,
    route: bridge.route
      ? {
          action: sanitizeText(bridge.route.action, 80) || 'route-update',
          from: sanitizeUrl(bridge.route.from),
          to: sanitizeUrl(bridge.route.to),
          basename: sanitizeUrl(bridge.route.basename),
          mechanism: bridge.route.mechanism,
        }
      : undefined,
    reason: sanitizeText(bridge.reason, 80),
    startedAt: timing.startedAt,
    endedAt: timing.endedAt,
    duration: timing.duration,
    outcome: bridge.outcome,
    error: bridge.error
      ? {
          name: sanitizeText(errorInfo.errorName, 80),
          message: sanitizeText(errorInfo.errorMessage, 240),
        }
      : undefined,
  });
}
