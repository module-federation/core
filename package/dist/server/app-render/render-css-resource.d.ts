import type { CssResource } from '../../build/webpack/plugins/flight-manifest-plugin';
import type { AppRenderContext } from './app-render';
import type { PreloadCallbacks } from './types';
/**
 * Abstracts the rendering of CSS files based on whether they are inlined or not.
 * For inlined CSS, renders a <style> tag with the CSS content directly embedded.
 * For external CSS files, renders a <link> tag pointing to the CSS file.
 */
export declare function renderCssResource(entryCssFiles: CssResource[], ctx: AppRenderContext, preloadCallbacks?: PreloadCallbacks): import("react/jsx-runtime").JSX.Element[];
