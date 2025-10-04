/// <reference lib="webworker" />

self.onmessage = async (event: MessageEvent<{ value: string }>) => {
  const module = await import('./map');
  const value = event.data.value;

  self.postMessage({
    answer: module.workerMap[value] ?? null,
  });
};
