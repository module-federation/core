export type MappingSegment = {
    /**
     * 0-based generated column (defaults to 0)
     */
    generatedColumn?: number | undefined;
    /**
     * index into the surrounding source map's `sources` array; omit for a generated-only segment
     */
    sourceIndex?: number | undefined;
    /**
     * 0-based line in the original source (required when `sourceIndex` is set)
     */
    originalLine?: number | undefined;
    /**
     * 0-based column in the original source (required when `sourceIndex` is set)
     */
    originalColumn?: number | undefined;
    /**
     * index into the surrounding source map's `names` array
     */
    nameIndex?: number | undefined;
};
export type LineMappings = null | MappingSegment | MappingSegment[];
/**
 * generated column, then source index, original line and column, then name index, all 0-based
 */
export type DecodedSegment = [number] | [number, number, number, number] | [number, number, number, number, number];
/** @typedef {[number] | [number, number, number, number] | [number, number, number, number, number]} DecodedSegment generated column, then source index, original line and column, then name index, all 0-based */
/**
 * Decode a V3 `mappings` string into one array of segments per generated line,
 * each sorted by generated column.
 * @param {string} mappings a VLQ encoded `mappings` string
 * @returns {DecodedSegment[][]} the segments of each generated line
 */
export function decodeMappings(mappings: string): DecodedSegment[][];
/**
 * Decode one base64 VLQ value per the source-map V3 spec.
 * @param {string} mappings a VLQ encoded `mappings` string
 * @param {number} start index of the value's first character
 * @returns {{ value: number, end: number }} the decoded value and the index just past it; `end` equals `start` when there is no valid value at `start`
 */
export function decodeVLQ(mappings: string, start: number): {
    value: number;
    end: number;
};
/**
 * Encode the segments `decodeMappings` reads back into a V3 `mappings` string.
 * @param {DecodedSegment[][]} lines the segments of each generated line
 * @returns {string} VLQ-encoded V3 mappings string
 */
export function encodeDecodedMappings(lines: DecodedSegment[][]): string;
/**
 * @typedef {object} MappingSegment
 * @property {number=} generatedColumn 0-based generated column (defaults to 0)
 * @property {number=} sourceIndex index into the surrounding source map's `sources` array; omit for a generated-only segment
 * @property {number=} originalLine 0-based line in the original source (required when `sourceIndex` is set)
 * @property {number=} originalColumn 0-based column in the original source (required when `sourceIndex` is set)
 * @property {number=} nameIndex index into the surrounding source map's `names` array
 */
/** @typedef {null | MappingSegment | MappingSegment[]} LineMappings */
/**
 * Encode a V3 source-map `mappings` string from a per-generated-line
 * description of segments.
 *
 * Each entry of `lines` describes the mappings for one generated line:
 *
 * - `null` (or `undefined`) — the line has no mappings.
 * - a single `MappingSegment` — convenience for the common "one mapping at
 * column 0" case.
 * - `MappingSegment[]` — multiple segments on the same line.
 *
 * Lines are joined with `;`, segments within a line with `,`. All numeric
 * fields are encoded as deltas relative to the previous emitted segment, per
 * the V3 spec.
 * @param {LineMappings[]} lines per-generated-line mapping segments
 * @returns {string} VLQ-encoded V3 mappings string
 */
export function encodeMappings(lines: LineMappings[]): string;
/**
 * Encode a signed integer as a base64 VLQ string per the source-map V3 spec.
 * @param {number} value signed integer to encode
 * @returns {string} base64 VLQ encoded value
 */
export function encodeVLQ(value: number): string;
