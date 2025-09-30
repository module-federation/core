// Share the instance module in the next-shared layer
import { workAsyncStorageInstance } from './work-async-storage-instance' with {
    'turbopack-transition': 'next-shared'
};
export { workAsyncStorageInstance as workAsyncStorage };

//# sourceMappingURL=work-async-storage.external.js.map