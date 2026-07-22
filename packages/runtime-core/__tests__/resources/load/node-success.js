module.exports = {
  get() {
    return () => Promise.resolve({ default: 'node remote' });
  },
  init() {},
};
