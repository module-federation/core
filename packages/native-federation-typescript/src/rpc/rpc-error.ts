class RpcExitError extends Error {
  constructor(
    message: string,
    readonly code?: string | number | null,
    readonly signal?: string | null,
  ) {
    super(message);
    this.name = 'RpcExitError';
  }
}

export { RpcExitError };
