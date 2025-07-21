const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');

const entrypoint1 = require('./entrypoint1');
const entrypoint2 = require('./entrypoint2');

const entrypointPaths = [
  path.resolve(__dirname, 'entrypoint1.js'),
  path.resolve(__dirname, 'entrypoint2.js'),
];

const watcher = chokidar.watch(entrypointPaths, {
  persistent: true,
  ignoreInitial: true,
});

function hotReload() {
  entrypoint1.destroyVM();
  entrypoint2.destroyVM();
}

watcher.on('change', (filePath) => {
  console.log(`📁 File changed: ${path.basename(filePath)}`);
  hotReload();
  if (typeof continueDemo === 'function') continueDemo();
});

let iteration = 0;
const maxIterations = 3;
let continueDemo = null;

function modifyGreetMessageEntrypoint1(newMessage) {
  const filePath = path.resolve(__dirname, 'entrypoint1.js');
  let fileContent = fs.readFileSync(filePath, 'utf8');
  const greetRegex = /greet: \(name = 'World'\) => `[^`]+`/;
  fileContent = fileContent.replace(
    greetRegex,
    `greet: (name = 'World') => \`${newMessage}\``,
  );
  fs.writeFileSync(filePath, fileContent);
  console.log(`\n📝 Modified entrypoint1 greet message to: "${newMessage}"`);
}

function modifyGreetMessageEntrypoint2(newMessage) {
  const filePath = path.resolve(__dirname, 'entrypoint2.js');
  let fileContent = fs.readFileSync(filePath, 'utf8');
  const greetRegex = /greet: \(name = 'Universe'\) => `[^`]+`/;
  fileContent = fileContent.replace(
    greetRegex,
    `greet: (name = 'Universe') => \`${newMessage}\``,
  );
  fs.writeFileSync(filePath, fileContent);
  console.log(`\n📝 Modified entrypoint2 greet message to: "${newMessage}"`);
}

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
  }

  if (iteration >= maxIterations) {
    console.log('\n✅ Completed all iterations. Exiting...');
    watcher.close();
    process.exit(0);
  } else {
    const messages1 = [
      'Hello ${name} from ${state.name}! Counter: ${state.counter}',
      '🔥 HOT RELOADED: Hey ${name}! Iteration ${state.counter}',
      '✨ FINAL: Greetings ${name}! Count is ${state.counter}',
    ];
    const messages2 = [
      'Greetings ${name} from ${state.name}! Counter: ${state.counter}',
      'Welcome ${name} to ${state.name}!',
      '🌟 Universe says hi to ${name}! Counter: ${state.counter}',
    ];
    setTimeout(() => {
      modifyGreetMessageEntrypoint1(messages1[iteration]);
      modifyGreetMessageEntrypoint2(messages2[iteration]);
      continueDemo = runDemo;
    }, 1500);
  }
}

runDemo();

console.log(
  '\n💡 The greet message will be automatically modified between iterations!',
);
console.log('💡 Watch how hot reload picks up the changes without restarting!');
