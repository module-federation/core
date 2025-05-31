const { fork } = require('child_process');
const path = require('path');

const child = fork(path.join(__dirname, 'index.js'), [], {
  stdio: 'inherit',
  env: { ...process.env, HMR_REPLAY: '1' },
});

setTimeout(() => {
  console.log('[PARENT] Sending replay signal to child...');
  child.send({ type: 'replay' });
}, 2000);
