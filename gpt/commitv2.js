const { LLMSingleActionAgent, AgentActionOutputParser, AgentExecutor } = require("langchain/agents");
const { LLMChain } = require("langchain/chains");
const { OpenAI } = require("langchain/llms/openai");
const { BasePromptTemplate, BaseStringPromptTemplate, SerializedBasePromptTemplate,renderTemplate } = require("langchain/prompts");
const {  InputValues, PartialValues, AgentStep, AgentAction, AgentFinish } = require("langchain/schema");
const { Calculator } = require("langchain/tools/calculator");
const { BufferWindowMemory } = require("langchain/memory");
const GitTools = require("./git-tools");
  const {recursiveAgent} = require('./git-tools')






  recursiveAgent("write commit message with a title and body based on staged files git diff, do not commit anything, format the commit message");
