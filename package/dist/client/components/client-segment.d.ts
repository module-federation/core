import type { Params } from '../../server/request/params';
/**
 * When the Page is a client component we send the params to this client wrapper
 * where they are turned into dynamically tracked values before being passed to the actual Segment component.
 *
 * additionally we may send a promise representing params. We don't ever use this passed
 * value but it can be necessary for the sender to send a Promise that doesn't resolve in certain situations
 * such as when dynamicIO is enabled. It is up to the caller to decide if the promises are needed.
 */
export declare function ClientSegmentRoot({ Component, slots, params, promise, }: {
    Component: React.ComponentType<any>;
    slots: {
        [key: string]: React.ReactNode;
    };
    params: Params;
    promise?: Promise<any>;
}): import("react/jsx-runtime").JSX.Element;
