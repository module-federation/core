import { beforeEach, describe, expect, it, rs } from '@rstest/core';
import { createBroker } from './createBroker';
import { Broker } from './Broker';
import { DEFAULT_WEB_SOCKET_PORT } from '../constant';

const child = rs.hoisted(() => ({ send: rs.fn(), unref: rs.fn() }));
const fork = rs.hoisted(() => rs.fn(() => child));
rs.mock('child_process', () => ({ fork }));

beforeEach(() => {
  rs.clearAllMocks();
});

describe('explicit broker ports', () => {
  it('passes an isolated port through IPC while preserving default startup', () => {
    createBroker(19483);
    expect(child.send).toHaveBeenLastCalledWith({ kind: 'start', port: 19483 });
    expect(child.unref).toHaveBeenCalledTimes(1);
    createBroker();
    expect(child.send).toHaveBeenLastCalledWith({
      kind: 'start',
      port: DEFAULT_WEB_SOCKET_PORT,
    });
  });

  it('rejects invalid ports before forking or starting a listener', () => {
    for (const port of [0, -1, 65536, 1.5, NaN]) {
      expect(() => createBroker(port)).toThrow(RangeError);
      expect(() => new Broker(port)).toThrow(RangeError);
    }
    expect(fork).not.toHaveBeenCalled();
  });
});
