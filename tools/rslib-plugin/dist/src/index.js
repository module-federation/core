Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
const require_executors_build_executor = require('./executors/build/executor.js');
const require_executors_dev_executor = require('./executors/dev/executor.js');
const require_executors_echo_executor = require('./executors/echo/executor.js');

exports.buildExecutor = require_executors_build_executor;
exports.devExecutor = require_executors_dev_executor;
exports.echoExecutor = require_executors_echo_executor;