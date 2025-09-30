/**
 * The revalidate option used internally for pages. A value of `false` means
 * that the page should not be revalidated. A number means that the page
 * should be revalidated after the given number of seconds (this also includes
 * `1` which means to revalidate after 1 second). A value of `0` is not a valid
 * value for this option.
 */
export type Revalidate = number | false;
export interface CacheControl {
    revalidate: Revalidate;
    expire: number | undefined;
}
export declare function getCacheControlHeader({ revalidate, expire, }: CacheControl): string;
