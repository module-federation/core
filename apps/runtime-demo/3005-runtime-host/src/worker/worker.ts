/// <reference lib="webworker" />
import { workerMap } from './map';

self.onmessage = (event: MessageEvent<{ value: string }>) => {
  const value = event.data.value;
  self.postMessage({
    answer: workerMap[value] ?? null,
  });
};
