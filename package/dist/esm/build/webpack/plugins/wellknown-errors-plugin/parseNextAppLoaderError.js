import { relative } from 'path';
import { SimpleWebpackError } from './simpleWebpackError';
import { getAppLoader } from '../../../entries';
export function getNextAppLoaderError(err, module, compiler) {
    try {
        if (!module.loaders[0].loader.includes(getAppLoader())) {
            return false;
        }
        const file = relative(compiler.context, module.buildInfo.route.absolutePagePath);
        return new SimpleWebpackError(file, err.message);
    } catch  {
        return false;
    }
}

//# sourceMappingURL=parseNextAppLoaderError.js.map