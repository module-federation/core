"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    AppSegmentConfigSchemaKeys: null,
    parseAppSegmentConfig: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    AppSegmentConfigSchemaKeys: function() {
        return AppSegmentConfigSchemaKeys;
    },
    parseAppSegmentConfig: function() {
        return parseAppSegmentConfig;
    }
});
const _zod = require("next/dist/compiled/zod");
const _zod1 = require("../../../shared/lib/zod");
/**
 * The schema for configuration for a page.
 */ const AppSegmentConfigSchema = _zod.z.object({
    /**
   * The number of seconds to revalidate the page or false to disable revalidation.
   */ revalidate: _zod.z.union([
        _zod.z.number().int().nonnegative(),
        _zod.z.literal(false)
    ]).optional(),
    /**
   * Whether the page supports dynamic parameters.
   */ dynamicParams: _zod.z.boolean().optional(),
    /**
   * The dynamic behavior of the page.
   */ dynamic: _zod.z.enum([
        'auto',
        'error',
        'force-static',
        'force-dynamic'
    ]).optional(),
    /**
   * The caching behavior of the page.
   */ fetchCache: _zod.z.enum([
        'auto',
        'default-cache',
        'only-cache',
        'force-cache',
        'force-no-store',
        'default-no-store',
        'only-no-store'
    ]).optional(),
    /**
   * The preferred region for the page.
   */ preferredRegion: _zod.z.union([
        _zod.z.string(),
        _zod.z.array(_zod.z.string())
    ]).optional(),
    /**
   * Whether the page supports partial prerendering. When true, the page will be
   * served using partial prerendering. This setting will only take affect if
   * it's enabled via the `experimental.ppr = "incremental"` option.
   */ experimental_ppr: _zod.z.boolean().optional(),
    /**
   * The runtime to use for the page.
   */ runtime: _zod.z.enum([
        'edge',
        'nodejs'
    ]).optional(),
    /**
   * The maximum duration for the page in seconds.
   */ maxDuration: _zod.z.number().int().nonnegative().optional()
});
function parseAppSegmentConfig(data, route) {
    const parsed = AppSegmentConfigSchema.safeParse(data, {
        errorMap: (issue, ctx)=>{
            if (issue.path.length === 1 && issue.path[0] === 'revalidate') {
                return {
                    message: `Invalid revalidate value ${JSON.stringify(ctx.data)} on "${route}", must be a non-negative number or false`
                };
            }
            return {
                message: ctx.defaultError
            };
        }
    });
    if (!parsed.success) {
        throw (0, _zod1.formatZodError)(`Invalid segment configuration options detected for "${route}". Read more at https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config`, parsed.error);
    }
    return parsed.data;
}
const AppSegmentConfigSchemaKeys = AppSegmentConfigSchema.keyof().options;

//# sourceMappingURL=app-segment-config.js.map