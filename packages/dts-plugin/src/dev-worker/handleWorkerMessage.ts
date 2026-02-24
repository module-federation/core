import { RpcGMCallTypes, type RpcMessage } from '../core/rpc/types';

interface HandleDevWorkerMessageOptions {
  moduleServer?: {
    exit: () => void;
  };
  processExit?: (code?: number) => void;
  pid?: number;
  log?: (message: string, scope: string, level: string) => void;
}

export function handleDevWorkerMessage(
  message: RpcMessage,
  options: HandleDevWorkerMessageOptions = {},
): void {
  const {
    moduleServer,
    processExit = process.exit,
    pid = process.pid,
    log = () => undefined,
  } = options;

  log(
    `ChildProcess(${pid}), message: ${JSON.stringify(message)} `,
    'forkDevWorker',
    'info',
  );

  if (message.type === RpcGMCallTypes.EXIT) {
    log(
      `ChildProcess(${pid}) SIGTERM, Federation DevServer will exit...`,
      'forkDevWorker',
      'error',
    );
    moduleServer?.exit();
    processExit(0);
  }
}
