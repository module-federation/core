export type CreateScriptHookReturnNode = { url: string } | void;

export type CreateScriptHookReturnReactNative = { url: string } | void;

export type CreateScriptHookReturnDom =
  | HTMLScriptElement
  | { script?: HTMLScriptElement; timeout?: number }
  | void;

export type CreateScriptHookReturn =
  | CreateScriptHookReturnNode
  | CreateScriptHookReturnReactNative
  | CreateScriptHookReturnDom;

export type CreateScriptHook = (
  url: string,
  attrs?: Record<string, any> | undefined,
) => CreateScriptHookReturn;
