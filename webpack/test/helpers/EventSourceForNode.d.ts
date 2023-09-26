/// <reference types="node" />
export = EventSource;
declare class EventSource {
  constructor(url: any);
  response: import('http').IncomingMessage;
  close(): void;
  set onopen(arg: any);
  set onmessage(arg: any);
}
