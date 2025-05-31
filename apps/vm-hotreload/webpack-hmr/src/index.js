console.log('index.js evaluated');

const fs = require('fs');
const path = require('path');

let entrypoint1 = require('./entrypoint1.js');
let entrypoint2 = require('./entrypoint2.js');

let iteration = 0;
const maxIterations = 3;
let continueDemo = null;

const testMessages1 = [
  'Hello ${name} from ${state.name}! Counter: ${state.counter}',
  '🔥 HOT RELOADED: Hey ${name}! Iteration ${state.counter}',
  '✨ FINAL: Greetings ${name}! Count is ${state.counter}',
];

const entrypoint1Path = path.resolve(__dirname, '../src/entrypoint1.js');
const entrypoint2Path = path.resolve(__dirname, '../src/entrypoint2.js');
const originalEntrypoint1 = fs.readFileSync(entrypoint1Path, 'utf8');
const originalEntrypoint2 = fs.readFileSync(entrypoint2Path, 'utf8');

function safeEditFile(filePath, newContent) {
  const dir = path.dirname(filePath);
  const base = path.basename(filePath);
  const tmpPath = path.join(dir, '.' + base + '.tmp');

  // Write to a temp file first
  fs.writeFileSync(tmpPath, newContent);

  // Rename temp file to target file (atomic replace)
  fs.renameSync(tmpPath, filePath);

  // Optionally, touch the file to update mtime
  const now = new Date();
  fs.utimesSync(filePath, now, now);
}

function modifyGreetMessageEntrypoint1(newMessage) {
  const filePath = path.resolve(__dirname, '../src/entrypoint1.js');
  console.log(`[MODIFY] Writing to: ${filePath}`);
  let fileContent = fs.readFileSync(filePath, 'utf8');
  const greetRegex = /greet: \(name = 'World'\) => `[^`]+`/;
  fileContent = fileContent.replace(
    greetRegex,
    `greet: (name = 'World') => \`${newMessage}\``,
  );
  safeEditFile(filePath, fileContent);
  console.log(`\n📝 Modified entrypoint1 greet message to: "${newMessage}"`);
}

function modifyGreetMessageEntrypoint2(newMessage) {
  const filePath = path.resolve(__dirname, '../src/entrypoint2.js');
  console.log(`[MODIFY] Writing to: ${filePath}`);
  let fileContent = fs.readFileSync(filePath, 'utf8');
  const greetRegex = /greet: \(name = 'Universe'\) => `[^`]+`/;
  fileContent = fileContent.replace(
    greetRegex,
    `greet: (name = 'Universe') => \`${newMessage}\``,
  );
  safeEditFile(filePath, fileContent);
  console.log(`\n📝 Modified entrypoint2 greet message to: "${newMessage}"`);
}

function simulateNaturalEditEntrypoint1() {
  const filePath = path.resolve(__dirname, '../src/entrypoint1.js');
  let fileContent = fs.readFileSync(filePath, 'utf8');
  // Regex to match the return line in the greet function
  const returnRegex =
    /(function greet\(name = 'World'\) \{[^}]*?return )`[^`]+`(;)/s;
  // Pick a message based on the current iteration (cycle if needed)
  const msgIdx = Math.min(iteration, testMessages1.length - 1);
  const newMessage = testMessages1[msgIdx];
  // Replace the template string in the return statement
  fileContent = fileContent.replace(returnRegex, `$1\`${newMessage}\`$2`);
  fs.writeFileSync(filePath, fileContent);
  // Update mtime to now
  const now = new Date();
  fs.utimesSync(filePath, now, now);
  console.log(
    `[SIMULATE] Replaced greet message and updated mtime for: ${filePath}`,
  );
}

function restoreEntrypoints() {
  fs.writeFileSync(entrypoint1Path, originalEntrypoint1);
  fs.utimesSync(entrypoint1Path, new Date(), new Date());
  fs.writeFileSync(entrypoint2Path, originalEntrypoint2);
  fs.utimesSync(entrypoint2Path, new Date(), new Date());
  console.log(
    '[RESTORE] Restored entrypoint1.js and entrypoint2.js to original state.',
  );
}

process.on('SIGINT', () => {
  restoreEntrypoints();
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  restoreEntrypoints();
  process.exit(1);
});
process.on('exit', () => {
  restoreEntrypoints();
});

function runDemo() {
  iteration++;
  console.log(
    `\n🎭 Running Demo (Iteration ${iteration}/${maxIterations})...\n`,
  );

  try {
    console.log('=== Entrypoint 1 Demo ===');
    console.log('Name:', entrypoint1.getName());
    console.log('Counter:', entrypoint1.getCounter());
    console.log('Increment:', entrypoint1.increment());
    console.log('Greet:', entrypoint1.greet('Developer'));
    console.log('Created at:', entrypoint1.getCreatedAt());

    console.log('\n=== Entrypoint 2 Demo ===');
    console.log('Name:', entrypoint2.getName());
    console.log('Counter:', entrypoint2.getCounter());
    console.log('Increment:', entrypoint2.increment());
    console.log('Greet:', entrypoint2.greet('Universe'));
    console.log('Created at:', entrypoint2.getCreatedAt());
  } catch (error) {
    console.error('❌ Demo error:', error);
    restoreEntrypoints();
    process.exit(1);
  }

  if (iteration >= maxIterations) {
    console.log('\n✅ Completed all iterations. Exiting...');
    restoreEntrypoints();
    process.exit(0);
  } else {
    setTimeout(() => {
      simulateNaturalEditEntrypoint1();
      continueDemo = runDemo;
    }, 1500);
  }
}

if (module.hot) {
  console.log('index.js has module.hot');
  // Accept updates for dependencies and re-require them
  module.hot.accept(['./entrypoint1.js', './entrypoint2.js'], () => {
    console.log('HMR accept handler called');
    entrypoint1 = require('./entrypoint1.js');
    entrypoint2 = require('./entrypoint2.js');
    console.log('\n♻️  HMR: Modules reloaded!');
    if (typeof continueDemo === 'function') {
      const fn = continueDemo;
      continueDemo = null;
      fn();
    }
  });
  // If you want to preserve state across HMR updates to this file, use dispose/data:
  // module.hot.dispose(data => { data.iteration = iteration; });
  // if (module.hot.data) { iteration = module.hot.data.iteration || 0; }
}

runDemo();
