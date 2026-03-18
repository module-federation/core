const Module = require('module');
const path = require('path');

const appRequire = Module.createRequire(
  path.join(process.cwd(), 'package.json'),
);
const nextCliPath =
  process.env.NEXT_TRACE_CLI_PATH || appRequire.resolve('next/dist/bin/next');
const recentLoads = [];

const pushRecentLoad = (entry) => {
  recentLoads.push(entry);
  if (recentLoads.length > 2000) {
    recentLoads.shift();
  }
};

const interestingRequest = (request) =>
  /webpack|webpack-sources|nextjs-mf|module-federation|enhanced/.test(
    String(request),
  );

const interestingParent = (parent) =>
  /nextjs-mf|module-federation|enhanced|webpack/.test(String(parent || ''));

const summarizeExports = (value) => {
  if (value === undefined) {
    return 'undefined';
  }
  if (value === null) {
    return 'null';
  }
  if (typeof value === 'function') {
    return 'function';
  }
  if (typeof value !== 'object') {
    return typeof value;
  }

  return Object.keys(value).slice(0, 12).join(',');
};

const originalLoad = Module._load;
Module._load = function patchedLoad(request, parent, isMain) {
  try {
    const loaded = originalLoad.apply(this, arguments);
    const summary = summarizeExports(loaded);
    pushRecentLoad({
      type: 'ok',
      request: String(request),
      parent: parent && parent.filename,
      summary,
    });

    if (
      interestingRequest(request) ||
      interestingParent(parent && parent.filename)
    ) {
      console.error(
        'LOAD_OK',
        request,
        'FROM',
        parent && parent.filename,
        'EXPORTS',
        summary,
      );
    }

    if (loaded === undefined) {
      console.error(
        'LOAD_UNDEFINED',
        request,
        'FROM',
        parent && parent.filename,
      );
    }

    return loaded;
  } catch (error) {
    pushRecentLoad({
      type: 'err',
      request: String(request),
      parent: parent && parent.filename,
      summary: error && (error.code || error.message),
    });
    if (
      interestingRequest(request) ||
      interestingParent(parent && parent.filename)
    ) {
      console.error(
        'LOAD_ERR',
        request,
        'FROM',
        parent && parent.filename,
        error && (error.code || error.message),
      );
    }
    throw error;
  }
};

process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT', error && error.stack ? error.stack : error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error(
    'UNHANDLED_REJECTION',
    error && error.stack ? error.stack : error,
  );
});

process.on('exit', (code) => {
  if (!code) {
    return;
  }

  console.error('RECENT_LOADS_START');
  for (const entry of recentLoads.filter(
    (item) =>
      interestingRequest(item.request) || interestingParent(item.parent),
  )) {
    console.error(
      entry.type,
      entry.request,
      'FROM',
      entry.parent,
      '=>',
      entry.summary,
    );
  }
  console.error('RECENT_LOADS_END');
});

process.argv = ['node', nextCliPath, ...process.argv.slice(2)];
require(nextCliPath);
