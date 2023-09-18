const fs = require('fs');
const path = require('path');

function modifyAndWriteImports(filePath, outputDir) {
    let content = fs.readFileSync(filePath, 'utf-8');
  
    // Replace all strings starting with " and containing relative paths
    content = content.replace(/("|')(\.\.\/[^"']+|\.\/[^"']+)("|')/g, (match, p1, p2, p3) => {
      const resolvedPath = path.resolve(path.dirname(filePath), p2).split('node_modules/webpack')[1];
      return `${p1}webpack${resolvedPath}${p3}`;
    });
  
    // Make import paths relative if they are within the same directory
    const currentDir = path.dirname(filePath).split('node_modules/webpack')[1];
    const regex = new RegExp(`"webpack${currentDir.replace(/\//g, '\\/')}/([^"]+)"`, 'g');
    content = content.replace(regex, '"./$1"');
  
    const resolvedPath = path.resolve(filePath).split('node_modules/webpack')[1];
    const outputPath = path.join(outputDir, resolvedPath);
  
    // Create the directory for the file
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  
    // Write the content to the file
    fs.writeFileSync(outputPath, content);
  }
  

function traverseAndWrite(dir, outputDir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      traverseAndWrite(filePath, outputDir);
    } else if (filePath.endsWith('.d.ts')) {
      modifyAndWriteImports(filePath, outputDir);
    }
  }
}

// Find the path to the webpack package in node_modules
const webpackPath = path.dirname(require.resolve('webpack/package.json'));

// Output directory where the modified files will be written
const outputDir = './src';

// Start the traversal and modification
traverseAndWrite(path.join(webpackPath, 'lib/container'), outputDir);
traverseAndWrite(path.join(webpackPath, 'lib/sharing'), outputDir);
traverseAndWrite(path.join(webpackPath, 'declarations/plugins/container'), outputDir);
traverseAndWrite(path.join(webpackPath, 'declarations/plugins/sharing'), outputDir);
