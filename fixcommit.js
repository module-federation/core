const util = require('util');
const exec = util.promisify(require('child_process').exec);

const numCommitsToEdit = 9; // Change this to the number of commit messages you want to edit.

async function fixCommitMessages() {
  try {
    // Get the last 'numCommitsToEdit' commit hashes.
    const { stdout: log } = await exec(
      `git log -n ${numCommitsToEdit} --pretty=format:"%H"`
    );
    const commits = log.split('\n');

    for (const commit of commits) {
      // Get the commit message for each commit.
      const { stdout: message } = await exec(
        `git show -s --format=%B ${commit}`
      );

      // Modify the message as needed.
      const fixedMessage = fixMessage(message);
      try {
        await exec(`git rebase --skip`);
      } catch (error) {}
      // Amend the commit with the new message.
      await exec(
        `git commit --amend -m "${fixedMessage.replace(/"/g, '\\"')}"`
      );
      await exec(
        `GIT_SEQUENCE_EDITOR="sed -i '' '1s/pick/edit/'" git rebase -i ${commit}~1`
      );
    }
    await exec(`git rebase --continue`);
  } catch (error) {
    console.error(`Failed to fix commit messages: ${error}`);
  }
}

function fixMessage(message) {
  // Implement your message fixing logic here.
  // For example, if your messages contain '\n', replace them with real line breaks:
  return message.replace(/\\n/g, '\n');
}

fixCommitMessages();
