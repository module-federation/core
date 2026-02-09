import { z } from 'zod';

const UploadOptionsSchema = z.object({
  scmName: z.string(),
  bucketName: z.string(),
  publicFilePath: z.string(),
  publicPath: z.string(),
  cdnRegion: z.string(),
});

const BasicSchema = z.object({
  shared: z
    .array(z.tuple([z.string(), z.string(), z.array(z.string())]))
    .describe('List of plugins: [name, version, usedExports]'),
  plugins: z
    .array(z.tuple([z.string(), z.string().optional()]))
    .describe(
      'Specify extra build plugin names, support specify version in second item',
    )
    .optional(),
  target: z
    .union([z.string(), z.array(z.string())])
    .describe(
      'Used to configure the target environment of Rspack output and the ECMAScript version of Rspack runtime code, the same with rspack#target',
    ),
  libraryType: z.string(),
  hostName: z.string().describe('The name of the host app / mf'),
});

export const ConfigSchema = BasicSchema.extend({
  uploadOptions: UploadOptionsSchema.optional(),
});

export type Config = z.infer<typeof ConfigSchema>;

export const CheckTreeShakingSchema = ConfigSchema.extend({
  uploadOptions: UploadOptionsSchema.optional(),
});

export type CheckTreeShaking = z.infer<typeof CheckTreeShakingSchema>;
