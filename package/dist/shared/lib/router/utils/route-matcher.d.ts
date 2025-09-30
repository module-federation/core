import type { Group } from './route-regex';
import type { Params } from '../../../../server/request/params';
export interface RouteMatchFn {
    (pathname: string): false | Params;
}
type RouteMatcherOptions = {
    re: Pick<RegExp, 'exec'>;
    groups: Record<string, Group>;
};
export declare function getRouteMatcher({ re, groups, }: RouteMatcherOptions): RouteMatchFn;
export {};
