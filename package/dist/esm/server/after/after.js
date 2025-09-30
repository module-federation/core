import { workAsyncStorage } from '../app-render/work-async-storage.external';
/**
 * This function allows you to schedule callbacks to be executed after the current request finishes.
 */ export function after(task) {
    const workStore = workAsyncStorage.getStore();
    if (!workStore) {
        // TODO(after): the linked docs page talks about *dynamic* APIs, which after soon won't be anymore
        throw Object.defineProperty(new Error('`after` was called outside a request scope. Read more: https://nextjs.org/docs/messages/next-dynamic-api-wrong-context'), "__NEXT_ERROR_CODE", {
            value: "E468",
            enumerable: false,
            configurable: true
        });
    }
    const { afterContext } = workStore;
    return afterContext.after(task);
}

//# sourceMappingURL=after.js.map