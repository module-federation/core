const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { generateUnitTest } = require('./generateUnitTest');

const argv = yargs(hideBin(process.argv)).argv;

async function main() {
  const code = argv.code;
  const description = argv.description;

  if (!code || !description) {
    console.error(
      'Missing arguments. Please provide both code and description.'
    );
    return;
  }

  const unitTest = await generateUnitTest(code, description);
  console.log('Generated unit test:', unitTest);
}

main().catch(console.error);
