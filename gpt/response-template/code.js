const { chatHistory } = require('../constants');
const responseTemplate = `
The response should follow this template:
\n
__BLOCK_START__
[filename 1]
__CODE_START__
[code changes for file 1]
__BLOCK_END__
__BLOCK_START__
[filename 2]
__CODE_START__
[code changes for file 2]
__BLOCK_END__\n
__BLOCK_FINISH__
\n
${response.end}`;

module.exports = responseTemplate;
