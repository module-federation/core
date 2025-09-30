"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const loader_1 = __importDefault(require("./loader"));
describe('next/font/local loader', () => {
    describe('generated CSS', () => {
        test('Default CSS', async () => {
            const { css } = await (0, loader_1.default)({
                functionName: '',
                data: [{ src: './my-font.woff2' }],
                emitFontFile: () => '/_next/static/media/my-font.woff2',
                resolve: jest.fn(),
                isDev: false,
                isServer: true,
                variableName: 'myFont',
                loaderContext: {
                    fs: {
                        readFile: (_, cb) => cb(null, 'fontdata'),
                    },
                },
            });
            expect(css).toMatchInlineSnapshot(`
        "@font-face {
        font-family: myFont;
        src: url(/_next/static/media/my-font.woff2) format('woff2');
        font-display: swap;
        }
        "
      `);
        });
        test('Weight and style', async () => {
            const { css } = await (0, loader_1.default)({
                functionName: '',
                data: [{ src: './my-font.woff2', weight: '100 900', style: 'italic' }],
                emitFontFile: () => '/_next/static/media/my-font.woff2',
                resolve: jest.fn(),
                isDev: false,
                isServer: true,
                variableName: 'myFont',
                loaderContext: {
                    fs: {
                        readFile: (_, cb) => cb(null, 'fontdata'),
                    },
                },
            });
            expect(css).toMatchInlineSnapshot(`
        "@font-face {
        font-family: myFont;
        src: url(/_next/static/media/my-font.woff2) format('woff2');
        font-display: swap;
        font-weight: 100 900;
        font-style: italic;
        }
        "
      `);
        });
        test('Other properties', async () => {
            const { css } = await (0, loader_1.default)({
                functionName: '',
                data: [
                    {
                        src: './my-font.woff2',
                        declarations: [
                            { prop: 'font-feature-settings', value: '"smcp" on' },
                            { prop: 'ascent-override', value: '90%' },
                        ],
                    },
                ],
                emitFontFile: () => '/_next/static/media/my-font.woff2',
                resolve: jest.fn(),
                isDev: false,
                isServer: true,
                variableName: 'myFont',
                loaderContext: {
                    fs: {
                        readFile: (_, cb) => cb(null, 'fontdata'),
                    },
                },
            });
            expect(css).toMatchInlineSnapshot(`
        "@font-face {
        font-feature-settings: "smcp" on;
        ascent-override: 90%;
        font-family: myFont;
        src: url(/_next/static/media/my-font.woff2) format('woff2');
        font-display: swap;
        }
        "
      `);
        });
        test('Multiple weights default style', async () => {
            const { css } = await (0, loader_1.default)({
                functionName: '',
                data: [
                    {
                        style: 'italic',
                        src: [
                            {
                                path: './fonts/font1.woff2',
                                weight: '100',
                            },
                            {
                                path: './fonts/font2.woff2',
                                weight: '400',
                            },
                            {
                                path: './fonts/font3.woff2',
                                weight: '700',
                            },
                            {
                                path: './fonts/font2.woff2',
                                weight: '400',
                                style: 'normal',
                            },
                        ],
                        adjustFontFallback: false,
                    },
                ],
                emitFontFile: () => `/_next/static/media/my-font.woff2`,
                resolve: jest.fn(),
                isDev: false,
                isServer: true,
                variableName: 'myFont',
                loaderContext: {
                    fs: {
                        readFile: (path, cb) => cb(null, path),
                    },
                },
            });
            expect(css).toMatchInlineSnapshot(`
        "@font-face {
        font-family: myFont;
        src: url(/_next/static/media/my-font.woff2) format('woff2');
        font-display: swap;
        font-weight: 100;
        font-style: italic;
        }

        @font-face {
        font-family: myFont;
        src: url(/_next/static/media/my-font.woff2) format('woff2');
        font-display: swap;
        font-weight: 400;
        font-style: italic;
        }

        @font-face {
        font-family: myFont;
        src: url(/_next/static/media/my-font.woff2) format('woff2');
        font-display: swap;
        font-weight: 700;
        font-style: italic;
        }

        @font-face {
        font-family: myFont;
        src: url(/_next/static/media/my-font.woff2) format('woff2');
        font-display: swap;
        font-weight: 400;
        font-style: normal;
        }
        "
      `);
        });
        test('Multiple styles default weight', async () => {
            const { css } = await (0, loader_1.default)({
                functionName: '',
                data: [
                    {
                        weight: '400',
                        src: [
                            {
                                path: './fonts/font1.woff2',
                                style: 'normal',
                            },
                            {
                                path: './fonts/font3.woff2',
                                style: 'italic',
                            },
                            {
                                path: './fonts/font2.woff2',
                                weight: '700',
                            },
                        ],
                        adjustFontFallback: false,
                    },
                ],
                emitFontFile: () => `/_next/static/media/my-font.woff2`,
                resolve: jest.fn(),
                isDev: false,
                isServer: true,
                variableName: 'myFont',
                loaderContext: {
                    fs: {
                        readFile: (path, cb) => cb(null, path),
                    },
                },
            });
            expect(css).toMatchInlineSnapshot(`
        "@font-face {
        font-family: myFont;
        src: url(/_next/static/media/my-font.woff2) format('woff2');
        font-display: swap;
        font-weight: 400;
        font-style: normal;
        }

        @font-face {
        font-family: myFont;
        src: url(/_next/static/media/my-font.woff2) format('woff2');
        font-display: swap;
        font-weight: 400;
        font-style: italic;
        }

        @font-face {
        font-family: myFont;
        src: url(/_next/static/media/my-font.woff2) format('woff2');
        font-display: swap;
        font-weight: 700;
        }
        "
      `);
        });
    });
});
