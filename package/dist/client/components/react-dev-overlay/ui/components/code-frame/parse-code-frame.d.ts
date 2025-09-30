import type { StackFrame } from 'next/dist/compiled/stacktrace-parser';
import { type AnserJsonEntry } from 'next/dist/compiled/anser';
export declare function formatCodeFrame(codeFrame: string): string;
export declare function groupCodeFrameLines(formattedFrame: string): AnserJsonEntry[][];
export declare function parseLineNumberFromCodeFrameLine(line: AnserJsonEntry[], stackFrame: StackFrame): {
    lineNumber: string | undefined;
    isErroredLine: boolean;
};
