// FileProcessor.test.js
const fs = require('fs');
const FileProcessor = require('./FileProcessor');

describe('FileProcessor', () => {
  let fileProcessor;

  beforeEach(() => {
    fileProcessor = new FileProcessor();
  });

  test('processFiles with OpenAI API', async () => {
    const filePaths = ['./example.js']; // replace with your actual file paths
    await fileProcessor.processFiles(filePaths);

    filePaths.forEach((filePath) => {
      const suggestedFilePath = `${filePath}_suggested.js`;
      expect(fs.existsSync(suggestedFilePath)).toBe(true);

      const suggestedContent = fs.readFileSync(suggestedFilePath, 'utf-8');
      // Check if the suggested content is in the correct JSON format
      let parsedContent;
      try {
        parsedContent = JSON.parse(suggestedContent);
      } catch (error) {
        throw new Error(`Suggested content for ${filePath} is not valid JSON`);
      }

      // Check if the parsed content has the correct structure
      expect(parsedContent).toHaveProperty('filename');
      expect(parsedContent).toHaveProperty('code');
    });
  });
});
