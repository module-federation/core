import type { VersionInfo } from '../../../../../../server/dev/parse-version-info';
export declare function VersionStalenessInfo({ versionInfo, bundlerName, }: {
    versionInfo: VersionInfo;
    bundlerName: 'Webpack' | 'Turbopack' | 'Rspack';
}): import("react/jsx-runtime").JSX.Element;
export declare function getStaleness({ installed, staleness, expected }: VersionInfo): {
    text: string;
    indicatorClass: string;
    title: string;
};
export declare const styles = "\n  .nextjs-container-build-error-version-status {\n    -webkit-font-smoothing: antialiased;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    gap: 4px;\n\n    height: var(--size-26);\n    padding: 6px 8px 6px 6px;\n    background: var(--color-background-100);\n    background-clip: padding-box;\n    border: 1px solid var(--color-gray-alpha-400);\n    box-shadow: var(--shadow-small);\n    border-radius: var(--rounded-full);\n\n    color: var(--color-gray-900);\n    font-size: var(--size-12);\n    font-weight: 500;\n    line-height: var(--size-16);\n  }\n\n  a.nextjs-container-build-error-version-status {\n    text-decoration: none;\n    color: var(--color-gray-900);\n\n    &:hover {\n      background: var(--color-gray-100);\n    }\n\n    &:focus {\n      outline: var(--focus-ring);\n    }\n  }\n\n  .version-staleness-indicator.fresh {\n    fill: var(--color-green-800);\n    stroke: var(--color-green-300);\n  }\n  .version-staleness-indicator.stale {\n    fill: var(--color-amber-800);\n    stroke: var(--color-amber-300);\n  }\n  .version-staleness-indicator.outdated {\n    fill: var(--color-red-800);\n    stroke: var(--color-red-300);\n  }\n  .version-staleness-indicator.unknown {\n    fill: var(--color-gray-800);\n    stroke: var(--color-gray-300);\n  }\n\n  .nextjs-container-build-error-version-status > .turbopack-text {\n    background: linear-gradient(\n      to right,\n      var(--color-turbopack-text-red) 0%,\n      var(--color-turbopack-text-blue) 100%\n    );\n    background-clip: text;\n    -webkit-background-clip: text;\n    -webkit-text-fill-color: transparent;\n  }\n";
