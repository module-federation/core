console.log('runtime plugins active');
export default function () {
  return {
    name: 'eager-react-test-plugin',
    async init(args) {
      return args;
    },
    async beforeRequest(args) {
      // const React = await import('react');
      // console.log(React);
      return args;
    },
    resolveShare(args) {
      console.log(args);
      return args;
    },
  };
}
