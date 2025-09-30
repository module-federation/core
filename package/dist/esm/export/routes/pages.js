import RenderResult from '../../server/render-result';
import { join } from 'path';
import { isInAmpMode } from '../../shared/lib/amp-mode';
import { NEXT_DATA_SUFFIX, SERVER_PROPS_EXPORT_ERROR } from '../../lib/constants';
import { isBailoutToCSRError } from '../../shared/lib/lazy-dynamic/bailout-to-csr';
import AmpHtmlValidator from 'next/dist/compiled/amphtml-validator';
import { FileType, fileExists } from '../../lib/file-exists';
import { lazyRenderPagesPage } from '../../server/route-modules/pages/module.render';
/**
 * Renders & exports a page associated with the /pages directory
 */ export async function exportPagesPage(req, res, path, page, query, params, htmlFilepath, htmlFilename, ampPath, subFolders, outDir, ampValidatorPath, pagesDataDir, buildExport, isDynamic, sharedContext, renderContext, hasOrigQueryValues, renderOpts, components, fileWriter) {
    var _components_pageConfig, _components_pageConfig1;
    const ampState = {
        ampFirst: ((_components_pageConfig = components.pageConfig) == null ? void 0 : _components_pageConfig.amp) === true,
        hasQuery: Boolean(query.amp),
        hybrid: ((_components_pageConfig1 = components.pageConfig) == null ? void 0 : _components_pageConfig1.amp) === 'hybrid'
    };
    if (!ampValidatorPath) {
        ampValidatorPath = require.resolve('next/dist/compiled/amphtml-validator/validator_wasm.js');
    }
    const inAmpMode = isInAmpMode(ampState);
    const hybridAmp = ampState.hybrid;
    if (components.getServerSideProps) {
        throw Object.defineProperty(new Error(`Error for page ${page}: ${SERVER_PROPS_EXPORT_ERROR}`), "__NEXT_ERROR_CODE", {
            value: "E15",
            enumerable: false,
            configurable: true
        });
    }
    // for non-dynamic SSG pages we should have already
    // prerendered the file
    if (!buildExport && components.getStaticProps && !isDynamic) {
        return;
    }
    // Pages router merges page params (e.g. [lang]) with query params
    // primarily to support them both being accessible on `useRouter().query`.
    // If we extracted dynamic params from the path, we need to merge them
    // back into the query object.
    const searchAndDynamicParams = {
        ...query,
        ...params
    };
    if (components.getStaticProps && !htmlFilepath.endsWith('.html')) {
        // make sure it ends with .html if the name contains a dot
        htmlFilepath += '.html';
        htmlFilename += '.html';
    }
    let renderResult;
    if (typeof components.Component === 'string') {
        renderResult = RenderResult.fromStatic(components.Component);
        if (hasOrigQueryValues) {
            throw Object.defineProperty(new Error(`\nError: you provided query values for ${path} which is an auto-exported page. These can not be applied since the page can no longer be re-rendered on the server. To disable auto-export for this page add \`getInitialProps\`\n`), "__NEXT_ERROR_CODE", {
                value: "E505",
                enumerable: false,
                configurable: true
            });
        }
    } else {
        /**
     * This sets environment variable to be used at the time of SSR by head.tsx.
     * Using this from process.env allows targeting SSR by calling
     * `process.env.__NEXT_OPTIMIZE_CSS`.
     */ if (renderOpts.optimizeCss) {
            process.env.__NEXT_OPTIMIZE_CSS = JSON.stringify(true);
        }
        try {
            renderResult = await lazyRenderPagesPage(req, res, page, searchAndDynamicParams, renderOpts, sharedContext, renderContext);
        } catch (err) {
            if (!isBailoutToCSRError(err)) throw err;
        }
    }
    const ssgNotFound = renderResult == null ? void 0 : renderResult.metadata.isNotFound;
    const ampValidations = [];
    const validateAmp = async (rawAmpHtml, ampPageName, validatorPath)=>{
        const validator = await AmpHtmlValidator.getInstance(validatorPath);
        const result = validator.validateString(rawAmpHtml);
        const errors = result.errors.filter((e)=>e.severity === 'ERROR');
        const warnings = result.errors.filter((e)=>e.severity !== 'ERROR');
        if (warnings.length || errors.length) {
            ampValidations.push({
                page: ampPageName,
                result: {
                    errors,
                    warnings
                }
            });
        }
    };
    const html = renderResult && !renderResult.isNull ? renderResult.toUnchunkedString() : '';
    let ampRenderResult;
    if (inAmpMode && !renderOpts.ampSkipValidation) {
        if (!ssgNotFound) {
            await validateAmp(html, path, ampValidatorPath);
        }
    } else if (hybridAmp) {
        const ampHtmlFilename = subFolders ? join(ampPath, 'index.html') : `${ampPath}.html`;
        const ampHtmlFilepath = join(outDir, ampHtmlFilename);
        const exists = await fileExists(ampHtmlFilepath, FileType.File);
        if (!exists) {
            try {
                ampRenderResult = await lazyRenderPagesPage(req, res, page, {
                    ...searchAndDynamicParams,
                    amp: '1'
                }, renderOpts, sharedContext, renderContext);
            } catch (err) {
                if (!isBailoutToCSRError(err)) throw err;
            }
            const ampHtml = ampRenderResult && !ampRenderResult.isNull ? ampRenderResult.toUnchunkedString() : '';
            if (!renderOpts.ampSkipValidation) {
                await validateAmp(ampHtml, page + '?amp=1', ampValidatorPath);
            }
            fileWriter.append(ampHtmlFilepath, ampHtml);
        }
    }
    const metadata = (renderResult == null ? void 0 : renderResult.metadata) || (ampRenderResult == null ? void 0 : ampRenderResult.metadata) || {};
    if (metadata.pageData) {
        const dataFile = join(pagesDataDir, htmlFilename.replace(/\.html$/, NEXT_DATA_SUFFIX));
        fileWriter.append(dataFile, JSON.stringify(metadata.pageData));
        if (hybridAmp) {
            fileWriter.append(dataFile.replace(/\.json$/, '.amp.json'), JSON.stringify(metadata.pageData));
        }
    }
    if (!ssgNotFound) {
        // don't attempt writing to disk if getStaticProps returned not found
        fileWriter.append(htmlFilepath, html);
    }
    return {
        ampValidations,
        cacheControl: metadata.cacheControl ?? {
            revalidate: false,
            expire: undefined
        },
        ssgNotFound
    };
}

//# sourceMappingURL=pages.js.map