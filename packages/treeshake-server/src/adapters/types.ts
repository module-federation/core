export type AdapterLogger = {
  info: (...args: unknown[]) => void;
  warn?: (...args: unknown[]) => void;
  error?: (...args: unknown[]) => void;
};

export type AdapterContext = {
  logger?: AdapterLogger;
  uploadedDir?: string;
};

export type AdapterConfig = Record<string, unknown>;

export interface ObjectStore {
  /**
   * Return true if an object exists for the given key.
   *
   * "key" is the object-store path/key (not a full URL).
   */
  exists(key: string): Promise<boolean>;

  /**
   * Upload a local file to the object store under the given key.
   */
  uploadFile(localPath: string, key: string): Promise<void>;

  /**
   * Convert a key to a publicly reachable URL.
   */
  publicUrl(key: string): string;
}

export type UploadOptions = {
  scmName: string;
  bucketName: string;
  publicFilePath: string;
  publicPath: string;
  cdnRegion: string;
};

export interface ProjectPublisher {
  /**
   * Return true if a public URL is already reachable (cache hit).
   */
  exists(publicUrl: string): Promise<boolean>;

  /**
   * Compute the public URL for a would-be published file.
   *
   * This lets the caller do an existence check before uploading.
   */
  publicUrl(params: {
    sharedName: string;
    hash: string;
    fileName: string;
    options: UploadOptions;
  }): string;

  /**
   * Publish a file to a project-owned CDN/bucket and return its public URL.
   */
  publishFile(params: {
    localPath: string;
    sharedName: string;
    hash: string;
    options: UploadOptions;
  }): Promise<string>;
}

export type AdapterCreateResult = {
  objectStore: ObjectStore;
  projectPublisher?: ProjectPublisher;
  shutdown?: () => Promise<void>;
};

export type AdapterEnv = Record<string, string | undefined>;

export interface TreeShakeAdapter<TConfig = AdapterConfig> {
  readonly id: string;
  create(
    config: TConfig,
    context?: AdapterContext,
  ): Promise<AdapterCreateResult>;
  fromEnv?: (env: AdapterEnv) => TConfig;
}
