module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules[\\\\/](?!(@react-native|react-native)/)',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {configFile: './babel.config.js'}],
  },
};
