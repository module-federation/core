export = matchAlias;
/**
 * Whether a `resolve.alias` name applies to a request. Mirrors `AliasPlugin`:
 * a name matches the whole request or a leading segment of it, and
 * `onlyModule` restricts it to the former.
 * @param {string} request the request as written
 * @param {string} name the alias name, already normalized by enhanced-resolve
 * @param {boolean=} onlyModule whether the alias only matches the whole request
 * @returns {boolean} true when the alias applies to the request
 */
declare function matchAlias(request: string, name: string, onlyModule?: boolean | undefined): boolean;
