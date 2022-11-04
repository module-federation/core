export {};

declare global {
  const __webpack_init_sharing__: (parameter: string) => Promise<void>;
  const __webpack_share_scopes__: { default: any };
  const __webpack_require__: { l: (url: string, cb: (event: any) => void, id: string) => {} };
}
