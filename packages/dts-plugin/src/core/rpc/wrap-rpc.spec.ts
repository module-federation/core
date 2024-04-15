import { ChildProcess } from 'child_process';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { randomUUID } from 'crypto';

import { RpcExitError, wrapRpc, RpcMessage, RpcGMCallTypes } from './index';

describe('wrapRpc', () => {
  let childProcessMock: ChildProcess;
  let eventHandlers: Record<string, Array<(...args: unknown[]) => void>>;
  let messageIds: string[];

  beforeEach(() => {
    eventHandlers = {};
    messageIds = [];
    const mockChildProcessFn = {
      send: (message: RpcMessage, callback: () => void) => {
        messageIds.push(message?.id);
        callback();
      },
    };
    childProcessMock = {
      connected: true,
      pid: 1234,
      send: vi.spyOn(mockChildProcessFn, 'send'),
      on: vi
        .fn()
        .mockImplementation(
          (name: string, handlerToAdd: (...args: unknown[]) => void) => {
            if (!eventHandlers[name]) {
              eventHandlers[name] = [];
            }

            eventHandlers[name].push((...args: unknown[]) => {
              if (name === 'close') {
                eventHandlers['message'] = [];
                eventHandlers['close'] = [];
              }
              handlerToAdd(...args);
            });
          },
        ),
      once: vi
        .fn()
        .mockImplementation(
          (name: string, handlerToAdd: (...args: unknown[]) => void) => {
            if (!eventHandlers[name]) {
              eventHandlers[name] = [];
            }
            eventHandlers[name].push((...args: unknown[]) => {
              eventHandlers[name] = [];
              handlerToAdd(...args);
            });
          },
        ),
      off: vi
        .fn()
        .mockImplementation(
          (name: string, handlerToRemove: (...args: unknown[]) => void) => {
            if (!eventHandlers[name]) {
              return;
            }
            eventHandlers[name] = eventHandlers[name].filter(
              (handler) => handler !== handlerToRemove,
            );
          },
        ),
      kill: vi.fn().mockImplementation((signal?: NodeJS.Signals | number) => {
        const handlerName = 'close';
        if (!eventHandlers[handlerName]) {
          return;
        }
        eventHandlers[handlerName].forEach((handler) => {
          handler(0, signal);
        });
      }),
      // we don't have to implement all methods - it would take a lot of code to do so
    } as unknown as ChildProcess;
  });

  describe('resident process', () => {
    it('returns new functions without adding event handlers', () => {
      const wrapped = wrapRpc(childProcessMock, { id: randomUUID() });
      expect(wrapped).toBeInstanceOf(Function);
      expect(eventHandlers).toEqual({});
    });

    it("throws an error if child process doesn't have IPC channels", async () => {
      // @ts-expect-error mock unexpected child process
      childProcessMock.send = undefined;
      const wrapped = wrapRpc(childProcessMock, { id: randomUUID() });
      await expect(wrapped()).rejects.toEqual(
        new Error("Process 1234 doesn't have IPC channels"),
      );
      expect(eventHandlers).toEqual({});
    });

    it("throws an error if child process doesn't have open IPC channels", async () => {
      // @ts-expect-error We're using mock here :)
      childProcessMock.connected = false;
      const wrapped = wrapRpc(childProcessMock, { id: randomUUID() });
      await expect(wrapped()).rejects.toEqual(
        new Error("Process 1234 doesn't have open IPC channels"),
      );
      expect(eventHandlers).toEqual({});
    });

    it('sends a call message', async () => {
      const id = randomUUID();
      const wrapped = wrapRpc(childProcessMock, { id });
      wrapped('foo', 1234);
      expect(childProcessMock.send).toHaveBeenCalledWith(
        {
          type: RpcGMCallTypes.CALL,
          id: id,
          args: ['foo', 1234],
        },
        expect.any(Function),
      );
      expect(eventHandlers).toMatchSnapshot({
        message: [expect.any(Function)],
        close: [expect.any(Function)],
      });
    });

    it('ignores invalid message', async () => {
      const id = randomUUID();
      const wrapped = wrapRpc<() => void>(childProcessMock, { id });
      wrapped();
      expect(messageIds).toEqual([id]);
      expect(eventHandlers['message']).toMatchSnapshot([expect.any(Function)]);
      const triggerMessage = eventHandlers['message'][0];

      triggerMessage(undefined);
      triggerMessage('test');
      triggerMessage({});
      triggerMessage({ id: 'test' });

      expect(eventHandlers).toMatchSnapshot({
        message: [expect.any(Function)],
        close: [expect.any(Function)],
      });
    });

    it('resolves on valid resolve message', async () => {
      const id = randomUUID();
      const wrapped = wrapRpc<() => void>(childProcessMock, { id });
      const promise = wrapped();
      expect(messageIds).toEqual([id]);
      expect(eventHandlers['message']).toMatchSnapshot([expect.any(Function)]);
      const triggerMessage = eventHandlers['message'][0];

      triggerMessage({
        id,
        type: RpcGMCallTypes.RESOLVE,
        value: 41,
      });

      expect(promise).resolves.toEqual(41);
      expect(eventHandlers).toMatchSnapshot({
        message: [expect.any(Function)],
        close: [expect.any(Function)],
      });
    });

    it('rejects on valid reject message', async () => {
      const id = randomUUID();
      const wrapped = wrapRpc<() => void>(childProcessMock, { id });
      const promise = wrapped();
      expect(messageIds).toEqual([id]);
      expect(eventHandlers['message']).toMatchSnapshot([expect.any(Function)]);
      const triggerMessage = eventHandlers['message'][0];

      triggerMessage({
        id,
        type: RpcGMCallTypes.REJECT,
        error: 'sad error',
      });

      expect(promise).rejects.toEqual('sad error');
      expect(eventHandlers).toMatchSnapshot({
        message: [expect.any(Function)],
        close: [expect.any(Function)],
      });
    });

    it('rejects on send error', async () => {
      childProcessMock.send = vi
        .fn()
        .mockImplementation((message, callback) => {
          callback(new Error('cannot send'));
        });
      const wrapped = wrapRpc<() => void>(childProcessMock, {
        id: randomUUID(),
      });
      expect(wrapped()).rejects.toEqual(new Error('cannot send'));
      expect(eventHandlers).toMatchSnapshot({
        message: [expect.any(Function)],
        close: [expect.any(Function)],
      });
    });

    it.each([
      {
        code: 100,
        signal: 'SIGINT',
        message: 'Process 1234 exited with code 100 [SIGINT]',
      },
      {
        code: -1,
        signal: undefined,
        message: 'Process 1234 exited with code -1',
      },
      { code: undefined, signal: undefined, message: 'Process 1234 exited' },
    ])(
      'rejects on process close with %p',
      async ({ code, signal, message }) => {
        const wrapped = wrapRpc<() => void>(childProcessMock, {
          id: randomUUID(),
        });
        const promise = wrapped();
        expect(eventHandlers['close']).toMatchSnapshot([expect.any(Function)]);
        const triggerClose = eventHandlers['close'][0];

        triggerClose(code, signal);

        expect(promise).rejects.toEqual(
          new RpcExitError(message, code, signal),
        );
        expect(eventHandlers).toMatchSnapshot({
          message: [],
          close: [],
        });
      },
    );
  });

  describe('once', () => {
    it('sends a call message', async () => {
      const id = randomUUID();
      const wrapped = wrapRpc(childProcessMock, { id, once: true });
      wrapped('foo', 1234);
      expect(childProcessMock.send).toHaveBeenCalledWith(
        {
          type: RpcGMCallTypes.CALL,
          id: id,
          args: ['foo', 1234],
        },
        expect.any(Function),
      );
    });

    it('resolves on valid resolve message and all handlers will be cleared', async () => {
      const id = randomUUID();
      const wrapped = wrapRpc<() => void>(childProcessMock, { id, once: true });
      const promise = wrapped();
      expect(messageIds).toEqual([id]);
      expect(eventHandlers['message']).toMatchSnapshot([expect.any(Function)]);
      const triggerMessage = eventHandlers['message'][0];

      triggerMessage({
        id,
        type: RpcGMCallTypes.RESOLVE,
        value: 41,
      });

      expect(promise).resolves.toEqual(41);
      expect(eventHandlers).toEqual({
        message: [],
        close: [],
      });
    });

    it('rejects on valid reject message', async () => {
      const id = randomUUID();
      const wrapped = wrapRpc<() => void>(childProcessMock, { id, once: true });
      const promise = wrapped();
      expect(messageIds).toEqual([id]);
      expect(eventHandlers['message']).toMatchSnapshot([expect.any(Function)]);
      const triggerMessage = eventHandlers['message'][0];

      triggerMessage({
        id,
        type: RpcGMCallTypes.REJECT,
        error: 'sad error',
      });

      expect(promise).rejects.toEqual('sad error');
      expect(eventHandlers).toEqual({
        message: [],
        close: [],
      });
    });

    it.each([
      {
        code: 100,
        signal: 'SIGINT',
        message: 'Process 1234 exited with code 100 [SIGINT]',
      },
      {
        code: -1,
        signal: undefined,
        message: 'Process 1234 exited with code -1',
      },
      { code: undefined, signal: undefined, message: 'Process 1234 exited' },
    ])(
      'rejects on process close with %p',
      async ({ code, signal, message }) => {
        const wrapped = wrapRpc<() => void>(childProcessMock, {
          id: randomUUID(),
          once: true,
        });
        const promise = wrapped();
        expect(eventHandlers['close']).toMatchSnapshot([expect.any(Function)]);
        const triggerClose = eventHandlers['close'][0];

        triggerClose(code, signal);

        expect(promise).rejects.toEqual(
          new RpcExitError(message, code, signal),
        );
        expect(eventHandlers).toMatchSnapshot({
          message: [],
          close: [],
        });
      },
    );
  });
});
