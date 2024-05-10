const { buildProject } = require('./build-common');

const watch = process.argv.includes('--watch');
buildProject('mfe1', watch);
