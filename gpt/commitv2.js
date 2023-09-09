const { LLMSingleActionAgent, AgentActionOutputParser, AgentExecutor } = require("langchain/agents");
const { LLMChain } = require("langchain/chains");
const { OpenAI } = require("langchain/llms/openai");
const { BasePromptTemplate, BaseStringPromptTemplate, SerializedBasePromptTemplate,renderTemplate } = require("langchain/prompts");
const {  InputValues, PartialValues, AgentStep, AgentAction, AgentFinish } = require("langchain/schema");
const { Calculator } = require("langchain/tools/calculator");
const { BufferWindowMemory } = require("langchain/memory");
  const {recursiveAgent} = require('./git-tools')






//   recursiveAgent("Summarize each staged file, do this one at a time. After reviewing all the files, write a conventional commit message");
  recursiveAgent("List the files that have been staged for commit, then pass the files one by one as an input to git_diff_staged");
