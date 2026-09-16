import { z } from 'zod';

import { CAPABILITIES, LIMITS } from './constants';
export type Capability = (typeof CAPABILITIES)[number];

const text = z.string().max(LIMITS.text);
const optionalText = text.nullable();
const flag = z.boolean().nullable();
const list = <T extends z.ZodType>(item: T) =>
  z.array(item).max(LIMITS.entries);
const instance = z.object({
  instanceId: text,
  name: optionalText,
  runtimeVersion: optionalText,
  version: optionalText,
  role: z.enum(['consumer', 'unknown']),
  capabilities: z.object({
    remotes: z.boolean(),
    shared: z.boolean(),
    remoteLoaded: z.boolean(),
  }),
});
const remote = z.object({
  instanceId: text,
  name: optionalText,
  alias: optionalText,
  version: optionalText,
  entry: optionalText,
  loaded: z.enum(['loaded', 'not-initialized', 'unknown']),
  producer: z
    .object({ name: optionalText, version: optionalText, entry: optionalText })
    .nullable(),
  candidateInstanceIds: z.array(text).max(LIMITS.instances),
});
const shared = z.object({
  instanceId: text,
  scope: text,
  name: text,
  version: text,
  provider: optionalText,
  loaded: flag,
  singleton: flag,
  eager: flag,
  requiredVersion: z.union([text, z.literal(false), z.null()]),
  strategy: optionalText,
});
const moduleInfo = z.object({
  key: text,
  version: optionalText,
  buildVersion: optionalText,
  remoteEntry: optionalText,
  remoteEntryType: optionalText,
  globalName: optionalText,
  publicPath: optionalText,
  modules: list(z.object({ name: optionalText, path: optionalText })),
});

/** Explicit allowlist also validates the browser-to-server boundary. */
export const snapshotSchema = z.object({
  schemaVersion: z.literal(1),
  boundary: z.literal('current-state'),
  present: z.boolean(),
  truncated: z.boolean(),
  moduleInfoAvailable: z.boolean(),
  instances: z.array(instance).max(LIMITS.instances),
  remotes: list(remote),
  shared: list(shared),
  moduleInfo: list(moduleInfo),
});
export type ModuleFederationSnapshot = z.infer<typeof snapshotSchema>;

export type PageResult =
  | { pageId: string; state: 'available'; snapshot: ModuleFederationSnapshot }
  | { pageId: string; state: 'unavailable' };

export const querySchema = z
  .object({ pageId: z.string().max(80).optional() })
  .optional();
export type Query = z.infer<typeof querySchema>;
