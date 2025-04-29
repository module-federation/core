export class BasicPluginOptionsManager<T> {
  private _options?: T;
  private _root: string;

  constructor(root = process.cwd()) {
    this._root = root;
  }

  get enable(): boolean {
    return Boolean(this._options);
  }

  get options(): T {
    return this._options as unknown as T;
  }

  get root(): string {
    return this._root;
  }

  init(options: T, extraArgs?: Record<string, any>): void {
    this._options = options;
  }

  setOptions(options: T): void {
    this._options = options;
  }
}
