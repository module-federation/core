import { describe, expect, it, rs, afterEach } from '@rstest/core';

import { RpcGMCallTypes } from '../core/rpc/types';
import { handleDevWorkerMessage } from './handleWorkerMessage';

describe('handleDevWorkerMessage', () => {
  afterEach(() => {
    rs.restoreAllMocks();
  });

  it('does not throw when EXIT arrives before module server is initialized', () => {
    const processExit = rs.fn();

    expect(() =>
      handleDevWorkerMessage(
        {
          type: RpcGMCallTypes.EXIT,
          id: 'exit-before-init',
        },
        { processExit, log: rs.fn() },
      ),
    ).not.toThrow();

    expect(processExit).toHaveBeenCalledWith(0);
  });

  it('calls module server exit when present', () => {
    const processExit = rs.fn();
    const moduleServer = {
      exit: rs.fn(),
    };

    handleDevWorkerMessage(
      {
        type: RpcGMCallTypes.EXIT,
        id: 'exit-with-server',
      },
      { moduleServer, processExit, log: rs.fn() },
    );

    expect(moduleServer.exit).toHaveBeenCalledTimes(1);
    expect(processExit).toHaveBeenCalledWith(0);
  });

  it('ignores non-exit messages', () => {
    const processExit = rs.fn();
    const moduleServer = {
      exit: rs.fn(),
    };

    handleDevWorkerMessage(
      {
        type: RpcGMCallTypes.CALL,
        id: 'message',
        args: [],
      },
      { moduleServer, processExit, log: rs.fn() },
    );

    expect(moduleServer.exit).not.toHaveBeenCalled();
    expect(processExit).not.toHaveBeenCalled();
  });
});
