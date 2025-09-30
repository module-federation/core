import type { WorkStore } from '../app-render/work-async-storage.external';
export declare function throwWithStaticGenerationBailoutError(route: string, expression: string): never;
export declare function throwWithStaticGenerationBailoutErrorWithDynamicError(route: string, expression: string): never;
export declare function throwForSearchParamsAccessInUseCache(workStore: WorkStore): never;
export declare function isRequestAPICallableInsideAfter(): boolean;
