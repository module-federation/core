econst { Tool } = require("langchain/tools");
const execSync = require("child_process").execSync;
const z = require('zod');
const {GitCommitOutputParser} = require('./outputs/GitCommitOutputParser')
const { LLMSingleActionAgent, AgentActionOutputParser, AgentExecutor } = require("langchain/agents");
const { LLMChain } = require("langchain/chains");
const { OpenAI } = require("langchain/llms/openai");
const { BasePromptTemplate, BaseStringPromptTemplate, SerializedBasePromptTemplate,renderTemplate } = require("langchain/prompts");
const {  InputValues, PartialValues, AgentStep, AgentAction, AgentFinish } = require("langchain/schema");
const { Calculator } = require("langchain/tools/calculator");
const { BufferWindowMemory } = require("langchain/memory");
const GitCommitPromptTemplate = require("./fir-remplates");

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

function getDiff(maxCharCount = 10000) {
    let maxUFlag = 7;
  
    let diff = [
      execSync('git diff --staged --stat').toString(),
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
    const diff = getDiff()
    console.log('running diff')
     const files = diff.split(/(?=diff --git)/);
    //  console.log(files[1])
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
    const model = new OpenAI({ temperature: 0.5, modelName: 'gpt-4', maxTokens: 7000, maxConcurrency: 3 });
    const tools = [
      new Calculator(),
      new GitAddTool({repoPath: process.cwd()}),
      new GitBranchListTool({repoPath: process.cwd()}),
      new GitCheckoutBranchTool({repoPath: process.cwd()}),
      new GitCommitTool({repoPath: process.cwd()}),
      new GitDeleteBranchTool({repoPath: process.cwd()}),
      new GitDiffStagedTool({repoPath: process.cwd()}),
    //   new GitTools.GitDiffTool({repoPath: process.cwd()}),
    //   new GitTools.GitNewBranchTool({repoPath: process.cwd()}),
    //   new GitTools.GitPullTool({repoPath: process.cwd()}),
    //   new GitTools.GitPushTool({repoPath: process.cwd()}),
    //   new GitTools.GitStatusTool({repoPath: process.cwd()}),
    ];


    console.log(GitCommitPromptTemplate)
    

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
    
    console.log(`Executing with input "${inputText}"...`);
    
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

