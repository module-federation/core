  const { LLMSingleActionAgent, AgentActionOutputParser, AgentExecutor } = require("langchain/agents");
  const { LLMChain } = require("langchain/chains");
  const { OpenAI } = require("langchain/llms/openai");
  const { BasePromptTemplate, BaseStringPromptTemplate, SerializedBasePromptTemplate,renderTemplate } = require("langchain/prompts");
  const {  InputValues, PartialValues, AgentStep, AgentAction, AgentFinish } = require("langchain/schema");
  const { Calculator } = require("langchain/tools/calculator");
  const { BufferWindowMemory } = require("langchain/memory");
  const recursiveAgent = require('./git-tools')
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
      async processFile(file) {
        console.log(this);
        recursiveAgent("write commit message for this code change:", file)
        // Use the AI agent to generate a commit message for this file
        // This is a placeholder implementation, replace it with your actual implementation
        // const commitMessage = await run(file);
        // return commitMessage;
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
let files
if(lastStep) {
         files = lastStep.observation.split(/(?=diff --git)/);
    const commitMessages = await Promise.all(files.map(file => this.processFile(file)));

    const combinedCommitMessage = commitMessages.join("\n\n");
console.log(combinedCommitMessage)
}
        const agentScratchpad = intermediateSteps.reduce(
          (thoughts, { action, observation }) => {
            const newThought = [action.log, `\nObservation: ${observation}`, "Thought:"].join("\n");
            return thoughts.includes(newThought) ? thoughts : thoughts + newThought;
          },
          ""
        );

        const newInput = { agent_scratchpad: agentScratchpad, ...input };
        // console.log({newInput})


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

  module.exports = GitCommitPromptTemplate
