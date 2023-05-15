module.exports.pre_prompt = ``;
module.exports.chatHistory = new Set();
// module.exports.model = 'gpt-3.5-turbo';
module.exports.model = 'gpt-4';
module.exports.MAX_FILES_LENGTH = 2000 * 3;
module.exports.MAX_TOKENS = Infinity; // 4000 if gpt3
module.exports.showProgress = true;
module.exports.MAX_CHAR_COUNT = 10000;
module.exports.MAIN_BRANCH = 'quantum_modules';
module.exports.filterStopwords = false;
module.exports.response = {
  end: ['_', 'END', 'OF', 'RESPONSE', '_'].join('_'),
};
