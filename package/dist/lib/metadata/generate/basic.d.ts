import type { ResolvedMetadata, ResolvedViewport } from '../types/metadata-interface';
export declare function ViewportMeta({ viewport }: {
    viewport: ResolvedViewport;
}): import("react/jsx-runtime").JSX.Element[];
export declare function BasicMeta({ metadata }: {
    metadata: ResolvedMetadata;
}): NonNullable<import("react/jsx-runtime").JSX.Element | (import("react/jsx-runtime").JSX.Element | null)[]>[];
export declare function ItunesMeta({ itunes }: {
    itunes: ResolvedMetadata['itunes'];
}): import("react/jsx-runtime").JSX.Element | null;
export declare function FacebookMeta({ facebook, }: {
    facebook: ResolvedMetadata['facebook'];
}): import("react/jsx-runtime").JSX.Element[] | null;
export declare function PinterestMeta({ pinterest, }: {
    pinterest: ResolvedMetadata['pinterest'];
}): import("react/jsx-runtime").JSX.Element | null;
export declare function FormatDetectionMeta({ formatDetection, }: {
    formatDetection: ResolvedMetadata['formatDetection'];
}): import("react/jsx-runtime").JSX.Element | null;
export declare function AppleWebAppMeta({ appleWebApp, }: {
    appleWebApp: ResolvedMetadata['appleWebApp'];
}): NonNullable<import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | import("react/jsx-runtime").JSX.Element[]>[] | null;
export declare function VerificationMeta({ verification, }: {
    verification: ResolvedMetadata['verification'];
}): NonNullable<import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>[]>[][] | null;
