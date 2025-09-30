import path from 'path';
import * as fs from 'fs/promises';
import { constants } from 'fs';
import * as Log from '../../../../build/output/log';
import { middlewareResponse } from '../server/middleware-response';
const FONT_PREFIX = '/__nextjs_font/';
const VALID_FONTS = [
    'geist-latin-ext.woff2',
    'geist-mono-latin-ext.woff2',
    'geist-latin.woff2',
    'geist-mono-latin.woff2'
];
const FONT_HEADERS = {
    'Content-Type': 'font/woff2',
    'Cache-Control': 'public, max-age=31536000, immutable'
};
export function getDevOverlayFontMiddleware() {
    return async function devOverlayFontMiddleware(req, res, next) {
        try {
            const { pathname } = new URL("http://n" + req.url);
            if (!pathname.startsWith(FONT_PREFIX)) {
                return next();
            }
            const fontFile = pathname.replace(FONT_PREFIX, '');
            if (!VALID_FONTS.includes(fontFile)) {
                return middlewareResponse.notFound(res);
            }
            const fontPath = path.resolve(__dirname, fontFile);
            const fileExists = await checkFileExists(fontPath);
            if (!fileExists) {
                return middlewareResponse.notFound(res);
            }
            const fontData = await fs.readFile(fontPath);
            Object.entries(FONT_HEADERS).forEach((param)=>{
                let [key, value] = param;
                res.setHeader(key, value);
            });
            res.end(fontData);
        } catch (err) {
            Log.error('Failed to serve font:', err instanceof Error ? err.message : err);
            return middlewareResponse.internalServerError(res);
        }
    };
}
async function checkFileExists(filePath) {
    try {
        await fs.access(filePath, constants.F_OK);
        return true;
    } catch (e) {
        return false;
    }
}

//# sourceMappingURL=get-dev-overlay-font-middleware.js.map