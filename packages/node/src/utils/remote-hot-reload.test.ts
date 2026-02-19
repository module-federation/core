import {
  createRemoteHotReloadController,
  ensureRemoteHotReload,
  stopRemoteHotReload,
  touchRemoteHotReload,
} from './remote-hot-reload';

const flushMicrotasks = async (): Promise<void> => {
  await Promise.resolve();
  await Promise.resolve();
};

describe('remote-hot-reload controller', () => {
  afterEach(() => {
    stopRemoteHotReload();
    jest.useRealTimers();
  });

  it('runs checks in the background and throttles request touches', async () => {
    jest.useFakeTimers();
    const revalidateFn = jest.fn().mockResolvedValue(false);

    const controller = createRemoteHotReloadController({
      immediate: false,
      intervalMs: 1_000,
      fetchModule: jest.fn(),
      revalidateFn,
    });

    controller.start();
    expect(revalidateFn).toHaveBeenCalledTimes(0);

    controller.touch();
    await flushMicrotasks();
    expect(revalidateFn).toHaveBeenCalledTimes(1);

    controller.touch();
    await flushMicrotasks();
    expect(revalidateFn).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(1_000);
    await flushMicrotasks();
    expect(revalidateFn).toHaveBeenCalledTimes(2);

    controller.stop();
  });

  it('tracks reload state when revalidate reports changes', async () => {
    const revalidateFn = jest.fn().mockResolvedValue(true);
    const controller = createRemoteHotReloadController({
      immediate: false,
      fetchModule: jest.fn(),
      revalidateFn,
    });

    const didReload = await controller.check(true);
    const state = controller.getState();

    expect(didReload).toBe(true);
    expect(state.lastReloadAt).toBeGreaterThan(0);
    expect(state.lastCheckAt).toBeGreaterThan(0);
  });

  it('deduplicates concurrent checks', async () => {
    let resolveCheck: ((value: boolean) => void) | undefined;
    const revalidateFn = jest.fn().mockImplementation(
      () =>
        new Promise<boolean>((resolve) => {
          resolveCheck = resolve;
        }),
    );

    const controller = createRemoteHotReloadController({
      immediate: false,
      fetchModule: jest.fn(),
      revalidateFn,
    });

    const first = controller.check(true);
    const second = controller.check(true);

    expect(revalidateFn).toHaveBeenCalledTimes(1);

    resolveCheck?.(false);
    await expect(first).resolves.toBe(false);
    await expect(second).resolves.toBe(false);
  });

  it('creates a singleton via ensureRemoteHotReload', async () => {
    const revalidateFn = jest.fn().mockResolvedValue(false);

    const first = ensureRemoteHotReload({
      immediate: false,
      intervalMs: 5_000,
      fetchModule: jest.fn(),
      revalidateFn,
    });
    const second = ensureRemoteHotReload({
      immediate: false,
      intervalMs: 5_000,
      fetchModule: jest.fn(),
      revalidateFn,
    });

    expect(first).toBe(second);

    touchRemoteHotReload({}, true);
    await flushMicrotasks();

    expect(revalidateFn).toHaveBeenCalledTimes(1);
  });

  it('recreates a disabled singleton when later enabled', async () => {
    const disabledRevalidate = jest.fn().mockResolvedValue(false);
    const disabled = ensureRemoteHotReload({
      enabled: false,
      immediate: false,
      fetchModule: jest.fn(),
      revalidateFn: disabledRevalidate,
    });

    expect(disabled.getState().running).toBe(false);

    const enabledRevalidate = jest.fn().mockResolvedValue(false);
    const enabled = ensureRemoteHotReload({
      enabled: true,
      immediate: false,
      fetchModule: jest.fn(),
      revalidateFn: enabledRevalidate,
    });

    expect(enabled).not.toBe(disabled);
    expect(enabled.getState().running).toBe(true);

    touchRemoteHotReload({}, true);
    await flushMicrotasks();

    expect(enabledRevalidate).toHaveBeenCalledTimes(1);
    expect(disabledRevalidate).toHaveBeenCalledTimes(0);
  });
});
