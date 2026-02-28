export type NextFederationErrorCode =
  | 'NMF001'
  | 'NMF002'
  | 'NMF003'
  | 'NMF004'
  | 'NMF005';

const DEFAULT_MESSAGES: Record<NextFederationErrorCode, string> = {
  NMF001:
    'Webpack mode is required. Run Next with --webpack (for example: next build --webpack or next dev --webpack).',
  NMF002:
    'NEXT_PRIVATE_LOCAL_WEBPACK must be enabled and webpack must be installed in the host app.',
  NMF003:
    'Edge runtime federation is unsupported in nextjs-mf v9. Only Node runtime federation is supported.',
  NMF004:
    'Unsupported App Router federation target detected. Route handlers, middleware, and server actions are not supported.',
  NMF005:
    'Legacy nextjs-mf options were detected. Migrate from legacy extraOptions/utils to the v9 API.',
};

export class NextFederationError extends Error {
  public readonly code: NextFederationErrorCode;

  constructor(code: NextFederationErrorCode, message?: string) {
    super(`[${code}] ${message || DEFAULT_MESSAGES[code]}`);
    this.name = 'NextFederationError';
    this.code = code;
  }
}

export function createNextFederationError(
  code: NextFederationErrorCode,
  message?: string,
): NextFederationError {
  return new NextFederationError(code, message);
}
