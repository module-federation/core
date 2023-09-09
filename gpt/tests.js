const fs = require('fs').promises;
const { Tool, Toolkit, Agent, OpenAI, initializeAgentExecutorWithOptions } = require('langchain');
const { exec } = require('child_process');

class FileSystemTool extends Tool {
  constructor() {
    super();
    this.name = 'FileSystemTool';
    this.description = 'A tool for reading and writing files.';
  }

  async call(arg) {
    const { operation, path, data } = JSON.parse(arg);

    if (operation === 'read') {
      return await fs.readFile(path, 'utf8');
    } else if (operation === 'write') {
      await fs.writeFile(path, data, 'utf8');
      return 'File written successfully';
    } else {
      throw new Error('Invalid operation. Must be "read" or "write".');
    }
  }
}

class FileSystemToolkit extends Toolkit {
  constructor() {
    super();
    this.tools = [new FileSystemTool()];
  }
}

class UnitTestAgent extends Agent {
  constructor(args) {
    super(args);
    this.llm = new OpenAI({ temperature: 0 });
    this.toolkit = new FileSystemToolkit();
  }

  async call({ code, description }) {
    let unitTest = await this.generateUnitTest(code, description);
    let testResult = await this.runUnitTest(unitTest);

    while (!testResult.passed) {
      unitTest = await this.generateUnitTest(code, description);
      testResult = await this.runUnitTest(unitTest);
    }

    return { unitTest, testResult };
  }

  async generateUnitTest(code, description) {
    const prompt = `Given the following code:\n${code}\nWrite a unit test for it. The test should ${description}.`;
    const response = await this.llm.createCompletion({
      model: "text-davinci-002",
      prompt: prompt,
      max_tokens: 200,
    });
    return response.data.choices[0].text.trim();
  }

  async runUnitTest(unitTest) {
    return new Promise((resolve, reject) => {
      exec(`npm test -- ${unitTest}`, (error, stdout, stderr) => {
        if (error) {
          resolve({ passed: false, output: error.message });
        } else if (stderr) {
          resolve({ passed: false, output: stderr });
        } else {
          resolve({ passed: true, output: stdout });
        }
      });
    });
  }
}

const executor = initializeAgentExecutorWithOptions([new UnitTestAgent()], {
  agentType: "zero-shot-react-description",
});

executor.call({ code: "function add(a, b) { return a + b; }", description: "ensure that the add function correctly adds two numbers" })
  .then(console.log)
  .catch(console.error);



  const { ChatOpenAI } = require('langchain/chat_models/openai');
const { initializeAgentExecutorWithOptions } = require('langchain/agents');
const { execSync } = require('child_process');
const { commandJoin } = require('command-join');
const { Calculator } = require("langchain/tools/calculator");
const {PlanAndExecuteAgentExecutor} = require("langchain/experimental/plan_and_execute");

const GitTools = require("./git")
const model = new ChatOpenAI({ modelName:"gpt-4",temperature: 0, verbose: true });
const tools = [
    new Calculator(),
    new GitTools.GitDiffTool({repoPath: process.cwd()}),
    new GitTools.GitDiffStagedTool({repoPath: process.cwd()}),
    new GitTools.GitStatusTool({repoPath: process.cwd()}),
    new GitTools.GitCommitTool({repoPath: process.cwd()}),
    new GitTools.GitAddTool({repoPath: process.cwd()}),
    new GitTools.GitNewBranchTool({repoPath: process.cwd()}),
    new GitTools.GitCheckoutBranchTool({repoPath: process.cwd()}),
    new GitTools.GitPullTool({repoPath: process.cwd()}),
    new GitTools.GitPushTool({repoPath: process.cwd()}),
    new GitTools.GitBranchListTool({repoPath: process.cwd()}),
    new GitTools.GitDeleteBranchTool({repoPath: process.cwd()}),
];

function getDiff(maxCharCount = 10000) {
  let maxUFlag = 7;
  let diff = [
    execSync('git diff --staged --stat').toString(),
    execSync(`git diff -U${maxUFlag} --staged`).toString(),
  ].join('\n');

  console.log('Initial diff generated with -U flag:', maxUFlag);

  while (diff.length > maxCharCount && maxUFlag > 2) {
    maxUFlag--;
    diff = [
      execSync('git diff --staged --stat').toString(),
      execSync(`git diff -U${maxUFlag} --staged`).toString(),
    ].join('\n');
    console.warn(
      'over max char count, reducing diff fidelity',
      'from:',
      diff.length,
      'to:',
      diff.length,
      `(-U flag now ${maxUFlag})`
    );
  }

  console.log('Final diff generated with -U flag:', maxUFlag);

  return diff;
}

(async () => {
    const executor = PlanAndExecuteAgentExecutor.fromLLMAndTools({
        llm: model,
        tools,
        verbose: true,
      });
    // const executor = await initializeAgentExecutorWithOptions(tools, model, {
    //   agentType: "openai-functions",
    //   agentArgs: {
    //     prefix: "You are a helpful AI assistant. Generate a commit message for the staged files.",
    //     verbose: true,
    //   },
    // });
  ;

    const commitMsg = await executor.call({ input:"write commit message based of staged files git diff, do not commit anything, then format the commit message" });
    console.log('Commit message generated:', commitMsg);
})();

