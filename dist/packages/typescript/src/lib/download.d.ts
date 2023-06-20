export interface DownloadOptions {
    /**
     * URL of the file.
     */
    url: string;
    /**
     * Path to where the file will be saved.
     */
    destination: string;
    /**
     * Name of the file.
     */
    filename: string;
}
/**
 * Downloads a file from a URL and saves it to disk.
 *
 * @param options Download options.
 */
export default function download(options: DownloadOptions): Promise<void>;
