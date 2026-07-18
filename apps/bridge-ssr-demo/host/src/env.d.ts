/// <reference types="@rsbuild/core/types" />

declare module 'bridge_ssr_react/export-app' {
  const provider: () => {
    render: (info: Record<string, unknown>) => void | Promise<void>;
    destroy: (info: { dom: HTMLElement }) => void;
    renderToString?: (
      info: Record<string, unknown>,
    ) => Promise<{ html: string; state?: Record<string, unknown> }>;
  };
  export default provider;
}

declare module 'bridge_ssr_vue/export-app' {
  const provider: () => {
    render: (info: Record<string, unknown>) => void | Promise<void>;
    destroy: (info: { dom: HTMLElement }) => void;
    renderToString?: (
      info: Record<string, unknown>,
    ) => Promise<{ html: string; state?: Record<string, unknown> }>;
  };
  export default provider;
}
