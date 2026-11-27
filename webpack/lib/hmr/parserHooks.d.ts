export = getParserHooks;
/**
 * Returns the attached hooks.
 * @param {JavascriptParser} parser the parser
 * @returns {HMRJavascriptParserHooks} the attached hooks
 */
declare function getParserHooks(parser: JavascriptParser): HMRJavascriptParserHooks;
declare namespace getParserHooks {
    export { Requests, HMRJavascriptParserHooks };
}
import type JavascriptParser from "../javascript/JavascriptParser";
type Requests = string[];
/**
 * Defines the hmr javascript parser hooks type used by this module.
 */
type HMRJavascriptParserHooks = {
    hotAcceptCallback: SyncBailHook<[Expression | SpreadElement, Requests], void>;
    hotAcceptWithoutCallback: SyncBailHook<[CallExpression, Requests], void>;
};
import { SyncBailHook } from "tapable";
import type { Expression } from "estree";
import type { SpreadElement } from "estree";
import type { CallExpression } from "estree";
