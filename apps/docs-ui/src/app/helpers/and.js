'use strict';

module.exports = (...args) => {
  const numArgs = args.length;
  if (numArgs === 3) return args[0] && args[1];
  if (numArgs < 3)
    throw new Error('{{and}} helper expects at least 2 arguments');
  args.pop();
  return args.every((it) => it);
};
