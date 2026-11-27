export type NativeObjectTables = {
    NATIVE_PURE_ACCESS_GLOBALS: (string | {
        name: string;
        when: ("sloppy" | number)[];
    })[];
    NATIVE_PURE_PROP_ACCESS_GLOBALS: string[];
    NATIVE_PURE_FUNCTIONS: (string | {
        name: string;
        when: ("sloppy" | number)[];
    })[];
    NATIVE_ARG1_IS_ITERABLE: string[];
    NATIVE_ARG1_IS_RANGE_OR_ITERABLE: string[];
    NATIVE_LONE_ARG_IS_RANGE: string[];
    NATIVE_PURE_METHODS: Record<string, {
        when?: ("sloppy" | number)[];
        names: (string | {
            name: string;
            when: ("sloppy" | number)[];
        })[];
    }>;
    NATIVE_PURE_STATIC_FUNCTIONS: Record<string, {
        when?: ("sloppy" | number)[];
        names: (string | {
            name: string;
            when: ("sloppy" | number)[];
        })[];
    }>;
    NATIVE_PURE_STATIC_PROPERTIES: Record<string, {
        when?: ("sloppy" | number)[];
        names: (string | {
            name: string;
            when: ("sloppy" | number)[];
        })[];
    }>;
};
export type FoldedBuiltIns = {
    /**
     * the global functions
     */
    globals: string[];
    /**
     * the functions of each global object
     */
    statics: Record<string, string[]>;
    /**
     * the prototype methods of each constructor
     */
    methods: Record<string, string[]>;
    /**
     * the static values of each global object
     */
    constants: Record<string, string[]>;
    /**
     * the static values of each global object written as a power of two
     */
    powerOfTwoConstants: Record<string, string[]>;
    /**
     * the string methods folded on ASCII only
     */
    unicodeDependent: string[];
    /**
     * the string methods a count or length argument sizes
     */
    sizedByArgument: string[];
    /**
     * the constructors that construct the same without `new`
     */
    constructedWhenCalled: string[];
};
export type PureBuiltIns = {
    /**
     * the globals a read of which has no effect
     */
    globals: string[];
    /**
     * the globals a call of which on literals has none but a throw
     */
    callableGlobals: string[];
    /**
     * the functions of each global a call of which on literals has none but a throw
     */
    statics: Record<string, string[]>;
    /**
     * the globals a browser page defines, a read of which is taken to have no effect
     */
    hostGlobals: string[];
    /**
     * every member any edition gives `Array`, `Object` and `String` or their prototypes
     */
    knownMembers: Record<string, string[]>;
};
/**
 * @returns {string[]} the names, fresh on each call
 */
export function domProperties(): string[];
/**
 * @typedef {object} FoldedBuiltIns
 * @property {string[]} globals the global functions
 * @property {Record<string, string[]>} statics the functions of each global object
 * @property {Record<string, string[]>} methods the prototype methods of each constructor
 * @property {Record<string, string[]>} constants the static values of each global object
 * @property {Record<string, string[]>} powerOfTwoConstants the static values of each global object written as a power of two
 * @property {string[]} unicodeDependent the string methods folded on ASCII only
 * @property {string[]} sizedByArgument the string methods a count or length argument sizes
 * @property {string[]} constructedWhenCalled the constructors that construct the same without `new`
 */
/**
 * @returns {FoldedBuiltIns} the tables, fresh on each call
 */
export function foldedBuiltIns(): FoldedBuiltIns;
/**
 * @typedef {object} PureBuiltIns
 * @property {string[]} globals the globals a read of which has no effect
 * @property {string[]} callableGlobals the globals a call of which on literals has none but a throw
 * @property {Record<string, string[]>} statics the functions of each global a call of which on literals has none but a throw
 * @property {string[]} hostGlobals the globals a browser page defines, a read of which is taken to have no effect
 * @property {Record<string, string[]>} knownMembers every member any edition gives `Array`, `Object` and `String` or their prototypes
 */
/**
 * @returns {PureBuiltIns} the tables, fresh on each call
 */
export function pureBuiltIns(): PureBuiltIns;
/**
 * @typedef {object} NativeObjectTables
 * @property {(string | { name: string, when: ("sloppy" | number)[] })[]} NATIVE_PURE_ACCESS_GLOBALS
 * @property {string[]} NATIVE_PURE_PROP_ACCESS_GLOBALS
 * @property {(string | { name: string, when: ("sloppy" | number)[] })[]} NATIVE_PURE_FUNCTIONS
 * @property {string[]} NATIVE_ARG1_IS_ITERABLE
 * @property {string[]} NATIVE_ARG1_IS_RANGE_OR_ITERABLE
 * @property {string[]} NATIVE_LONE_ARG_IS_RANGE
 * @property {Record<string, { when?: ("sloppy" | number)[], names: (string | { name: string, when: ("sloppy" | number)[] })[] }>} NATIVE_PURE_METHODS
 * @property {Record<string, { when?: ("sloppy" | number)[], names: (string | { name: string, when: ("sloppy" | number)[] })[] }>} NATIVE_PURE_STATIC_FUNCTIONS
 * @property {Record<string, { when?: ("sloppy" | number)[], names: (string | { name: string, when: ("sloppy" | number)[] })[] }>} NATIVE_PURE_STATIC_PROPERTIES
 */
/**
 * @returns {NativeObjectTables} the tables, fresh on each call
 */
export function nativeObjectTables(): NativeObjectTables;
/**
 * @returns {Record<string, string[] | string[][]>} the tables, fresh on each call
 */
export function parserTables(): Record<string, string[] | string[][]>;
