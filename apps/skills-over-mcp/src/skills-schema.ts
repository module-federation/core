import * as z from 'zod/v4';

const FrontmatterSchema = z.object({
  name: z.string(),
  description: z.string(),
  license: z.string().optional(),
});

const SkillResourceSchema = z.object({
  uri: z.string(),
  digest: z.string().regex(/^sha256:[0-9a-f]{64}$/),
  size: z.number().int().nonnegative(),
});

export const SkillEntrySchema = z.object({
  uri: z.string(),
  frontmatter: FrontmatterSchema,
  resources: z.array(SkillResourceSchema),
});

export const ListSkillsParamsSchema = z.object({
  cursor: z.string().optional(),
});

export const ListSkillsResultSchema = z.object({
  skills: z.array(SkillEntrySchema),
  ttlMs: z.number().int().nonnegative(),
  cacheScope: z.literal('public'),
});

export const GetSkillParamsSchema = z.object({
  uri: z.string(),
});

export const GetSkillResultSchema = z.object({
  skill: SkillEntrySchema,
  ttlMs: z.number().int().nonnegative(),
  cacheScope: z.literal('public'),
});
