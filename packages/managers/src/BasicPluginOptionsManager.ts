export class BasicPluginOptionsManager<T> {
  private _options?: T;

  get enable(): boolean {
    return Boolean(this._options);
  }

  get options(): T {
    return this._options as unknown as T;
  }

  init(options: T, extraArgs?: Record<string, any>): void {
    this._options = options;
  }

  setOptions(options: T): void {
    this._options = options;
  }
}
