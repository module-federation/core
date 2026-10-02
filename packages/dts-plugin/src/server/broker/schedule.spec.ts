import { describe, expect, it, rs } from '@rstest/core';
import { getNextCleanupDelay, scheduleCleanup } from './Broker';

describe('broker cleanup schedule', () => {
  it('calculates the next configured cleanup time', () => {
    const now = new Date(2026, 0, 1, 7, 30, 0, 0);
    const next = new Date(now.getTime() + getNextCleanupDelay(now));

    expect(next.getFullYear()).toBe(2026);
    expect(next.getMonth()).toBe(0);
    expect(next.getDate()).toBe(1);
    expect(next.getHours()).toBe(9);
    expect(next.getMinutes()).toBe(0);
  });

  it('rolls over to midnight after the last cleanup time', () => {
    const now = new Date(2026, 0, 1, 19, 0, 0, 0);
    const next = new Date(now.getTime() + getNextCleanupDelay(now));

    expect(next.getDate()).toBe(2);
    expect(next.getHours()).toBe(0);
  });

  it('runs at the test interval and stops after cancellation', async () => {
    rs.useFakeTimers();
    const callback = rs.fn();
    const task = scheduleCleanup(callback, 5_000);

    await rs.advanceTimersByTimeAsync(10_000);
    expect(callback).toHaveBeenCalledTimes(2);

    task.cancel();
    await rs.advanceTimersByTimeAsync(10_000);
    expect(callback).toHaveBeenCalledTimes(2);
    rs.useRealTimers();
  });
});
