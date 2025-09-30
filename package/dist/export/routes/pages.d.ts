import type { ExportRouteResult } from '../types';
import type { PagesRenderContext, PagesSharedContext, RenderOpts } from '../../server/render';
import type { LoadComponentsReturnType } from '../../server/load-components';
import type { NextParsedUrlQuery } from '../../server/request-meta';
import type { Params } from '../../server/request/params';
import type { MockedRequest, MockedResponse } from '../../server/lib/mock-request';
import type { MultiFileWriter } from '../../lib/multi-file-writer';
/**
 * Renders & exports a page associated with the /pages directory
 */
export declare function exportPagesPage(req: MockedRequest, res: MockedResponse, path: string, page: string, query: NextParsedUrlQuery, params: Params | undefined, htmlFilepath: string, htmlFilename: string, ampPath: string, subFolders: boolean, outDir: string, ampValidatorPath: string | undefined, pagesDataDir: string, buildExport: boolean, isDynamic: boolean, sharedContext: PagesSharedContext, renderContext: PagesRenderContext, hasOrigQueryValues: boolean, renderOpts: RenderOpts, components: LoadComponentsReturnType, fileWriter: MultiFileWriter): Promise<ExportRouteResult | undefined>;
