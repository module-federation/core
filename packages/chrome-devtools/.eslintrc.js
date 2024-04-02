module.exports = {
  root: true,
  extends: ['@modern-js'],
  env: {
    webextensions: true,
  },
  parserOptions: {
    project: true,
  },
  rules: {
    '@typescript-eslint/no-parameter-properties': 'off',
  },
};
