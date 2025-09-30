import { getRequestMeta } from '../request-meta';
/**
 * Ensure cookies set in middleware are merged and not overridden by API
 * routes/getServerSideProps.
 *
 * @param req Incoming request
 * @param res Outgoing response
 */ export function patchSetHeaderWithCookieSupport(req, res) {
    const setHeader = res.setHeader.bind(res);
    res.setHeader = (name, value)=>{
        // When renders /_error after page is failed, it could attempt to set
        // headers after headers.
        if ('headersSent' in res && res.headersSent) {
            return res;
        }
        if (name.toLowerCase() === 'set-cookie') {
            const middlewareValue = getRequestMeta(req, 'middlewareCookie');
            if (!middlewareValue || !Array.isArray(value) || !value.every((item, idx)=>item === middlewareValue[idx])) {
                value = [
                    // TODO: (wyattjoh) find out why this is called multiple times resulting in duplicate cookies being added
                    ...new Set([
                        ...middlewareValue || [],
                        ...typeof value === 'string' ? [
                            value
                        ] : Array.isArray(value) ? value : []
                    ])
                ];
            }
        }
        return setHeader(name, value);
    };
}

//# sourceMappingURL=patch-set-header.js.map