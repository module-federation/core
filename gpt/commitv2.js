const { LLMSingleActionAgent, AgentActionOutputParser, AgentExecutor } = require("langchain/agents");
const { LLMChain } = require("langchain/chains");
const { OpenAI } = require("langchain/llms/openai");
const { BasePromptTemplate, BaseStringPromptTemplate, SerializedBasePromptTemplate,renderTemplate } = require("langchain/prompts");
const { InputValues, PartialValues, AgentStep, AgentAction, AgentFinish } = require("langchain/schema");
const { Calculator } = require("langchain/tools/calculator");
const GitTools = require("./git");
  
  const PREFIX = `Rules for conventional commit: ${require('fs').readFileSync('./conventional_commit.md', 'utf8')}`;

  const formatInstructions = (
    toolNames
  ) => `
  Use the following format in your response, you must respond with a commit title, body, and footer. Include detailed changed in each file:
  
  Question: the input question you must answer
  Thought: you should always think about what to do
  Action: the action to take, should be one of [${toolNames}]
  Action Input: the input to the action
  Observation: the result of the action
  ... (this Thought/Action/Action Input/Observation can repeat N times)
  Thought: is this relavent to the code being commited?
  Final Answer: 
  Title: [commit title] \n
  Body: [commit body]
  `;
  const SUFFIX = `Begin!\n\nQuestion: {input}\nThought:{agent_scratchpad}`;
  
  class GitCommitPromptTemplate extends BaseStringPromptTemplate {
    constructor(args) {
      super({ inputVariables: args.inputVariables });
      this.tools = args.tools;
    }
    _getPromptType() {
        return 'prompt'
      }
  
      format(input) {
        /** Construct the final template */
        const toolStrings = this.tools
          .map((tool) => `${tool.name}: ${tool.description}`)
          .join("\n");
        const toolNames = this.tools.map((tool) => tool.name).join("\n");
        const instructions = formatInstructions(toolNames);
        const template = [PREFIX, toolStrings, instructions, SUFFIX].join("\n\n");
        /** Construct the agent_scratchpad */
        const intermediateSteps = input.intermediate_steps;
        console.log(input)
        const agentScratchpad = intermediateSteps.reduce(
          (thoughts, { action, observation }) =>
            thoughts +
            [action.log, `\nObservation: ${observation}`, "Thought:"].join("\n"),
          ""
        );

        console.log(agentScratchpad)
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
  
  class GitCommitOutputParser extends AgentActionOutputParser {
    constructor(args) {
        super(args);
        this.lc_namespace = ["langchain", "agents", "custom_llm_agent_chat"];
    }
    parse(text) {
      return new Promise((resolve, reject) => {
        console.log(text)
        if (text.includes("Final Answer:")) {
          const parts = text.split("Final Answer:");
          const commitMsg = parts[parts.length - 1].trim();
          resolve({ log: text, returnValues: { commitMsg } });
        }
  
        const match = /Action: (.*)\nAction Input: (.*)/s.exec(text);
        
        if (!match) reject(new Error(`Could not parse LLM output: ${text}`));
  
        resolve({
          tool: match[1].trim(),
          toolInput: match[2].trim().replace(/^"+|"+$/g, ""),
          log: text,
        });
      });
    }
    getFormatInstructions() {
        throw new Error("Not implemented");
      }
  }
  
const run = async () => {
    const model = new OpenAI({ temperature: 0.5, modelName: 'gpt-4', maxTokens: 7000, maxConcurrency: 3 });
    const tools = [
      new Calculator(),
      new GitTools.GitAddTool({repoPath: process.cwd()}),
      new GitTools.GitBranchListTool({repoPath: process.cwd()}),
      new GitTools.GitCheckoutBranchTool({repoPath: process.cwd()}),
      new GitTools.GitCommitTool({repoPath: process.cwd()}),
      new GitTools.GitDeleteBranchTool({repoPath: process.cwd()}),
      new GitTools.GitDiffStagedTool({repoPath: process.cwd()}),
    //   new GitTools.GitDiffTool({repoPath: process.cwd()}),
    //   new GitTools.GitNewBranchTool({repoPath: process.cwd()}),
    //   new GitTools.GitPullTool({repoPath: process.cwd()}),
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
    
    const input = "write commit message with a title and body based on staged files git diff, do not commit anything, format the commit message";
    
    console.log(`Executing with input "${input}"...`);
    
    const result = await executor.call({ input });
    
    console.log(`Commit message generated: ${result.commitMsg}`);
  };
  run()