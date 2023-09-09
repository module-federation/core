
  const formatInstructions = (
    toolNames
  ) => `
    Use the following format in your response, you must respond with a commit title, body. If there is no meaningful change, then you should not commit anything.

    Question: the input question you must answer
    Thought: you should always think about what to do
    Action: the action to take, should be one of [${toolNames}]
    Action Input: the input to the action \n
    Observation: the result of the action
    ... (this Thought/Action/Action Input/Observation can repeat N times)
    Thought: is this relavent to the code being commited?
    Final Answer:
    [commit title] \n
    [commit body]
    `;
  const SUFFIX = `Begin!\n\nQuestion: {input}\nThought:{agent_scratchpad}`;
  const PREFIX = `Rules for conventional commit: ${require('fs').readFileSync(require('path').resolve(__dirname,'../conventional_commit.md'), 'utf8')}`;

  module.exports = {
    formatInstructions,
    SUFFIX,
    PREFIX
  };
  