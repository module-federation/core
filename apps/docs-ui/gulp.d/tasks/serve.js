'use strict';

const connect = require('gulp-connect');
const os = require('os');

const ANY_HOST = '0.0.0.0';
const URL_RX = /(https?):\/\/(?:[^/: ]+)(:\d+)?/;

module.exports =
  (root, opts = {}, watch = undefined) =>
  (done) => {
    connect.server(
      {
        ...opts,
        middleware: opts.host === ANY_HOST ? decorateLog : undefined,
        root,
      },
      function () {
        this.server.on('close', done);
        if (watch) watch();
      }
    );
  };

function decorateLog(_, app) {
  const _log = app.log;
  app.log = (msg) => {
    if (msg.startsWith('Server started ')) {
      const localIp = getLocalIp();
      const replacement =
        '$1://localhost$2' + (localIp ? ` and $1://${localIp}$2` : '');
      msg = msg.replace(URL_RX, replacement);
    }
    _log(msg);
  };
  return [];
}

function getLocalIp() {
  for (const records of Object.values(os.networkInterfaces())) {
    for (const record of records) {
      if (!record.internal && record.family === 'IPv4') return record.address;
    }
  }
  return 'localhost';
}
