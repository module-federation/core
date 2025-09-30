export declare const REACT_HYDRATION_ERROR_LINK = "https://react.dev/link/hydration-mismatch";
export declare const NEXTJS_HYDRATION_ERROR_LINK = "https://nextjs.org/docs/messages/react-hydration-error";
export declare const getDefaultHydrationErrorMessage: () => string;
export declare function isHydrationError(error: unknown): boolean;
export declare function isReactHydrationErrorMessage(msg: string): boolean;
export declare function testReactHydrationWarning(msg: string): boolean;
export declare function getHydrationErrorStackInfo(rawMessage: string): {
    message: string | null;
    stack?: string;
    diff?: string;
};
