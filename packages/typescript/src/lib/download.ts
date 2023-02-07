import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';
import { pipeline } from 'stream/promises';

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
export default async function download(options: DownloadOptions) {
  const { url, destination, filename } = options;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Error ${response.status}. Failed to fetch types for URL: ${url}`
    );
  }

  const fileDest = path.normalize(path.join(destination, filename));

  // Create the dir path. This doesn't do anything if dir already exists.
  await fs.promises.mkdir(path.dirname(fileDest), {
    recursive: true,
  });

  await pipeline(
    response.body,
    fs.createWriteStream(fileDest, {
      flags: 'w',
    })
  );
}
