'use strict';

const normalizeLogEntry = (log) => {
  let normalized;
  if (typeof log === 'string') normalized = log;
  else if (Array.isArray(log)) normalized = log.join(' ');
  else if (log && typeof log.message === 'string') normalized = log.message;
  else normalized = String(log ?? '');
  return normalized.replace(/\u001b\[[0-9;]*m/g, '');
};

const createLogEntry = (log) => {
  const normalized = normalizeLogEntry(log).trim();
  if (!normalized) {
    return null;
  }
  const stripped = normalized.replace(/^<[^>]+>\s*/, '');
  return { normalized, stripped };
};

const PERSISTENCE_CACHE_INVALIDATE_ERROR = (entry, config) => {
  if (config.run < 2) return;
  const match =
    /^\[webpack\.cache\.PackFileCacheStrategy\] Pack got invalid because of write to:(.+)$/.exec(
      entry.stripped,
    );
  if (match) {
    return {
      message: `Pack got invalid because of write to: ${match[1].trim()}`,
      normalized: entry.normalized,
    };
  }
};

const MANIFEST_PUBLIC_PATH_WARNING = (entry) => {
  const withoutLeadingPluginPrefix = entry.stripped.replace(
    /^\[ *Module Federation Manifest Plugin *]\s*/,
    '',
  );
  const match =
    /\[ *Module Federation Manifest Plugin *]\s+Manifest will not generate, because publicPath can only be string, but got '([^']*)'$/i.exec(
      withoutLeadingPluginPrefix,
    );
  if (match) {
    return {
      handled: true,
      normalized: entry.normalized,
    };
  }
};

const errorsFilter = [
  PERSISTENCE_CACHE_INVALIDATE_ERROR,
  MANIFEST_PUBLIC_PATH_WARNING,
];

const STACK_LINE_REGEX = /^(at\s|\()/i;

const collect = (logs = [], config = {}) => {
  const entries = [];
  const results = [];
  const handled = new Set();
  let skipStack = false;

  for (const rawLog of logs) {
    const entry = createLogEntry(rawLog);
    if (!entry) {
      skipStack = false;
      continue;
    }
    if (skipStack && STACK_LINE_REGEX.test(entry.stripped)) {
      handled.add(entry.normalized);
      entries.push(entry);
      continue;
    }
    entries.push(entry);
    for (const filter of errorsFilter) {
      const output = filter(entry, config);
      if (!output) {
        continue;
      }
      const {
        message,
        handled: shouldHandle = true,
        normalized,
      } = typeof output === 'string'
        ? { message: output, normalized: entry.normalized }
        : output;
      if (message) {
        results.push({ message });
      }
      if (shouldHandle) {
        handled.add(normalized ?? entry.normalized);
      }
    }
    if (handled.has(entry.normalized)) {
      skipStack = true;
    } else {
      skipStack = false;
    }
  }
  return { results, entries, handled };
};

function filterInfraStructureErrors(logs, config) {
  const { results } = collect(logs, config);
  return results;
}

filterInfraStructureErrors.collect = collect;
filterInfraStructureErrors.normalizeLogEntry = normalizeLogEntry;

module.exports = filterInfraStructureErrors;
