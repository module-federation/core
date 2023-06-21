class CodeEditPromptTemplate {
  apply({ files, tasks }) {
    return `
      Given the files provided, please perform the following tasks as needed:
      ${tasks.join('\n')}
      The files are as follows:
      ${files
        .map(
          (file) =>
            `__BLOCK_START__\n${file.name}\n__CODE_START__\n${file.content}\n__BLOCK_END__`
        )
        .join('\n\n')}
      Please provide the updated code as the answer to this objective. The response should be a JSON string that contains an array of objects. Each object should have a 'filename' key and a 'code' key with the corresponding values. For example:
      [
        {
          "filename": "file1.js",
          "code": "const updatedCodeForFile1 = 'This is the updated code for file1.js';"
        },
        {
          "filename": "file2.js",
          "code": "const updatedCodeForFile2 = 'This is the updated code for file2.js';"
        }
      ]
      ${response.end}
    `;
  }
}

class TemplateSystem {
  constructor() {
    this.templates = {
      fileProcessingPrompt: new Template(
        ({ filePath, content }) => `File: ${filePath}\nContent:\n${content}`
      ),
      commandPrompt: new Template(
        ({ command, args }) =>
          `Command: ${command}\nArguments: ${args.join(', ')}`
      ),
      codeEditPrompt: new CodeEditPromptTemplate(),
      // Add more templates as needed
    };
  }

  get(templateName, args) {
    if (!this.templates[templateName]) {
      throw new Error(`No template found for ${templateName}`);
    }
    return this.templates[templateName].apply(args);
  }

  add(templateName, templateFunction) {
    this.templates[templateName] = new Template(templateFunction);
  }
}
