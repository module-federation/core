import fs from 'node:fs';
import path from 'node:path';
import {
  type BuildType,
  type NormalizedConfig,
  normalizedKey,
} from '@/domain/build/normalize-config';
import type { Config } from '@/domain/build/schema';
import { logger } from '@/infra/logger';
import type { ObjectStore } from '@/ports/objectStore';
import type { ProjectPublisher } from '@/ports/projectPublisher';
import { createUniqueTempDirByKey } from './buildService';
import { createCacheHash, retrieveCDNPath } from './cacheService';

export interface SharedFilePath {
  name: string;
  version: string;
  filepath: string;
  globalName: string;
  type: BuildType;
  canTreeShaking: boolean;
  modules?: string[];
}

export interface UploadResult {
  name: string;
  version: string;
  globalName: string;
  cdnUrl: string;
  type: BuildType;
  modules?: string[];
  canTreeShaking?: boolean;
}

/**
 * Upload shared files to CDN
 * @param sharedFilePaths Array of shared file paths to upload
 * @returns Array of upload results with CDN URLs
 */
export async function uploadToCacheStore(
  sharedFilePaths: SharedFilePath[],
  normalizedConfig: NormalizedConfig,
  store: ObjectStore,
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (const file of sharedFilePaths) {
    const {
      name,
      version,
      filepath,
      globalName,
      type,
      modules,
      canTreeShaking,
    } = file;

    try {
      // Generate a unique filename for CDN
      const sharedKey = normalizedKey(name, version);
      logger.info(`Uploading ${sharedKey} to CDN`);
      const config = normalizedConfig[sharedKey];
      const cdnPath = retrieveCDNPath({ config, sharedKey, type });
      const t0 = Date.now();
      await store.uploadFile(filepath, cdnPath);
      const tUpload = Date.now() - t0;
      const cdnUrl = store.publicUrl(cdnPath);

      const res: UploadResult = {
        name: name,
        version: version,
        globalName: globalName,
        cdnUrl,
        type,
        modules,
        canTreeShaking,
      };
      try {
        const jsonFilePath = filepath.replace(/\.js$/, '.json');
        const jsonFile = JSON.stringify(res);
        const jsonCdnUrl = cdnPath.replace(/\.js$/, '.json');
        fs.writeFileSync(jsonFilePath, jsonFile);
        await store.uploadFile(jsonFilePath, jsonCdnUrl);
      } catch (error) {
        logger.error(`Failed to upload ${name}@${version} json file: ${error}`);
      }

      results.push(res);
      logger.info(
        `Successfully uploaded ${name}@${version} to ${cdnUrl} in ${tUpload}ms`,
      );
    } catch (error) {
      logger.error(`Failed to upload ${name}@${version}: ${error}`);
      throw error;
    }
  }

  return results;
}

export interface UploadOpts {
  bucketName: string;
  scmName: string;
  cdnRegion: string;
  publicRoot: string;
}

const downloadToFile = async (
  url: string,
  destPath: string,
): Promise<string> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `Download failed: ${res.status} ${res.statusText} - ${url}`,
    );
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
  await fs.promises.writeFile(destPath, buf);
  return destPath;
};

//TODO: 也许不需要下载，都从本地构建可能更快
export async function uploadProject(
  uploadResults: UploadResult[],
  sharedFilePaths: SharedFilePath[],
  normalizedConfig: NormalizedConfig,
  publisher: ProjectPublisher,
): Promise<UploadResult[]> {
  const tmpDir = createUniqueTempDirByKey(
    `upload-project${Date.now().toString()}`,
  );
  const uploaded: Array<UploadResult> = [];
  try {
    for (const item of uploadResults) {
      try {
        const config = normalizedConfig[normalizedKey(item.name, item.version)];
        if (!config) {
          logger.error(`No config found for ${item.name}`);
          continue;
        }
        const { uploadOptions } = config;
        if (!uploadOptions) {
          throw new Error(`No uploadOptions found for ${item.name}`);
        }

        // publishFile()/publicUrl() use uploadOptions; no need to destructure fields here.

        const filename = path.basename(new URL(item.cdnUrl).pathname);
        const localPath = path.join(tmpDir, filename);
        const hash = createCacheHash(
          {
            ...config,
            plugins: config.plugins || [],
          },
          item.type,
        );
        const cdnUrl = publisher.publicUrl({
          sharedName: item.name,
          hash,
          fileName: filename,
          options: uploadOptions,
        });
        const hitCache = await publisher.exists(cdnUrl);
        if (hitCache) {
          logger.info(
            `Hit cache for ${item.name}@${item.version} -> ${cdnUrl}`,
          );
          uploaded.push({
            ...item,
            cdnUrl,
          });
          continue;
        }
        logger.info(`Downloading ${item.name}@${item.version} -> ${localPath}`);
        const t0 = Date.now();
        await downloadToFile(item.cdnUrl, localPath);
        const tDownload = Date.now() - t0;
        logger.info(
          `Downloaded ${item.name}@${item.version} in ${tDownload}ms`,
        );

        const newCdnUrl = await publisher.publishFile({
          localPath,
          sharedName: item.name,
          hash,
          options: uploadOptions,
        });
        uploaded.push({ ...item, cdnUrl: newCdnUrl });
      } catch (error) {
        logger.error(`Failed to upload ${item.name}@${item.version}: ${error}`);
      }
    }

    for (const s of sharedFilePaths) {
      try {
        const config = normalizedConfig[normalizedKey(s.name, s.version)];
        if (!config) {
          logger.error(`No config found for ${s.name}`);
          continue;
        }
        const { uploadOptions } = config;
        if (!uploadOptions) {
          throw new Error(`No uploadOptions found for ${s.name}`);
        }
        const hash = createCacheHash(
          {
            ...config,
            plugins: config.plugins || [],
          },
          s.type,
        );
        // publishFile() handles adapter-specific details; we still compute hash consistently.
        const cdnUrl = await publisher.publishFile({
          localPath: s.filepath,
          sharedName: s.name,
          hash,
          options: uploadOptions,
        });
        uploaded.push({
          name: s.name,
          version: s.version,
          globalName: s.globalName,
          cdnUrl,
          type: s.type,
        });
      } catch (error) {
        logger.error(`Failed to upload ${s.name}@${s.version}: ${error}`);
      }
    }

    return uploaded;
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

export async function upload(
  sharedFilePaths: SharedFilePath[],
  uploadResults: UploadResult[],
  normalizedConfig: NormalizedConfig,
  uploadOptions: Config['uploadOptions'],
  store: ObjectStore,
  publisher?: ProjectPublisher,
): Promise<UploadResult[]> {
  const cacheUploaded = await uploadToCacheStore(
    sharedFilePaths,
    normalizedConfig,
    store,
  );
  if (!uploadOptions) {
    const hydrated: UploadResult[] = await Promise.all(
      uploadResults.map(async (item): Promise<UploadResult> => {
        if (item.type !== 'full') {
          return item;
        }
        const tmpDir = createUniqueTempDirByKey(
          `download-full-json${Date.now().toString()}`,
        );
        const jsonPath = path.join(tmpDir, `${item.name}-${item.version}.json`);
        try {
          const tJson0 = Date.now();
          await downloadToFile(item.cdnUrl.replace('.js', '.json'), jsonPath);
          const tJson = Date.now() - tJson0;
          logger.info(
            `Downloaded ${item.name}@${item.version} json in ${tJson}ms`,
          );
          const jsonContent = JSON.parse(
            fs.readFileSync(jsonPath, 'utf8'),
          ) as Required<UploadResult>;
          return {
            ...item,
            canTreeShaking: jsonContent.canTreeShaking,
            modules: jsonContent.modules,
          };
        } catch (jsonError) {
          logger.error(
            `Failed to download ${item.name}@${item.version} json: ${jsonError}`,
          );
          // Default to true to preserve existing behavior for older artifacts.
          return { ...item, canTreeShaking: item.canTreeShaking ?? true };
        } finally {
          fs.rmSync(tmpDir, { recursive: true, force: true });
        }
      }),
    );
    return [...cacheUploaded, ...hydrated];
  }
  if (!publisher) {
    throw new Error(
      'uploadOptions provided but no projectPublisher configured (configure the selected adapter to enable it or omit uploadOptions)',
    );
  }
  const projectUploadResults = await uploadProject(
    uploadResults,
    sharedFilePaths,
    normalizedConfig,
    publisher,
  );
  return projectUploadResults;
}
