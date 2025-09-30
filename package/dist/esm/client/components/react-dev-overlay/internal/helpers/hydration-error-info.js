export const getHydrationWarningType = (msg)=>{
    if (isHtmlTagsWarning(msg)) return "tag";
    if (isTextInTagsMismatchWarning(msg)) return "text-in-tag";
    return "text";
};
const isHtmlTagsWarning = (msg)=>Boolean(msg && htmlTagsWarnings.has(msg));
const isTextMismatchWarning = (msg)=>textMismatchWarning === msg;
const isTextInTagsMismatchWarning = (msg)=>Boolean(msg && textAndTagsMismatchWarnings.has(msg));
const isKnownHydrationWarning = (msg)=>isHtmlTagsWarning(msg) || isTextInTagsMismatchWarning(msg) || isTextMismatchWarning(msg);
export const hydrationErrorState = {};
// https://github.com/facebook/react/blob/main/packages/react-dom/src/__tests__/ReactDOMHydrationDiff-test.js used as a reference
const htmlTagsWarnings = new Set([
    'Warning: Cannot render a sync or defer <script> outside the main document without knowing its order. Try adding async="" or moving it into the root <head> tag.%s',
    "Warning: In HTML, %s cannot be a child of <%s>.%s\nThis will cause a hydration error.%s",
    "Warning: In HTML, %s cannot be a descendant of <%s>.\nThis will cause a hydration error.%s",
    "Warning: In HTML, text nodes cannot be a child of <%s>.\nThis will cause a hydration error.",
    "Warning: In HTML, whitespace text nodes cannot be a child of <%s>. Make sure you don't have any extra whitespace between tags on each line of your source code.\nThis will cause a hydration error.",
    "Warning: Expected server HTML to contain a matching <%s> in <%s>.%s",
    "Warning: Did not expect server HTML to contain a <%s> in <%s>.%s"
]);
const textAndTagsMismatchWarnings = new Set([
    'Warning: Expected server HTML to contain a matching text node for "%s" in <%s>.%s',
    'Warning: Did not expect server HTML to contain the text node "%s" in <%s>.%s'
]);
const textMismatchWarning = 'Warning: Text content did not match. Server: "%s" Client: "%s"%s';
/**
 * Patch console.error to capture hydration errors.
 * If any of the knownHydrationWarnings are logged, store the message and component stack.
 * When the hydration runtime error is thrown, the message and component stack are added to the error.
 * This results in a more helpful error message in the error overlay.
 */ export function patchConsoleError() {
    const prev = console.error;
    console.error = function(msg, serverContent, clientContent, componentStack) {
        if (isKnownHydrationWarning(msg)) {
            hydrationErrorState.warning = [
                // remove the last %s from the message
                msg,
                serverContent,
                clientContent
            ];
            hydrationErrorState.componentStack = componentStack;
            hydrationErrorState.serverContent = serverContent;
            hydrationErrorState.clientContent = clientContent;
        }
        // @ts-expect-error argument is defined
        prev.apply(console, arguments);
    };
}

//# sourceMappingURL=hydration-error-info.js.map