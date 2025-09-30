import type { ServerResponse } from 'http';
export declare const middlewareResponse: {
    noContent(res: ServerResponse): void;
    badRequest(res: ServerResponse): void;
    notFound(res: ServerResponse): void;
    methodNotAllowed(res: ServerResponse): void;
    internalServerError(res: ServerResponse, error?: unknown): void;
    json(res: ServerResponse, data: any): void;
    jsonString(res: ServerResponse, data: string): void;
};
