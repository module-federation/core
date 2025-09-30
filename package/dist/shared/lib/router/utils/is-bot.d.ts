import { HTML_LIMITED_BOT_UA_RE } from './html-bots';
export declare const HTML_LIMITED_BOT_UA_RE_STRING: string;
export { HTML_LIMITED_BOT_UA_RE };
export declare function isBot(userAgent: string): boolean;
export declare function getBotType(userAgent: string): 'dom' | 'html' | undefined;
