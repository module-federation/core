'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.reactReplacements = void 0;
exports.reactReplacements = {
  dev: {
    'node_modules/react/index.js': {
      file: 'node_modules/react/cjs/react.development.js',
    },
    'node_modules/react/jsx-dev-runtime.js': {
      file: 'node_modules/react/cjs/react-jsx-dev-runtime.development.js',
    },
    'node_modules/react/jsx-runtime.js': {
      file: 'node_modules/react/cjs/react-jsx-runtime.development.js',
    },
    'node_modules/react-dom/index.js': {
      file: 'node_modules/react-dom/cjs/react-dom.development.js',
    },
  },
  prod: {
    'node_modules/react/index.js': {
      file: 'node_modules/react/cjs/react.production.min.js',
    },
    'node_modules/react/jsx-dev-runtime.js': {
      file: 'node_modules/react/cjs/react-jsx-dev-runtime.production.min.js',
    },
    'node_modules/react/jsx-runtime.js': {
      file: 'node_modules/react/cjs/react-jsx-runtime.production.min.js',
    },
    'node_modules/react-dom/index.js': {
      file: 'node_modules/react-dom/cjs/react-dom.production.min.js',
    },
  },
};
//# sourceMappingURL=react-replacements.js.map
