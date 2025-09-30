import { RouteKind } from "../route-kind";
import { DefaultRouteMatcherManager } from "./default-route-matcher-manager";
import path from "../../../shared/lib/isomorphic/path";
import * as Log from "../../../build/output/log";
import { cyan } from "../../../lib/picocolors";
export class DevRouteMatcherManager extends DefaultRouteMatcherManager {
    constructor(production, ensurer, dir){
        super();
        this.production = production;
        this.ensurer = ensurer;
        this.dir = dir;
    }
    async test(pathname, options) {
        // Try to find a match within the developer routes.
        const match = await super.match(pathname, options);
        // Return if the match wasn't null. Unlike the implementation of `match`
        // which uses `matchAll` here, this does not call `ensure` on the match
        // found via the development matches.
        return match !== null;
    }
    validate(pathname, matcher, options) {
        const match = super.validate(pathname, matcher, options);
        // If a match was found, check to see if there were any conflicting app or
        // pages files.
        // TODO: maybe expand this to _any_ duplicated routes instead?
        if (match && matcher.duplicated && matcher.duplicated.some((duplicate)=>duplicate.definition.kind === RouteKind.APP_PAGE || duplicate.definition.kind === RouteKind.APP_ROUTE) && matcher.duplicated.some((duplicate)=>duplicate.definition.kind === RouteKind.PAGES || duplicate.definition.kind === RouteKind.PAGES_API)) {
            return null;
        }
        return match;
    }
    async *matchAll(pathname, options) {
        // Compile the development routes.
        // TODO: we may want to only run this during testing, users won't be fast enough to require this many dir scans
        await super.reload();
        // Iterate over the development matches to see if one of them match the
        // request path.
        for await (const development of super.matchAll(pathname, options)){
            // We're here, which means that we haven't seen this match yet, so we
            // should try to ensure it and recompile the production matcher.
            await this.ensurer.ensure(development, pathname);
            await this.production.reload();
            // Iterate over the production matches again, this time we should be able
            // to match it against the production matcher unless there's an error.
            for await (const production of this.production.matchAll(pathname, options)){
                yield production;
            }
        }
        // We tried direct matching against the pathname and against all the dynamic
        // paths, so there was no match.
        return null;
    }
    async reload() {
        // Compile the production routes again.
        await this.production.reload();
        // Compile the development routes.
        await super.reload();
        // Check for and warn of any duplicates.
        for (const [pathname, matchers] of Object.entries(this.matchers.duplicates)){
            // We only want to warn about matchers resolving to the same path if their
            // identities are different.
            const identity = matchers[0].identity;
            if (matchers.slice(1).some((matcher)=>matcher.identity !== identity)) {
                continue;
            }
            Log.warn(`Duplicate page detected. ${matchers.map((matcher)=>cyan(path.relative(this.dir, matcher.definition.filename))).join(" and ")} resolve to ${cyan(pathname)}`);
        }
    }
}

//# sourceMappingURL=dev-route-matcher-manager.js.map