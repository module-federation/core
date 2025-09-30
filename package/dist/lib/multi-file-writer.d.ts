import type { CacheFs } from '../shared/lib/utils';
/**
 * MultiFileWriter is a utility for writing multiple files in parallel that
 * guarantees that all files will be written after their containing directory
 * is created, and that the directory will only be created once.
 */
export declare class MultiFileWriter {
    /**
     * The file system methods to use.
     */
    private readonly fs;
    /**
     * The tasks to be written.
     */
    private readonly tasks;
    constructor(
    /**
     * The file system methods to use.
     */
    fs: Pick<CacheFs, 'mkdir' | 'writeFile'>);
    /**
     * Finds or creates a task for a directory.
     *
     * @param directory - The directory to find or create a task for.
     * @returns The task for the directory.
     */
    private findOrCreateTask;
    /**
     * Appends a file to the writer to be written after its containing directory
     * is created. The file writer should be awaited after all the files have been
     * appended. Any async operation that occurs between appending and awaiting
     * may cause an unhandled promise rejection warning and potentially crash the
     * process.
     *
     * @param filePath - The path to the file to write.
     * @param data - The data to write to the file.
     */
    append(filePath: string, data: Buffer | string): void;
    /**
     * Returns a promise that resolves when all the files have been written.
     */
    wait(): Promise<unknown>;
}
