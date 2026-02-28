import { getFetchModule, revalidate } from './hot-reload';

export interface RemoteHotReloadOptions {
  /**
   * Enables remote polling + reload checks.
   * Defaults to true.
   */
  enabled?: boolean;
  /**
   * Minimum time between checks in milliseconds.
   * Defaults to 10 seconds.
   */
  intervalMs?: number;
  /**
   * Runs an initial check as soon as controller starts.
   * Defaults to true.
   */
  immediate?: boolean;
  /**
   * Forces revalidation on startup.
   * Defaults to false.
   */
  forceOnStart?: boolean;
  /**
   * Optional custom fetch implementation for remote probing.
   */
  fetchModule?: any;
  /**
   * Optional logger override.
   */
  logger?: {
    warn?: (...args: unknown[]) => void;
  };
  /**
   * Internal/test override for the revalidate implementation.
   */
  revalidateFn?: typeof revalidate;
}

export interface RemoteHotReloadState {
  running: boolean;
  inFlight: boolean;
  lastCheckAt: number;
  lastReloadAt: number;
  intervalMs: number;
}

export interface RemoteHotReloadController {
  start(): void;
  stop(): void;
  touch(force?: boolean): void;
  check(force?: boolean): Promise<boolean>;
  getState(): RemoteHotReloadState;
}

declare global {
  // eslint-disable-next-line no-var
  var __MF_REMOTE_HOT_RELOAD_CONTROLLER__:
    | RemoteHotReloadController
    | undefined;
}

const DEFAULT_INTERVAL_MS = 10_000;

type NormalizedRemoteHotReloadOptions = {
  enabled: boolean;
  intervalMs: number;
  immediate: boolean;
  forceOnStart: boolean;
  fetchModule?: any;
  logger: {
    warn: (...args: unknown[]) => void;
  };
  revalidateFn: typeof revalidate;
};

class RemoteHotReloadControllerImpl implements RemoteHotReloadController {
  private readonly options: NormalizedRemoteHotReloadOptions;
  private running = false;
  private lastCheckAt = 0;
  private lastReloadAt = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private inFlight: Promise<boolean> | null = null;

  constructor(options: NormalizedRemoteHotReloadOptions) {
    this.options = options;
  }

  start(): void {
    if (!this.options.enabled || this.running) {
      return;
    }

    this.running = true;

    if (this.options.immediate) {
      this.touch(this.options.forceOnStart);
    }

    this.schedule();
  }

  stop(): void {
    this.running = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  touch(force = false): void {
    if (!this.running) {
      this.start();
    }

    void this.check(force);
  }

  async check(force = false): Promise<boolean> {
    if (!this.options.enabled) {
      return false;
    }

    if (this.inFlight) {
      return this.inFlight;
    }

    const now = Date.now();
    const elapsedMs = now - this.lastCheckAt;
    if (!force && this.lastCheckAt > 0 && elapsedMs < this.options.intervalMs) {
      return false;
    }

    this.lastCheckAt = now;

    const fetchModule = this.options.fetchModule ?? getFetchModule();
    this.inFlight = this.options
      .revalidateFn(fetchModule, force)
      .then((didReload) => {
        if (didReload) {
          this.lastReloadAt = Date.now();
        }
        return didReload;
      })
      .catch((error: unknown) => {
        this.options.logger.warn?.(
          '[module-federation] remote hot-reload check failed:',
          error,
        );
        return false;
      })
      .finally(() => {
        this.inFlight = null;
      });

    return this.inFlight;
  }

  getState(): RemoteHotReloadState {
    return {
      running: this.running,
      inFlight: Boolean(this.inFlight),
      lastCheckAt: this.lastCheckAt,
      lastReloadAt: this.lastReloadAt,
      intervalMs: this.options.intervalMs,
    };
  }

  private schedule(): void {
    if (!this.running || !this.options.enabled) {
      return;
    }

    this.timer = setTimeout(() => {
      this.timer = null;
      void this.check(false).finally(() => {
        this.schedule();
      });
    }, this.options.intervalMs);

    if (typeof this.timer === 'object' && this.timer?.unref) {
      this.timer.unref();
    }
  }
}

function normalizeOptions(
  options: RemoteHotReloadOptions,
): NormalizedRemoteHotReloadOptions {
  const intervalMs = Number(options.intervalMs);
  const normalizedInterval =
    Number.isFinite(intervalMs) && intervalMs > 0
      ? intervalMs
      : DEFAULT_INTERVAL_MS;

  return {
    enabled: options.enabled !== false,
    intervalMs: normalizedInterval,
    immediate: options.immediate !== false,
    forceOnStart: options.forceOnStart === true,
    fetchModule: options.fetchModule,
    logger: {
      warn: options.logger?.warn || console.warn,
    },
    revalidateFn: options.revalidateFn || revalidate,
  };
}

export function createRemoteHotReloadController(
  options: RemoteHotReloadOptions = {},
): RemoteHotReloadController {
  return new RemoteHotReloadControllerImpl(normalizeOptions(options));
}

export function ensureRemoteHotReload(
  options: RemoteHotReloadOptions = {},
): RemoteHotReloadController {
  if (!globalThis.__MF_REMOTE_HOT_RELOAD_CONTROLLER__) {
    globalThis.__MF_REMOTE_HOT_RELOAD_CONTROLLER__ =
      createRemoteHotReloadController(options);
  }

  let controller = globalThis.__MF_REMOTE_HOT_RELOAD_CONTROLLER__;
  if (options.enabled === false) {
    controller.stop();
  } else {
    controller.start();

    // The controller captures `enabled` at creation time. If it was originally
    // created with `enabled: false`, start() is a no-op; recreate with current options.
    if (!controller.getState().running) {
      controller = createRemoteHotReloadController(options);
      globalThis.__MF_REMOTE_HOT_RELOAD_CONTROLLER__ = controller;
      controller.start();
    }
  }

  return controller;
}

export function touchRemoteHotReload(
  options: RemoteHotReloadOptions = {},
  force = false,
): void {
  const controller = ensureRemoteHotReload(options);
  controller.touch(force);
}

export function stopRemoteHotReload(): void {
  if (!globalThis.__MF_REMOTE_HOT_RELOAD_CONTROLLER__) {
    return;
  }

  globalThis.__MF_REMOTE_HOT_RELOAD_CONTROLLER__.stop();
  delete globalThis.__MF_REMOTE_HOT_RELOAD_CONTROLLER__;
}
