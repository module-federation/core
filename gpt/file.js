const fs = require('fs');
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function uploadFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const file = await openai.createFile(fileContent, 'fine-tuning', {});
  console.log('f', file);

  return file.data.id;
}

async function getFileStatus(fileId) {
  const file = await openai.getFile(fileId);
  return file.data.status;
}

async function useFileInCompletion(fileId) {
  const completion = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: 'Translate the following English text to French: "{documents}"',
    max_tokens: 60,
    documents: [fileId],
  });

  return completion.data.choices[0].text;
}

async function main() {
  const filePath = './OpenAIStream.js'; // Replace with your file path
  const fileId = await uploadFile(filePath);
  console.log(`Uploaded file with ID: ${fileId}`);

  let status = await getFileStatus(fileId);
  while (status !== 'processed') {
    console.log(
      `File status: ${status}, waiting for processing to complete...`
    );
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
    status = await getFileStatus(fileId);
  }
  console.log(`File status: ${status}`);

  const completion = await useFileInCompletion(fileId);
  console.log(`Completion: ${completion}`);
}

main().catch(console.error);
