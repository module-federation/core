const marked = require('marked');
const TerminalRenderer = require('marked-terminal');
const chalk = require('chalk');

// Configure marked to use `marked-terminal` as the renderer
marked.setOptions({
  // Define custom renderer
  mangle: false,
  headerIds: false,
  renderer: new TerminalRenderer({
    firstHeading: chalk.magenta.underline.bold,
    heading: chalk.green.underline,
  }),
});

module.exports = marked.parse;
