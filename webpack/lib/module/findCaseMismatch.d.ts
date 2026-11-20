/**
 * wrongly cased segment paired with its real name
 */
export type CaseCorrection = [string, string];
export type CaseMismatch = {
    corrections: CaseCorrection[];
    path: string;
};
/**
 * Rewrites a request with the real casing found on disk. Corrections are
 * case-only, so each one keeps the length and position of what it replaces —
 * a request that omitted the extension spells a prefix of the segment.
 * @param {string} request request as written
 * @param {CaseCorrection[]} corrections corrections, outermost first
 * @returns {string | undefined} the corrected request, or undefined when a correction is not spelled out in the request
 */
export function applyCaseCorrections(request: string, corrections: CaseCorrection[]): string | undefined;
/**
 * Finds an existing path that differs from `missingPath` only in the casing of
 * its segments, by listing the directories the path walks through.
 * @param {InputFileSystem} fs input file system
 * @param {string} missingPath absolute path that does not exist
 * @param {(mismatch?: CaseMismatch) => void} callback receives the real path and the wrongly cased segments, outermost first, or nothing when the path does not exist under any casing
 * @returns {void}
 */
export function findCaseMismatch(fs: InputFileSystem, missingPath: string, callback: (mismatch?: CaseMismatch) => void): void;
import type { InputFileSystem } from "../fs/fs";
