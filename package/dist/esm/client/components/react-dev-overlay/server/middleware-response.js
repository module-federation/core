import { inspect } from 'util';
export const middlewareResponse = {
    noContent (res) {
        res.statusCode = 204;
        res.end('No Content');
    },
    badRequest (res) {
        res.statusCode = 400;
        res.end('Bad Request');
    },
    notFound (res) {
        res.statusCode = 404;
        res.end('Not Found');
    },
    methodNotAllowed (res) {
        res.statusCode = 405;
        res.end('Method Not Allowed');
    },
    internalServerError (res, error) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end(error !== undefined ? inspect(error, {
            colors: false
        }) : 'Internal Server Error');
    },
    json (res, data) {
        res.setHeader('Content-Type', 'application/json').end(Buffer.from(JSON.stringify(data)));
    },
    jsonString (res, data) {
        res.setHeader('Content-Type', 'application/json').end(Buffer.from(data));
    }
};

//# sourceMappingURL=middleware-response.js.map