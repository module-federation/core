export function needsExperimentalReact(config) {
    const { ppr, taint, viewTransition, routerBFCache } = config.experimental || {};
    return Boolean(ppr || taint || viewTransition || routerBFCache);
}

//# sourceMappingURL=needs-experimental-react.js.map