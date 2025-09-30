import { type SearchParams } from '../request/search-params';
import type { Params } from '../request/params';
export interface UseCachePageComponentProps {
    params: Promise<Params>;
    searchParams: Promise<SearchParams>;
    $$isPageComponent: true;
}
export declare function cache(kind: string, id: string, boundArgsLength: number, originalFn: (...args: unknown[]) => Promise<unknown>): (...args: any[]) => Promise<unknown>;
