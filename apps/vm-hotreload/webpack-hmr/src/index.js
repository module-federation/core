const fs = require('fs');
const path = require('path');

let entrypoint1 = require('./entrypoint1');
let entrypoint2 = require('./entrypoint2');

let iteration = 0;
const maxIterations = 3;

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
      // Wait for HMR to reload modules, then rerun demo
      setTimeout(runDemo, 2000);
    }, 1500);
  }
}

if (module.hot) {
  module.hot.accept(['./entrypoint1', './entrypoint2'], () => {
    entrypoint1 = require('./entrypoint1');
    entrypoint2 = require('./entrypoint2');
    console.log('\n♻️  HMR: Modules reloaded!');
  });
}

console.log('🎪 Webpack HMR Hot Reload Demo Starting...');
runDemo();

console.log(
  '\n💡 The greet message will be automatically modified between iterations!',
);
console.log('💡 Watch how HMR picks up the changes without restarting!');
