'use strict';

const PERSISTENCE_CACHE_INVALIDATE_ERROR = (log, config) => {
  if (config.run < 2) return;
  const match =
    /^\[webpack\.cache\.PackFileCacheStrategy\] Pack got invalid because of write to:(.+)$/.exec(
      log,
    );
  if (match) {
    return `Pack got invalid because of write to: ${match[1].trim()}`;
  }
};
const ALLOWED_PREFIXES = [
  '[ Module Federation ]',
  '[ Federation Runtime ]',
  '[ Module Federation Manifest Plugin ]',
  '[ Module Federation Bridge React ]',
  '[ Module Federation Bridge Vue3 ]',
  '[ Module Federation Bridge ]',
  '[Module Federation Manifest Plugin]',
  '[Module Federation Bridge React]',
  '[Module Federation Bridge Vue3]',
  '[Module Federation Bridge]',
];

const normalizeLogEntry = (log) => {
  let normalized;
  if (typeof log === 'string') normalized = log;
  else if (Array.isArray(log)) normalized = log.join(' ');
  else if (log && typeof log.message === 'string') normalized = log.message;
  else normalized = String(log ?? '');

  return normalized.replace(/\u001b\[[0-9;]*m/g, '');
};

const isAllowedLog = (log) => {
  const normalized = normalizeLogEntry(log).trim();
  if (!normalized) {
    return true;
  }
  const sanitized = normalized.replace(/^<[^>]+>\s*/, '');
  return ALLOWED_PREFIXES.some((prefix) => sanitized.startsWith(prefix));
};

const errorsFilter = [PERSISTENCE_CACHE_INVALIDATE_ERROR];

/**
 * @param {string[]} logs logs
 * @param {object} config config
 * @returns {string[]} errors
 */
module.exports = function filterInfraStructureErrors(logs, config) {
  const results = [];
  for (const log of logs) {
    if (isAllowedLog(log)) {
      continue;
    }
    for (const filter of errorsFilter) {
      const result = filter(log, config);
      if (result) results.push({ message: result });
    }
  }
  return results;
};

module.exports.isAllowedLog = (log) => isAllowedLog(log);
