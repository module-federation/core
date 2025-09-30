import { parse } from 'next/dist/compiled/content-type';
import isError from '../../../lib/is-error';
import { ApiError } from '../index';
/**
 * Parse `JSON` and handles invalid `JSON` strings
 * @param str `JSON` string
 */ function parseJson(str) {
    if (str.length === 0) {
        // special-case empty json body, as it's a common client-side mistake
        return {};
    }
    try {
        return JSON.parse(str);
    } catch (e) {
        throw Object.defineProperty(new ApiError(400, 'Invalid JSON'), "__NEXT_ERROR_CODE", {
            value: "E394",
            enumerable: false,
            configurable: true
        });
    }
}
/**
 * Parse incoming message like `json` or `urlencoded`
 * @param req request object
 */ export async function parseBody(req, limit) {
    let contentType;
    try {
        contentType = parse(req.headers['content-type'] || 'text/plain');
    } catch  {
        contentType = parse('text/plain');
    }
    const { type, parameters } = contentType;
    const encoding = parameters.charset || 'utf-8';
    let buffer;
    try {
        const getRawBody = require('next/dist/compiled/raw-body');
        buffer = await getRawBody(req, {
            encoding,
            limit
        });
    } catch (e) {
        if (isError(e) && e.type === 'entity.too.large') {
            throw Object.defineProperty(new ApiError(413, `Body exceeded ${limit} limit`), "__NEXT_ERROR_CODE", {
                value: "E394",
                enumerable: false,
                configurable: true
            });
        } else {
            throw Object.defineProperty(new ApiError(400, 'Invalid body'), "__NEXT_ERROR_CODE", {
                value: "E394",
                enumerable: false,
                configurable: true
            });
        }
    }
    const body = buffer.toString();
    if (type === 'application/json' || type === 'application/ld+json') {
        return parseJson(body);
    } else if (type === 'application/x-www-form-urlencoded') {
        const qs = require('querystring');
        return qs.decode(body);
    } else {
        return body;
    }
}

//# sourceMappingURL=parse-body.js.map