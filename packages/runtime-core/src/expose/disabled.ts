export class DisabledExposeHandler {
  get(): never {
    throw new Error(
      'Remote loading is disabled by experiments.optimization.disableRemote.',
    );
  }
}
