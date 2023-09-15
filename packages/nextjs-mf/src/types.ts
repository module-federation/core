export declare interface WatchOptions {
  /**
   * Delay the rebuilt after the first change. Value is a time in ms.
   */
  aggregateTimeout?: number;

  /**
   * Resolve symlinks and watch symlink and real file. This is usually not needed as webpack already resolves symlinks ('resolve.symlinks').
   */
  followSymlinks?: boolean;

  /**
   * Ignore some files from watching (glob pattern or regexp).
   */
  ignored?: string | RegExp | string[];

  /**
   * Enable polling mode for watching.
   */
  poll?: number | boolean;

  /**
   * Stop watching when stdin stream has ended.
   */
  stdin?: boolean;
}

export declare interface CallbackFunction<T> {
  (err?: null | Error, result?: T): any;
}

declare global {
  //eslint-disable-next-line
  var usedChunks: Set<string>;
}
