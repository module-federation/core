"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 * Requires either the default delegate module or a custom one
 *
 */
function patchDefaultSharedLoader(content) {
    const { delegates } = this.getOptions();
    const resolvedDelegates = Object.values(delegates).map((delegate) => {
        const [request, query] = delegate.replace('internal ', '').split('?');
        if (query) {
            let queries = [];
            for (const [key, value] of new URLSearchParams(query).entries()) {
                queries.push(`${key}=${value}`);
            }
            const delegatePath = this.utils.contextify(this.context, this.utils.absolutify(this._compiler?.context || '', request) +
                '?' +
                queries.join('&'));
            return delegatePath;
        }
        else {
            const delegatePath = this.utils.contextify(this.context, this.utils.absolutify(this._compiler?.context || '', request));
            return delegatePath;
        }
    });
    if (content.includes('hasDelegateMarkers')
    // || (this._compilation && this._compilation.name === 'ChildFederationPlugin')
    ) {
        return content;
    }
    const requiredDelegates = resolvedDelegates.map((delegate) => {
        return `require('${delegate}')`;
    });
    return ['', ...requiredDelegates, '//hasDelegateMarkers', content].join('\n');
}
exports.default = patchDefaultSharedLoader;
//# sourceMappingURL=delegateLoader.js.map