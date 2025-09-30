import { normalizePagePath } from "../../../../../shared/lib/page-path/normalize-page-path";
import { Normalizers } from "../../normalizers";
import { PrefixingNormalizer } from "../../prefixing-normalizer";
import { wrapNormalizerFn } from "../../wrap-normalizer-fn";
export class PagesBundlePathNormalizer extends Normalizers {
    constructor(){
        super([
            // The bundle path should have the trailing `/index` stripped from
            // it.
            wrapNormalizerFn(normalizePagePath),
            // The page should prefixed with `pages/`.
            new PrefixingNormalizer("pages")
        ]);
    }
    normalize(page) {
        return super.normalize(page);
    }
}
export class DevPagesBundlePathNormalizer extends Normalizers {
    constructor(pagesNormalizer){
        super([
            // This should normalize the filename to a page.
            pagesNormalizer,
            // Normalize the app page to a pathname.
            new PagesBundlePathNormalizer()
        ]);
    }
    normalize(filename) {
        return super.normalize(filename);
    }
}

//# sourceMappingURL=pages-bundle-path-normalizer.js.map