const { Tool } = require("langchain/tools");
const execSync = require("child_process").execSync;
const z = require('zod');
const {GitCommitOutputParser} = require('./outputs/GitCommitOutputParser')
const { LLMSingleActionAgent, AgentActionOutputParser, AgentExecutor } = require("langchain/agents");
const { LLMChain } = require("langchain/chains");
const { OpenAI, OpenAIChat } = require("langchain/llms/openai");
const { BasePromptTemplate, BaseStringPromptTemplate, SerializedBasePromptTemplate,renderTemplate } = require("langchain/prompts");
const {  InputValues, PartialValues, AgentStep, AgentAction, AgentFinish } = require("langchain/schema");
const { Calculator } = require("langchain/tools/calculator");
const { BufferWindowMemory } = require("langchain/memory");
const path = require('path')

const formatInstructions = (
  toolNames
) => `
  Use the following format in your response, you must respond with a commit title, body. If there is no meaningful change, then you should not commit anything.

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
const PREFIX = `Rules for conventional commit: ${require('fs').readFileSync(path.resolve(__dirname,'./conventional_commit.md'), 'utf8')}`;



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
    if(lastStep) {
      files = lastStep.observation.split(/(?<=\n)diff --git a\//);
      files = await Promise.all(files.map(file => this.processFile(file)));
    }
    
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

/**
 * @class
 * @extends {Tool}
 * @description GitTool class for running git commands
 */
class GitTool extends Tool {
  constructor(fields) {
    super(fields);
    this.repoPath = fields.repoPath;
  }

  /**
   * @method
   * @description Runs a git command
   * @param {string} command - The git command to run
   * @returns {string} The result of the git command
   */
  runGitCommand(command) {
    try {
      return execSync(`git -C ${this.repoPath} ${command}`, { encoding: 'utf8' });
    } catch (error) {
      return `${error}`;
    }
  }
}

function getDiff(maxCharCount = 12000) {
    let maxUFlag = 7;
    let diff = [
      // execSync('git diff --staged --stat').toString(),
      execSync(`git diff -U${maxUFlag} --staged`).toString(),
    ].join('\n');
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

    if (diff.length < 5) {
        return undefined;
    }
    return diff;
  }

// Get the diff of staged files
/**
 * @class
 * @extends {GitTool}
 * @description GitDiffStagedTool class for getting the diff of staged files
 */
class GitDiffStagedTool extends GitTool {
  /**
   * @method
   * @description Returns the name of the tool
   * @returns {string} The name of the tool
   */
  static lc_name() {
    return "GitDiffStagedTool";
  }

  constructor(args) {
    super(args);
    this.name = "git_diff_staged";
    this.schema = z.object({});
  }

  /**
   * @method
   * @description Returns the diff of staged changes
   * @returns {string} The diff of staged changes
   */
  async _call() {
    console.log('staged diff')
    // const message = this.runGitCommand('diff --cached');
    const diff = getDiff();
    if (diff === undefined) {
      console.log('No meaningful changes in git diff. Aborting agent.');
      const abortController = new AbortController();
      abortController.abort(); // trigger the abort signal
      return;
    }
    console.log('running diff')
    return diff
  }

  description = `Get the diff of staged changes.`;
}

// Get the list of staged files
/**
 * @class
 * @extends {GitTool}
 * @description GitStagedFilesTool class for getting the list of staged files
 */
class GitStagedFilesTool extends GitTool {
  /**
   * @method
   * @description Returns the name of the tool
   * @returns {string} The name of the tool
   */
  static lc_name() {
    return "GitStagedFilesTool";
  }

  constructor(args) {
    super(args);
    this.name = "git_list_staged_files";
    this.schema = z.object({});
  }

  /**
   * @method
   * @description Returns the list of staged files
   * @returns {string} The list of staged files
   */
  async _call() {
    return this.runGitCommand('diff --name-only --cached');
  }

  description = `Get the list of staged files.`;
}

// Get the diff of all changed files
/**
 * @class
 * @extends {GitTool}
 * @description GitDiffTool class for getting the diff of all changed files
 */
class GitDiffTool extends GitTool {
  /**
   * @method
   * @description Returns the name of the tool
   * @returns {string} The name of the tool
   */
  static lc_name() {
    return "GitDiffTool";
  }

  constructor(args) {
    super(args);
    this.name = "git_diff";
    this.schema = z.object({});
  }

  schema = z.object({});

  async _call() {
    const message = this.runGitCommand('diff');

    return message;
  }

  description = `Get the diff of all changed files, staged or not.`;
}

// Get the status of the repository
class GitStatusTool extends GitTool {
  static lc_name() {
    return "GitStatusTool";
  }

  name = "git_status";

  schema = z.object({});

  async _call() {
    return this.runGitCommand('status');
  }

  description = `Get the status of the repository.`;
}

// Commit changes with a given message


/**
 * @class
 * @extends {GitTool}
 * @description GitCommitTool class for committing changes with a given message
 */
class GitCommitTool extends GitTool {
  /**
   * @method
   * @description Returns the name of the tool
   * @returns {string} The name of the tool
   */
  static lc_name() {
    return "GitCommitTool";
  }

  constructor(args) {
    super(args);
    this.name = "git_commit";
  }

  /**
   * @method
   * @description Commits changes with a given message
   * @param {string} input - The commit message
   * @returns {Object} The parsed commit message
   */
  async _call(input) {
    const commitMessage = this.runGitCommand(`commit -m "${input}"`);
    // Parse the commit message using the output parser
    return commitMessage;
  }

  /**
   * @description The description of the tool
   * @type {string}
   */
  get description() {
    return `Can be used to commit the current changes in the git repository. The input is the commit message.`;
  }
}

// Add files to staging
class GitAddTool extends GitTool {
  /**
   * @method
   * @description Returns the name of the tool
   * @returns {string} The name of the tool
   */
  static lc_name() {
    return "GitAddTool";
  }

  constructor(args) {
    super(args);
    this.name = "git_add";
    this.schema = z.object({
      files: z.string(),
    });
  }

  /**
   * @method
   * @description Adds files to staging
   * @param {Object} files - The files to add
   * @returns {string} The result of the git command
   */
  async _call({ files }) {
    return this.runGitCommand(`add ${files}`);
  }

  /**
   * @description The description of the tool
   * @type {string}
   */
  get description() {
    return `Add files to staging. Use '.' to add all files.`;
  }
}

// Create a new branch
class GitNewBranchTool extends GitTool {
  static lc_name() {
    return "GitNewBranchTool";
  }

  name = "git_new_branch";

  schema = z.object({
    branchName: z.string(),
  });

  async _call({ branchName }) {
    return this.runGitCommand(`checkout -b ${branchName}`);
  }

  description = `Create a new branch.`;
}

// Switch to an existing branch
class GitCheckoutBranchTool extends GitTool {
  static lc_name() {
    return "GitCheckoutBranchTool";
  }

  name = "git_checkout_branch";

  schema = z.object({
    branchName: z.string(),
  });

  async _call({ branchName }) {
    return this.runGitCommand(`checkout ${branchName}`);
  }

  description = `Switch to an existing branch.`;
}

// Pull latest changes from remote
class GitPullTool extends GitTool {
  static lc_name() {
    return "GitPullTool";
  }

  name = "git_pull";

  schema = z.object({});

  async _call() {
    return this.runGitCommand('pull');
  }

  description = `Pull latest changes from remote.`;
}

// Push changes to remote
class GitPushTool extends GitTool {
  static lc_name() {
    return "GitPushTool";
  }

  name = "git_push";

  schema = z.object({});

  async _call() {
    return this.runGitCommand('push');
  }

  description = `Push local commits to remote.`;
}

// List all branches
class GitBranchListTool extends GitTool {
  static lc_name() {
    return "GitBranchListTool";
  }

  name = "git_branch_list";

  schema = z.object({});

  async _call() {
    return this.runGitCommand('branch');
  }

  description = `List all local branches.`;
}

// Delete a local branch
class GitDeleteBranchTool extends GitTool {
  static lc_name() {
    return "GitDeleteBranchTool";
  }

  name = "git_delete_branch";

  schema = z.object({
    branchName: z.string(),
  });

  async _call({ branchName }) {
    return this.runGitCommand(`branch -d ${branchName}`);
  }

  description = `Delete a local branch.`;
}

async function recursiveAgent(input) {
    const model = new OpenAIChat({ temperature: 0.5, modelName: 'gpt-4', maxConcurrency: 40 });
    const tools = [
      new Calculator(),
      new GitAddTool({repoPath: process.cwd()}),
      new GitBranchListTool({repoPath: process.cwd()}),
      new GitCheckoutBranchTool({repoPath: process.cwd()}),
      // new GitCommitTool({repoPath: process.cwd()}),
      new GitDeleteBranchTool({repoPath: process.cwd()}),
      new GitDiffStagedTool({repoPath: process.cwd()}),
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

    const inputText = input

    console.log(`Executing with input`);

    const result = await executor.call({ input: inputText });


    console.log(`Commit message generated: ${result.commitMsg}`);
    return result.commitMsg
  };

module.exports = {
  GitTool,
  GitDiffStagedTool,
  GitStagedFilesTool,
  GitDiffTool,
  GitStatusTool,
  GitCommitTool,
  GitAddTool,
  GitNewBranchTool,
  GitCheckoutBranchTool,
  GitPullTool,
  GitPushTool,
  GitBranchListTool,
  GitDeleteBranchTool,
  recursiveAgent
};

