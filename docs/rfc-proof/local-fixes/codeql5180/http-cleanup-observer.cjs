const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const dirs = [];
const servers = [];
const makeTemp = fs.mkdtempSync;
fs.mkdtempSync = function (...args) {
  const dir = makeTemp.apply(this, args);
  if (path.basename(dir).startsWith('mf-shared-platform-')) dirs.push(dir);
  return dir;
};
const createServer = http.createServer;
http.createServer = function (...args) {
  const server = createServer.apply(this, args);
  const record = { address: null, closed: false };
  servers.push(record);
  server.on('listening', () => { record.address = server.address(); });
  server.on('close', () => { record.closed = true; });
  return server;
};
process.on('exit', (code) => {
  const remaining = dirs.filter((dir) => fs.existsSync(dir));
  if (code === 0) {
    assert.equal(dirs.length, 1);
    assert.equal(remaining.length, 0);
    assert.equal(servers.length, 1);
    assert.equal(servers[0].closed, true);
    assert.equal(servers[0].address.address, '127.0.0.1');
  }
  console.log(JSON.stringify({ cleanupObserver: true, fixtureExitCode: code,
    temporaryDirectoriesCreated: dirs.length, temporaryDirectoriesRemaining: remaining.length,
    servers, }, null, 2));
});
