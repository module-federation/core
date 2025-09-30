import type { ZodError } from 'next/dist/compiled/zod';
import { type ZodIssue } from 'next/dist/compiled/zod';
export declare function normalizeZodErrors(error: ZodError): {
    issue: ZodIssue;
    message: string;
}[];
export declare function formatZodError(prefix: string, error: ZodError): Error;
export declare function reportZodError(prefix: string, error: ZodError): void;
