export const LOCALHOST = 'localhost';
export const PLUGIN_IDENTIFIER = '[ Modern.js Module Federation ]';
export const DATA_FETCH_QUERY = 'x-mf-data-fetch';
export const DATA_FETCH_ERROR_PREFIX =
  'caught the following error during dataFetch: ';
export const LOAD_REMOTE_ERROR_PREFIX =
  'caught the following error during loadRemote: ';
export const DOWNGRADE_KEY = '_mfSSRDowngrade';

export const ERROR_TYPE = {
  DATA_FETCH: 1,
  LOAD_REMOTE: 2,
  UNKNOWN: 3,
};
