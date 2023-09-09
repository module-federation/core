


   const { Tool } = require("langchain/tools");
   const execSync = require("child_process").execSync;
   const z = require('zod');
   const path = require('path')

   class GitTool extends Tool {
     constructor(fields) {
       super(fields);
       this.repoPath = fields.repoPath;
     }

     runGitCommand(command) {
       try {
         return execSync(`git -C ${this.repoPath} ${command}`, { encoding: 'utf8' });
       } catch (error) {
         return `${error}`;
       }
     }
   }

   class GitDiffStagedTool extends GitTool {
     static lc_name() {
       return "GitDiffStagedTool";
     }

     constructor(args) {
       super(args);
       this.name = "git_diff_staged";
       this.schema = z.object({
         input: z.string(),
       });
     }

     async _call(args) {
       const message = this.runGitCommand(`diff ${path.resolve(args.input)}`);
       return message
     }

     description = `Get the diff of staged changes.`;
   }

   class GitStagedFilesTool extends GitTool {
     static lc_name() {
       return "GitStagedFilesTool";
     }

     constructor(args) {
       super(args);
       this.name = "git_list_staged_files";
       this.schema = z.object({});
     }

     async _call() {
       return this.runGitCommand('diff --name-only --cached');
     }

     description = `Get the list of staged files.`;
   }

   class GitDiffTool extends GitTool {
     static lc_name() {
       return "GitDiffTool";
     }

     constructor(args) {
       super(args);
       this.name = "git_diff";
       this.schema = z.object({});
     }

     async _call() {
       const message = this.runGitCommand('diff');
       return message;
     }

     description = `Get the diff of all changed files, staged or not.`;
   }

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

   class GitCommitTool extends GitTool {
     static lc_name() {
       return "GitCommitTool";
     }

     constructor(args) {
       super(args);
       this.name = "git_commit";
     }

     async _call(input) {
       const commitMessage = this.runGitCommand(`commit -m "${input}"`);
       return commitMessage;
     }

     get description() {
       return `Can be used to commit the current changes in the git repository. The input is the commit message.`;
     }
   }

   class GitAddTool extends GitTool {
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

     async _call({ files }) {
       return this.runGitCommand(`add ${files}`);
     }

     get description() {
       return `Add files to staging. Use '.' to add all files.`;
     }
   }

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
     GitDeleteBranchTool
   };
   