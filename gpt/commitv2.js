const { LLMSingleActionAgent, AgentActionOutputParser, AgentExecutor } = require("langchain/agents");
const { LLMChain } = require("langchain/chains");
const { OpenAI } = require("langchain/llms/openai");
const { BasePromptTemplate, BaseStringPromptTemplate, SerializedBasePromptTemplate,renderTemplate } = require("langchain/prompts");
const {  InputValues, PartialValues, AgentStep, AgentAction, AgentFinish } = require("langchain/schema");
const { Calculator } = require("langchain/tools/calculator");
const { BufferWindowMemory } = require("langchain/memory");
const GitTools = require("./git-tools");
  const {recursiveAgent} = require('./git-tools')

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







  recursiveAgent("write commit message with a title and body based on staged files git diff, do not commit anything, format the commit message");
