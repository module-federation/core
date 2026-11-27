export type PrintFunction = (value: EXPECTED_ANY) => string;
/**
 * Defines the colors type used by this module.
 */
export type Colors = {
    reset: PrintFunction;
    bold: PrintFunction;
    dim: PrintFunction;
    italic: PrintFunction;
    underline: PrintFunction;
    inverse: PrintFunction;
    hidden: PrintFunction;
    strikethrough: PrintFunction;
    black: PrintFunction;
    red: PrintFunction;
    green: PrintFunction;
    yellow: PrintFunction;
    blue: PrintFunction;
    magenta: PrintFunction;
    cyan: PrintFunction;
    white: PrintFunction;
    gray: PrintFunction;
    bgBlack: PrintFunction;
    bgRed: PrintFunction;
    bgGreen: PrintFunction;
    bgYellow: PrintFunction;
    bgBlue: PrintFunction;
    bgMagenta: PrintFunction;
    bgCyan: PrintFunction;
    bgWhite: PrintFunction;
    blackBright: PrintFunction;
    redBright: PrintFunction;
    greenBright: PrintFunction;
    yellowBright: PrintFunction;
    blueBright: PrintFunction;
    magentaBright: PrintFunction;
    cyanBright: PrintFunction;
    whiteBright: PrintFunction;
    bgBlackBright: PrintFunction;
    bgRedBright: PrintFunction;
    bgGreenBright: PrintFunction;
    bgYellowBright: PrintFunction;
    bgBlueBright: PrintFunction;
    bgMagentaBright: PrintFunction;
    bgCyanBright: PrintFunction;
    bgWhiteBright: PrintFunction;
};
/**
 * Defines the colors options type used by this module.
 */
export type ColorsOptions = {
    /**
     * force use colors
     */
    useColor?: boolean | undefined;
};
/**
 * Defines the colors type used by this module.
 * @typedef {{ reset: PrintFunction, bold: PrintFunction, dim: PrintFunction, italic: PrintFunction, underline: PrintFunction, inverse: PrintFunction, hidden: PrintFunction, strikethrough: PrintFunction, black: PrintFunction, red: PrintFunction, green: PrintFunction, yellow: PrintFunction, blue: PrintFunction, magenta: PrintFunction, cyan: PrintFunction, white: PrintFunction, gray: PrintFunction, bgBlack: PrintFunction, bgRed: PrintFunction, bgGreen: PrintFunction, bgYellow: PrintFunction, bgBlue: PrintFunction, bgMagenta: PrintFunction, bgCyan: PrintFunction, bgWhite: PrintFunction, blackBright: PrintFunction, redBright: PrintFunction, greenBright: PrintFunction, yellowBright: PrintFunction, blueBright: PrintFunction, magentaBright: PrintFunction, cyanBright: PrintFunction, whiteBright: PrintFunction, bgBlackBright: PrintFunction, bgRedBright: PrintFunction, bgGreenBright: PrintFunction, bgYellowBright: PrintFunction, bgBlueBright: PrintFunction, bgMagentaBright: PrintFunction, bgCyanBright: PrintFunction, bgWhiteBright: PrintFunction }} Colors
 */
/**
 * Defines the colors options type used by this module.
 * @typedef {object} ColorsOptions
 * @property {boolean=} useColor force use colors
 */
/**
 * Creates a colors from the provided colors option.
 * @param {ColorsOptions=} options options
 * @returns {Colors} colors
 */
export function createColors({ useColor }?: ColorsOptions | undefined): Colors;
/**
 * Checks whether this object is color supported.
 * @returns {boolean} true when colors supported, otherwise false
 */
export function isColorSupported(): boolean;
