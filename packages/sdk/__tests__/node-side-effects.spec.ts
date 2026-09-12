/** @jest-environment node */
import {
  withSideEffectScope,
  disposeRemoteSideEffects,
  getRecordedRemoteSideEffects,
  resetRemoteSideEffectsState,
} from '../src/node-side-effects';

describe('node-side-effects', () => {
  beforeEach(() => {
    resetRemoteSideEffectsState();
  });

  afterEach(() => {
    resetRemoteSideEffectsState();
  });

  it('records setTimeout, setInterval, and setImmediate inside scope', () => {
    const originalSetTimeout = globalThis.setTimeout;
    const originalSetInterval = globalThis.setInterval;
    const originalSetImmediate = globalThis.setImmediate;

    let timerId: any;
    let intervalId: any;
    let immediateId: any;

    withSideEffectScope('remote-a', () => {
      // While scope is active, global functions should be wrapped
      expect(globalThis.setTimeout).not.toBe(originalSetTimeout);
      expect(globalThis.setInterval).not.toBe(originalSetInterval);

      timerId = setTimeout(() => {}, 10000);
      intervalId = setInterval(() => {}, 10000);
      immediateId = setImmediate(() => {});
    });

    // After scope exits, originals must be restored
    expect(globalThis.setTimeout).toBe(originalSetTimeout);
    expect(globalThis.setInterval).toBe(originalSetInterval);
    expect(globalThis.setImmediate).toBe(originalSetImmediate);

    const recorded = getRecordedRemoteSideEffects('remote-a');
    expect(recorded).toBeDefined();
    expect(recorded!.timers.has(timerId)).toBe(true);
    expect(recorded!.timers.has(intervalId)).toBe(true);
    expect(recorded!.immediates.has(immediateId)).toBe(true);

    // Disposing the remote cancels the timers and immediates
    const disposedCount = disposeRemoteSideEffects('remote-a');
    expect(disposedCount).toBe(3);
    expect(getRecordedRemoteSideEffects('remote-a')).toBeUndefined();
  });

  it('records process listeners and removes them on dispose', () => {
    const originalOn = process.on;
    const warningHandler = () => {};
    const customHandler = () => {};

    withSideEffectScope('remote-b', () => {
      expect(process.on).not.toBe(originalOn);

      process.on('warning', warningHandler);
      process.addListener('uncaughtException', customHandler);
    });

    expect(process.on).toBe(originalOn);

    const recorded = getRecordedRemoteSideEffects('remote-b');
    expect(recorded).toBeDefined();
    expect(recorded!.listeners.length).toBe(2);

    expect(process.listeners('warning')).toContain(warningHandler);
    expect(process.listeners('uncaughtException')).toContain(customHandler);

    const disposed = disposeRemoteSideEffects('remote-b');
    expect(disposed).toBe(2);

    expect(process.listeners('warning')).not.toContain(warningHandler);
    expect(process.listeners('uncaughtException')).not.toContain(customHandler);
  });

  it('handles nested scope stack (re-entrant calls)', () => {
    let timerOuter: any;
    let timerInner: any;

    withSideEffectScope('outer', () => {
      timerOuter = setTimeout(() => {}, 5000);

      withSideEffectScope('inner', () => {
        timerInner = setTimeout(() => {}, 5000);
      });

      // Still in outer scope
      expect(
        getRecordedRemoteSideEffects('inner')!.timers.has(timerInner),
      ).toBe(true);
    });

    const outerRecorded = getRecordedRemoteSideEffects('outer');
    const innerRecorded = getRecordedRemoteSideEffects('inner');

    expect(outerRecorded!.timers.has(timerOuter)).toBe(true);
    expect(outerRecorded!.timers.has(timerInner)).toBe(false);
    expect(innerRecorded!.timers.has(timerInner)).toBe(true);

    disposeRemoteSideEffects('outer');
    disposeRemoteSideEffects('inner');
  });

  it('restores originals when an error is thrown inside the scope', () => {
    const originalSetTimeout = globalThis.setTimeout;
    const originalOn = process.on;

    expect(() => {
      withSideEffectScope('faulty', () => {
        setTimeout(() => {}, 1000);
        throw new Error('boom');
      });
    }).toThrow('boom');

    expect(globalThis.setTimeout).toBe(originalSetTimeout);
    expect(process.on).toBe(originalOn);

    disposeRemoteSideEffects('faulty');
  });

  it('ignores side-effects registered asynchronously outside the sync scope', async () => {
    let asyncTimer: any;

    withSideEffectScope('sync-only', () => {
      setTimeout(() => {}, 1000);
    });

    // Outside sync scope
    asyncTimer = setTimeout(() => {}, 1000);

    const recorded = getRecordedRemoteSideEffects('sync-only');
    expect(recorded!.timers.size).toBe(1);
    expect(recorded!.timers.has(asyncTimer)).toBe(false);

    clearTimeout(asyncTimer);
    disposeRemoteSideEffects('sync-only');
  });
});
