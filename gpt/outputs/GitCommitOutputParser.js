const { AgentActionOutputParser } = require("langchain/agents");
class GitCommitOutputParser extends AgentActionOutputParser {
    constructor(args) {
        super(args);
        this.lc_namespace = ["langchain", "agents", "custom_llm_agent_chat"];
    }
    parse(text) {
      return new Promise((resolve, reject) => {
        if (text.includes("Final Answer:")) {
          const parts = text.split("Final Answer:");
          const commitMsg = parts[parts.length - 1].trim();
          resolve({ log: text, returnValues: { commitMsg } });
        }
  
        const match = /Action: (.*)\nAction Input:z (.*)/s.exec(text);
        
        if (!match) reject(new Error(`Could not parse LLM output: ${text}`));
  console.log(text, 'text response')
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

  module.exports = {
    GitCommitOutputParser
  }