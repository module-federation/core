import { type NextIncomingMessage } from '../request-meta';
type PatchableResponse = {
    setHeader(key: string, value: string | string[]): PatchableResponse;
};
/**
 * Ensure cookies set in middleware are merged and not overridden by API
 * routes/getServerSideProps.
 *
 * @param req Incoming request
 * @param res Outgoing response
 */
export declare function patchSetHeaderWithCookieSupport(req: NextIncomingMessage, res: PatchableResponse): void;
export {};
