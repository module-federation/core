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
const path = require('path')
const {GitCommitOutputParser} = require('./outputs/GitCommitOutputParser')
const { formatInstructions, SUFFIX, PREFIX } = require('./git/instructions')
const { GitTool, GitDiffStagedTool, GitStagedFilesTool, GitDiffTool, GitStatusTool, GitCommitTool, GitAddTool, GitNewBranchTool, GitCheckoutBranchTool, GitPullTool, GitPushTool, GitBranchListTool, GitDeleteBranchTool } = require('./git/tools');

// File: GitCommitPromptTemplate.js
class GitCommitPromptTemplate extends BaseStringPromptTemplate {
  constructor(args) {
    super({ inputVariables: args.inputVariables });
    this.tools = args.tools;
  }
  _getPromptType() {
    return 'prompt'
  }
  async processFile(file) {
    console.log('process file');
    const fileName = file.match(/(?<=diff --git a\/).*?(?= b\/)/)
    console.log('fileName', fileName?.[0] || file);
    console.log(file.length)

    console.log(file)
  
    if(!fileName?.[0]) {
      console.log('no filename', fileName)
      return ''
    }
    // recursiveAgent("write commit message for this code change:", file)
    // Use the AI agent to generate a commit message for this file
    // This is a placeholder implementation, replace it with your actual implementation
    const commitMessage = await recursiveAgent("Write commit message for this codechange \n\n" + file);

    console.log({commitMessage})
    return commitMessage;
  }
  async format(input) {
    // console.log('DRIVED',input)
    /** Construct the final template */
    const toolStrings = this.tools
      .map((tool) => `${tool.name}: ${tool.description}`)
      .join("\n");
    const toolNames = this.tools.map((tool) => tool.name).join("\n");
    const instructions = formatInstructions(toolNames);
    const template = [PREFIX, toolStrings, instructions, SUFFIX].join("\n\n");
    /** Construct the agent_scratchpad */
    const intermediateSteps = input.intermediate_steps;
    // console.log('intermediateSteps',intermediateSteps[0])
    // const files = lastStep.observation.split(/(?=diff --git)/);
    const lastStep = intermediateSteps[intermediateSteps.length - 1];

    // console.log(input)
    let files
    // if(lastStep) {
    //   files = lastStep.observation.split(/(?<=\n)diff --git a\//);
    //   files = await Promise.all(files.map(file => this.processFile(file)));
    // }

    
    const agentScratchpad = intermediateSteps.reduce(
      (thoughts, { action, observation }) => {
        const newThought = [action.log, `\nObservation: ${observation}`, "Thought:"].join("\n");
        return thoughts.includes(newThought) ? thoughts : thoughts + newThought;
      },
      ""
    );


    const newInput = { agent_scratchpad: agentScratchpad, ...input };


    /** Format the template. */
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
    // new GitTools.GitDiffTool({repoPath: process.cwd()}),
  //   new GitTools.GitNewBranchTool({repoPath: process.cwd()}),
    new GitPullTool({repoPath: process.cwd()}),
  //   new GitTools.GitPushTool({repoPath: process.cwd()}),
  //   new GitTools.GitStatusTool({repoPath: process.cwd()}),
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


  console.log("Loaded agent.");

  const inputText = input

  console.log(`Executing with input`);

  const result = await executor.call({ input: inputText });


  console.log(`Commit message generated: ${result.commitMsg}`);
  return result.commitMsg
};


module.exports = { GitCommitPromptTemplate, recursiveAgent };
