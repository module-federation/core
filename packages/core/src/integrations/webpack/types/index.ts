export type WebpackRequire = {
  l: (
    url: string | undefined,
    cb: (event: any) => void,
    id: string | number,
  ) => Record<string, unknown>;
  S: Record<string, unknown>;
};
