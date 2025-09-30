import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cx } from '../../utils/cx';
export function VersionStalenessInfo(param) {
    let { versionInfo, bundlerName } = param;
    const { staleness } = versionInfo;
    let { text, indicatorClass, title } = getStaleness(versionInfo);
    const isTurbopack = bundlerName === 'Turbopack';
    const shouldBeLink = staleness.startsWith('stale');
    if (shouldBeLink) {
        return /*#__PURE__*/ _jsxs("a", {
            className: "nextjs-container-build-error-version-status dialog-exclude-closing-from-outside-click",
            target: "_blank",
            rel: "noopener noreferrer",
            href: "https://nextjs.org/docs/messages/version-staleness",
            children: [
                /*#__PURE__*/ _jsx(Eclipse, {
                    className: cx('version-staleness-indicator', indicatorClass)
                }),
                /*#__PURE__*/ _jsx("span", {
                    "data-nextjs-version-checker": true,
                    title: title,
                    children: text
                }),
                /*#__PURE__*/ _jsx("span", {
                    className: cx(isTurbopack && 'turbopack-text'),
                    children: bundlerName
                })
            ]
        });
    }
    return /*#__PURE__*/ _jsxs("span", {
        className: "nextjs-container-build-error-version-status dialog-exclude-closing-from-outside-click",
        children: [
            /*#__PURE__*/ _jsx(Eclipse, {
                className: cx('version-staleness-indicator', indicatorClass)
            }),
            /*#__PURE__*/ _jsx("span", {
                "data-nextjs-version-checker": true,
                title: title,
                children: text
            }),
            /*#__PURE__*/ _jsx("span", {
                className: cx(isTurbopack && 'turbopack-text'),
                children: bundlerName
            })
        ]
    });
}
export function getStaleness(param) {
    let { installed, staleness, expected } = param;
    let text = '';
    let title = '';
    let indicatorClass = '';
    const versionLabel = "Next.js " + installed;
    switch(staleness){
        case 'newer-than-npm':
        case 'fresh':
            text = versionLabel;
            title = "Latest available version is detected (" + installed + ").";
            indicatorClass = 'fresh';
            break;
        case 'stale-patch':
        case 'stale-minor':
            text = "" + versionLabel + " (stale)";
            title = "There is a newer version (" + expected + ") available, upgrade recommended! ";
            indicatorClass = 'stale';
            break;
        case 'stale-major':
            {
                text = "" + versionLabel + " (outdated)";
                title = "An outdated version detected (latest is " + expected + "), upgrade is highly recommended!";
                indicatorClass = 'outdated';
                break;
            }
        case 'stale-prerelease':
            {
                text = "" + versionLabel + " (stale)";
                title = "There is a newer canary version (" + expected + ") available, please upgrade! ";
                indicatorClass = 'stale';
                break;
            }
        case 'unknown':
            text = "" + versionLabel + " (unknown)";
            title = 'No Next.js version data was found.';
            indicatorClass = 'unknown';
            break;
        default:
            break;
    }
    return {
        text,
        indicatorClass,
        title
    };
}
export const styles = "\n  .nextjs-container-build-error-version-status {\n    -webkit-font-smoothing: antialiased;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    gap: 4px;\n\n    height: var(--size-26);\n    padding: 6px 8px 6px 6px;\n    background: var(--color-background-100);\n    background-clip: padding-box;\n    border: 1px solid var(--color-gray-alpha-400);\n    box-shadow: var(--shadow-small);\n    border-radius: var(--rounded-full);\n\n    color: var(--color-gray-900);\n    font-size: var(--size-12);\n    font-weight: 500;\n    line-height: var(--size-16);\n  }\n\n  a.nextjs-container-build-error-version-status {\n    text-decoration: none;\n    color: var(--color-gray-900);\n\n    &:hover {\n      background: var(--color-gray-100);\n    }\n\n    &:focus {\n      outline: var(--focus-ring);\n    }\n  }\n\n  .version-staleness-indicator.fresh {\n    fill: var(--color-green-800);\n    stroke: var(--color-green-300);\n  }\n  .version-staleness-indicator.stale {\n    fill: var(--color-amber-800);\n    stroke: var(--color-amber-300);\n  }\n  .version-staleness-indicator.outdated {\n    fill: var(--color-red-800);\n    stroke: var(--color-red-300);\n  }\n  .version-staleness-indicator.unknown {\n    fill: var(--color-gray-800);\n    stroke: var(--color-gray-300);\n  }\n\n  .nextjs-container-build-error-version-status > .turbopack-text {\n    background: linear-gradient(\n      to right,\n      var(--color-turbopack-text-red) 0%,\n      var(--color-turbopack-text-blue) 100%\n    );\n    background-clip: text;\n    -webkit-background-clip: text;\n    -webkit-text-fill-color: transparent;\n  }\n";
function Eclipse(param) {
    let { className } = param;
    return /*#__PURE__*/ _jsx("svg", {
        width: "14",
        height: "14",
        viewBox: "0 0 14 14",
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
        children: /*#__PURE__*/ _jsx("circle", {
            className: className,
            cx: "7",
            cy: "7",
            r: "5.5",
            strokeWidth: "3"
        })
    });
}

//# sourceMappingURL=version-staleness-info.js.map