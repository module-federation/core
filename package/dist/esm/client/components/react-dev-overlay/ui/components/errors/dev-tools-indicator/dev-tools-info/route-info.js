import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DevToolsInfo } from './dev-tools-info';
function StaticRouteContent(param) {
    let { routerType } = param;
    return /*#__PURE__*/ _jsxs("article", {
        className: "dev-tools-info-article",
        children: [
            /*#__PURE__*/ _jsxs("p", {
                className: "dev-tools-info-paragraph",
                children: [
                    "The path",
                    ' ',
                    /*#__PURE__*/ _jsx("code", {
                        className: "dev-tools-info-code",
                        children: window.location.pathname
                    }),
                    ' ',
                    'is marked as "static" since it will be prerendered during the build time.'
                ]
            }),
            /*#__PURE__*/ _jsxs("p", {
                className: "dev-tools-info-paragraph",
                children: [
                    "With Static Rendering, routes are rendered at build time, or in the background after",
                    ' ',
                    /*#__PURE__*/ _jsx("a", {
                        className: "dev-tools-info-link",
                        href: routerType === 'pages' ? 'https://nextjs.org/docs/pages/building-your-application/data-fetching/incremental-static-regeneration' : "https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration",
                        target: "_blank",
                        rel: "noopener noreferrer",
                        children: "data revalidation"
                    }),
                    "."
                ]
            }),
            /*#__PURE__*/ _jsx("p", {
                className: "dev-tools-info-paragraph",
                children: "Static rendering is useful when a route has data that is not personalized to the user and can be known at build time, such as a static blog post or a product page."
            })
        ]
    });
}
function DynamicRouteContent(param) {
    let { routerType } = param;
    return /*#__PURE__*/ _jsxs("article", {
        className: "dev-tools-info-article",
        children: [
            /*#__PURE__*/ _jsxs("p", {
                className: "dev-tools-info-paragraph",
                children: [
                    "The path",
                    ' ',
                    /*#__PURE__*/ _jsx("code", {
                        className: "dev-tools-info-code",
                        children: window.location.pathname
                    }),
                    ' ',
                    'is marked as "dynamic" since it will be rendered for each user at',
                    ' ',
                    /*#__PURE__*/ _jsx("strong", {
                        children: "request time"
                    }),
                    "."
                ]
            }),
            /*#__PURE__*/ _jsx("p", {
                className: "dev-tools-info-paragraph",
                children: "Dynamic rendering is useful when a route has data that is personalized to the user or has information that can only be known at request time, such as cookies or the URL's search params."
            }),
            routerType === 'pages' ? /*#__PURE__*/ _jsxs("p", {
                className: "dev-tools-info-pagraph",
                children: [
                    "Exporting the",
                    ' ',
                    /*#__PURE__*/ _jsx("a", {
                        className: "dev-tools-info-link",
                        href: "https://nextjs.org/docs/pages/building-your-application/data-fetching/get-server-side-props",
                        target: "_blank",
                        rel: "noopener noreferrer",
                        children: "getServerSideProps"
                    }),
                    ' ',
                    "function will opt the route into dynamic rendering. This function will be called by the server on every request."
                ]
            }) : /*#__PURE__*/ _jsxs("p", {
                className: "dev-tools-info-paragraph",
                children: [
                    "During rendering, if a",
                    ' ',
                    /*#__PURE__*/ _jsx("a", {
                        className: "dev-tools-info-link",
                        href: "https://nextjs.org/docs/app/building-your-application/rendering/server-components#dynamic-apis",
                        target: "_blank",
                        rel: "noopener noreferrer",
                        children: "Dynamic API"
                    }),
                    ' ',
                    "or a",
                    ' ',
                    /*#__PURE__*/ _jsx("a", {
                        className: "dev-tools-info-link",
                        href: "https://nextjs.org/docs/app/api-reference/functions/fetch",
                        target: "_blank",
                        rel: "noopener noreferrer",
                        children: "fetch"
                    }),
                    ' ',
                    "option of",
                    ' ',
                    /*#__PURE__*/ _jsx("code", {
                        className: "dev-tools-info-code",
                        children: "{ cache: 'no-store' }"
                    }),
                    ' ',
                    "is discovered, Next.js will switch to dynamically rendering the whole route."
                ]
            })
        ]
    });
}
const learnMoreLink = {
    pages: {
        static: 'https://nextjs.org/docs/pages/building-your-application/rendering/static-site-generation',
        dynamic: 'https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering'
    },
    app: {
        static: 'https://nextjs.org/docs/app/building-your-application/rendering/server-components#static-rendering-default',
        dynamic: 'https://nextjs.org/docs/app/building-your-application/rendering/server-components#dynamic-rendering'
    }
};
export function RouteInfo(param) {
    let { routeType, routerType, ...props } = param;
    const isStaticRoute = routeType === 'Static';
    const learnMore = isStaticRoute ? learnMoreLink[routerType].static : learnMoreLink[routerType].dynamic;
    return /*#__PURE__*/ _jsx(DevToolsInfo, {
        title: "" + routeType + " Route",
        learnMoreLink: learnMore,
        ...props,
        children: isStaticRoute ? /*#__PURE__*/ _jsx(StaticRouteContent, {
            routerType: routerType
        }) : /*#__PURE__*/ _jsx(DynamicRouteContent, {
            routerType: routerType
        })
    });
}
export const DEV_TOOLS_INFO_ROUTE_INFO_STYLES = "";

//# sourceMappingURL=route-info.js.map