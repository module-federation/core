module.exports.pre_prompt = ``;
module.exports.chatHistory = new Set();
// module.exports.model = 'gpt-3.5-turbo';
module.exports.model = 'gpt-4';
module.exports.MAX_FILES_LENGTH = 2000 * 3;
module.exports.MAX_TOKENS = Infinity; // 4000 if gpt3
module.exports.showProgress = true;
module.exports.MAX_CHAR_COUNT = 15000;
module.exports.MAIN_BRANCH = 'main';
module.exports.filterStopwords = false;
module.exports.response = {
  end: ['_', 'END', 'OF', 'RESPONSE', '_'].join('_'),
};
// This is the minimum cosine similarity score that a file must have with the search query to be considered relevant
// This is an arbitrary value, and you should vary/ remove this depending on the diversity of your dataset
module.exports.COSINE_SIM_THRESHOLD = 0.72;
