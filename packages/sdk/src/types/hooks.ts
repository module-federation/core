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

export type CreateScriptHookNode = (
  url: string,
  attrs?: Record<string, any> | undefined,
) => CreateScriptHookReturnNode;

export type CreateScriptHookDom = (
  url: string,
  attrs?: Record<string, any> | undefined,
) => CreateScriptHookReturnDom;

export type CreateScriptHook = (
  url: string,
  attrs?: Record<string, any> | undefined,
) => CreateScriptHookReturn;
