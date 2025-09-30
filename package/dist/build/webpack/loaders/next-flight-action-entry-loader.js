"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
function nextFlightActionEntryLoader() {
    const { actions } = this.getOptions();
    const actionList = JSON.parse(actions);
    const individualActions = actionList.map(([path, actionsFromModule])=>{
        return actionsFromModule.map(({ id, exportedName })=>{
            return [
                id,
                path,
                exportedName
            ];
        });
    }).flat();
    return `
${individualActions.map(([id, path, exportedName])=>{
        // Re-export the same functions from the original module path as action IDs.
        return `export { ${exportedName} as "${id}" } from ${JSON.stringify(path)}`;
    }).join('\n')}
`;
}
const _default = nextFlightActionEntryLoader;

//# sourceMappingURL=next-flight-action-entry-loader.js.map