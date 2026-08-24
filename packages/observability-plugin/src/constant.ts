import { createLogger } from '@module-federation/sdk';

export const DEFAULT_MAX_EVENTS = 100;

export const HARD_MAX_EVENTS = 1000;

export const DEFAULT_COLLECTOR_PORT = 17891;

export const COLLECTOR_PATH = '/__mf_observability';

export const logger = createLogger(
  '[ Module Federation Observability Plugin ]',
);

export const DEFAULT_DEVTOOLS_SOURCE = 'module-federation/observability';

export const COMPONENT_BUSINESS_LOADED_EVENT = 'component:business-loaded';

export const ON_MF_REMOTE_LOADED_PROP = 'onMFRemoteLoaded';

export const SHARED_SINGLETON_MULTIPLE_VERSIONS_REASON =
  'singleton-multiple-versions' as const;

export const SENSITIVE_PAIR_PATTERN =
  /\b(token|authorization|cookie|secret|password|session|access_token|refresh_token|api_key|apikey|key)\s*[:=]\s*([^&\s'",;<>]+)/gi;

export const ERROR_CODE_PATTERN = /\b(?:RUNTIME|TYPE|BUILD)-\d{3}\b/;

export const URL_PATTERN = /https?:\/\/[^\s'"<>]+/g;

export const DIAGNOSTIC_DOC_LINK_PATTERN =
  /https?:\/\/module-federation\.io\/guide\/troubleshooting\/[^\s'"<>]+/i;

export const RUNTIME_DOC_LINK =
  'https://module-federation.io/guide/troubleshooting/runtime';

export const ABSOLUTE_PATH_PATTERN =
  /(?:file:\/\/)?(?:\/(?:Users|private|var|tmp|home|workspace|opt|usr)\/[^\s)]+|[A-Za-z]:\\[^\s)]+)/g;

export const MAX_METADATA_KEYS = 20;

export const MAX_FACT_KEYS = 50;

export const MAX_BUILD_ITEMS = 50;

export const MAX_MODULE_INFO_ENTRIES = 20;

export const HARD_MAX_REPORT_QUERY_LIMIT = 1000;
