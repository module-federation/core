import { PrefixPathnameNormalizer } from './prefix';
export class BasePathPathnameNormalizer extends PrefixPathnameNormalizer {
    constructor(basePath){
        if (!basePath || basePath === '/') {
            throw Object.defineProperty(new Error('Invariant: basePath must be set and cannot be "/"'), "__NEXT_ERROR_CODE", {
                value: "E154",
                enumerable: false,
                configurable: true
            });
        }
        super(basePath);
    }
}

//# sourceMappingURL=base-path.js.map