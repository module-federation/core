import { isBailoutToCSRError } from '../../shared/lib/lazy-dynamic/bailout-to-csr';
import { isNextRouterError } from './is-next-router-error';
export function unstable_rethrow(error) {
    if (isNextRouterError(error) || isBailoutToCSRError(error)) {
        throw error;
    }
    if (error instanceof Error && 'cause' in error) {
        unstable_rethrow(error.cause);
    }
}

//# sourceMappingURL=unstable-rethrow.browser.js.map