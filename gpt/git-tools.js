// File: imports.js
const { Tool } = require("langchain/tools");
const execSync = require("child_process").execSync;
const z = require('zod');
const { LLMSingleActionAgent, AgentActionOutputParser, AgentExecutor } = require("langchain/agents");
const { LLMChain } = require("langchain/chains");
const { OpenAI, OpenAIChat } = require("langchain/llms/openai");
const { BasePromptTemplate, BaseStringPromptTemplate, SerializedBasePromptTemplate,renderTemplate } = require("langchain/prompts");
const {  InputValues, PartialValues, AgentStep, AgentAction, AgentFinish } = require("langchain/schema");
const { Calculator } = require("langchain/tools/calculator");
const { BufferWindowMemory } = require("langchain/memory");
const path = require('path');
const {GitCommitOutputParser} = require('./outputs/GitCommitOutputParser');
const { formatInstructions, SUFFIX, PREFIX } = require('./git/instructions');
const { GitTool, GitDiffStagedTool, GitStagedFilesTool, GitDiffTool, GitStatusTool, GitCommitTool, GitAddTool, GitNewBranchTool, GitCheckoutBranchTool, GitPullTool, GitPushTool, GitBranchListTool, GitDeleteBranchTool } = require('./git/tools');

// File: GitCommitPromptTemplate.js
class GitCommitPromptTemplate extends BaseStringPromptTemplate {
  constructor(args) {
    super({ inputVariables: args.inputVariables });
    this.tools = args.tools;
  }
  _getPromptType() {
    return 'prompt';
  }
  async processFile(file) {
    const fileName = file.match(/(?<=diff --git a\/).*?(?= b\/)/);
    if(!fileName?.[0]) {
      return '';
    }
    const commitMessage = await recursiveAgent("Write commit message for this codechange \n\n" + file);
    return commitMessage;
  }
  async format(input) {
    const toolStrings = this.tools
      .map((tool) => `${tool.name}: ${tool.description}`)
      .join("\n");
    const toolNames = this.tools.map((tool) => tool.name).join("\n");
    const instructions = formatInstructions(toolNames);
    const template = [PREFIX, toolStrings, instructions, SUFFIX].join("\n\n");
    const intermediateSteps = input.intermediate_steps;
    const lastStep = intermediateSteps[intermediateSteps.length - 1];
    const agentScratchpad = intermediateSteps.reduce(
      (thoughts, { action, observation }) => {
        const newThought = [action.log, `\nObservation: ${observation}`, "Thought:"].join("\n");
        return thoughts.includes(newThought) ? thoughts : thoughts + newThought;
      },
      ""
    );
    const newInput = { agent_scratchpad: agentScratchpad, ...input };
    return Promise.resolve(renderTemplate(template, "f-string", newInput));
  }
  partial(_values) {
    throw new Error("Not implemented");
  }
  serialize() {
    throw new Error("Not implemented");
  }
}
async function recursiveAgent(input) {
  const model = new OpenAIChat({ temperature: 0.5, modelName: 'gpt-4', maxConcurrency: 40 });
  const tools = [
    new Calculator(),
    new GitAddTool({repoPath: process.cwd()}),
    new GitBranchListTool({repoPath: process.cwd()}),
    new GitCheckoutBranchTool({repoPath: process.cwd()}),
    new GitCommitTool({repoPath: process.cwd()}),
    new GitDeleteBranchTool({repoPath: process.cwd()}),
    new GitDiffStagedTool({repoPath: process.cwd()}),
    new GitStagedFilesTool({repoPath: process.cwd()}),
    new GitPullTool({repoPath: process.cwd()}),
  ];
  const llmChain = new LLMChain({
    prompt: new GitCommitPromptTemplate({
      tools,
      inputVariables: ["input", "agent_scratchpad"],
    }),
    llm: model,
  });
  const agent = new LLMSingleActionAgent({
    llmChain,
    outputParser: new GitCommitOutputParser(),
    stop: ["\nObservation"],
  });
  const executor = new AgentExecutor({
    agent,
    tools,
    agentType: "openai-functions",
  });
  const inputText = input;
  const result = await executor.call({ input: inputText });
  console.log(result)
  return result.commitMsg;
}
module.exports = { GitCommitPromptTemplate, recursiveAgent };
