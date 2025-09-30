/**
 * Fetches a font file and returns its contents as a Buffer.
 * If NEXT_FONT_GOOGLE_MOCKED_RESPONSES is set, we handle mock data logic.
 */
export declare function fetchFontFile(url: string, isDev: boolean): Promise<any>;
