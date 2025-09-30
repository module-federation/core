import { NodeModuleLoader } from './node-module-loader';
export class RouteModuleLoader {
    static async load(id, loader = new NodeModuleLoader()) {
        const module = await loader.load(id);
        if ('routeModule' in module) {
            return module.routeModule;
        }
        throw Object.defineProperty(new Error(`Module "${id}" does not export a routeModule.`), "__NEXT_ERROR_CODE", {
            value: "E53",
            enumerable: false,
            configurable: true
        });
    }
}

//# sourceMappingURL=route-module-loader.js.map