export class DisabledExposeHandler {
  get(): never {
    throw new Error(
      'Expose loading is disabled by experiments.optimization.disableExpose.',
    );
  }
}
