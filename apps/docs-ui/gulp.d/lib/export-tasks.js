'use strict';

module.exports = (...tasks) => {
  const seed = {};
  if (tasks.length) {
    if (tasks.lastIndexOf(tasks[0]) > 0) {
      const task1 = tasks.shift();
      seed.default = Object.assign(task1.bind(null), {
        description: `=> ${task1.displayName}`,
        displayName: 'default',
      });
    }
    return tasks.reduce(
      (acc, it) => (acc[it.displayName || it.name] = it) && acc,
      seed
    );
  } else {
    return seed;
  }
};
