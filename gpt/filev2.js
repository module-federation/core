const readline = require('readline');
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { openai, completion } = require('./openai'); // Assuming openai.js is in the same directory
const {
  TemplateSystem,
  CodeEditPromptTemplate,
  CodeEditAnswerTemplate,
} = require('./response-template/template-factory');

class FileProcessor {
  constructor() {
    this.chatHistory = [];
    this.ignoredDirectories = ['node_modules', '.next', 'dist'];
    this.directoryTree = {};
    this.templateSystem = new TemplateSystem();
    this.templateSystem.add('codeEditPrompt', new CodeEditPromptTemplate());
    this.templateSystem.add('codeEditAnswer', new CodeEditAnswerTemplate());
  }

  buildDirectoryTree(directoryPath, currentDirectory) {
    const files = fs.readdirSync(directoryPath);
    for (const file of files) {
      const fullPath = path.join(directoryPath, file);
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory() && !this.ignoredDirectories.includes(file)) {
        currentDirectory[file] = {};
        this.buildDirectoryTree(fullPath, currentDirectory[file]);
      } else if (stats.isFile()) {
        currentDirectory[file] = null;
      }
    }
  }
  async processFiles(filePaths) {
    for (const filePath of filePaths) {
      const response = await this.processFile(filePath);
      console.log(`Generated code for ${filePath}:\n${response}`);
      if (response.toLowerCase() === 'yes') {
        fs.writeFileSync(`${filePath}_suggested.js`, response);
      }
    }
  }
  async processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const prompt = this.templateSystem.get('codeEditPrompt', {
      files: [{ name: filePath, content }],
      tasks: ['Edit the code'],
    });
    let result = await completion({ prompt, max_tokens: 1000 });
    const parsedResult = JSON.parse(result);
    const formattedResult = this.templateSystem.get('codeEditAnswer', {
      files: parsedResult,
    });
    fs.writeFileSync(filePath + '.suggested.js', formattedResult);
  }

  isTruncated(response) {
    // Define your own criteria for a truncated response
    // This is just an example and may not work for all cases
    const openBrackets = (response.match(/{/g) || []).length;
    const closeBrackets = (response.match(/}/g) || []).length;
    return openBrackets !== closeBrackets;
  }

  async interactWithUser() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('Which file(s) do you want to process? ', async (input) => {
      // Split the input by commas to handle a comma-separated list of paths
      const paths = input.split(',');
      for (const path of paths) {
        // Use glob to handle glob patterns
        glob(path.trim(), async (err, files) => {
          if (err) {
            console.error(err);
            return;
          }
          for (const file of files) {
            const response = await this.processFile(file);
            console.log(`Generated code for ${file}:\n${response}`);
            rl.question('Do you accept these changes? (yes/no) ', (answer) => {
              if (answer.toLowerCase() === 'yes') {
                fs.writeFileSync(`${file}_suggested.js`, response);
              }
              rl.close();
            });
          }
        });
      }
    });
  }
}

module.exports = FileProcessor;
