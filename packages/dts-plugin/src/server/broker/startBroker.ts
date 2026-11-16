import { Broker } from './Broker';
import { fileLog } from '../utils';
let broker: Broker;

export function getBroker(): Broker | undefined {
  return broker;
}

async function startBroker(port?: number): Promise<void> {
  if (getBroker()) {
    return;
  }
  broker = new Broker(port);

  await broker.start();

  process.send?.('ready');
}

// * Broker won't start until this process receives a 'start'
// * signal, or an error will occur in a ProxyService.
process.on('message', (message) => {
  const request = message as { kind?: string; port?: number } | null;
  if (message === 'start' || request?.kind === 'start') {
    fileLog(`startBroker... ${process.pid}`, 'StartBroker', 'info');
    startBroker(message === 'start' ? undefined : request?.port);
  }
});
