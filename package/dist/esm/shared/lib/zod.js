import { ZodParsedType, util } from 'next/dist/compiled/zod';
import { fromZodError } from 'next/dist/compiled/zod-validation-error';
import * as Log from '../../build/output/log';
function processZodErrorMessage(issue) {
    let message = issue.message;
    let path;
    if (issue.path.length > 0) {
        if (issue.path.length === 1) {
            const identifier = issue.path[0];
            if (typeof identifier === 'number') {
                // The first identifier inside path is a number
                path = "index " + identifier;
            } else {
                path = '"' + identifier + '"';
            }
        } else {
            // joined path to be shown in the error message
            path = '"' + issue.path.reduce((acc, cur)=>{
                if (typeof cur === 'number') {
                    // array index
                    return acc + "[" + cur + "]";
                }
                if (cur.includes('"')) {
                    // escape quotes
                    return acc + '["' + cur.replaceAll('"', '\\"') + '"]';
                }
                // dot notation
                const separator = acc.length === 0 ? '' : '.';
                return acc + separator + cur;
            }, '') + '"';
        }
    } else {
        path = '';
    }
    if (issue.code === 'invalid_type' && issue.received === ZodParsedType.undefined) {
        // Missing key in object.
        return path + " is missing, expected " + issue.expected;
    }
    if (issue.code === 'invalid_enum_value') {
        // Remove "Invalid enum value" prefix from zod default error message
        return "Expected " + util.joinValues(issue.options) + ", received '" + issue.received + "' at " + path;
    }
    return message + (path ? " at " + path : '');
}
export function normalizeZodErrors(error) {
    return error.issues.flatMap((issue)=>{
        const issues = [
            {
                issue,
                message: processZodErrorMessage(issue)
            }
        ];
        if ('unionErrors' in issue) {
            for (const unionError of issue.unionErrors){
                issues.push(...normalizeZodErrors(unionError));
            }
        }
        return issues;
    });
}
export function formatZodError(prefix, error) {
    return Object.defineProperty(new Error(fromZodError(error, {
        prefix: prefix
    }).toString()), "__NEXT_ERROR_CODE", {
        value: "E394",
        enumerable: false,
        configurable: true
    });
}
export function reportZodError(prefix, error) {
    Log.error(formatZodError(prefix, error).message);
}

//# sourceMappingURL=zod.js.map