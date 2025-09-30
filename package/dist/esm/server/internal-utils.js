import { NEXT_RSC_UNION_QUERY } from '../client/components/app-router-headers';
const INTERNAL_QUERY_NAMES = [
    NEXT_RSC_UNION_QUERY
];
export function stripInternalQueries(query) {
    for (const name of INTERNAL_QUERY_NAMES){
        delete query[name];
    }
}
export function stripInternalSearchParams(url) {
    const isStringUrl = typeof url === 'string';
    const instance = isStringUrl ? new URL(url) : url;
    instance.searchParams.delete(NEXT_RSC_UNION_QUERY);
    return isStringUrl ? instance.toString() : instance;
}

//# sourceMappingURL=internal-utils.js.map