import type {
  BridgeFramework,
  BridgeOperation,
  BridgeOperationContext,
  BridgeOperationOutcome,
  BridgeOperationResult,
  BridgeOperationSide,
  BridgeRouteSummary,
} from './type';

const OPERATION_CONTEXT_SYMBOL = Symbol.for(
  'module-federation.bridge.operation-context',
);

let bridgeCounter = 0;
let operationCounter = 0;

const sanitizeText = (value: unknown, maxLength = 240) => {
  if (typeof value !== 'string' || !value) {
    return undefined;
  }

  const sanitized = value
    .replace(
      /\b(token|key|secret|password|auth|code)\s*[:=]\s*[^&#\s]+/gi,
      '$1=[redacted]',
    )
    .replace(/#.*$/g, '')
    .trim();
  return sanitized ? sanitized.slice(0, maxLength) : undefined;
};

export const sanitizeBridgePath = (value: unknown) => {
  const sanitized = sanitizeText(value);
  if (!sanitized) {
    return undefined;
  }

  return sanitized.split(/[?#]/, 1)[0] || '/';
};

const getModuleInfo = (moduleName: unknown) => {
  const safeModuleName = sanitizeText(moduleName, 160);
  if (!safeModuleName) {
    return {};
  }

  const slashIndex = safeModuleName.indexOf('/');
  if (slashIndex <= 0) {
    return { moduleName: safeModuleName, remote: safeModuleName };
  }

  const remote = safeModuleName.slice(0, slashIndex);
  const rawExpose = safeModuleName.slice(slashIndex + 1);
  return {
    moduleName: safeModuleName,
    remote,
    expose: rawExpose ? `./${rawExpose.replace(/^\.\//, '')}` : undefined,
  };
};

export const createBridgeId = () => {
  bridgeCounter += 1;
  return `bridge-${Date.now().toString(36)}-${bridgeCounter.toString(36)}`;
};

const createOperationId = () => {
  operationCounter += 1;
  return `bridge-op-${Date.now().toString(36)}-${operationCounter.toString(36)}`;
};

export function createBridgeOperationContext(options: {
  side: BridgeOperationSide;
  framework: BridgeFramework;
  operation: BridgeOperation;
  bridgeId?: string;
  moduleName?: string;
  route?: BridgeRouteSummary;
  parent?: BridgeOperationContext;
  reason?: BridgeOperationContext['reason'];
}): BridgeOperationContext {
  const moduleInfo = getModuleInfo(
    options.moduleName || options.parent?.moduleName,
  );
  const route = options.route
    ? {
        action: options.route.action,
        from: sanitizeBridgePath(options.route.from),
        to: sanitizeBridgePath(options.route.to),
        basename: sanitizeBridgePath(options.route.basename),
        mechanism: options.route.mechanism,
      }
    : undefined;

  return {
    operationId: options.parent?.operationId || createOperationId(),
    bridgeId: options.bridgeId || options.parent?.bridgeId || createBridgeId(),
    side: options.side,
    framework: options.framework,
    operation: options.operation,
    ...moduleInfo,
    route,
    reason: options.reason || options.parent?.reason,
    startedAt: Date.now(),
  };
}

export function completeBridgeOperation(
  context: BridgeOperationContext,
  outcome: BridgeOperationOutcome,
  error?: unknown,
): BridgeOperationResult {
  const endedAt = Date.now();
  let errorSummary: BridgeOperationResult['error'];
  if (error instanceof Error) {
    errorSummary = {
      name: sanitizeText(error.name, 80),
      message: sanitizeText(error.message, 240),
    };
  } else if (error !== undefined) {
    errorSummary = { message: sanitizeText(error, 240) };
  }

  return {
    ...context,
    endedAt,
    duration: Math.max(0, endedAt - context.startedAt),
    outcome,
    error: errorSummary,
  };
}

export function attachBridgeOperationContext(
  target: object,
  context: BridgeOperationContext,
) {
  Object.defineProperty(target, OPERATION_CONTEXT_SYMBOL, {
    configurable: true,
    enumerable: false,
    value: context,
  });
  return target;
}

export function getAttachedBridgeOperationContext(
  target: unknown,
): BridgeOperationContext | undefined {
  if (!target || (typeof target !== 'object' && typeof target !== 'function')) {
    return undefined;
  }
  return (target as Record<PropertyKey, unknown>)[OPERATION_CONTEXT_SYMBOL] as
    | BridgeOperationContext
    | undefined;
}

type BridgeLifecycle = Partial<
  Record<
    | 'beforeBridgeOperation'
    | 'bridgeRenderInvoked'
    | 'afterBridgeOperation'
    | 'afterBridgeCommit',
    { emit(payload: BridgeOperationContext | BridgeOperationResult): unknown }
  >
>;

export function emitBridgeLifecycle(
  instance: { bridgeHook?: { lifecycle?: BridgeLifecycle } } | null | undefined,
  lifecycle: keyof BridgeLifecycle,
  payload: BridgeOperationContext | BridgeOperationResult,
) {
  try {
    instance?.bridgeHook?.lifecycle?.[lifecycle]?.emit(payload);
  } catch {
    // Observability signals must not affect Bridge behavior.
  }
}
