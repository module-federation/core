"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const loader_1 = __importDefault(require("./loader"));
// @ts-ignore
const node_fetch_1 = __importDefault(require("next/dist/compiled/node-fetch"));
jest.mock('next/dist/compiled/node-fetch');
describe('next/font/google loader', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });
    describe('URL from options', () => {
        const fixtures = [
            [
                'Inter',
                {},
                'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap',
            ],
            [
                'Inter',
                { weight: '400' },
                'https://fonts.googleapis.com/css2?family=Inter:wght@400&display=swap',
            ],
            [
                'Inter',
                { weight: '900', display: 'block' },
                'https://fonts.googleapis.com/css2?family=Inter:wght@900&display=block',
            ],
            [
                'Source_Sans_3',
                { weight: '900', display: 'auto' },
                'https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@900&display=auto',
            ],
            [
                'Source_Sans_3',
                { weight: '200', style: 'italic' },
                'https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@1,200&display=swap',
            ],
            [
                'Roboto_Flex',
                { display: 'swap' },
                'https://fonts.googleapis.com/css2?family=Roboto+Flex:wght@100..1000&display=swap',
            ],
            [
                'Roboto_Flex',
                { display: 'fallback', weight: 'variable', axes: ['opsz'] },
                'https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wght@8..144,100..1000&display=fallback',
            ],
            [
                'Roboto_Flex',
                {
                    display: 'optional',
                    axes: ['YTUC', 'slnt', 'wdth', 'opsz', 'XTRA', 'YTAS'],
                },
                'https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,slnt,wdth,wght,XTRA,YTAS,YTUC@8..144,-10..0,25..151,100..1000,323..603,649..854,528..760&display=optional',
            ],
            [
                'Oooh_Baby',
                { weight: '400' },
                'https://fonts.googleapis.com/css2?family=Oooh+Baby:wght@400&display=swap',
            ],
            [
                'Albert_Sans',
                { weight: 'variable', style: 'italic' },
                'https://fonts.googleapis.com/css2?family=Albert+Sans:ital,wght@1,100..900&display=swap',
            ],
            [
                'Fraunces',
                { weight: 'variable', style: 'italic', axes: ['WONK', 'opsz', 'SOFT'] },
                'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@1,9..144,100..900,0..100,0..1&display=swap',
            ],
            [
                'Molle',
                { weight: '400' },
                'https://fonts.googleapis.com/css2?family=Molle:ital,wght@1,400&display=swap',
            ],
            [
                'Roboto',
                { weight: ['500', '300', '400'], style: ['normal', 'italic'] },
                'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap',
            ],
            [
                'Roboto Mono',
                { style: ['italic', 'normal'] },
                'https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap',
            ],
            [
                'Fraunces',
                {
                    style: ['normal', 'italic'],
                    axes: ['WONK', 'opsz', 'SOFT'],
                },
                'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,100..900,0..100,0..1;1,9..144,100..900,0..100,0..1&display=swap',
            ],
            [
                'Poppins',
                { weight: ['900', '400', '100'] },
                'https://fonts.googleapis.com/css2?family=Poppins:wght@100;400;900&display=swap',
            ],
            [
                'Nabla',
                {},
                'https://fonts.googleapis.com/css2?family=Nabla&display=swap',
            ],
            [
                'Nabla',
                { axes: ['EDPT', 'EHLT'] },
                'https://fonts.googleapis.com/css2?family=Nabla:EDPT,EHLT@0..200,0..24&display=swap',
            ],
            [
                'Ballet',
                {},
                'https://fonts.googleapis.com/css2?family=Ballet&display=swap',
            ],
        ];
        test.each(fixtures)('%s', async (functionName, fontFunctionArguments, expectedUrl) => {
            node_fetch_1.default.mockResolvedValue({
                ok: true,
                text: async () => 'OK',
            });
            const { css } = await (0, loader_1.default)({
                functionName,
                data: [
                    {
                        adjustFontFallback: false,
                        subsets: [],
                        ...fontFunctionArguments,
                    },
                ],
                emitFontFile: jest.fn(),
                resolve: jest.fn(),
                loaderContext: {},
                isDev: false,
                isServer: true,
                variableName: 'myFont',
            });
            expect(css).toBe('OK');
            expect(node_fetch_1.default).toHaveBeenCalledTimes(1);
            expect(node_fetch_1.default).toHaveBeenCalledWith(expectedUrl, expect.any(Object));
        });
    });
});
