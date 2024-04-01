import { Broker } from './Broker';
import { fileLog } from '../utils';
let broker: Broker;

export function getBroker(): Broker | undefined {
  return broker;
}

async function startBroker(): Promise<void> {
  if (getBroker()) {
    return;
  }
  broker = new Broker();

  await broker.start();

  process.send?.('ready');
}

// * Broker won't start until this process receives a 'start'
// * signal, or an error will occur in a ProxyService.
process.on('message', (message) => {
  if (message === 'start') {
    fileLog(`startBroker... ${process.pid}`, 'StartBroker', 'info');
    startBroker();
  }
});
