const fs = require('fs');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const NodeHtmlMarkdown = require('node-html-markdown');
const mime = require('mime-types');
const path = require('path');

module.exports = async function extractTextFromFile({ filepath, filetype }) {
  const buffer = await new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(filepath);
    const chunks = [];
    fileStream.on('data', (chunk) => {
      chunks.push(chunk);
    });
    fileStream.on('error', (error) => {
      reject(error);
    });
    fileStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
  });

  const mimeType = mime.lookup(filetype);
  // Handle different file types using different modules
  switch (mimeType) {
    case 'application/pdf':
      const pdfData = await pdfParse(buffer);
      return pdfData.text;
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': // i.e. docx file
      const docxResult = await mammoth.extractRawText({ path: filepath });
      return docxResult.value;
    case 'text/markdown':
    case 'text/csv':
    case 'text/html':
      const html = buffer.toString();
      return NodeHtmlMarkdown.translate(html);
    case 'text/plain':
      return buffer.toString();
    case 'application/javascript':
      return buffer.toString();
    default:
      return buffer.toString();
  }
};
