import type { WorkStore } from '../app-render/work-async-storage.external';
export type SearchParams = {
    [key: string]: string | string[] | undefined;
};
/**
 * In this version of Next.js the `params` prop passed to Layouts, Pages, and other Segments is a Promise.
 * However to facilitate migration to this new Promise type you can currently still access params directly on the Promise instance passed to these Segments.
 * The `UnsafeUnwrappedSearchParams` type is available if you need to temporarily access the underlying params without first awaiting or `use`ing the Promise.
 *
 * In a future version of Next.js the `params` prop will be a plain Promise and this type will be removed.
 *
 * Typically instances of `params` can be updated automatically to be treated as a Promise by a codemod published alongside this Next.js version however if you
 * have not yet run the codemod of the codemod cannot detect certain instances of `params` usage you should first try to refactor your code to await `params`.
 *
 * If refactoring is not possible but you still want to be able to access params directly without typescript errors you can cast the params Promise to this type
 *
 * ```tsx
 * type Props = { searchParams: Promise<{ foo: string }> }
 *
 * export default async function Page(props: Props) {
 *  const { searchParams } = (props.searchParams as unknown as UnsafeUnwrappedSearchParams<typeof props.searchParams>)
 *  return ...
 * }
 * ```
 *
 * This type is marked deprecated to help identify it as target for refactoring away.
 *
 * @deprecated
 */
export type UnsafeUnwrappedSearchParams<P> = P extends Promise<infer U> ? Omit<U, 'then' | 'status' | 'value'> : never;
export declare function createSearchParamsFromClient(underlyingSearchParams: SearchParams, workStore: WorkStore): Promise<SearchParams>;
export declare const createServerSearchParamsForMetadata: typeof createServerSearchParamsForServerPage;
export declare function createServerSearchParamsForServerPage(underlyingSearchParams: SearchParams, workStore: WorkStore): Promise<SearchParams>;
export declare function createPrerenderSearchParamsForClientPage(workStore: WorkStore): Promise<SearchParams>;
/**
 * This is a variation of `makeErroringExoticSearchParams` that always throws an
 * error on access, because accessing searchParams inside of `"use cache"` is
 * not allowed.
 */
export declare function makeErroringExoticSearchParamsForUseCache(workStore: WorkStore): Promise<SearchParams>;
