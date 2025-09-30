import type { DevToolsScale } from './dev-tools-info/preferences';
interface Props extends React.ComponentProps<'button'> {
    issueCount: number;
    isDevBuilding: boolean;
    isDevRendering: boolean;
    isBuildError: boolean;
    onTriggerClick: () => void;
    toggleErrorOverlay: () => void;
    scale: DevToolsScale;
}
export declare const NextLogo: import("react").ForwardRefExoticComponent<Omit<Props, "ref"> & import("react").RefAttributes<HTMLButtonElement>>;
export declare function Cross(props: React.SVGProps<SVGSVGElement>): import("react/jsx-runtime").JSX.Element;
export {};
