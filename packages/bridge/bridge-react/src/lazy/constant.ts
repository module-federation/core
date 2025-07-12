export const PLUGIN_IDENTIFIER = '[ Module Federation React ]';
export const DOWNGRADE_KEY = '_mfSSRDowngrade';
export const DATA_FETCH_MAP_KEY = '__MF_DATA_FETCH_MAP__';
export const DATA_FETCH_FUNCTION = '_mfDataFetch';
export const FS_HREF = '_mfFSHref';
export const ERROR_TYPE = {
  DATA_FETCH: 1,
  LOAD_REMOTE: 2,
  UNKNOWN: 3,
};
export const WRAP_DATA_FETCH_ID_IDENTIFIER = 'wrap_dfip_identifier';
export const enum MF_DATA_FETCH_TYPE {
  FETCH_SERVER = 1,
  FETCH_CLIENT = 2,
}

export const enum MF_DATA_FETCH_STATUS {
  LOADED = 1,
  LOADING = 2,
  AWAIT = 0,
  ERROR = 3,
}

export const DATA_FETCH_IDENTIFIER = 'data';
export const DATA_FETCH_CLIENT_SUFFIX = '.client';
export const DATA_FETCH_QUERY = 'x-mf-data-fetch';
export const DATA_FETCH_ERROR_PREFIX =
  'caught the following error during dataFetch: ';
export const LOAD_REMOTE_ERROR_PREFIX =
  'caught the following error during loadRemote: ';
