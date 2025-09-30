import type { HTMLProps } from 'react';
export declare const DISALLOWED_FORM_PROPS: readonly ["method", "encType", "target"];
type HTMLFormProps = HTMLProps<HTMLFormElement>;
type DisallowedFormProps = (typeof DISALLOWED_FORM_PROPS)[number];
type InternalFormProps = {
    /**
     * `action` can be either a `string` or a function.
     * - If `action` is a string, it will be interpreted as a path or URL to navigate to when the form is submitted.
     *   The path will be prefetched when the form becomes visible.
     * - If `action` is a function, it will be called when the form is submitted. See the [React docs](https://react.dev/reference/react-dom/components/form#props) for more.
     */
    action: NonNullable<HTMLFormProps['action']>;
    /**
     * Controls how the route specified by `action` is prefetched.
     * Any `<Form />` that is in the viewport (initially or through scroll) will be prefetched.
     * Prefetch can be disabled by passing `prefetch={false}`. Prefetching is only enabled in production.
     *
     * Options:
     * - `null` (default): For statically generated pages, this will prefetch the full React Server Component data. For dynamic pages, this will prefetch up to the nearest route segment with a [`loading.js`](https://nextjs.org/docs/app/api-reference/file-conventions/loading) file. If there is no loading file, it will not fetch the full tree to avoid fetching too much data.
     * - `false`: This will not prefetch any data.
     *
     * In pages dir, prefetching is not supported, and passing this prop will emit a warning.
     *
     * @defaultValue `null`
     */
    prefetch?: false | null;
    /**
     * Whether submitting the form should replace the current `history` state instead of adding a new url into the stack.
     * Only valid if `action` is a string.
     *
     * @defaultValue `false`
     */
    replace?: boolean;
    /**
     * Override the default scroll behavior when navigating.
     * Only valid if `action` is a string.
     *
     * @defaultValue `true`
     */
    scroll?: boolean;
} & Omit<HTMLFormProps, 'action' | DisallowedFormProps>;
export type FormProps<RouteInferType = any> = InternalFormProps;
export declare function createFormSubmitDestinationUrl(action: string, formElement: HTMLFormElement): URL;
export declare function checkFormActionUrl(action: string, source: 'action' | 'formAction'): void;
export declare const isSupportedFormEncType: (value: string) => value is "application/x-www-form-urlencoded";
export declare const isSupportedFormMethod: (value: string) => value is "get";
export declare const isSupportedFormTarget: (value: string) => value is "_self";
export declare function hasUnsupportedSubmitterAttributes(submitter: HTMLElement): boolean;
export declare function hasReactClientActionAttributes(submitter: HTMLElement): boolean | "" | null;
export {};
