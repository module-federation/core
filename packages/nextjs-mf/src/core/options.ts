import type { moduleFederationPlugin } from '@module-federation/sdk';
import { createNextFederationError } from './errors';
import type {
  NextFederationCompilerContext,
  NextFederationOptionsV9,
  ResolvedNextFederationOptions,
} from '../types';

function isTruthy(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function getNextCommandArgs(): string[] {
  const nextArgIndex = process.argv.findIndex((arg) => {
    return (
      /(^|[/\\])next(\.js)?$/.test(arg) || arg.includes('next/dist/bin/next')
    );
  });

  if (nextArgIndex < 0) {
    return [];
  }

  return process.argv.slice(nextArgIndex + 1);
}

export function isNextBuildOrDevCommand(): boolean {
  const commandArgs = getNextCommandArgs();
  return commandArgs.includes('build') || commandArgs.includes('dev');
}

export function assertWebpackBuildInvocation(): void {
  if (!isNextBuildOrDevCommand()) {
    return;
  }

  const commandArgs = getNextCommandArgs();
  const hasWebpackFlag = commandArgs.includes('--webpack');
  const hasTurboFlag =
    commandArgs.includes('--turbo') || commandArgs.includes('--turbopack');

  if (process.env['NEXT_RSPACK']) {
    throw createNextFederationError(
      'NMF001',
      'Rspack mode is unsupported for nextjs-mf v9. Use webpack mode.',
    );
  }

  if (hasTurboFlag || !hasWebpackFlag) {
    throw createNextFederationError('NMF001');
  }
}

export function assertLocalWebpackEnabled(): void {
  if (!isTruthy(process.env['NEXT_PRIVATE_LOCAL_WEBPACK'])) {
    throw createNextFederationError('NMF002');
  }
}

function assertNoLegacyOptions(options: Record<string, unknown>): void {
  if (!('extraOptions' in options)) {
    return;
  }

  throw createNextFederationError(
    'NMF005',
    'Legacy extraOptions are no longer supported. Migrate to pages/app/runtime/sharing/diagnostics options.',
  );
}

function assertMode(mode: string): asserts mode is 'pages' | 'app' | 'hybrid' {
  if (mode === 'pages' || mode === 'app' || mode === 'hybrid') {
    return;
  }

  throw new Error(`Invalid next federation mode: ${mode}`);
}

export function normalizeNextFederationOptions(
  input: NextFederationOptionsV9,
): ResolvedNextFederationOptions {
  const unknownInput = input as unknown as Record<string, unknown>;
  assertNoLegacyOptions(unknownInput);

  if (!input.name) {
    throw new Error('nextjs-mf v9 requires a "name" option.');
  }

  const {
    mode: rawMode,
    pages: rawPages,
    app: rawApp,
    runtime: rawRuntime,
    sharing: rawSharing,
    diagnostics: rawDiagnostics,
    remotes,
    ...federation
  } = input;

  const mode = rawMode || 'hybrid';
  assertMode(mode);

  if (rawRuntime?.environment && rawRuntime.environment !== 'node') {
    throw createNextFederationError('NMF003');
  }

  const remotesResolver = typeof remotes === 'function' ? remotes : undefined;

  const staticRemotes = typeof remotes === 'function' ? undefined : remotes;

  const runtime = {
    environment: 'node' as const,
    onRemoteFailure: rawRuntime?.onRemoteFailure || 'error',
    runtimePlugins: rawRuntime?.runtimePlugins || [],
  };

  const sharing = {
    includeNextInternals: rawSharing?.includeNextInternals ?? true,
    strategy: rawSharing?.strategy || 'loaded-first',
  };

  const resolvedOptions: ResolvedNextFederationOptions = {
    mode,
    filename: input.filename || 'static/chunks/remoteEntry.js',
    pages: {
      exposePages: rawPages?.exposePages ?? false,
      pageMapFormat: rawPages?.pageMapFormat || 'routes-v2',
    },
    app: {
      enableClientComponents:
        rawApp?.enableClientComponents ?? (mode === 'app' || mode === 'hybrid'),
      enableRsc: rawApp?.enableRsc ?? (mode === 'app' || mode === 'hybrid'),
    },
    runtime,
    sharing,
    diagnostics: {
      level: rawDiagnostics?.level || 'warn',
    },
    federation: {
      ...federation,
      remotes: staticRemotes as
        | moduleFederationPlugin.ModuleFederationPluginOptions['remotes']
        | undefined,
    },
    remotesResolver,
  };

  return resolvedOptions;
}

export function resolveFederationRemotes(
  resolved: ResolvedNextFederationOptions,
  context: NextFederationCompilerContext,
): moduleFederationPlugin.ModuleFederationPluginOptions['remotes'] {
  if (!resolved.remotesResolver) {
    return resolved.federation.remotes;
  }

  return resolved.remotesResolver(context);
}
