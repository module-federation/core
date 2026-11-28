module.exports = function registerFixtures(app) {
  const sendJson = (response, body) => {
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(body));
  };
  const sendJs = (response, body) => {
    response.setHeader('Content-Type', 'application/javascript');
    response.end(body);
  };
  let esmRetryRequestCount = 0;
  const createManifest = ({ name, globalName, publicPath }) => ({
    id: name,
    name,
    metaData: {
      name,
      type: 'app',
      buildInfo: {
        buildVersion: 'observability-fixture',
        buildName: name,
      },
      remoteEntry: {
        name: 'remoteEntry.js',
        path: '',
        type: 'global',
      },
      types: {
        path: '',
        name: '',
        zip: '',
        api: '',
      },
      globalName,
      pluginVersion: 'observability-fixture',
      publicPath,
    },
    shared: [],
    remotes: [],
    exposes: [
      {
        id: `${name}:Button`,
        name: 'Button',
        assets: {
          js: {
            sync: [],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
        path: './Button',
      },
    ],
  });

  app.post('/esm-retry-fixture/reset', (_request, response) => {
    esmRetryRequestCount = 0;
    response.statusCode = 204;
    response.end();
  });
  app.get('/esm-retry-fixture/remoteEntry.js', (_request, response) => {
    esmRetryRequestCount += 1;
    response.setHeader('Cache-Control', 'no-store');

    if (esmRetryRequestCount === 1) {
      response.statusCode = 503;
      response.end('ESM remote unavailable');
      return;
    }

    sendJs(
      response,
      [
        'export function init() {}',
        'export function get() {',
        "  return Promise.resolve(function() { return { default: 'ESM retry recovered' }; });",
        '}',
      ].join('\n'),
    );
  });

  app.get(
    '/observability-fixtures/missing-fields/mf-manifest.json',
    (_request, response) => {
      sendJson(response, {
        id: 'observability_missing_fields_remote',
        name: 'observability_missing_fields_remote',
      });
    },
  );
  app.get(
    '/observability-fixtures/retry-recovered/mf-manifest.json',
    (_request, response) => {
      sendJson(
        response,
        createManifest({
          name: 'observability_retry_recovered_remote',
          globalName: 'observability_retry_recovered_remote',
          publicPath:
            'http://127.0.0.1:3005/observability-fixtures/retry-recovered/',
        }),
      );
    },
  );
  app.get(
    '/observability-fixtures/retry-recovered/remoteEntry.js',
    (request, response) => {
      if (request.query.retryCount !== '1') {
        response.statusCode = 503;
        response.end('observability retry fixture failed before retry');
        return;
      }

      sendJs(
        response,
        [
          'window.observability_retry_recovered_remote = {',
          '  init: function() {},',
          '  get: function() {',
          '    return Promise.resolve(function() {',
          '      return { default: function ObservabilityRetryRecovered() { return null; } };',
          '    });',
          '  }',
          '};',
        ].join('\n'),
      );
    },
  );
  app.get(
    '/observability-fixtures/wrong-global/mf-manifest.json',
    (_request, response) => {
      sendJson(
        response,
        createManifest({
          name: 'observability_wrong_global_remote',
          globalName: 'observability_wrong_global_expected',
          publicPath:
            'http://127.0.0.1:3005/observability-fixtures/wrong-global/',
        }),
      );
    },
  );
  app.get(
    '/observability-fixtures/wrong-global/remoteEntry.js',
    (_request, response) => {
      sendJs(
        response,
        [
          'window.observability_wrong_global_actual = {',
          '  init: function() {},',
          '  get: function() {',
          '    return Promise.resolve(function() {',
          '      return { default: function ObservabilityWrongGlobal() { return null; } };',
          '    });',
          '  }',
          '};',
        ].join('\n'),
      );
    },
  );
  app.get(
    '/observability-fixtures/execution-error/mf-manifest.json',
    (_request, response) => {
      sendJson(
        response,
        createManifest({
          name: 'observability_execution_error_remote',
          globalName: 'observability_execution_error_remote',
          publicPath:
            'http://127.0.0.1:3005/observability-fixtures/execution-error/',
        }),
      );
    },
  );
  app.get(
    '/observability-fixtures/execution-error/remoteEntry.js',
    (_request, response) => {
      sendJs(
        response,
        "throw new Error('observability remoteEntry execution failed');",
      );
    },
  );
};
