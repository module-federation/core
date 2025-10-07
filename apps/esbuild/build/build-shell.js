const { buildProject } = require('./build-common');

const watch = process.argv.includes('--watch');
buildProject('shell', watch);
