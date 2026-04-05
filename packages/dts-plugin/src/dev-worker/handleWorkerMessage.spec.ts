import { describe, expect, it, vi, afterEach } from 'vitest';

import { RpcGMCallTypes } from '../core/rpc/types';
import { handleDevWorkerMessage } from './handleWorkerMessage';

describe('handleDevWorkerMessage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not throw when EXIT arrives before module server is initialized', () => {
    const processExit = vi.fn();

    expect(() =>
      handleDevWorkerMessage(
        {
          type: RpcGMCallTypes.EXIT,
          id: 'exit-before-init',
        },
        { processExit, log: vi.fn() },
      ),
    ).not.toThrow();

    expect(processExit).toHaveBeenCalledWith(0);
  });

  it('calls module server exit when present', () => {
    const processExit = vi.fn();
    const moduleServer = {
      exit: vi.fn(),
    };

    handleDevWorkerMessage(
      {
        type: RpcGMCallTypes.EXIT,
        id: 'exit-with-server',
      },
      { moduleServer, processExit, log: vi.fn() },
    );

    expect(moduleServer.exit).toHaveBeenCalledTimes(1);
    expect(processExit).toHaveBeenCalledWith(0);
  });

  it('ignores non-exit messages', () => {
    const processExit = vi.fn();
    const moduleServer = {
      exit: vi.fn(),
    };

    handleDevWorkerMessage(
      {
        type: RpcGMCallTypes.CALL,
        id: 'message',
        args: [],
      },
      { moduleServer, processExit, log: vi.fn() },
    );

    expect(moduleServer.exit).not.toHaveBeenCalled();
    expect(processExit).not.toHaveBeenCalled();
  });
});
