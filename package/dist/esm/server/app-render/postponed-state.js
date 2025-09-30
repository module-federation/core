import { createPrerenderResumeDataCache, createRenderResumeDataCache } from '../resume-data-cache/resume-data-cache';
import { stringifyResumeDataCache } from '../resume-data-cache/resume-data-cache';
export var DynamicState = /*#__PURE__*/ function(DynamicState) {
    /**
   * The dynamic access occurred during the RSC render phase.
   */ DynamicState[DynamicState["DATA"] = 1] = "DATA";
    /**
   * The dynamic access occurred during the HTML shell render phase.
   */ DynamicState[DynamicState["HTML"] = 2] = "HTML";
    return DynamicState;
}({});
export async function getDynamicHTMLPostponedState(data, fallbackRouteParams, prerenderResumeDataCache) {
    if (!fallbackRouteParams || fallbackRouteParams.size === 0) {
        const postponedString = JSON.stringify(data);
        // Serialized as `<postponedString.length>:<postponedString><renderResumeDataCache>`
        return `${postponedString.length}:${postponedString}${await stringifyResumeDataCache(createRenderResumeDataCache(prerenderResumeDataCache))}`;
    }
    const replacements = Array.from(fallbackRouteParams);
    const replacementsString = JSON.stringify(replacements);
    const dataString = JSON.stringify(data);
    // Serialized as `<replacements.length><replacements><data>`
    const postponedString = `${replacementsString.length}${replacementsString}${dataString}`;
    // Serialized as `<postponedString.length>:<postponedString><renderResumeDataCache>`
    return `${postponedString.length}:${postponedString}${await stringifyResumeDataCache(prerenderResumeDataCache)}`;
}
export async function getDynamicDataPostponedState(prerenderResumeDataCache) {
    return `4:null${await stringifyResumeDataCache(createRenderResumeDataCache(prerenderResumeDataCache))}`;
}
export function parsePostponedState(state, params) {
    try {
        var _state_match;
        const postponedStringLengthMatch = (_state_match = state.match(/^([0-9]*):/)) == null ? void 0 : _state_match[1];
        if (!postponedStringLengthMatch) {
            throw Object.defineProperty(new Error(`Invariant: invalid postponed state ${state}`), "__NEXT_ERROR_CODE", {
                value: "E314",
                enumerable: false,
                configurable: true
            });
        }
        const postponedStringLength = parseInt(postponedStringLengthMatch);
        // We add a `:` to the end of the length as the first character of the
        // postponed string is the length of the replacement entries.
        const postponedString = state.slice(postponedStringLengthMatch.length + 1, postponedStringLengthMatch.length + postponedStringLength + 1);
        const renderResumeDataCache = createRenderResumeDataCache(state.slice(postponedStringLengthMatch.length + postponedStringLength + 1));
        try {
            if (postponedString === 'null') {
                return {
                    type: 1,
                    renderResumeDataCache
                };
            }
            if (/^[0-9]/.test(postponedString)) {
                var _postponedString_match;
                const match = (_postponedString_match = postponedString.match(/^([0-9]*)/)) == null ? void 0 : _postponedString_match[1];
                if (!match) {
                    throw Object.defineProperty(new Error(`Invariant: invalid postponed state ${JSON.stringify(postponedString)}`), "__NEXT_ERROR_CODE", {
                        value: "E314",
                        enumerable: false,
                        configurable: true
                    });
                }
                // This is the length of the replacements entries.
                const length = parseInt(match);
                const replacements = JSON.parse(postponedString.slice(match.length, // We then go to the end of the string.
                match.length + length));
                let postponed = postponedString.slice(match.length + length);
                for (const [key, searchValue] of replacements){
                    const value = (params == null ? void 0 : params[key]) ?? '';
                    const replaceValue = Array.isArray(value) ? value.join('/') : value;
                    postponed = postponed.replaceAll(searchValue, replaceValue);
                }
                return {
                    type: 2,
                    data: JSON.parse(postponed),
                    renderResumeDataCache
                };
            }
            return {
                type: 2,
                data: JSON.parse(postponedString),
                renderResumeDataCache
            };
        } catch (err) {
            console.error('Failed to parse postponed state', err);
            return {
                type: 1,
                renderResumeDataCache
            };
        }
    } catch (err) {
        console.error('Failed to parse postponed state', err);
        return {
            type: 1,
            renderResumeDataCache: createPrerenderResumeDataCache()
        };
    }
}
export function getPostponedFromState(state) {
    if (state.type === 1) {
        return null;
    }
    return state.data;
}

//# sourceMappingURL=postponed-state.js.map