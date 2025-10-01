// Expect singleton + include.version warning
module.exports = [
  // ProvideSharedPlugin warnings (emitted twice: provide and finalize)
  {
    file: /shared module next\/dist\/compiled\/react-allowed .*->.*react-allowed\.js/,
    message:
      /\"singleton: true\" is used together with \"include\.version: \"\^18\.0\.0\"\"/,
  },
  {
    file: /shared module next\/dist\/compiled\/react-allowed .*->.*react-allowed\.js/,
    message:
      /\"singleton: true\" is used together with \"include\.version: \"\^18\.0\.0\"\"/,
  },
  // ConsumeSharedPlugin warning (moduleRequest is absolute resource path)
  {
    file: /shared module .*react-allowed\.js .*->.*react-allowed\.js/,
    message:
      /\"singleton: true\" is used together with \"include\.version: \"\^18\.0\.0\"\"/,
  },
];
