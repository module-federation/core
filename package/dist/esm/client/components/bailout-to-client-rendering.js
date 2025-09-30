import { BailoutToCSRError } from '../../shared/lib/lazy-dynamic/bailout-to-csr';
import { workAsyncStorage } from '../../server/app-render/work-async-storage.external';
export function bailoutToClientRendering(reason) {
    const workStore = workAsyncStorage.getStore();
    if (workStore == null ? void 0 : workStore.forceStatic) return;
    if (workStore == null ? void 0 : workStore.isStaticGeneration) throw Object.defineProperty(new BailoutToCSRError(reason), "__NEXT_ERROR_CODE", {
        value: "E394",
        enumerable: false,
        configurable: true
    });
}

//# sourceMappingURL=bailout-to-client-rendering.js.map