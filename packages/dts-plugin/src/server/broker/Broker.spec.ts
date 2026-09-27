import { createServer, type Server } from 'http';
import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { Broker } from './Broker';

describe('Broker', () => {
  let occupant: Server | undefined;

  afterEach(async () => {
    rs.restoreAllMocks();
    await new Promise((resolve) =>
      occupant?.listening ? occupant.close(resolve) : resolve(undefined),
    );
    occupant = undefined;
  });

  it('yields when another broker already owns the port', async () => {
    occupant = createServer();
    // The port may already be held by a broker on this machine; either way
    // it is in use when the Broker below tries to bind it.
    await new Promise<void>((resolve) => {
      occupant!.once('error', () => resolve());
      occupant!.listen(Broker.DEFAULT_WEB_SOCKET_PORT, resolve);
    });
    const exit = rs
      .spyOn(process, 'exit')
      .mockImplementation((() => undefined) as never);

    const broker = new Broker();
    await expect(broker.start()).resolves.toBe(false);

    broker.exit();
    expect(exit).toHaveBeenCalledWith(0);
  });
});
