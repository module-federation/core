/** @import RuntimeModule from "../runtime/RuntimeModule" */
/**
 * The one key a chunk's runtime modules install on a handler map, or `null` when
 * they install several, none, or one a module could not name. Every module states
 * what it installs, so nothing has to be rendered to find out.
 * @param {RuntimeModule} runtimeModule the runtime module rendering the dispatch
 * @param {string} handlers the handler map global
 * @returns {string | null} the sole handler key, or `null`
 */
export function getOnlyHandlerKey(runtimeModule: RuntimeModule, handlers: string): string | null;
import type RuntimeModule from "../runtime/RuntimeModule";
