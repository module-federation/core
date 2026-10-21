/** Zero internal HWM lets HTML and data share one exact pending-byte budget. */
export function channel<T>(
  budget: { bytes: number; limit: number },
  cancel: (reason: unknown) => void,
  onPull?: () => void,
) {
  const queue: { value: T; bytes: number }[] = [];
  let controller!: ReadableStreamDefaultController<T>;
  let waiting: (() => void) | undefined;
  let ended = false;
  let failed = false;
  const flush = () => {
    if (!waiting) return;
    if (queue.length) {
      const next = queue.shift()!;
      budget.bytes -= next.bytes;
      controller.enqueue(next.value);
    } else if (ended) controller.close();
    else return;
    const resolve = waiting;
    waiting = undefined;
    resolve();
  };
  const discard = () => {
    for (const item of queue) budget.bytes -= item.bytes;
    queue.length = 0;
  };
  const stream = new ReadableStream<T>(
    {
      start(value) {
        controller = value;
      },
      pull() {
        onPull?.();
        return new Promise<void>((resolve) => {
          waiting = resolve;
          flush();
        });
      },
      cancel(reason) {
        failed = true;
        discard();
        waiting?.();
        waiting = undefined;
        cancel(reason);
      },
    },
    { highWaterMark: 0 },
  );
  return {
    stream,
    push(value: T, bytes: number) {
      if (failed || ended) throw new Error('Bridge service stream is closed.');
      if (budget.bytes + bytes > budget.limit)
        throw new Error('Bridge service pending buffer exceeds limit.');
      budget.bytes += bytes;
      queue.push({ value, bytes });
      flush();
    },
    close() {
      if (failed || ended) return;
      ended = true;
      flush();
    },
    fail(reason: unknown) {
      if (failed) return;
      failed = true;
      discard();
      controller.error(reason);
      waiting?.();
      waiting = undefined;
    },
  };
}
