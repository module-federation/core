// /src/types/modern-js.d.ts
import type { AppToolsNormalizedConfig } from '@modern-js/app-tools';

type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

type ExcludeUndefined<T> = T extends undefined ? never : T;
type ExcludeVoid<T> = T extends void ? never : T;
type NonUndefined<T> = ExcludeUndefined<T>;
type NonVoid<T> = ExcludeVoid<T>;
type Must<T> = NonVoid<NonUndefined<T>>;

type PickObjectArr<T> = T extends Record<string, any>[] ? never : T;
type ExcludeFunction<T> = T extends (...args: any[]) => any ? never : T;

type WebpackPlugins = Must<AppToolsNormalizedConfig['tools']['webpack']>;

export type WebpackPluginType = ArrayElement<
  Must<ExcludeFunction<PickObjectArr<WebpackPlugins>>['plugins']>
>;
