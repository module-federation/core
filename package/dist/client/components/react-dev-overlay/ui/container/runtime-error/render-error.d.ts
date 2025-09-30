import type { OverlayState, UnhandledErrorAction, UnhandledRejectionAction } from '../../../shared';
import { type ReadyRuntimeError } from '../../../utils/get-error-by-type';
export type SupportedErrorEvent = {
    id: number;
    event: UnhandledErrorAction | UnhandledRejectionAction;
};
type Props = {
    children: (params: {
        runtimeErrors: ReadyRuntimeError[];
        totalErrorCount: number;
    }) => React.ReactNode;
    state: OverlayState;
    isAppDir: boolean;
};
export declare const RenderError: (props: Props) => import("react/jsx-runtime").JSX.Element;
export {};
